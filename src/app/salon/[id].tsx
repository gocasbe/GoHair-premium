import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Feedback';
import { Avatar, IconButton, SectionTitle } from '@/components/ui/Primitives';
import { Text } from '@/components/ui/Text';
import { L, salons } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { store, useStore } from '@/lib/store';
import { colors, radius, shadow } from '@/lib/theme';

/** Fiche salon : photo immersive, réassurance, choix des prestations, barre d'action collée en bas. */
export default function SalonScreen() {
  const { id, service } = useLocalSearchParams<{ id: string; service?: string }>();
  const { t, lang, money } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const salon = salons.find((s) => s.id === id) ?? salons[0];
  const services = useStore((s) => s.services).filter((s) => s.active);
  const staff = useStore((s) => s.staff).filter((s) => s.active);
  const fav = useStore((s) => s.favorites).includes(salon.id);
  const [sel, setSel] = useState<string[]>(service ? [service] : []);

  const chosen = services.filter((s) => sel.includes(s.id));
  const total = chosen.reduce((n, s) => n + s.price, 0);
  const toggle = (sid: string) => setSel((x) => (x.includes(sid) ? x.filter((i) => i !== sid) : [...x, sid]));

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={{ height: 300 }}>
          <Image source={salon.image} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.35)', 'transparent']} style={[StyleSheet.absoluteFill, { height: 120 }]} />
          <View style={[styles.bar, { top: insets.top + 8 }]}>
            <IconButton icon="arrow-left" label={t('back')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))} />
            <IconButton icon="heart" label="Favori" color={fav ? colors.danger : colors.ink} onPress={() => store.toggleFavorite(salon.id)} />
          </View>
        </View>

        <View style={styles.sheet}>
          <Text variant="display" style={{ fontSize: 28 }}>
            {salon.name}
          </Text>
          <View style={styles.meta}>
            <Feather name="star" size={15} color={colors.gold} />
            <Text weight="bold">{salon.rating.toFixed(1)}</Text>
            <Text color={colors.muted}>({t('reviews', { n: salon.reviews })})</Text>
          </View>
          <View style={styles.meta}>
            <Feather name="map-pin" size={15} color={colors.muted} />
            <Text color={colors.muted} style={{ flex: 1 }}>
              {salon.address}
            </Text>
          </View>
          <View style={styles.meta}>
            <Feather name="clock" size={15} color={colors.success} />
            <Text color={colors.success} weight="semibold">
              {L(salon.open, lang)}
            </Text>
          </View>

          <SectionTitle title={t('salon.services')} />
          {services.map((s) => {
            const on = sel.includes(s.id);
            return (
              <Pressable key={s.id} onPress={() => toggle(s.id)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={[styles.service, shadow.soft, on && { borderColor: colors.accent }]}>
                <Image source={s.image} style={styles.thumb} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text variant="heading" numberOfLines={1}>
                    {L(s.name, lang)}
                  </Text>
                  <Text variant="small" color={colors.muted}>
                    {t('min', { n: s.duration })} · {money(s.price)}
                  </Text>
                </View>
                <View style={[styles.check, on && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                  <Feather name={on ? 'check' : 'plus'} size={16} color={on ? '#fff' : colors.muted} />
                </View>
              </Pressable>
            );
          })}

          <SectionTitle title={t('salon.team')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 18 }}>
            {staff.map((m) => (
              <View key={m.id} style={{ alignItems: 'center', width: 84 }}>
                <Avatar name={m.name} size={60} tone={colors.goldSoft} color={colors.gold} />
                <Text variant="small" weight="bold" numberOfLines={1} style={{ marginTop: 8 }}>
                  {m.name.split(' ')[0]}
                </Text>
                <Text variant="small" color={colors.muted} numberOfLines={1} style={{ fontSize: 11 }}>
                  {L(m.role, lang)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* barre d'action collée : total en direct + CTA */}
      <View style={[styles.cta, shadow.lift, { paddingBottom: insets.bottom + 14 }]}>
        <View style={{ flex: 1 }}>
          <Text variant="small" color={colors.muted}>
            {sel.length ? t('salon.count', { n: sel.length }) : t('salon.select')}
          </Text>
          <Text variant="title">{money(total)}</Text>
        </View>
        <Button
          title={t('salon.choose')}
          iconRight="arrow-right"
          onPress={() => (sel.length ? router.push(`/booking?salon=${salon.id}&services=${sel.join(',')}`) : toast(t('salon.pick'), 'error'))}
          style={{ opacity: sel.length ? 1 : 0.6, minWidth: 190 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  sheet: { marginTop: -28, backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  service: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 10, paddingRight: 14, marginBottom: 12, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: 'transparent' },
  thumb: { width: 56, height: 56, borderRadius: 14 },
  check: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  cta: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 14, backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
});
