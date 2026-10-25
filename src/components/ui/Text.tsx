import React from 'react';
import { StyleSheet, Text as RNText, TextProps, TextStyle } from 'react-native';
import { FONT, colors } from '@/lib/theme';

export type Variant = 'display' | 'title' | 'heading' | 'body' | 'small' | 'caption';
type Weight = keyof typeof FONT;

const VARIANTS: Record<Variant, { style: TextStyle; weight: Weight }> = {
  display: { style: { fontSize: 32, lineHeight: 38, letterSpacing: -0.5 }, weight: 'bold' },
  title: { style: { fontSize: 22, lineHeight: 28, letterSpacing: -0.2 }, weight: 'bold' },
  heading: { style: { fontSize: 17, lineHeight: 22 }, weight: 'bold' },
  body: { style: { fontSize: 15, lineHeight: 22 }, weight: 'regular' },
  small: { style: { fontSize: 13, lineHeight: 18 }, weight: 'regular' },
  caption: { style: { fontSize: 11, lineHeight: 14, letterSpacing: 1, textTransform: 'uppercase' }, weight: 'semibold' },
};

type Props = TextProps & { variant?: Variant; color?: string; weight?: Weight; align?: TextStyle['textAlign'] };

/** Texte typé : une variante = taille, interlignage et graisse cohérents. */
export function Text({ variant = 'body', color = colors.ink, weight, align, style, ...rest }: Props) {
  const v = VARIANTS[variant];
  return (
    <RNText
      {...rest}
      style={[styles.base, v.style, { fontFamily: FONT[weight ?? v.weight], color, textAlign: align }, style]}
    />
  );
}

const styles = StyleSheet.create({ base: { includeFontPadding: false } });
