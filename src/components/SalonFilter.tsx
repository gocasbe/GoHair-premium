import React, { useSyncExternalStore } from 'react';
import { ScrollView } from 'react-native';
import { Chip } from '@/components/ui/Primitives';
import { salons } from '@/lib/data';
import { useI18n } from '@/lib/i18n';

/**
 * Filtre « salon » de l'espace admin, partagé entre tableau de bord et planning
 * (le choix est conservé quand on passe d'un écran à l'autre). null = tous les salons.
 */
let current: string | null = null;
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const setSalon = (id: string | null) => {
  current = id;
  listeners.forEach((l) => l());
};

export function useSalonFilter() {
  const salonId = useSyncExternalStore(subscribe, () => current, () => current);
  return { salonId, setSalon, matches: (bookingSalonId: string) => salonId === null || bookingSalonId === salonId };
}

export function SalonFilter() {
  const { t } = useI18n();
  const { salonId } = useSalonFilter();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14, flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
      <Chip label={t('admin.allSalons')} icon="grid" selected={salonId === null} onPress={() => setSalon(null)} />
      {salons.map((s) => (
        <Chip key={s.id} label={s.name} selected={salonId === s.id} onPress={() => setSalon(s.id)} />
      ))}
    </ScrollView>
  );
}
