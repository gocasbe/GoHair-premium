import { useSyncExternalStore } from 'react';
import { Booking, BookingStatus, Service, Staff, initialBookings, initialServices, initialStaff } from './data';

/**
 * Store global minimal (réservations, services, équipe, favoris).
 * Partagé entre l'espace client et l'espace admin : une réservation créée côté client
 * apparaît immédiatement dans le planning du gérant.
 * ⚠ les sélecteurs doivent renvoyer une tranche existante du state (pas un nouveau tableau).
 */
type State = { bookings: Booking[]; services: Service[]; staff: Staff[]; favorites: string[] };

let state: State = { bookings: initialBookings, services: initialServices, staff: initialStaff, favorites: ['studio-lumiere'] };
const listeners = new Set<() => void>();
const commit = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export const store = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  addBooking: (b: Booking) => commit({ bookings: [b, ...state.bookings] }),
  setBookingStatus: (id: string, status: BookingStatus) => commit({ bookings: state.bookings.map((b) => (b.id === id ? { ...b, status } : b)) }),
  toggleFavorite: (id: string) => commit({ favorites: state.favorites.includes(id) ? state.favorites.filter((f) => f !== id) : [...state.favorites, id] }),
  upsertService: (s: Service) => commit({ services: state.services.some((x) => x.id === s.id) ? state.services.map((x) => (x.id === s.id ? s : x)) : [...state.services, s] }),
  removeService: (id: string) => commit({ services: state.services.filter((s) => s.id !== id) }),
  upsertStaff: (s: Staff) => commit({ staff: state.staff.some((x) => x.id === s.id) ? state.staff.map((x) => (x.id === s.id ? s : x)) : [...state.staff, s] }),
  removeStaff: (id: string) => commit({ staff: state.staff.filter((s) => s.id !== id) }),
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(state), () => selector(state));
}
