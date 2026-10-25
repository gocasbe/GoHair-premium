import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { ColorValue, Platform } from 'react-native';
import { useI18n } from '@/lib/i18n';
import { FONT, colors } from '@/lib/theme';

const icon = (name: keyof typeof Feather.glyphMap) =>
  function TabIcon({ color }: { color: ColorValue }) {
    return <Feather name={name} size={21} color={color as string} />;
  };

/** Back-office : 4 onglets. Réservé au rôle « admin » (garde dans le layout racine). */
export default function AdminLayout() {
  const { t } = useI18n();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { fontFamily: FONT.semibold, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line, height: Platform.OS === 'web' ? 64 : undefined, paddingTop: 4 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('admin.dashboard'), tabBarIcon: icon('bar-chart-2') }} />
      <Tabs.Screen name="planning" options={{ title: t('admin.planning'), tabBarIcon: icon('calendar') }} />
      <Tabs.Screen name="services" options={{ title: t('admin.services'), tabBarIcon: icon('scissors') }} />
      <Tabs.Screen name="team" options={{ title: t('admin.team'), tabBarIcon: icon('users') }} />
    </Tabs>
  );
}
