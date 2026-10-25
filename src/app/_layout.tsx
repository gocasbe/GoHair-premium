import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '@/components/ui/Feedback';
import { I18nProvider } from '@/lib/i18n';
import { SessionProvider, useSession } from '@/lib/session';
import { colors } from '@/lib/theme';
import { dict } from '@/lib/translations';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold });
  return (
    <SafeAreaProvider>
      <I18nProvider dict={dict}>
        <SessionProvider>
          <Shell fontsReady={loaded || !!error} />
        </SessionProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

function Shell({ fontsReady }: { fontsReady: boolean }) {
  const { ready, uid, role } = useSession();
  const segments = useSegments();
  const isAdmin = (segments[0] as string) === 'admin';

  useEffect(() => {
    if (ready && fontsReady) SplashScreen.hideAsync().catch(() => {});
  }, [ready, fontsReady]);
  if (!ready || !fontsReady) return null;

  // Web : l'espace client reste une « vue mobile », l'espace admin s'élargit (responsive).
  const web = Platform.OS === 'web';
  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }, web && { width: '100%', maxWidth: isAdmin ? 1080 : 480, alignSelf: 'center' }]}>
      <ToastProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade_from_bottom' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          {/* espace client : toute session connectée */}
          <Stack.Protected guard={!!uid} redirectTo="/welcome">
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="salon/[id]" />
            <Stack.Screen name="booking" />
          </Stack.Protected>
          {/* espace gérant : rôle admin uniquement */}
          <Stack.Protected guard={role === 'admin'} redirectTo="/">
            <Stack.Screen name="admin" />
          </Stack.Protected>
        </Stack>
      </ToastProvider>
    </View>
  );
}
