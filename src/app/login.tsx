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
import { googleSignInAvailable, resetPassword, signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { colors, radius } from '@/lib/theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Connexion avec Firebase : email/password ou Google OAuth. */
export default function Login() {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useSession();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const submit = async () => {
    const e = { email: EMAIL.test(email.trim()) ? undefined : t('auth.invalidEmail'), password: password ? undefined : t('auth.needPassword') };
    setErrors(e);
    if (e.email || e.password) return;
    setBusy(true);
    try {
      const user = await signInWithEmail(email.trim(), password);
      await signIn(user);
      
      if (!user.emailVerified) {
        toast(t('auth.verifyEmailSent'), 'info');
      }
      
      router.replace(user.role === 'admin' ? '/admin' : '/home');
    } catch (error: any) {
      toast(error.message || t('auth.loginError'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleBusy(true);
    try {
      const user = await signInWithGoogle();
      await signIn(user);
      router.replace(user.role === 'admin' ? '/admin' : '/home');
    } catch (error: any) {
      toast(error.message || t('auth.googleError'), 'error');
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    const mail = email.trim();
    if (!EMAIL.test(mail)) {
      setErrors({ email: t('auth.resetNeedEmail') });
      return;
    }
    try {
      await resetPassword(mail);
      toast(t('auth.resetSent'), 'success');
    } catch (error: any) {
      toast(error.message || t('auth.resendError'), 'error');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header onBack={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} right={<LanguageSwitch />} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <Text variant="display" style={{ marginTop: 12 }}>
          {t('auth.loginTitle')}
        </Text>
        <Text color={colors.muted} style={{ marginTop: 8, marginBottom: 24 }}>
          {t('auth.loginSub')}
        </Text>

        <Input label={t('auth.email')} icon="mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} error={errors.email} placeholder="nom@exemple.be" />
        <Input label={t('auth.password')} icon="lock" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} placeholder="••••••••" onSubmitEditing={submit} />
        <Pressable onPress={handleForgotPassword} hitSlop={8} style={{ alignSelf: 'flex-end', marginTop: -4, marginBottom: 20 }}>
          <Text variant="small" weight="bold" color={colors.accent}>
            {t('auth.forgot')}
          </Text>
        </Pressable>

        <Button title={t('auth.submit')} size="lg" onPress={submit} loading={busy} />
        
        {googleSignInAvailable && (
          <>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text variant="small" color={colors.muted} style={styles.dividerText}>
                {t('auth.or')}
              </Text>
              <View style={styles.dividerLine} />
            </View>

            <Button title={t('auth.googleSignIn')} variant="secondary" size="lg" onPress={handleGoogleSignIn} loading={googleBusy} icon="chrome" />
          </>
        )}

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
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerText: { marginHorizontal: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
});
