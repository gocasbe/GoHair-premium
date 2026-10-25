import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookingCard } from '@/components/BookingCard';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Feedback';
import { Chip, Empty } from '@/components/ui/Primitives';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/lib/i18n';
import { store, useStore } from '@/lib/store';

/** Réservations du client : à venir / passées, annulation et « réserver à nouveau ». */
export default function Bookings() {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const all = useStore((s) => s.bookings);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const mine = useMemo(() => all.filter((b) => b.mine), [all]);
  const today = dayjs().format('YYYY-MM-DD');
  const upcoming = mine.filter((b) => b.date >= today && b.status !== 'canceled' && b.status !== 'done').sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const past = mine.filter((b) => !upcoming.includes(b)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 32 }}>
      <Text variant="display">{t('bookings.title')}</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginVertical: 18 }}>
        <Chip label={`${t('bookings.upcoming')} (${upcoming.length})`} selected={tab === 'upcoming'} onPress={() => setTab('upcoming')} />
        <Chip label={t('bookings.past')} selected={tab === 'past'} onPress={() => setTab('past')} />
      </View>
      {list.length === 0 ? (
        <Empty icon="calendar" title={t('bookings.none')} text={t('bookings.noneText')} />
      ) : (
        list.map((b) => (
          <BookingCard
            key={b.id}
            booking={b}
            footer={
              tab === 'upcoming' ? (
                <Button
                  title={t('bookings.cancel')}
                  variant="danger"
                  style={{ flex: 1, height: 42 }}
                  onPress={() => {
                    store.setBookingStatus(b.id, 'canceled');
                    toast(t('bookings.canceled'), 'success');
                  }}
                />
              ) : (
                <Button title={t('bookings.rebook')} variant="secondary" icon="rotate-cw" style={{ flex: 1, height: 42 }} onPress={() => router.push(`/booking?salon=${b.salonId}&services=${b.serviceIds.join(',')}`)} />
              )
            }
          />
        ))
      )}
    </ScrollView>
  );
}
