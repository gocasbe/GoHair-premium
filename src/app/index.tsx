import { Redirect } from 'expo-router';
import { useSession } from '@/lib/session';

/** Aiguillage : visiteur → bienvenue, gérant → /admin, client → accueil. */
export default function Index() {
  const { uid, role } = useSession();
  if (!uid) return <Redirect href="/welcome" />;
  return <Redirect href={role === 'admin' ? '/admin' : '/home'} />;
}
