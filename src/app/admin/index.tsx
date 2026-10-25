import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { AdminBooking } from '@/components/AdminBooking';
import { AdminTop } from '@/components/AdminTop';
import { BarChart, Kpi } from '@/components/ui/Charts';
import { Card, Empty, SectionTitle } from '@/components/ui/Primitives';
import { Text } from '@/components/ui/Text';
import { SALON_ID } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { useStore } from '@/lib/store';

/** Tableau de bord : 4 KPI, courbe de CA sur 7 jours, file des réservations à traiter. */
export default function Dashboard() {
  const { t, money } = useI18n();
  const { uid } = useSession();
  const all = useStore((s) => s.bookings);
  const staff = useStore((s) => s.staff);

  const stats = useMemo(() => {
    const mine = all.filter((b) => b.salonId === SALON_ID);
    const today = dayjs().format('YYYY-MM-DD');
    const live = mine.filter((b) => b.status !== 'canceled');
    const todayList = live.filter((b) => b.date === today);
    const days = Array.from({ length: 7 }, (_, i) => dayjs().subtract(6 - i, 'day'));
    const revenue = days.map((d) => ({
      label: d.format('dd').replace('.', ''),
      value: live.filter((b) => b.date === d.format('YYYY-MM-DD') && (b.status === 'confirmed' || b.status === 'done')).reduce((n, b) => n + b.total, 0),
    }));
    const from = days[0].format('YYYY-MM-DD');
    const clients = new Set(live.filter((b) => b.date >= from && b.date <= today).map((b) => b.customer.toLowerCase())).size;
    // capacité indicative : 8 prestations par coiffeur et par jour
    const fill = Math.min(100, Math.round((todayList.length / Math.max(1, staff.filter((s) => s.active).length * 8)) * 100));
    const pending = mine.filter((b) => b.status === 'pending' && b.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    return { todayCount: todayList.length, revenue, total7: revenue.reduce((n, d) => n + d.value, 0), clients, fill, pending };
  }, [all, staff]);

  const name = (uid ?? 'sophie').split('@')[0].replace(/[._-]+/g, ' ');

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <AdminTop title={t('admin.dashboard')} subtitle={`${t('admin.hello', { name: name.charAt(0).toUpperCase() + name.slice(1) })} — ${t('admin.sub')}`} />
      <View style={{ paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 }}>
          <Kpi icon="calendar" label={t('admin.today')} value={String(stats.todayCount)} hint={t('admin.todayHint', { n: stats.pending.filter((b) => b.date === dayjs().format('YYYY-MM-DD')).length })} />
          <Kpi icon="trending-up" label={t('admin.revenue')} value={money(stats.total7)} tone="gold" />
          <Kpi icon="pie-chart" label={t('admin.fill')} value={`${stats.fill} %`} hint={t('admin.fillHint')} />
          <Kpi icon="users" label={t('admin.clients')} value={String(stats.clients)} hint={t('admin.clientsHint')} tone="warning" />
        </View>

        <Card style={{ marginTop: 16 }}>
          <Text variant="heading" style={{ marginBottom: 16 }}>
            {t('admin.chart')}
          </Text>
          <BarChart data={stats.revenue} highlight={6} format={(n) => money(n)} />
        </Card>

        <SectionTitle title={`${t('admin.toHandle')} (${stats.pending.length})`} />
        {stats.pending.length === 0 ? (
          <Empty icon="check-circle" title={t('admin.nothing')} text={t('admin.nothingText')} />
        ) : (
          stats.pending.slice(0, 5).map((b) => <AdminBooking key={b.id} b={b} showDate />)
        )}
      </View>
    </ScrollView>
  );
}
