/**
 * Design tokens — style minimaliste haut de gamme.
 * Blanc cassé, encre profonde, un seul accent (vert sapin) et une touche dorée.
 */
export const colors = {
  bg: '#FBFAF8',
  surface: '#FFFFFF',
  ink: '#12201E',
  muted: '#6B7775',
  faint: '#A4ADAB',
  line: '#ECEAE5',
  accent: '#2E6F65',
  accentDark: '#1F4F47',
  accentSoft: '#E7F0EE',
  gold: '#B8935A',
  goldSoft: '#F5EEE2',
  danger: '#C2493D',
  dangerSoft: '#FBEAE8',
  success: '#2F8F5B',
  successSoft: '#E5F4EB',
  warning: '#C98A1B',
  warningSoft: '#FBF1DC',
} as const;

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;

/** échelle d'espacement sur une grille de 4 px : space(4) = 16 */
export const space = (n: number) => n * 4;

export const shadow = {
  soft: { boxShadow: '0 4px 20px rgba(18,32,30,0.06)' },
  lift: { boxShadow: '0 12px 32px rgba(18,32,30,0.14)' },
} as const;

/** React Native n'a pas de fontWeight pour les polices custom : une famille par graisse. */
export const FONT = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
} as const;
