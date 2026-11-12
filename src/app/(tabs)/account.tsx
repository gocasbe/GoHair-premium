import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Button } from '@/components/ui/Button';
import { Avatar, Card, Toggle } from '@/components/ui/Primitives';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { useStore } from '@/lib/store';
import { getNotificationPreferences, setNotificationPreferences, requestNotificationPermission, type NotificationPreferences } from '@/lib/notifications';
import { colors } from '@/lib/theme';

/** Compte : identité, chiffres clés, réglages (langue, notifications), déconnexion. */
export default function Account() {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { uid, role, signOut } = useSession();
  const bookings = useStore((s) => s.bookings);
  const favorites = useStore((s) => s.favorites);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({ promos: true, availability: true, reminders: true });
  const mine = bookings.filter((b) => b.mine).length;
  const name = (uid ?? 'camille').split('@')[0].replace(/[._-]+/g, ' ');

  useEffect(() => {
    loadNotificationPreferences();
    requestNotificationPermission();
  }, []);

  const loadNotificationPreferences = async () => {
    const prefs = await getNotificationPreferences();
    setNotificationPrefs(prefs);
  };

  const updateNotificationPref = async (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(updated);
    await setNotificationPreferences(updated);
  };

  const logout = async () => {
    router.replace('/welcome');
    await signOut();
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 32 }}>
      <Text variant="display">{t('account.title')}</Text>
      <View style={styles.id}>
        <Avatar name={name} size={64} />
        <View style={{ flex: 1 }}>
          <Text variant="title" style={{ textTransform: 'capitalize' }}>
            {name}
          </Text>
          <Text color={colors.muted} numberOfLines={1}>
            {uid}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={styles.stat}>
          <Text variant="display">{mine}</Text>
          <Text variant="small" color={colors.muted}>
            {t('account.bookings')}
          </Text>
        </Card>
        <Card style={styles.stat}>
          <Text variant="display">{favorites.length}</Text>
          <Text variant="small" color={colors.muted}>
            {t('account.favorites')}
          </Text>
        </Card>
      </View>

      <Text variant="caption" color={colors.faint} style={{ marginTop: 28, marginBottom: 10 }}>
        {t('account.settings')}
      </Text>
      <Card style={{ paddingVertical: 4 }}>
        <Row icon="globe" label={t('account.language')} right={<LanguageSwitch />} />
        <Row icon="bell" label={t('account.notifications')} chevron />
        <Row icon="tag" label={t('account.promoNotifications')} right={<Toggle value={notificationPrefs.promos} onChange={(v) => updateNotificationPref('promos', v)} label={t('account.promoNotifications')} />} />
        <Row icon="clock" label={t('account.availabilityNotifications')} right={<Toggle value={notificationPrefs.availability} onChange={(v) => updateNotificationPref('availability', v)} label={t('account.availabilityNotifications')} />} />
        <Row icon="alert-circle" label={t('account.reminderNotifications')} right={<Toggle value={notificationPrefs.reminders} onChange={(v) => updateNotificationPref('reminders', v)} label={t('account.reminderNotifications')} />} />
        {role === 'admin' ? <Row icon="briefcase" label={t('admin.space')} onPress={() => router.push('/admin')} chevron last /> : <Row icon="help-circle" label={t('account.help')} chevron last />}
      </Card>

      <Button title={t('account.logout')} variant="secondary" icon="log-out" onPress={logout} style={{ marginTop: 28 }} />
    </ScrollView>
  );
}

function Row({ icon, label, right, onPress, chevron, last }: { icon: keyof typeof Feather.glyphMap; label: string; right?: React.ReactNode; onPress?: () => void; chevron?: boolean; last?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.line }]}>
      <Feather name={icon} size={19} color={colors.muted} />
      <Text style={{ flex: 1 }} weight="semibold">
        {label}
      </Text>
      {right}
      {chevron ? <Feather name="chevron-right" size={18} color={colors.faint} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  id: { flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 24 },
  stat: { flex: 1, alignItems: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56 },
});
