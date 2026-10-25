import dayjs from 'dayjs';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, Card } from '@/components/ui/Primitives';
import { Text } from '@/components/ui/Text';
import { Booking, BookingStatus, L, fmtTime, salons } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export const STATUS_TONE: Record<BookingStatus, 'warning' | 'success' | 'neutral' | 'danger'> = { pending: 'warning', confirmed: 'success', done: 'neutral', canceled: 'danger' };

/** Carte de réservation côté client : date en vignette, salon, prestations, prix. */
export function BookingCard({ booking, footer }: { booking: Booking; footer?: React.ReactNode }) {
  const { t, lang, money } = useI18n();
  const services = useStore((s) => s.services);
  const d = dayjs(booking.date);
  const salon = salons.find((s) => s.id === booking.salonId);
  const names = booking.serviceIds.map((id) => services.find((s) => s.id === id)).filter(Boolean).map((s) => L(s!.name, lang)).join(' · ');
  return (
    <Card style={{ marginBottom: 14 }}>
      <View style={styles.row}>
        <View style={styles.date}>
          <Text variant="caption" color={colors.accent} style={{ fontSize: 10 }}>
            {d.format('MMM')}
          </Text>
          <Text variant="title" style={{ lineHeight: 26 }}>
            {d.format('D')}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="heading" numberOfLines={1}>
            {salon?.name}
          </Text>
          <Text variant="small" color={colors.muted} numberOfLines={1}>
            {d.format('dddd')} · {fmtTime(booking.time, lang)}
          </Text>
          <Text variant="small" color={colors.muted} numberOfLines={1}>
            {names}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Text variant="heading">{money(booking.total)}</Text>
          <Badge label={t(`status.${booking.status}`)} tone={STATUS_TONE[booking.status]} />
        </View>
      </View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  date: { width: 52, height: 60, borderRadius: 16, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  footer: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', gap: 10 },
});
