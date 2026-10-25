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

/** Navigation du client : 4 onglets, pas de bruit visuel. */
export default function TabsLayout() {
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
      <Tabs.Screen name="home" options={{ title: t('nav.home'), tabBarIcon: icon('home') }} />
      <Tabs.Screen name="bookings" options={{ title: t('nav.bookings'), tabBarIcon: icon('calendar') }} />
      <Tabs.Screen name="favorites" options={{ title: t('nav.favorites'), tabBarIcon: icon('heart') }} />
      <Tabs.Screen name="account" options={{ title: t('nav.account'), tabBarIcon: icon('user') }} />
    </Tabs>
  );
}
