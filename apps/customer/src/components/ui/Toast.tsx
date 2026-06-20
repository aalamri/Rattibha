import { CheckCircle, Warning, X, XCircle } from 'phosphor-react-native';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './Text';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii, shadows } from '@/theme/tokens';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
  anim: Animated.Value;
}

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isRTL = useIsRTL();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const insets = useSafeAreaInsets();

  const TONE_CONFIG: Record<ToastTone, { bg: string; border: string; icon: typeof CheckCircle; iconColor: string }> = {
    success: { bg: '#F0FDF4', border: '#86EFAC', icon: CheckCircle, iconColor: '#16A34A' },
    error:   { bg: '#FEF2F2', border: '#FCA5A5', icon: XCircle,     iconColor: '#DC2626' },
    info:    { bg: theme.bgSurface, border: theme.border, icon: Warning, iconColor: theme.brand },
  };

  const dismiss = useCallback((id: number, anim: Animated.Value) => {
    Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    });
  }, []);

  const show = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = ++counter.current;
    const anim = new Animated.Value(0);

    setToasts((prev) => [...prev.slice(-2), { id, message, tone, anim }]);

    Animated.spring(anim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 220 }).start();

    setTimeout(() => dismiss(id, anim), 3200);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', top: insets.top + 12, left: 16, right: 16, gap: 8, zIndex: 9999 }}>
        {toasts.map((t) => {
          const cfg = TONE_CONFIG[t.tone];
          const IconComp = cfg.icon;
          return (
            <Animated.View
              key={t.id}
              style={[
                shadows.md,
                {
                  backgroundColor: cfg.bg,
                  borderWidth: 1,
                  borderColor: cfg.border,
                  borderRadius: radii.md,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  opacity: t.anim,
                  transform: [{ translateY: t.anim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
                },
              ]}>
              <IconComp size={20} color={cfg.iconColor} weight="fill" />
              <Text style={{ flex: 1, fontFamily: isRTL ? fonts.arSans.semibold : fonts.sans.semibold, fontSize: 13.5, color: '#1a1a1a', lineHeight: 18 }}>
                {t.message}
              </Text>
              <Pressable onPress={() => dismiss(t.id, t.anim)} hitSlop={8}>
                <X size={16} color="#9ca3af" />
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}
