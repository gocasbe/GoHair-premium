import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SalonCard } from '@/components/SalonCard';
import { Button } from '@/components/ui/Button';
import { Avatar, Chip, Empty, Input, SectionTitle } from '@/components/ui/Primitives';
import { Text } from '@/components/ui/Text';
import { Category, L, SALON_ID, salons } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { img } from '@/lib/images';
import { useSession } from '@/lib/session';
import { useStore } from '@/lib/store';
import { colors, radius, shadow } from '@/lib/theme';

const CATS: ('all' | Category)[] = ['all', 'women', 'men', 'kids', 'care'];

/** Accueil : promesse, recherche, filtres, coups de cœur, services populaires. */
export default function Home() {
  const { t, lang, money } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { uid } = useSession();
  const services = useStore((s) => s.services);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<'all' | Category>('all');

  const name = useMemo(() => {
    const raw = (uid ?? '').split('@')[0].split(/[._-]+/)[0].trim();
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Camille';
  }, [uid]);

  const query = q.trim().toLowerCase();
  const list = useMemo(
    () =>
      salons.filter((s) => (cat === 'all' || s.tags.includes(cat)) && (!query || s.name.toLowerCase().includes(query) || s.area.toLowerCase().includes(query) || services.some((v) => v.active && s.tags.includes(v.category) && L(v.name, lang).toLowerCase().includes(query)))),
    [cat, query, services, lang],
  );
  const popular = services.filter((s) => s.active).slice(0, 4);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.pad}>
        <View style={styles.top}>
          <View style={{ flex: 1 }}>
            <Text variant="title">{t('home.hello', { name })}</Text>
            <Text color={colors.muted} variant="small">
              {t('home.where')}
            </Text>
          </View>
          <Avatar name={name} />
        </View>

        <View style={{ marginTop: 18 }}>
          <Input icon="search" value={q} onChangeText={setQ} placeholder={t('home.search')} />
        </View>

        {/* bandeau de réassurance + CTA principal */}
        <View style={[styles.hero, shadow.lift]}>
          <Image source={img.hairStyle} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={['rgba(31,79,71,0.95)', 'rgba(31,79,71,0.55)']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
          <Text variant="title" color="#fff" style={{ fontSize: 22, lineHeight: 28 }}>
            {t('home.heroTitle')}
          </Text>
          <Text variant="small" color="rgba(255,255,255,0.85)" style={{ marginTop: 6 }}>
            {t('home.heroSub')}
          </Text>
          <Button title={t('home.heroCta')} variant="secondary" iconRight="arrow-right" onPress={() => router.push(`/salon/${SALON_ID}`)} style={{ marginTop: 16, alignSelf: 'flex-start', height: 44 }} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.pad, { gap: 8, paddingTop: 20 }]}>
        {CATS.map((c) => (
          <Chip key={c} label={t(`cat.${c}`)} selected={cat === c} onPress={() => setCat(c)} />
        ))}
      </ScrollView>

      <View style={styles.pad}>
        {list.length === 0 ? (
          <Empty icon="search" title={t('home.none')} text={t('home.noneText')} />
        ) : (
          <>
            <SectionTitle title={t('home.featured')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 12 }}>
              {list.map((s) => (
                <SalonCard key={s.id} salon={s} wide />
              ))}
            </ScrollView>

            <SectionTitle title={t('home.popular')} />
            {popular.map((s) => (
              <Pressable key={s.id} onPress={() => router.push(`/salon/${SALON_ID}?service=${s.id}`)} style={[styles.row, shadow.soft]} accessibilityRole="button">
                <Image source={s.image} style={styles.thumb} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text variant="heading" numberOfLines={1}>
                    {L(s.name, lang)}
                  </Text>
                  <Text variant="small" color={colors.muted}>
                    {t('min', { n: s.duration })}
                  </Text>
                </View>
                <Text variant="heading" color={colors.accent}>
                  {money(s.price)}
                </Text>
                <Feather name="chevron-right" size={18} color={colors.faint} />
              </Pressable>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hero: { marginTop: 4, borderRadius: radius.lg, padding: 22, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 10, paddingRight: 16, backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: 12 },
  thumb: { width: 56, height: 56, borderRadius: 14 },
});
