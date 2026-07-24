import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radii } from '@/theme/tokens';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: object;
}

export function Skeleton({ width, height = 14, radius = radii.sm, style }: SkeletonProps) {
  const theme = useTheme();
  const animRef = useRef<Animated.Value | null>(null);
  if (animRef.current === null) {
    animRef.current = new Animated.Value(0.4);
  }
  // React Native's Animated API pattern: animRef.current is a stable
  // reference for the component's lifetime (assigned once, above) whose
  // internal numeric value is driven outside React's render cycle by the
  // native driver — not the "ref value that changes between renders" case
  // this rule targets.
  // eslint-disable-next-line react-hooks/refs
  const anim = animRef.current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.9, duration: 850, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 850, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <Animated.View
      style={[
        { width: width ?? '100%', height, borderRadius: radius, backgroundColor: theme.bgSunken, opacity: anim },
        style,
      ]}
    />
  );
}

export function SkeletonRow({ gap = 10, children }: { gap?: number; children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap, alignItems: 'center' }}>{children}</View>;
}

export function SkeletonCard({ children, style }: { children: React.ReactNode; style?: object }) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.bgSurface,
          borderRadius: radii.lg,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.border,
          gap: 10,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
