import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Button } from '@/components/ui/Button';
import { Header, Input } from '@/components/ui/Primitives';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/lib/i18n';
import { sendPromoNotification } from '@/lib/notifications';
import { useToast } from '@/components/ui/Feedback';
import { colors } from '@/lib/theme';

/** Page admin pour créer et envoyer des notifications promo. */
export default function AdminPromos() {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const sendPromo = async () => {
    if (!title.trim() || !body.trim()) {
      toast('Veuillez remplir tous les champs', 'error');
      return;
    }

    setBusy(true);
    try {
      await sendPromoNotification(title.trim(), body.trim());
      toast('Promo envoyée avec succès', 'success');
      setTitle('');
      setBody('');
    } catch (error) {
      toast('Erreur lors de l\'envoi de la promo', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header onBack={() => router.back()} right={<LanguageSwitch />} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <Text variant="display" style={{ marginTop: 12 }}>
          Promotions
        </Text>
        <Text color={colors.muted} style={{ marginTop: 8, marginBottom: 24 }}>
          Envoyer une notification promotionnelle à tous les clients
        </Text>

        <Input label="Titre de la promo" icon="tag" value={title} onChangeText={setTitle} placeholder="Ex: -20% sur toutes les coupes" />
        <Input label="Description" icon="file-text" value={body} onChangeText={setBody} multiline numberOfLines={4} placeholder="Détails de l'offre..." style={{ minHeight: 100 }} />

        <Button title="Envoyer la promo" size="lg" onPress={sendPromo} loading={busy} style={{ marginTop: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
