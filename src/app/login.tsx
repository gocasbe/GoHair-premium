import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Feedback';
import { Header, Input } from '@/components/ui/Primitives';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/lib/i18n';
import { Role, useSession } from '@/lib/session';
import { colors, radius } from '@/lib/theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Connexion : un sélecteur d'espace (client / gérant), deux champs, un CTA. */
export default function Login() {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useSession();
  const toast = useToast();
  const [role, setRole] = useState<Role>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const e = { email: EMAIL.test(email.trim()) ? undefined : t('auth.invalidEmail'), password: password ? undefined : t('auth.needPassword') };
    setErrors(e);
    if (e.email || e.password) return;
    setBusy(true);
    await signIn(email.trim(), role);
    router.replace(role === 'admin' ? '/admin' : '/home');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header onBack={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} right={<LanguageSwitch />} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <Text variant="display" style={{ marginTop: 12 }}>
          {t('auth.loginTitle')}
        </Text>
        <Text color={colors.muted} style={{ marginTop: 8, marginBottom: 24 }}>
          {role === 'admin' ? t('auth.adminSub') : t('auth.loginSub')}
        </Text>

        <View style={styles.seg}>
          {(['client', 'admin'] as Role[]).map((r) => (
            <Pressable key={r} onPress={() => setRole(r)} accessibilityRole="tab" accessibilityState={{ selected: role === r }} style={[styles.segItem, role === r && styles.segOn]}>
              <Text variant="small" weight="bold" color={role === r ? colors.ink : colors.muted}>
                {t(`auth.${r}`)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Input label={t('auth.email')} icon="mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} error={errors.email} placeholder="nom@exemple.be" />
        <Input label={t('auth.password')} icon="lock" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} placeholder="••••••••" onSubmitEditing={submit} />
        <Pressable onPress={() => toast(t('auth.resetSent'), 'success')} hitSlop={8} style={{ alignSelf: 'flex-end', marginTop: -4, marginBottom: 20 }}>
          <Text variant="small" weight="bold" color={colors.accent}>
            {t('auth.forgot')}
          </Text>
        </Pressable>

        <Button title={t('auth.submit')} size="lg" onPress={submit} loading={busy} />
        <Text variant="small" color={colors.faint} align="center" style={{ marginTop: 14 }}>
          {t('auth.demo')}
        </Text>

        <View style={styles.footer}>
          <Text color={colors.muted}>{t('auth.noAccount')} </Text>
          <Pressable onPress={() => router.replace('/register')} hitSlop={8}>
            <Text weight="bold" color={colors.accent}>
              {t('auth.signUp')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  seg: { flexDirection: 'row', backgroundColor: colors.line, borderRadius: radius.pill, padding: 4, marginBottom: 22 },
  segItem: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  segOn: { backgroundColor: colors.surface, boxShadow: '0 2px 8px rgba(18,32,30,0.08)' } as never,
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
});
