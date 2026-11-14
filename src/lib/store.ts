import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { useSyncExternalStore } from 'react';
import { Booking, BookingStatus, Service, Staff, initialServices, initialStaff } from './data';
import { auth } from './firebase';
import {
  createBooking,
  deleteService,
  deleteStaff,
  saveService,
  saveStaff,
  subscribeToBookings,
  subscribeToServices,
  subscribeToStaff,
  updateBooking,
  type StoredBooking,
  type StoredService,
} from './firestore';
import { img } from './images';

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

// Les images sont locales (require) : on les réattache aux prestations venant de Firestore.
const fallbackImage: Record<Service['category'], Service['image']> = { women: img.hairStyle, men: img.spraying, kids: img.shampoo, care: img.faceMassage };
const withImage = (s: StoredService): Service => ({ ...s, image: initialServices.find((x) => x.id === s.id)?.image ?? fallbackImage[s.category] ?? img.hairStyle });

// `mine` dépend de l'utilisateur connecté : recalculé à chaque changement de réservations ou de session.
let rawBookings: StoredBooking[] = [];
let currentUid: string | null = null;
const publishBookings = () => commit({ bookings: rawBookings.map((b) => ({ ...b, mine: !!currentUid && b.userId === currentUid })) });

// Tant que Firestore n'a aucune prestation / aucun membre, on affiche le catalogue par défaut.
// À la première modification par le gérant, ce catalogue est d'abord enregistré dans Firestore,
// sinon ajouter une seule prestation ferait disparaître toutes les autres.
let servicesInDb = false;
let staffInDb = false;
const seedServices = async () => {
  if (servicesInDb) return;
  await Promise.all(initialServices.map(({ image: _image, ...s }) => saveService(s)));
  servicesInDb = true;
};
const seedStaff = async () => {
  if (staffInDb) return;
  await Promise.all(initialStaff.map((s) => saveStaff(s)));
  staffInDb = true;
};

let started = false;
const unsubscribers: (() => void)[] = [];

export async function initializeStore() {
  if (started) return;
  started = true;

  try {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    if (stored) commit({ favorites: JSON.parse(stored) });
  } catch (error) {
    console.error('Error loading favorites:', error);
  }

  unsubscribers.push(
    onAuthStateChanged(auth, (user) => {
      currentUid = user?.uid ?? null;
      publishBookings();
    }),
    subscribeToBookings((bookings) => {
      rawBookings = bookings;
      publishBookings();
    }),
    // Collection vide (pas encore initialisée) : on garde le catalogue par défaut plutôt qu'un écran vide.
    subscribeToServices((services) => {
      servicesInDb = services.length > 0;
      commit({ services: servicesInDb ? services.map(withImage) : initialServices });
    }),
    subscribeToStaff((staff) => {
      staffInDb = staff.length > 0;
      commit({ staff: staffInDb ? staff : initialStaff });
    }),
  );

  commit({ ready: true });
}

export function cleanupStore() {
  unsubscribers.splice(0).forEach((u) => u());
  started = false;
}

export const store = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** Crée la réservation pour l'utilisateur connecté et renvoie son identifiant Firestore. */
  addBooking: async (b: Omit<Booking, 'id' | 'mine' | 'userId'>): Promise<string> => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not signed in');
    return createBooking({ ...b, userId });
  },
  setBookingStatus: (id: string, status: BookingStatus) => updateBooking(id, { status }),
  toggleFavorite: async (id: string) => {
    const updated = state.favorites.includes(id) ? state.favorites.filter((f) => f !== id) : [...state.favorites, id];
    commit({ favorites: updated });
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  },
  upsertService: async ({ image: _image, ...s }: Service) => {
    await seedServices();
    await saveService(s);
  },
  removeService: async (id: string) => {
    await seedServices();
    await deleteService(id);
  },
  upsertStaff: async (s: Staff) => {
    await seedStaff();
    await saveStaff(s);
  },
  removeStaff: async (id: string) => {
    await seedStaff();
    await deleteStaff(id);
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(state), () => selector(state));
}
