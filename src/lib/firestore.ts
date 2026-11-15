import { addDoc, collection, deleteDoc, doc, onSnapshot, query, setDoc, updateDoc, where, type DocumentData, type Query, type QuerySnapshot } from 'firebase/firestore';
import { db } from './firebase';
import type { Booking, Service, Staff } from './data';

/**
 * Accès Firestore (réservations, prestations, équipe).
 * - L'identifiant d'un document est toujours celui de Firestore (`doc.id`), jamais un champ stocké.
 * - Les images ne sont pas stockées : ce sont des `require()` locaux, réattachés par le store.
 * - Le champ calculé `mine` n'est jamais stocké : il dépend de l'utilisateur connecté.
 */
const BOOKINGS = 'bookings';
const SERVICES = 'services';
const STAFF = 'staff';

/** Firestore refuse les valeurs `undefined` : on les retire avant écriture. */
const clean = <T extends object>(o: T) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as DocumentData;

const rows = <T>(snap: QuerySnapshot<DocumentData>) => snap.docs.map((d) => ({ ...d.data(), id: d.id }) as T);

const onError = (what: string) => (error: Error) => console.error(`[firestore] ${what}:`, error.message);

// === RÉSERVATIONS ===

export type StoredBooking = Omit<Booking, 'mine'>;

export async function createBooking(booking: Omit<StoredBooking, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, BOOKINGS), clean(booking));
  return ref.id;
}

export async function updateBooking(id: string, data: Partial<Omit<StoredBooking, 'id'>>): Promise<void> {
  await updateDoc(doc(db, BOOKINGS, id), clean(data));
}

/**
 * Lectures ciblées (plan gratuit Firebase : 50 000 lectures / jour) : on ne charge jamais
 * toute la collection, seulement ce dont l'écran a besoin. Aucune de ces requêtes
 * ne demande d'index composite.
 */
type Listener = (bookings: StoredBooking[]) => void;
const listen = (q: Query<DocumentData>, what: string, callback: Listener) =>
  onSnapshot(q, (snap) => callback(rows<StoredBooking>(snap)), onError(what));

/** Réservations d'un client (« Mes réservations », compteur du profil). */
export const subscribeToUserBookings = (userId: string, callback: Listener) =>
  listen(query(collection(db, BOOKINGS), where('userId', '==', userId)), 'bookings/user', callback);

/** Occupation d'un salon pour un jour (créneaux déjà pris dans le tunnel de réservation). */
export const subscribeToSalonDay = (salonId: string, date: string, callback: Listener) =>
  listen(query(collection(db, BOOKINGS), where('salonId', '==', salonId), where('date', '==', date)), 'bookings/day', callback);

/** Espace admin : toutes les réservations à partir d'une date (historique récent + à venir). */
export const subscribeToBookingsSince = (date: string, callback: Listener) =>
  listen(query(collection(db, BOOKINGS), where('date', '>=', date)), 'bookings/since', callback);

// === PRESTATIONS ===

export type StoredService = Omit<Service, 'image'>;

/** Création ou mise à jour (upsert) avec un identifiant choisi par l'app. */
export async function saveService({ id, ...data }: StoredService): Promise<void> {
  await setDoc(doc(db, SERVICES, id), clean(data), { merge: true });
}

export async function deleteService(id: string): Promise<void> {
  await deleteDoc(doc(db, SERVICES, id));
}

export function subscribeToServices(callback: (services: StoredService[]) => void): () => void {
  return onSnapshot(collection(db, SERVICES), (snap) => callback(rows<StoredService>(snap)), onError('services'));
}

// === ÉQUIPE ===

export async function saveStaff({ id, ...data }: Staff): Promise<void> {
  await setDoc(doc(db, STAFF, id), clean(data), { merge: true });
}

export async function deleteStaff(id: string): Promise<void> {
  await deleteDoc(doc(db, STAFF, id));
}

export function subscribeToStaff(callback: (staff: Staff[]) => void): () => void {
  return onSnapshot(collection(db, STAFF), (snap) => callback(rows<Staff>(snap)), onError('staff'));
}
