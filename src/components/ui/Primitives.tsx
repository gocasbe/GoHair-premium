import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { FONT, colors, radius, shadow } from '@/lib/theme';
import { Text } from './Text';

type IconName = keyof typeof Feather.glyphMap;

/** Surface blanche arrondie avec ombre douce. */
export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const body = [styles.card, shadow.soft, style];
  if (!onPress) return <View style={body}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [body, pressed && { transform: [{ scale: 0.99 }] }]}>
      {children}
    </Pressable>
  );
}

/** Pastille filtre / sélection. */
export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[styles.chip, selected && { backgroundColor: colors.ink, borderColor: colors.ink }]}
    >
      {icon ? <Feather name={icon} size={14} color={selected ? '#fff' : colors.muted} /> : null}
      <Text variant="small" weight="semibold" color={selected ? '#fff' : colors.ink}>
        {label}
      </Text>
    </Pressable>
  );
}

export function IconButton({ icon, onPress, label, color = colors.ink, filled = true, size = 40 }: { icon: IconName; onPress?: () => void; label: string; color?: string; filled?: boolean; size?: number }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' },
        filled && { backgroundColor: colors.surface, ...shadow.soft },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Feather name={icon} size={20} color={color} />
    </Pressable>
  );
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'accent' | 'gold' }) {
  const t = {
    neutral: [colors.line, colors.muted],
    success: [colors.successSoft, colors.success],
    warning: [colors.warningSoft, colors.warning],
    danger: [colors.dangerSoft, colors.danger],
    accent: [colors.accentSoft, colors.accent],
    gold: [colors.goldSoft, colors.gold],
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t[0] }]}>
      <Text variant="small" weight="bold" color={t[1]} style={{ fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}

export function Avatar({ name, size = 44, tone = colors.accentSoft, color = colors.accent }: { name: string; size?: number; tone?: string; color?: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tone, alignItems: 'center', justifyContent: 'center' }}>
      <Text weight="bold" color={color} style={{ fontSize: size * 0.36 }}>
        {initials}
      </Text>
    </View>
  );
}

type InputProps = TextInputProps & { label?: string; icon?: IconName; error?: string };

/** Champ de saisie : label au-dessus, focus accentué, bascule d'affichage du mot de passe. */
export function Input({ label, icon, error, secureTextEntry, style, ...rest }: InputProps) {
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? (
        <Text variant="small" weight="semibold" color={colors.muted} style={{ marginBottom: 6 }}>
          {label}
        </Text>
      ) : null}
      <View style={[styles.input, focus && { borderColor: colors.accent }, !!error && { borderColor: colors.danger }]}>
        {icon ? <Feather name={icon} size={18} color={colors.faint} /> : null}
        <TextInput
          {...rest}
          secureTextEntry={hidden}
          onFocus={(e) => {
            setFocus(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocus(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={colors.faint}
          style={[styles.field, style]}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Afficher le mot de passe">
            <Feather name={hidden ? 'eye' : 'eye-off'} size={18} color={colors.faint} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="small" color={colors.danger} style={{ marginTop: 4 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/** En-tête d'écran : retour optionnel, titre, action à droite. */
export function Header({ title, back = true, right, onBack }: { title?: string; back?: boolean; right?: React.ReactNode; onBack?: () => void }) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <View style={{ width: 44 }}>{back ? <IconButton icon="arrow-left" label="Retour" onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))} /> : null}</View>
      <Text variant="heading" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
        {title}
      </Text>
      <View style={{ width: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.section}>
      <Text variant="title">{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text variant="small" weight="bold" color={colors.accent}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Empty({ icon, title, text }: { icon: IconName; title: string; text?: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
      <View style={styles.emptyIcon}>
        <Feather name={icon} size={26} color={colors.accent} />
      </View>
      <Text variant="heading" style={{ marginTop: 14 }} align="center">
        {title}
      </Text>
      {text ? (
        <Text color={colors.muted} align="center" style={{ marginTop: 4 }}>
          {text}
        </Text>
      ) : null}
    </View>
  );
}

/** Interrupteur minimal (évite la dépendance au Switch natif et garde le style). */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      style={[styles.toggle, { backgroundColor: value ? colors.accent : colors.line }]}
    >
      <View style={[styles.knob, { alignSelf: value ? 'flex-end' : 'flex-start' }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, height: 38, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  input: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.line },
  field: { flex: 1, height: '100%', fontFamily: FONT.regular, fontSize: 15, color: colors.ink, outlineStyle: 'none' } as never,
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 60 },
  section: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 28, marginBottom: 14 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  toggle: { width: 48, height: 28, borderRadius: 14, padding: 3, justifyContent: 'center' },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' } as never,
});
