import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SalonCard } from '@/components/SalonCard';
import { Empty } from '@/components/ui/Primitives';
import { Text } from '@/components/ui/Text';
import { salons } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { useStore } from '@/lib/store';

export default function Favorites() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const favs = useStore((s) => s.favorites);
  const list = salons.filter((s) => favs.includes(s.id));
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 32, gap: 16 }}>
      <Text variant="display" style={{ marginBottom: 6 }}>
        {t('fav.title')}
      </Text>
      {list.length === 0 ? <Empty icon="heart" title={t('fav.none')} text={t('fav.noneText')} /> : list.map((s) => <SalonCard key={s.id} salon={s} />)}
    </ScrollView>
  );
}
