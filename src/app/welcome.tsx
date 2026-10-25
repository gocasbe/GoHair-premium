import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/lib/i18n';
import { img } from '@/lib/images';
import { colors } from '@/lib/theme';

/** Écran d'accueil : une promesse, trois preuves de réassurance, un seul CTA. */
export default function Welcome() {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <Image source={img.salon} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient colors={['rgba(18,32,30,0.15)', 'rgba(18,32,30,0.55)', 'rgba(18,32,30,0.96)']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <Text variant="title" color="#fff" style={{ letterSpacing: 1 }}>
          GoHair
        </Text>
        <LanguageSwitch light />
      </View>
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
        <Text variant="display" color="#fff">
          {t('welcome.title')}
        </Text>
        <Text color="rgba(255,255,255,0.8)" style={{ marginTop: 12 }}>
          {t('welcome.sub')}
        </Text>
        <View style={styles.trust}>
          {(['welcome.t1', 'welcome.t2', 'welcome.t3'] as const).map((k) => (
            <View key={k} style={styles.trustItem}>
              <Feather name="check" size={14} color={colors.gold} />
              <Text variant="small" color="rgba(255,255,255,0.85)" weight="semibold">
                {t(k)}
              </Text>
            </View>
          ))}
        </View>
        <Button title={t('welcome.cta')} size="lg" iconRight="arrow-right" onPress={() => router.push('/register')} style={{ marginTop: 24 }} />
        <Button title={t('welcome.login')} variant="ghost" onPress={() => router.push('/login')} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24 },
  bottom: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24 },
  trust: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 6, marginTop: 18 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
