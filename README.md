# GoHair Premium — app de réservation + back-office (Expo / React Native)

Refonte « clean design » de GoHair : **un seul projet** Expo Router, deux espaces.

| Espace | Routes (`src/app`) | Contenu |
|---|---|---|
| Visiteur | `welcome`, `login`, `register` | promesse + réassurance, connexion (Client / Gérant), inscription en 1 écran |
| Client | `(tabs)/home · bookings · favorites · account`, `salon/[id]`, `booking` | accueil, filtres, fiche salon, **tunnel en 3 étapes** (créneau → récap & paiement → confirmation animée), historique, favoris, langue |
| Admin | `admin/index · planning · services · team` | dashboard (4 KPI + CA 7 j + file « à traiter »), planning par jour, CRUD prestations, CRUD équipe |

Rôles : `Stack.Protected` — `/admin` n'est accessible qu'au rôle `admin` (sinon retour à l'accueil).
Une réservation créée côté client apparaît **immédiatement** dans le planning/dashboard du gérant (store partagé).

## Lancer
```bash
npm install
npx expo start         # i (iOS) / a (Android) / w (web)
npm run typecheck
npm run export:web
```
Connexion démo : tout e-mail valide + tout mot de passe. Sélecteur « Gérant » pour l'espace admin.

## Design system (`src/lib/theme.ts`, `src/components/ui`)
- Tokens : blanc cassé `#FBFAF8`, encre `#12201E`, accent vert sapin `#2E6F65`, touche dorée `#B8935A`, rayons 10/16/24, ombres douces.
- Typo **Nunito** (SIL OFL) : `display / title / heading / body / small / caption`.
- Composants : `Text`, `Button` (primary/secondary/ghost/danger), `Card`, `Chip`, `Input`, `Badge`, `Avatar`, `Toggle`, `Header`, `Sheet`, `Kpi`, `BarChart`, `ToastProvider`.
- Icônes : `@expo/vector-icons` (Feather). Accessibilité : rôles/labels, états `selected/disabled/checked`.

## Choix CRO
Une seule action par écran, CTA collé en bas avec total en direct, prestations choisies **avant** le créneau, pas de saisie dans le tunnel (note facultative), paiement au salon par défaut, annulation gratuite rappelée au moment de confirmer, bouton « Réserver à nouveau » dans l'historique, état vide actionnable.

## Langues / données
FR par défaut + EN (`src/lib/translations.ts`). Données factices belges (Mons) dans `src/lib/data.ts`, sans backend : remplacer `src/lib/store.ts` par des appels API (Supabase/Firebase…) quand le back-end est prêt.

## À prévoir
Paiement réel (Stripe), notifications/rappels, upload d'images des prestations, photos réelles des salons (les visuels actuels viennent du template d'origine), statistiques avancées.
