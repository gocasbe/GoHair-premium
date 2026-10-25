import { Redirect } from 'expo-router';

/** Toute URL inconnue (ex. /index.html en démo) retombe sur l'accueil. */
export default function NotFound() {
  return <Redirect href="/" />;
}
