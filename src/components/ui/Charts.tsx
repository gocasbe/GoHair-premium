import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, shadow } from '@/lib/theme';
import { Text } from './Text';

/** Tuile d'indicateur clé (KPI). */
export function Kpi({ icon, label, value, hint, tone = 'accent' }: { icon: keyof typeof Feather.glyphMap; label: string; value: string; hint?: string; tone?: 'accent' | 'gold' | 'warning' }) {
  const [bg, fg] = tone === 'gold' ? [colors.goldSoft, colors.gold] : tone === 'warning' ? [colors.warningSoft, colors.warning] : [colors.accentSoft, colors.accent];
  return (
    <View style={[styles.kpi, shadow.soft]}>
      <View style={[styles.kpiIcon, { backgroundColor: bg }]}>
        <Feather name={icon} size={18} color={fg} />
      </View>
      <Text variant="small" color={colors.muted} style={{ marginTop: 12 }}>
        {label}
      </Text>
      <Text variant="display" style={{ fontSize: 28, lineHeight: 34 }}>
        {value}
      </Text>
      {hint ? (
        <Text variant="small" color={colors.faint}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** Histogramme sobre : la barre mise en avant porte l'accent, les autres restent neutres. */
export function BarChart({ data, highlight, format }: { data: { label: string; value: number }[]; highlight: number; format: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={styles.chart} accessibilityRole="image" accessibilityLabel={data.map((d) => `${d.label} ${format(d.value)}`).join(', ')}>
      {data.map((d, i) => (
        <View key={d.label + i} style={styles.col}>
          <Text variant="small" weight="semibold" color={i === highlight ? colors.accent : colors.faint} style={{ fontSize: 11 }}>
            {d.value ? format(d.value) : ''}
          </Text>
          <View style={styles.track}>
            <View style={[styles.bar, { height: `${Math.max(4, (d.value / max) * 100)}%`, backgroundColor: i === highlight ? colors.accent : colors.accentSoft }]} />
          </View>
          <Text variant="small" color={i === highlight ? colors.ink : colors.muted} weight={i === highlight ? 'bold' : 'regular'} style={{ fontSize: 12 }}>
            {d.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  kpi: { flexGrow: 1, flexBasis: 150, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16 },
  kpiIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 190 },
  col: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 6 },
  track: { width: '100%', maxWidth: 34, flex: 1, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 10 },
});
