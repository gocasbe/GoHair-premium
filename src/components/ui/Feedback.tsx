import { Feather } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow } from '@/lib/theme';
import { Text } from './Text';

type Kind = 'success' | 'error' | 'info';
const ctx = createContext<(message: string, kind?: Kind) => void>(() => {});
export const useToast = () => useContext(ctx);

/** Toast discret en haut de l'écran (2,4 s). */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [t, setT] = useState<{ message: string; kind: Kind } | null>(null);
  const op = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, kind: Kind = 'info') => {
    if (timer.current) clearTimeout(timer.current);
    setT({ message, kind });
    Animated.timing(op, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    timer.current = setTimeout(() => Animated.timing(op, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setT(null)), 2400);
  }, [op]);

  const value = useMemo(() => show, [show]);
  const icon = t?.kind === 'success' ? 'check-circle' : t?.kind === 'error' ? 'alert-circle' : 'info';
  const tone = t?.kind === 'success' ? colors.success : t?.kind === 'error' ? colors.danger : colors.accent;
  return (
    <ctx.Provider value={value}>
      {children}
      {t ? (
        <Animated.View pointerEvents="none" style={[styles.wrap, { top: insets.top + 12, opacity: op }]}>
          <View style={[styles.toast, shadow.lift]}>
            <Feather name={icon} size={18} color={tone} />
            <Text variant="small" weight="semibold" style={{ flexShrink: 1 }}>
              {t.message}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </ctx.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 50 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.pill, maxWidth: 420 },
});
