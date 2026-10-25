import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Lang, useI18n } from '@/lib/i18n';
import { colors, radius } from '@/lib/theme';

/** Bascule FR / EN ; `light` pour les fonds sombres. */
export function LanguageSwitch({ light }: { light?: boolean }) {
  const { lang, setLang } = useI18n();
  const fg = light ? '#fff' : colors.ink;
  return (
    <View style={[styles.box, { borderColor: light ? 'rgba(255,255,255,0.4)' : colors.line }]}>
      {(['fr', 'en'] as Lang[]).map((l) => {
        const on = lang === l;
        return (
          <Pressable key={l} onPress={() => setLang(l)} accessibilityRole="button" accessibilityLabel={l === 'fr' ? 'Français' : 'English'} style={[styles.item, on && { backgroundColor: light ? '#fff' : colors.ink }]}>
            <Text variant="small" weight="bold" color={on ? (light ? colors.ink : '#fff') : fg} style={{ fontSize: 12 }}>
              {l.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.pill, padding: 2 },
  item: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill },
});
