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
import { useSession } from '@/lib/session';
import { googleSignInAvailable, registerWithEmail, signInWithGoogle } from '@/lib/auth';
import { colors, radius } from '@/lib/theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Inscription avec Firebase : email/password ou Google OAuth. Email de validation envoyé automatiquement. */
export default function Register() {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useSession();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const submit = async () => {
    const e = {
      name: name.trim() ? undefined : t('auth.needName'),
      email: EMAIL.test(email.trim()) ? undefined : t('auth.invalidEmail'),
      password: password.length >= 6 ? undefined : t('auth.shortPassword'),
    };
    setErrors(e);
    if (e.name || e.email || e.password) return;
    setBusy(true);
    try {
      const user = await registerWithEmail(email.trim(), password, 'client');
      await signIn(user);
      toast(t('auth.verifyEmailSent'), 'success');
      router.replace('/home');
    } catch (error: any) {
      toast(error.message || t('auth.registerError'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleBusy(true);
    try {
      const user = await signInWithGoogle();
      await signIn(user);
      router.replace('/home');
    } catch (error: any) {
      toast(error.message || t('auth.googleError'), 'error');
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header onBack={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} right={<LanguageSwitch />} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <Text variant="display" style={{ marginTop: 12 }}>
          {t('auth.registerTitle')}
        </Text>
        <Text color={colors.muted} style={{ marginTop: 8, marginBottom: 28 }}>
          {t('auth.registerSub')}
        </Text>
        <Input label={t('auth.name')} icon="user" value={name} onChangeText={setName} autoCapitalize="words" error={errors.name} placeholder="Camille Martin" />
        <Input label={t('auth.email')} icon="mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} error={errors.email} placeholder="nom@exemple.be" />
        <Input label={t('auth.password')} icon="lock" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} placeholder="••••••••" onSubmitEditing={submit} />
        <Button title={t('auth.create')} size="lg" onPress={submit} loading={busy} style={{ marginTop: 10 }} />
        
        {googleSignInAvailable && (
          <>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text variant="small" color={colors.muted} style={styles.dividerText}>
                {t('auth.or')}
              </Text>
              <View style={styles.dividerLine} />
            </View>

            <Button title={t('auth.googleSignUp')} variant="secondary" size="lg" onPress={handleGoogleSignIn} loading={googleBusy} icon="chrome" />
          </>
        )}

        <View style={styles.footer}>
          <Text color={colors.muted}>{t('auth.haveAccount')} </Text>
          <Pressable onPress={() => router.replace('/login')} hitSlop={8}>
            <Text weight="bold" color={colors.accent}>
              {t('auth.submit')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerText: { marginHorizontal: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
});
