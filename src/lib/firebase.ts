import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDbHRPM74YvzYeSRSxdUGpkvZXlrLoiyRQ",
  authDomain: "gohair-premium.firebaseapp.com",
  projectId: "gohair-premium",
  storageBucket: "gohair-premium.firebasestorage.app",
  messagingSenderId: "892768439164",
  appId: "1:892768439164:web:e68049e506a28b376032f9",
  measurementId: "G-GCQC185HFX"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

/**
 * Web : cache local (IndexedDB). En rouvrant l'app, Firestore reprend depuis ce cache
 * et ne facture que les documents modifiés entre-temps (pendant 30 min), au lieu de tout relire.
 * Si le cache est indisponible (navigation privée stricte…), Firestore fonctionne en mémoire.
 */
function createDb(): Firestore {
  if (Platform.OS !== 'web') return getFirestore(app);
  try {
    return initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  } catch {
    return getFirestore(app); // déjà initialisé (rechargement à chaud)
  }
}
export const db = createDb();
