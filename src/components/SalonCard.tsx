import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Salon, initialServices } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { store, useStore } from '@/lib/store';
import { colors, radius, shadow } from '@/lib/theme';

/** Carte salon : grande photo, favori, note et prix d'appel. `wide` = carrousel horizontal. */
export function SalonCard({ salon, wide }: { salon: Salon; wide?: boolean }) {
  const { t, money } = useI18n();
  const router = useRouter();
  const fav = useStore((s) => s.favorites).includes(salon.id);
  const services = useStore((s) => s.services);
  const from = Math.min(...(services.length ? services : initialServices).filter((s) => s.active).map((s) => s.price));
  return (
    <Pressable onPress={() => router.push(`/salon/${salon.id}`)} style={({ pressed }) => [styles.card, shadow.soft, wide && { width: 260 }, pressed && { transform: [{ scale: 0.99 }] }]} accessibilityRole="button" accessibilityLabel={salon.name}>
      <View>
        <Image source={salon.image} style={[styles.image, wide && { height: 170 }]} contentFit="cover" transition={200} />
        <Pressable
          onPress={() => store.toggleFavorite(salon.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Favori"
          accessibilityState={{ selected: fav }}
          style={styles.heart}
        >
          <Feather name="heart" size={18} color={fav ? colors.danger : colors.ink} style={fav ? { fontWeight: '900' } : undefined} />
        </Pressable>
        <View style={styles.rating}>
          <Feather name="star" size={12} color={colors.gold} />
          <Text variant="small" weight="bold" style={{ fontSize: 12 }}>
            {salon.rating.toFixed(1)}
          </Text>
        </View>
      </View>
      <View style={{ padding: 14 }}>
        <Text variant="heading" numberOfLines={1}>
          {salon.name}
        </Text>
        <Text variant="small" color={colors.muted} numberOfLines={1} style={{ marginTop: 2 }}>
          {salon.area} · {t('reviews', { n: salon.reviews })}
        </Text>
        <Text variant="small" weight="semibold" color={colors.accent} style={{ marginTop: 8 }}>
          {t('from', { price: money(from) })}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  image: { width: '100%', height: 190 },
  heart: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  rating: { position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
});
