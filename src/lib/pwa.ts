import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Installation de la web app (PWA).
 * - Android / Chrome / Edge : le navigateur émet `beforeinstallprompt`, on le garde pour l'ouvrir au clic.
 * - iPhone / iPad (Safari) : aucune API, il faut passer par Partager → « Sur l'écran d'accueil ».
 * Rien n'est proposé dans l'app native ni quand la web app est déjà installée.
 */
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

if (isWeb) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // pas de mini-bannière automatique : on propose notre propre bouton
    deferred = e as InstallEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

const standalone = () =>
  isWeb && (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

const ios = () => isWeb && (/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

export type InstallMode = 'prompt' | 'ios' | null;

export function useInstallApp() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const mode: InstallMode = !isWeb || standalone() ? null : deferred ? 'prompt' : ios() ? 'ios' : null;

  const install = async () => {
    if (!deferred) return false;
    const e = deferred;
    deferred = null;
    notify();
    await e.prompt();
    return (await e.userChoice).outcome === 'accepted';
  };

  return { mode, install };
}
