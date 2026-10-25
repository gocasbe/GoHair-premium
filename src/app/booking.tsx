import { Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Feedback';
import { Card, Chip, Header, Input } from '@/components/ui/Primitives';
import { Text } from '@/components/ui/Text';
import { Booking, L, SLOTS, fmtTime, salons } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { store, useStore } from '@/lib/store';
import { colors, radius, shadow } from '@/lib/theme';

const DAYS = 14;

/**
 * Tunnel de réservation en 3 étapes : 1 créneau → 2 récapitulatif & paiement → 3 confirmation.
 * Les prestations sont déjà choisies sur la fiche salon : aucune saisie inutile.
 */
export default function BookingScreen() {
  const { salon: salonId, services: ids } = useLocalSearchParams<{ salon: string; services: string }>();
  const { t, lang, money } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { uid } = useSession();
  const salon = salons.find((s) => s.id === salonId) ?? salons[0];
  const allServices = useStore((s) => s.services);
  const staff = useStore((s) => s.staff).filter((s) => s.active);
  const bookings = useStore((s) => s.bookings);

  const chosen = useMemo(() => allServices.filter((s) => (ids ?? '').split(',').includes(s.id)), [allServices, ids]);
  const total = chosen.reduce((n, s) => n + s.price, 0);

  const [step, setStep] = useState(0);
  const [day, setDay] = useState(dayjs().format('YYYY-MM-DD'));
  const [time, setTime] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [pay, setPay] = useState<'onsite' | 'card'>('onsite');
  const [note, setNote] = useState('');

  const days = useMemo(() => Array.from({ length: DAYS }, (_, i) => dayjs().add(i, 'day')), []);

  /** créneau indisponible : passé, ou capacité atteinte (tout le salon, ou le/la coiffeur·se choisi·e) */
  const taken = (slot: string) => {
    if (day === dayjs().format('YYYY-MM-DD') && slot <= dayjs().format('HH:mm')) return true;
    const at = bookings.filter((b) => b.salonId === salon.id && b.date === day && b.time === slot && b.status !== 'canceled');
    return staffId ? at.some((b) => b.staffId === staffId) : at.length >= Math.max(1, staff.length);
  };
  const free = SLOTS.filter((s) => !taken(s));
  const morning = SLOTS.filter((s) => s < '12:00');
  const afternoon = SLOTS.filter((s) => s >= '12:00');

  // si le créneau choisi devient indisponible (changement de jour / coiffeur), on le désélectionne
  useEffect(() => {
    if (time && taken(time)) setTime(null);
  }, [day, staffId]); // eslint-disable-line react-hooks/exhaustive-deps

  const back = () => (step === 0 || step === 2 ? (router.canGoBack() ? router.back() : router.replace('/home')) : setStep(step - 1));
  const next = () => {
    if (step === 0 && !time) return toast(t('book.needTime'), 'error');
    setStep(step + 1);
  };

  const confirm = () => {
    const b: Booking = { id: `m${Date.now()}`, salonId: salon.id, customer: (uid ?? 'client').split('@')[0], mine: true, serviceIds: chosen.map((s) => s.id), staffId, date: day, time: time!, status: 'pending', total, pay };
    store.addBooking(b);
    setStep(2);
  };

  const when = `${dayjs(day).format('dddd D MMMM')} · ${time ? fmtTime(time, lang) : ''}`;

  return (
    <View style={{ flex: 1 }}>
      {step < 2 ? <Header title={t('book.title')} onBack={back} /> : <View style={{ height: insets.top + 24 }} />}
      {step < 2 ? <Progress step={step} labels={[t('book.step1'), t('book.step2'), t('book.step3')]} /> : null}

      {step === 0 && (
        <>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
            <Text variant="title">{t('book.pickDate')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: 14 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
              {days.map((d) => {
                const key = d.format('YYYY-MM-DD');
                const on = key === day;
                return (
                  <Pressable key={key} onPress={() => setDay(key)} accessibilityRole="button" accessibilityState={{ selected: on }} style={[styles.day, on && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                    <Text variant="caption" color={on ? 'rgba(255,255,255,0.8)' : colors.muted} style={{ fontSize: 10 }}>
                      {d.format('ddd')}
                    </Text>
                    <Text variant="title" color={on ? '#fff' : colors.ink}>
                      {d.format('D')}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text variant="title" style={{ marginTop: 28 }}>
              {t('book.stylist')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: 14 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
              <Chip label={t('book.any')} icon="users" selected={staffId === null} onPress={() => setStaffId(null)} />
              {staff.map((m) => (
                <Chip key={m.id} label={m.name.split(' ')[0]} selected={staffId === m.id} onPress={() => setStaffId(m.id)} />
              ))}
            </ScrollView>

            <Text variant="title" style={{ marginTop: 28 }}>
              {t('book.pickTime')}
            </Text>
            {free.length === 0 ? (
              <Text color={colors.muted} style={{ marginTop: 14 }}>
                {t('book.noSlots')}
              </Text>
            ) : (
              [[t('book.morning'), morning], [t('book.afternoon'), afternoon]].map(([label, slots]) => (
                <View key={label as string}>
                  <Text variant="caption" color={colors.faint} style={{ marginTop: 18, marginBottom: 10 }}>
                    {label as string}
                  </Text>
                  <View style={styles.slots}>
                    {(slots as string[]).map((s) => {
                      const off = taken(s);
                      const on = time === s;
                      return (
                        <Pressable key={s} disabled={off} onPress={() => setTime(s)} accessibilityRole="button" accessibilityState={{ selected: on, disabled: off }} style={[styles.slot, off && { opacity: 0.35 }, on && { backgroundColor: colors.ink, borderColor: colors.ink }]}>
                          <Text variant="small" weight="bold" color={on ? '#fff' : colors.ink} style={off ? { textDecorationLine: 'line-through' } : undefined}>
                            {fmtTime(s, lang)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          <Footer insets={insets.bottom}>
            <Button title={t('book.next')} size="lg" iconRight="arrow-right" onPress={next} style={{ flex: 1, opacity: time ? 1 : 0.6 }} />
          </Footer>
        </>
      )}

      {step === 1 && (
        <>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
            <Text variant="title">{t('book.recap')}</Text>
            <Card style={{ marginTop: 14, gap: 14 }}>
              <Line icon="calendar" label={t('book.when')} value={when} />
              <Line icon="map-pin" label={t('book.where')} value={`${salon.name} — ${salon.address}`} />
              <View style={{ height: 1, backgroundColor: colors.line }} />
              <Text variant="caption" color={colors.faint}>
                {t('book.what')}
              </Text>
              {chosen.map((s) => (
                <View key={s.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ flex: 1 }}>{L(s.name, lang)}</Text>
                  <Text weight="bold">{money(s.price)}</Text>
                </View>
              ))}
              <View style={{ height: 1, backgroundColor: colors.line }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="heading">{t('book.total')}</Text>
                <Text variant="title">{money(total)}</Text>
              </View>
            </Card>

            <Text variant="title" style={{ marginTop: 28, marginBottom: 14 }}>
              {t('book.payment')}
            </Text>
            {([['onsite', 'credit-card', 'book.onsite', 'book.onsiteHint'], ['card', 'lock', 'book.card', 'book.cardHint']] as const).map(([k, icon, label, hint]) => (
              <Pressable key={k} onPress={() => setPay(k)} accessibilityRole="radio" accessibilityState={{ checked: pay === k }} style={[styles.pay, pay === k && { borderColor: colors.accent }]}>
                <Feather name={icon === 'credit-card' ? 'home' : icon} size={20} color={pay === k ? colors.accent : colors.muted} />
                <View style={{ flex: 1 }}>
                  <Text weight="bold">{t(label)}</Text>
                  <Text variant="small" color={colors.muted}>
                    {t(hint)}
                  </Text>
                </View>
                <View style={[styles.radio, pay === k && { borderColor: colors.accent }]}>{pay === k ? <View style={styles.dot} /> : null}</View>
              </Pressable>
            ))}
            <View style={{ marginTop: 10 }}>
              <Input value={note} onChangeText={setNote} placeholder={t('book.note')} multiline style={{ paddingVertical: 12 }} />
            </View>
          </ScrollView>
          <Footer insets={insets.bottom}>
            <View style={{ flex: 1 }}>
              <Button title={t('book.confirm', { amount: money(total) })} size="lg" icon="check" onPress={confirm} />
              <Text variant="small" color={colors.muted} align="center" style={{ marginTop: 8 }}>
                {t('book.free')}
              </Text>
            </View>
          </Footer>
        </>
      )}

      {step === 2 && (
        <View style={{ flex: 1, padding: 24, paddingBottom: insets.bottom + 24 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Tick />
            <Text variant="display" align="center" style={{ marginTop: 28 }}>
              {t('book.doneTitle')}
            </Text>
            <Text color={colors.muted} align="center" style={{ marginTop: 8, maxWidth: 320 }}>
              {t('book.doneSub')}
            </Text>
            <Card style={{ alignSelf: 'stretch', marginTop: 28, gap: 12 }}>
              <Line icon="calendar" label={t('book.when')} value={when} />
              <Line icon="map-pin" label={t('book.where')} value={salon.name} />
              <Line icon="scissors" label={t('book.what')} value={chosen.map((s) => L(s.name, lang)).join(' · ')} />
            </Card>
          </View>
          <Button title={t('book.viewBookings')} size="lg" onPress={() => router.replace('/bookings')} />
          <Button title={t('book.home')} variant="ghost" onPress={() => router.replace('/home')} style={{ marginTop: 6 }} />
        </View>
      )}
    </View>
  );
}

function Progress({ step, labels }: { step: number; labels: string[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 4 }}>
      {labels.map((l, i) => (
        <View key={l} style={{ flex: 1 }}>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: i <= step ? colors.accent : colors.line }} />
          <Text variant="small" weight={i === step ? 'bold' : 'regular'} color={i <= step ? colors.ink : colors.faint} style={{ marginTop: 6, fontSize: 12 }}>
            {i + 1}. {l}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Line({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View style={styles.lineIcon}>
        <Feather name={icon} size={16} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="small" color={colors.muted}>
          {label}
        </Text>
        <Text weight="semibold" style={{ textTransform: 'none' }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function Footer({ children, insets }: { children: React.ReactNode; insets: number }) {
  return <View style={[styles.footer, shadow.lift, { paddingBottom: insets + 14 }]}>{children}</View>;
}

/** Coche animée de confirmation (ressort + halo). */
function Tick() {
  const scale = useRef(new Animated.Value(0.4)).current;
  const halo = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }), Animated.timing(halo, { toValue: 1, duration: 600, useNativeDriver: true })]).start();
  }, [scale, halo]);
  return (
    <Animated.View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', opacity: halo, transform: [{ scale }] }}>
      <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name="check" size={40} color="#fff" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  day: { width: 62, height: 78, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: { minWidth: 88, height: 44, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  pay: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, marginBottom: 10 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  lineIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', paddingHorizontal: 20, paddingTop: 14, backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
});
