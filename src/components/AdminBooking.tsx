import dayjs from 'dayjs';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Feedback';
import { Avatar, Badge, Card } from '@/components/ui/Primitives';
import { Text } from '@/components/ui/Text';
import { STATUS_TONE } from '@/components/BookingCard';
import { Booking, L, fmtTime } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { store, useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

/** Ligne de réservation du back-office, avec actions de traitement selon le statut. */
export function AdminBooking({ b, showDate }: { b: Booking; showDate?: boolean }) {
  const { t, lang, money } = useI18n();
  const toast = useToast();
  const services = useStore((s) => s.services);
  const staff = useStore((s) => s.staff);
  const names = b.serviceIds.map((id) => services.find((s) => s.id === id)).filter(Boolean).map((s) => L(s!.name, lang)).join(' · ');
  const who = staff.find((s) => s.id === b.staffId)?.name.split(' ')[0] ?? t('admin.anyone');
  const customer = b.customer.split(' ').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

  const set = (status: Booking['status'], msg: string) => {
    store.setBookingStatus(b.id, status);
    toast(msg, 'success');
  };

  return (
    <Card style={{ marginBottom: 12 }}>
      <View style={styles.row}>
        <Avatar name={customer} />
        <View style={{ flex: 1 }}>
          <Text variant="heading" numberOfLines={1}>
            {customer}
          </Text>
          <Text variant="small" color={colors.muted} numberOfLines={1}>
            {showDate ? `${dayjs(b.date).format('ddd D MMM')} · ` : ''}
            {fmtTime(b.time, lang)} · {who}
          </Text>
          <Text variant="small" color={colors.muted} numberOfLines={1}>
            {names}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Text variant="heading">{money(b.total)}</Text>
          <Badge label={t(`status.${b.status}`)} tone={STATUS_TONE[b.status]} />
        </View>
      </View>
      {b.status === 'pending' ? (
        <View style={styles.actions}>
          <Button title={t('admin.refuse')} variant="danger" style={{ flex: 1, height: 42 }} onPress={() => set('canceled', t('admin.refused'))} />
          <Button title={t('admin.confirm')} style={{ flex: 1, height: 42 }} onPress={() => set('confirmed', t('admin.confirmed'))} />
        </View>
      ) : b.status === 'confirmed' ? (
        <View style={styles.actions}>
          <Button title={t('admin.done')} variant="secondary" icon="check" style={{ flex: 1, height: 42 }} onPress={() => set('done', t('status.done'))} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line },
});
