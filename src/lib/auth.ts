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

/** Lit le rôle dans Firestore ; 'client' par défaut (document absent, champ manquant ou erreur réseau). */
async function fetchRole(uid: string): Promise<Role> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.data()?.role === 'admin' ? 'admin' : 'client';
  } catch (e) {
    console.warn('Unable to read user role:', e);
    return 'client';
  }
}

/** Clé de traduction lisible pour une erreur Firebase Auth. */
export function authErrorKey(error: unknown, fallback: string): string {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/email-already-in-use': return 'auth.err.emailInUse';
    case 'auth/invalid-email': return 'auth.invalidEmail';
    case 'auth/weak-password': return 'auth.shortPassword';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'auth.err.wrongCredentials';
    case 'auth/too-many-requests': return 'auth.err.tooMany';
    case 'auth/network-request-failed': return 'auth.err.network';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request': return 'auth.err.popupClosed';
    default: return fallback;
  }
}

export interface AuthUser {
  uid: string;
  email: string;
  role: Role;
  emailVerified: boolean;
}

/**
 * Créer un compte utilisateur avec email/mot de passe
 * Envoie un email de validation automatiquement
 * Le rôle est toujours 'client' par défaut (les admins sont créés manuellement)
 */
export async function registerWithEmail(email: string, password: string, name?: string): Promise<AuthUser> {
  const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Sauvegarder le profil dans Firestore (rôle toujours 'client')
  const role: Role = 'client';
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email,
    ...(name ? { name } : {}),
    role,
    createdAt: new Date().toISOString()
  });

  // Email de validation : un échec d'envoi ne doit pas faire échouer l'inscription (le compte existe déjà)
  await sendEmailVerification(userCredential.user).catch((e) => console.warn('sendEmailVerification failed:', e));
  
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
  
  const role = await fetchRole(userCredential.user.uid);
  
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
    role = userDoc.data()?.role === 'admin' ? 'admin' : 'client';
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
      const role = await fetchRole(firebaseUser.uid);
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        role,
        emailVerified: firebaseUser.emailVerified
      });
    } else {
      callback(null);
    }
  });
}
