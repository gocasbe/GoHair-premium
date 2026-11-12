import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChange, signOut as firebaseSignOut, type AuthUser, type Role } from './auth';

const KEY = 'auth';

type SessionValue = {
  ready: boolean;
  uid: string | null;
  email: string | null;
  role: Role | null;
  emailVerified: boolean;
  signIn: (user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

/** Session Firebase avec authentification réelle (email validation + Google OAuth). */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [auth, setAuth] = useState<AuthUser | null>(null);
  const ref = useRef<AuthUser | null>(null);
  const waiters = useRef<(() => void)[]>([]);

  useEffect(() => {
    // Écouter les changements d'état Firebase
    const unsubscribe = onAuthStateChange((user) => {
      ref.current = user;
      setAuth(user);
      setReady(true);
    });

    return () => unsubscribe();
  }, []);

  // les effets du provider s'exécutent après ceux du navigateur : les routes protégées sont alors à jour
  useEffect(() => {
    waiters.current.splice(0).forEach((r) => r());
  }, [auth]);

  const change = useCallback(async (next: AuthUser | null) => {
    ref.current = next;
    try {
      if (next) await AsyncStorage.setItem(KEY, JSON.stringify(next));
      else await AsyncStorage.removeItem(KEY);
    } catch {}
    await new Promise<void>((resolve) => {
      waiters.current.push(resolve);
      setAuth(next);
    });
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      ready,
      uid: auth?.uid ?? null,
      email: auth?.email ?? null,
      role: auth?.role ?? null,
      emailVerified: auth?.emailVerified ?? false,
      signIn: (user) => change(user),
      signOut: async () => {
        await firebaseSignOut();
        await change(null);
      },
    }),
    [ready, auth, change],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession doit être utilisé dans <SessionProvider>');
  return ctx;
}
