import { collection, addDoc, getDoc, getDocs, doc, updateDoc, deleteDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Booking, Service, Staff } from './data';

// Collections
const BOOKINGS_COLLECTION = 'bookings';
const SERVICES_COLLECTION = 'services';
const STAFF_COLLECTION = 'staff';

/**
 * Firestore Service - Gère les données dans Firestore
 */

// === RÉSERVATIONS ===

export async function createBooking(booking: Omit<Booking, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), booking);
  return docRef.id;
}

export async function getBooking(id: string): Promise<Booking | null> {
  const docSnap = await getDoc(doc(db, BOOKINGS_COLLECTION, id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Booking;
  }
  return null;
}

export async function getAllBookings(): Promise<Booking[]> {
  const querySnapshot = await getDocs(collection(db, BOOKINGS_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Booking[];
}

export async function updateBooking(id: string, data: Partial<Booking>): Promise<void> {
  await updateDoc(doc(db, BOOKINGS_COLLECTION, id), data);
}

export async function deleteBooking(id: string): Promise<void> {
  await deleteDoc(doc(db, BOOKINGS_COLLECTION, id));
}

export function subscribeToBookings(callback: (bookings: Booking[]) => void): () => void {
  const q = query(collection(db, BOOKINGS_COLLECTION), orderBy('date', 'desc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Booking[];
    callback(bookings);
  });
  return unsubscribe;
}

// === PRESTATIONS ===

export async function createService(service: Omit<Service, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, SERVICES_COLLECTION), service);
  return docRef.id;
}

export async function getService(id: string): Promise<Service | null> {
  const docSnap = await getDoc(doc(db, SERVICES_COLLECTION, id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Service;
  }
  return null;
}

export async function getAllServices(): Promise<Service[]> {
  const querySnapshot = await getDocs(collection(db, SERVICES_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[];
}

export async function updateService(id: string, data: Partial<Service>): Promise<void> {
  await updateDoc(doc(db, SERVICES_COLLECTION, id), data);
}

export async function deleteService(id: string): Promise<void> {
  await deleteDoc(doc(db, SERVICES_COLLECTION, id));
}

export function subscribeToServices(callback: (services: Service[]) => void): () => void {
  const unsubscribe = onSnapshot(collection(db, SERVICES_COLLECTION), (snapshot) => {
    const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[];
    callback(services);
  });
  return unsubscribe;
}

// === ÉQUIPE ===

export async function createStaff(staff: Omit<Staff, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, STAFF_COLLECTION), staff);
  return docRef.id;
}

export async function getStaff(id: string): Promise<Staff | null> {
  const docSnap = await getDoc(doc(db, STAFF_COLLECTION, id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Staff;
  }
  return null;
}

export async function getAllStaff(): Promise<Staff[]> {
  const querySnapshot = await getDocs(collection(db, STAFF_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Staff[];
}

export async function updateStaff(id: string, data: Partial<Staff>): Promise<void> {
  await updateDoc(doc(db, STAFF_COLLECTION, id), data);
}

export async function deleteStaff(id: string): Promise<void> {
  await deleteDoc(doc(db, STAFF_COLLECTION, id));
}

export function subscribeToStaff(callback: (staff: Staff[]) => void): () => void {
  const unsubscribe = onSnapshot(collection(db, STAFF_COLLECTION), (snapshot) => {
    const staff = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Staff[];
    callback(staff);
  });
  return unsubscribe;
}
