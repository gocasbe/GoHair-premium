import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export const db = getFirestore(app);
