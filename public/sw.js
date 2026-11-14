/*
 * Service worker GoHair.
 * - Pages HTML : toujours le réseau d'abord (jamais d'ancienne version tant qu'il y a du réseau),
 *   la copie en cache ne sert que hors ligne.
 * - Fichiers /_expo/static et /assets : leur nom contient un hash, ils ne changent jamais → cache d'abord.
 * - Firebase et autres domaines : jamais interceptés.
 * __BUILD_ID__ et __BASE_URL__ sont remplacés à chaque build (scripts/pwa-postbuild.js) :
 * un nouveau déploiement installe donc un nouveau service worker et vide les anciens caches.
 */
const VERSION = '__BUILD_ID__';
const BASE = '__BASE_URL__';
const PAGES = `gohair-pages-${VERSION}`;
const STATIC = `gohair-static-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.add(`${BASE}/`)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('gohair-') && k !== PAGES && k !== STATIC).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGES).then((c) => c.put(`${BASE}/`, copy));
          return res;
        })
        .catch(() => caches.match(`${BASE}/`)),
    );
    return;
  }

  if (url.pathname.startsWith(`${BASE}/_expo/static/`) || url.pathname.startsWith(`${BASE}/assets/`)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
  }
});
