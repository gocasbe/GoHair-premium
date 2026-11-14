import { useSyncExternalStore } from 'react';
import { Booking, BookingStatus, Service, Staff, initialServices, initialStaff } from './data';
import { createBooking, updateBooking, subscribeToBookings, subscribeToServices, subscribeToStaff, updateService, deleteService, updateStaff, deleteStaff } from './firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Store global connecté à Firestore (réservations, services, équipe) + AsyncStorage (favoris).
 * Partagé entre l'espace client et l'espace admin : une réservation créée côté client
 * apparaît immédiatement dans le planning du gérant via Firestore.
 */
type State = { bookings: Booking[]; services: Service[]; staff: Staff[]; favorites: string[]; ready: boolean };

let state: State = { bookings: [], services: initialServices, staff: initialStaff, favorites: [], ready: false };
const listeners = new Set<() => void>();
const FAVORITES_KEY = 'favorites';

const commit = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

// Initialiser Firestore subscriptions
let unsubscribeBookings: (() => void) | null = null;
let unsubscribeServices: (() => void) | null = null;
let unsubscribeStaff: (() => void) | null = null;

export async function initializeStore() {
  // Charger les favoris depuis AsyncStorage
  try {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    if (stored) {
      state.favorites = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
  }

  // S'abonner aux changements Firestore
  unsubscribeBookings = subscribeToBookings((bookings) => {
    commit({ bookings });
  });

  unsubscribeServices = subscribeToServices((services) => {
    commit({ services });
  });

  unsubscribeStaff = subscribeToStaff((staff) => {
    commit({ staff });
  });

  commit({ ready: true });
}

export function cleanupStore() {
  unsubscribeBookings?.();
  unsubscribeServices?.();
  unsubscribeStaff?.();
}

export const store = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  addBooking: async (b: Omit<Booking, 'id'>) => {
    const id = await createBooking(b);
    // Firestore va mettre à jour state via le subscription
  },
  setBookingStatus: async (id: string, status: BookingStatus) => {
    await updateBooking(id, { status });
    // Firestore va mettre à jour state via le subscription
  },
  toggleFavorite: async (id: string) => {
    const updated = state.favorites.includes(id) 
      ? state.favorites.filter((f) => f !== id) 
      : [...state.favorites, id];
    commit({ favorites: updated });
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  },
  upsertService: async (s: Service) => {
    if (state.services.some((x) => x.id === s.id)) {
      await updateService(s.id, s);
    } else {
      // Pour les nouveaux services, on utiliserait createService
      // Pour l'instant, on garde le comportement local
      commit({ services: [...state.services, s] });
    }
  },
  removeService: async (id: string) => {
    await deleteService(id);
    // Firestore va mettre à jour state via le subscription
  },
  upsertStaff: async (s: Staff) => {
    if (state.staff.some((x) => x.id === s.id)) {
      await updateStaff(s.id, s);
    } else {
      // Pour les nouveaux membres, on utiliserait createStaff
      commit({ staff: [...state.staff, s] });
    }
  },
  removeStaff: async (id: string) => {
    await deleteStaff(id);
    // Firestore va mettre à jour state via le subscription
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(state), () => selector(state));
}
