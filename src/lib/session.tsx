import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type Role = 'client' | 'admin';
type Auth = { uid: string; role: Role } | null;
const KEY = 'auth';

type SessionValue = {
  ready: boolean;
  uid: string | null;
  role: Role | null;
  /** résolu une fois l'état propagé : on peut alors naviguer vers un écran protégé */
  signIn: (uid: string, role: Role) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

/** Session locale (démo) : l'e-mail fait office d'identifiant, le rôle ouvre l'espace client ou gérant. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [auth, setAuth] = useState<Auth>(null);
  const ref = useRef<Auth>(null);
  const waiters = useRef<(() => void)[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        const a = v ? (JSON.parse(v) as Auth) : null;
        ref.current = a;
        setAuth(a);
      })
      .catch(() => setAuth(null))
      .finally(() => setReady(true));
  }, []);

  // les effets du provider s'exécutent après ceux du navigateur : les routes protégées sont alors à jour
  useEffect(() => {
    waiters.current.splice(0).forEach((r) => r());
  }, [auth]);

  const change = useCallback(async (next: Auth) => {
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
      role: auth?.role ?? null,
      signIn: (uid, role) => change({ uid, role }),
      signOut: () => change(null),
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
