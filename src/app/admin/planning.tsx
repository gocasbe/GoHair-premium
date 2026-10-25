import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AdminBooking } from '@/components/AdminBooking';
import { AdminTop } from '@/components/AdminTop';
import { Empty } from '@/components/ui/Primitives';
import { Text } from '@/components/ui/Text';
import { SALON_ID } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

const RANGE = Array.from({ length: 14 }, (_, i) => i - 3);

/** Planning : bandeau de jours, rendez-vous triés par heure, mise à jour en direct. */
export default function Planning() {
  const { t } = useI18n();
  const all = useStore((s) => s.bookings);
  const [day, setDay] = useState(dayjs().format('YYYY-MM-DD'));
  const days = useMemo(() => RANGE.map((o) => dayjs().add(o, 'day')), []);
  const list = useMemo(() => all.filter((b) => b.salonId === SALON_ID && b.date === day && b.status !== 'canceled').sort((a, b) => a.time.localeCompare(b.time)), [all, day]);
  const countOn = (key: string) => all.filter((b) => b.salonId === SALON_ID && b.date === key && b.status !== 'canceled').length;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <AdminTop title={t('admin.planning')} subtitle={dayjs(day).format('dddd D MMMM YYYY')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14, flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
        {days.map((d) => {
          const key = d.format('YYYY-MM-DD');
          const on = key === day;
          const n = countOn(key);
          return (
            <Pressable key={key} onPress={() => setDay(key)} accessibilityRole="button" accessibilityState={{ selected: on }} style={[styles.day, on && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
              <Text variant="caption" color={on ? 'rgba(255,255,255,0.8)' : colors.muted} style={{ fontSize: 10 }}>
                {d.format('ddd')}
              </Text>
              <Text variant="title" color={on ? '#fff' : colors.ink}>
                {d.format('D')}
              </Text>
              <View style={[styles.dot, { backgroundColor: n ? (on ? '#fff' : colors.gold) : 'transparent' }]} />
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        {list.length === 0 ? <Empty icon="calendar" title={t('admin.planningNone')} text={t('admin.planningNoneText')} /> : list.map((b) => <AdminBooking key={b.id} b={b} />)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  day: { width: 60, height: 84, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
});
