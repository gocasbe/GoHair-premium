import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AdminTop } from '@/components/AdminTop';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Feedback';
import { Avatar, Input, Toggle } from '@/components/ui/Primitives';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { L, Staff } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { store, useStore } from '@/lib/store';
import { colors, radius, shadow } from '@/lib/theme';

type Draft = { id: string | null; name: string; role: string; active: boolean };

/** Gestion de l'équipe : disponibilité à la réservation, création / édition / suppression. */
export default function Team() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const staff = useStore((s) => s.staff);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [err, setErr] = useState('');

  const open = (s?: Staff) => {
    setErr('');
    setDraft(s ? { id: s.id, name: s.name, role: L(s.role, lang), active: s.active } : { id: null, name: '', role: '', active: true });
  };
  const save = () => {
    if (!draft) return;
    if (!draft.name.trim()) return setErr(t('admin.needName'));
    const prev = staff.find((s) => s.id === draft.id);
    store.upsertStaff({
      id: draft.id ?? `e${Date.now()}`,
      name: draft.name.trim(),
      role: prev && L(prev.role, lang) === draft.role ? prev.role : { fr: draft.role.trim(), en: draft.role.trim() },
      rating: prev?.rating ?? 5,
      active: draft.active,
    });
    setDraft(null);
    toast(t('admin.saved'), 'success');
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <AdminTop title={t('admin.team')} action={<Button title={t('add')} icon="plus" onPress={() => open()} style={{ height: 44 }} />} />
        <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
          {staff.map((s) => (
            <Pressable key={s.id} onPress={() => open(s)} accessibilityRole="button" style={[styles.row, shadow.soft, !s.active && { opacity: 0.6 }]}>
              <Avatar name={s.name} size={52} tone={colors.goldSoft} color={colors.gold} />
              <View style={{ flex: 1 }}>
                <Text variant="heading" numberOfLines={1}>
                  {s.name}
                </Text>
                <Text variant="small" color={colors.muted} numberOfLines={1}>
                  {L(s.role, lang)}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Feather name="star" size={12} color={colors.gold} />
                  <Text variant="small" weight="bold" style={{ fontSize: 12 }}>
                    {s.rating.toFixed(1)}
                  </Text>
                </View>
              </View>
              <Toggle value={s.active} onChange={(v) => store.upsertStaff({ ...s, active: v })} label={t('admin.available')} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Sheet visible={!!draft} onClose={() => setDraft(null)} title={draft?.id ? t('admin.editStaff') : t('admin.newStaff')}>
        {draft ? (
          <>
            <Input label={t('admin.staffName')} value={draft.name} onChangeText={(v) => setDraft({ ...draft, name: v })} error={err} autoCapitalize="words" />
            <Input label={t('admin.staffRole')} value={draft.role} onChangeText={(v) => setDraft({ ...draft, role: v })} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text weight="semibold">{t('admin.available')}</Text>
              <Toggle value={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} label={t('admin.available')} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {draft.id ? (
                <Button
                  title={t('delete')}
                  variant="danger"
                  icon="trash-2"
                  onPress={() => {
                    store.removeStaff(draft.id!);
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: 12 },
});
