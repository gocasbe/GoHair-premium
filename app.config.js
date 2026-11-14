// Complète app.json. EXPO_BASE_URL est défini uniquement par le workflow GitHub Pages
// (site servi sous /GoHair-premium/). Vercel et le dev local restent à la racine.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
