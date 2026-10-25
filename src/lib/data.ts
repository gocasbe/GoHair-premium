import dayjs from 'dayjs';
import type { ImageSource } from 'expo-image';
import { img } from './images';
import type { Lang } from './i18n';

/** Texte bilingue des données métier (les libellés d'interface passent par t()). */
export type LText = { fr: string; en: string };
export const L = (v: LText | string, lang: Lang) => (typeof v === 'string' ? v : v[lang]);

export type Category = 'women' | 'men' | 'kids' | 'care';
export type Salon = { id: string; name: string; area: string; address: string; image: ImageSource; rating: number; reviews: number; tags: Category[]; open: LText };
export type Service = { id: string; name: LText; category: Category; price: number; duration: number; image: ImageSource; active: boolean };
export type Staff = { id: string; name: string; role: LText; rating: number; active: boolean };
export type BookingStatus = 'pending' | 'confirmed' | 'done' | 'canceled';
export type Booking = {
  id: string;
  salonId: string;
  customer: string;
  /** true pour les réservations du client connecté */
  mine: boolean;
  serviceIds: string[];
  staffId: string | null;
  date: string; // AAAA-MM-JJ
  time: string; // HH:mm
  status: BookingStatus;
  total: number;
  pay: 'onsite' | 'card';
};

export const SALON_ID = 'studio-lumiere'; // salon géré par l'espace admin

export const salons: Salon[] = [
  { id: SALON_ID, name: 'Studio Lumière', area: 'Mons centre', address: 'Rue de Nimy 12, 7000 Mons', image: img.salon, rating: 4.9, reviews: 214, tags: ['women', 'men', 'care'], open: { fr: "Ouvert jusqu'à 19 h", en: 'Open until 7 pm' } },
  { id: 'atelier-capillaire', name: 'Atelier Capillaire', area: 'Jemappes', address: 'Rue de Bouzanton 8, 7012 Mons', image: img.hairStyle, rating: 4.8, reviews: 132, tags: ['women', 'kids'], open: { fr: "Ouvert jusqu'à 18 h", en: 'Open until 6 pm' } },
  { id: 'maison-lea', name: 'Maison Léa', area: 'Nimy', address: 'Avenue Reine Astrid 41, 7020 Nimy', image: img.makeup, rating: 4.7, reviews: 98, tags: ['women', 'care'], open: { fr: "Ouvert jusqu'à 19 h", en: 'Open until 7 pm' } },
  { id: 'art-du-cheveu', name: "L'Art du Cheveu", area: 'Cuesmes', address: 'Rue du Grand Peuple 3, 7033 Cuesmes', image: img.hairColor, rating: 4.9, reviews: 176, tags: ['men', 'kids'], open: { fr: "Ouvert jusqu'à 18 h 30", en: 'Open until 6:30 pm' } },
];

export const initialServices: Service[] = [
  { id: 'v1', name: { fr: 'Coupe & brushing', en: 'Cut & blow-dry' }, category: 'women', price: 45, duration: 60, image: img.hairStyle, active: true },
  { id: 'v2', name: { fr: 'Coloration', en: 'Colouring' }, category: 'women', price: 70, duration: 90, image: img.hairColor, active: true },
  { id: 'v3', name: { fr: 'Coupe homme', en: "Men's cut" }, category: 'men', price: 25, duration: 30, image: img.spraying, active: true },
  { id: 'v4', name: { fr: 'Barbe & contours', en: 'Beard & outlines' }, category: 'men', price: 18, duration: 20, image: img.strait, active: true },
  { id: 'v5', name: { fr: 'Coupe enfant', en: "Kid's cut" }, category: 'kids', price: 18, duration: 30, image: img.shampoo, active: true },
  { id: 'v6', name: { fr: 'Boucles & ondulations', en: 'Curls & waves' }, category: 'women', price: 55, duration: 75, image: img.curling, active: true },
  { id: 'v7', name: { fr: 'Maquillage', en: 'Make-up' }, category: 'care', price: 40, duration: 45, image: img.makeup, active: true },
  { id: 'v8', name: { fr: 'Soin visage', en: 'Facial care' }, category: 'care', price: 50, duration: 50, image: img.faceMassage, active: true },
];

export const initialStaff: Staff[] = [
  { id: 'e1', name: 'Sophie Delvaux', role: { fr: 'Directrice artistique', en: 'Creative director' }, rating: 4.9, active: true },
  { id: 'e2', name: 'Thomas Lecomte', role: { fr: 'Coiffeur-barbier', en: 'Hairdresser & barber' }, rating: 4.8, active: true },
  { id: 'e3', name: 'Inès Benali', role: { fr: 'Coloriste', en: 'Colourist' }, rating: 4.9, active: true },
];

const NAMES = ['Camille Martin', 'Lucas Dubois', 'Emma Lambert', 'Noah Peeters', 'Léa Dupuis', 'Hugo Janssens', 'Chloé Lemaire', 'Louis Renard', 'Manon Collin', 'Jules Hanot'];
const TIMES = ['09:00', '09:30', '10:30', '11:00', '13:30', '14:00', '15:30', '16:30', '17:00'];

/** Réservations factices autour de la date du jour (déterministes pour des KPI stables). */
function seedBookings(): Booking[] {
  const out: Booking[] = [];
  let n = 0;
  for (let d = -7; d <= 4; d++) {
    const count = d === 0 ? 4 : 2 + ((d + 9) % 3);
    for (let k = 0; k < count; k++, n++) {
      const sv = [initialServices[(n * 3) % 8].id, ...(n % 3 === 0 ? [initialServices[(n * 3 + 1) % 8].id] : [])];
      const total = sv.reduce((s, id) => s + (initialServices.find((x) => x.id === id)?.price ?? 0), 0);
      const past = d < 0;
      out.push({
        id: `b${n}`,
        salonId: SALON_ID,
        customer: NAMES[n % NAMES.length],
        mine: false,
        serviceIds: sv,
        staffId: initialStaff[n % 3].id,
        date: dayjs().add(d, 'day').format('YYYY-MM-DD'),
        time: TIMES[(n * 2 + k) % TIMES.length],
        status: past ? (n % 7 === 0 ? 'canceled' : 'done') : d === 0 ? (k < 2 ? 'confirmed' : 'pending') : n % 2 ? 'pending' : 'confirmed',
        total,
        pay: n % 2 ? 'card' : 'onsite',
      });
    }
  }
  // historique et réservation à venir du client connecté (démo)
  out.push(
    { id: 'm1', salonId: SALON_ID, customer: 'Camille Martin', mine: true, serviceIds: ['v1'], staffId: 'e1', date: dayjs().add(2, 'day').format('YYYY-MM-DD'), time: '14:00', status: 'confirmed', total: 45, pay: 'onsite' },
    { id: 'm2', salonId: 'maison-lea', customer: 'Camille Martin', mine: true, serviceIds: ['v7'], staffId: null, date: dayjs().subtract(12, 'day').format('YYYY-MM-DD'), time: '11:00', status: 'done', total: 40, pay: 'card' },
    { id: 'm3', salonId: SALON_ID, customer: 'Camille Martin', mine: true, serviceIds: ['v2'], staffId: 'e3', date: dayjs().subtract(40, 'day').format('YYYY-MM-DD'), time: '10:30', status: 'done', total: 70, pay: 'onsite' },
  );
  return out;
}
export const initialBookings = seedBookings();

/** Créneaux de 30 min de 09:00 à 18:30. */
export const SLOTS: string[] = Array.from({ length: 19 }, (_, i) => dayjs().startOf('day').hour(9).minute(i * 30).format('HH:mm'));
/** Capacité simultanée du salon = nombre de coiffeurs actifs (au moins 1). */
export const fmtTime = (t: string, lang: Lang) => (lang === 'fr' ? t.replace(':', ' h ').replace(' h 00', ' h') : dayjs(`2000-01-01 ${t}`).format('h:mm A'));
