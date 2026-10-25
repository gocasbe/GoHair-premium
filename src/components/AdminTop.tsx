import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { IconButton } from '@/components/ui/Primitives';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { colors } from '@/lib/theme';

/** En-tête commun du back-office : titre, sous-titre, langue, déconnexion. */
export function AdminTop({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut } = useSession();
  return (
    <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, justifyContent: 'flex-end' }}>
        <LanguageSwitch />
        <IconButton
          icon="log-out"
          label={t('admin.logout')}
          onPress={async () => {
            router.replace('/welcome');
            await signOut();
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text variant="display">{title}</Text>
          {subtitle ? (
            <Text color={colors.muted} style={{ marginTop: 4 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {action}
      </View>
    </View>
  );
}
