import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '@/lib/theme';
import { Text } from './Text';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'lg';
  icon?: keyof typeof Feather.glyphMap;
  iconRight?: keyof typeof Feather.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const PALETTE = {
  primary: { bg: colors.accent, fg: '#fff', border: colors.accent },
  secondary: { bg: colors.surface, fg: colors.ink, border: colors.line },
  ghost: { bg: 'transparent', fg: colors.accent, border: 'transparent' },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
} as const;

/** CTA principal : plein et proéminent ; retour tactile par léger enfoncement. */
export function Button({ title, onPress, variant = 'primary', size = 'md', icon, iconRight, loading, disabled, style }: Props) {
  const p = PALETTE[variant];
  const off = disabled || loading;
  return (
    <Pressable
      onPress={off ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off }}
      style={({ pressed }) => [
        styles.base,
        { height: size === 'lg' ? 56 : 48, backgroundColor: p.bg, borderColor: p.border, opacity: off ? 0.45 : 1 },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Feather name={icon} size={18} color={p.fg} /> : null}
          <Text variant="heading" color={p.fg} style={{ fontSize: size === 'lg' ? 16 : 15 }}>
            {title}
          </Text>
          {iconRight ? <Feather name={iconRight} size={18} color={p.fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
