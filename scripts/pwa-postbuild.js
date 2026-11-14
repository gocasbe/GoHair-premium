/**
 * Après `expo export --platform web` : remplace __BASE_URL__ et __BUILD_ID__ dans les fichiers PWA.
 * - EXPO_BASE_URL vaut "/GoHair-premium" sur GitHub Pages, vide sur Vercel (site à la racine).
 * - BUILD_ID change à chaque build : le navigateur détecte un nouveau service worker et se met à jour.
 */
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const base = (process.env.EXPO_BASE_URL || '').replace(/\/$/, '');
const buildId = process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now());

for (const file of ['index.html', 'manifest.json', 'sw.js']) {
  const p = path.join(dist, file);
  if (!fs.existsSync(p)) throw new Error(`pwa-postbuild: ${file} manquant dans dist/`);
  const out = fs.readFileSync(p, 'utf8').split('__BASE_URL__').join(base).split('__BUILD_ID__').join(buildId);
  fs.writeFileSync(p, out);
}
console.log(`PWA prête (base="${base || '/'}", build=${buildId.slice(0, 12)})`);
