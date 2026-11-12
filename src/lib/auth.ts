import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { auth, db } from './firebase';

export type Role = 'client' | 'admin';

export interface AuthUser {
  uid: string;
  email: string;
  role: Role;
  emailVerified: boolean;
}

/**
 * Créer un compte utilisateur avec email/mot de passe
 * Envoie un email de validation automatiquement
 */
export async function registerWithEmail(email: string, password: string, role: Role = 'client'): Promise<AuthUser> {
  const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Envoyer l'email de validation
  await sendEmailVerification(userCredential.user);
  
  // Sauvegarder le rôle dans Firestore
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email,
    role,
    createdAt: new Date().toISOString()
  });
  
  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email!,
    role,
    emailVerified: userCredential.user.emailVerified
  };
}

/**
 * Connecter un utilisateur avec email/mot de passe
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Récupérer le rôle depuis Firestore
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  const role = userDoc.exists() ? userDoc.data()?.role : 'client';
  
  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email!,
    role,
    emailVerified: userCredential.user.emailVerified
  };
}

/**
 * signInWithPopup ne fonctionne que sur le web. Sur iOS/Android il faut un
 * module natif (dev build) — pas encore configuré, donc le bouton est masqué.
 */
export const googleSignInAvailable = Platform.OS === 'web';

/**
 * Connecter un utilisateur avec Google
 */
export async function signInWithGoogle(): Promise<AuthUser> {
  if (!googleSignInAvailable) throw new Error('Google sign-in is only available on web for now');
  const provider = new GoogleAuthProvider();
  const userCredential: UserCredential = await signInWithPopup(auth, provider);
  
  // Vérifier si l'utilisateur existe déjà dans Firestore
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  
  let role: Role = 'client';
  if (!userDoc.exists()) {
    // Nouvel utilisateur, créer le document
    role = 'client';
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      role,
      createdAt: new Date().toISOString()
    });
  } else {
    role = userDoc.data()?.role || 'client';
  }
  
  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email!,
    role,
    emailVerified: userCredential.user.emailVerified
  };
}

/**
 * Envoyer un email de réinitialisation du mot de passe
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Renvoyer l'email de validation
 */
export async function resendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    await sendEmailVerification(user);
  }
}

/**
 * Déconnexion
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Observer les changements d'authentification
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const role = userDoc.exists() ? userDoc.data()?.role : 'client';
      
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        role,
        emailVerified: firebaseUser.emailVerified
      });
    } else {
      callback(null);
    }
  });
}
