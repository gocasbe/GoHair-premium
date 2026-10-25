import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AdminTop } from '@/components/AdminTop';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Feedback';
import { Badge, Chip, Input, Toggle } from '@/components/ui/Primitives';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { Category, L, Service } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { img } from '@/lib/images';
import { store, useStore } from '@/lib/store';
import { colors, radius, shadow } from '@/lib/theme';

const CATS: Category[] = ['women', 'men', 'kids', 'care'];
type Draft = { id: string | null; name: string; price: string; duration: string; category: Category; active: boolean };

/** Gestion des prestations : liste, activation en un geste, création / édition en feuille modale. */
export default function Services() {
  const { t, lang, money } = useI18n();
  const toast = useToast();
  const services = useStore((s) => s.services);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [err, setErr] = useState('');

  const open = (s?: Service) => {
    setErr('');
    setDraft(s ? { id: s.id, name: L(s.name, lang), price: String(s.price), duration: String(s.duration), category: s.category, active: s.active } : { id: null, name: '', price: '30', duration: '45', category: 'women', active: true });
  };
  const save = () => {
    if (!draft) return;
    if (!draft.name.trim()) return setErr(t('admin.needName'));
    const prev = services.find((s) => s.id === draft.id);
    store.upsertService({
      id: draft.id ?? `v${Date.now()}`,
      name: prev && L(prev.name, lang) === draft.name ? prev.name : { fr: draft.name.trim(), en: draft.name.trim() },
      category: draft.category,
      price: Math.max(0, Number(draft.price) || 0),
      duration: Math.max(5, Number(draft.duration) || 30),
      image: prev?.image ?? img.hairStyle,
      active: draft.active,
    });
    setDraft(null);
    toast(t('admin.saved'), 'success');
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <AdminTop title={t('admin.services')} action={<Button title={t('add')} icon="plus" onPress={() => open()} style={{ height: 44 }} />} />
        <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
          {services.map((s) => (
            <Pressable key={s.id} onPress={() => open(s)} accessibilityRole="button" style={[styles.row, shadow.soft, !s.active && { opacity: 0.6 }]}>
              <Image source={s.image} style={styles.thumb} contentFit="cover" />
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="heading" numberOfLines={1}>
                  {L(s.name, lang)}
                </Text>
                <Text variant="small" color={colors.muted}>
                  {t('min', { n: s.duration })} · {money(s.price)}
                </Text>
                <Badge label={t(`cat.${s.category}`)} tone="accent" />
              </View>
              <Toggle value={s.active} onChange={(v) => store.upsertService({ ...s, active: v })} label={t('admin.active')} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Sheet visible={!!draft} onClose={() => setDraft(null)} title={draft?.id ? t('admin.editService') : t('admin.newService')}>
        {draft ? (
          <>
            <Input label={t('admin.serviceName')} value={draft.name} onChangeText={(v) => setDraft({ ...draft, name: v })} error={err} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Input label={t('admin.price')} value={draft.price} onChangeText={(v) => setDraft({ ...draft, price: v.replace(/[^0-9]/g, '') })} keyboardType="number-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <Input label={t('admin.duration')} value={draft.duration} onChangeText={(v) => setDraft({ ...draft, duration: v.replace(/[^0-9]/g, '') })} keyboardType="number-pad" />
              </View>
            </View>
            <Text variant="small" weight="semibold" color={colors.muted} style={{ marginBottom: 8 }}>
              {t('admin.category')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {CATS.map((c) => (
                <Chip key={c} label={t(`cat.${c}`)} selected={draft.category === c} onPress={() => setDraft({ ...draft, category: c })} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text weight="semibold">{t('admin.active')}</Text>
              <Toggle value={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} label={t('admin.active')} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {draft.id ? (
                <Button
                  title={t('delete')}
                  variant="danger"
                  icon="trash-2"
                  onPress={() => {
                    store.removeService(draft.id!);
                    setDraft(null);
                    toast(t('admin.deleted'), 'success');
                  }}
                  style={{ flex: 1 }}
                />
              ) : null}
              <Button title={t('save')} onPress={save} style={{ flex: 1 }} />
            </View>
          </>
        ) : null}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 10, paddingRight: 16, backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: 12 },
  thumb: { width: 64, height: 64, borderRadius: 16 },
});
