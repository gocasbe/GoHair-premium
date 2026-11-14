import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Primitives';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/lib/i18n';
import { useInstallApp } from '@/lib/pwa';
import { colors } from '@/lib/theme';

const KEY = 'gohair-install-dismissed';
const read = () => {
  try {
    return globalThis.localStorage?.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

/** Invite à installer la web app (Android : bouton système ; iPhone : marche à suivre). */
export function InstallBanner({ dismissible = true }: { dismissible?: boolean }) {
  const { t } = useI18n();
  const { mode, install } = useInstallApp();
  const [hidden, setHidden] = useState(() => dismissible && read());
  if (!mode || hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      globalThis.localStorage?.setItem(KEY, '1');
    } catch {}
  };

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Image source={require('../../public/icons/icon-192.png')} style={styles.icon} />
        <View style={{ flex: 1 }}>
          <Text weight="bold">{t('pwa.title')}</Text>
          <Text variant="small" color={colors.muted}>
            {mode === 'ios' ? t('pwa.ios') : t('pwa.text')}
          </Text>
        </View>
        {dismissible ? (
          <Pressable onPress={dismiss} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('cancel')}>
            <Feather name="x" size={18} color={colors.faint} />
          </Pressable>
        ) : null}
      </View>
      {mode === 'prompt' ? <Button title={t('pwa.install')} icon="download" onPress={install} style={{ marginTop: 12, height: 42 }} /> : null}
      {mode === 'ios' ? (
        <View style={styles.steps}>
          <Feather name="share" size={16} color={colors.accent} />
          <Text variant="small" weight="semibold">
            {t('pwa.iosSteps')}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 12 },
  steps: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: colors.accentSoft, padding: 10, borderRadius: 12 },
});
