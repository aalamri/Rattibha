/**
 * Rattibha design tokens — spacing, radii, shadows, motion.
 * Ported from colors_and_type.css. Keep in sync with tailwind.config.js.
 */
import { Platform } from 'react-native';
import { colors } from './colors';

/** 4px base spacing scale (matches Tailwind's default scale 1:1). */
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const radii = {
  xs: 6,
  sm: 10,
  md: 14, // buttons / inputs
  lg: 20, // cards
  xl: 28,
  '2xl': 36,
  pill: 999,
} as const;

/** Purple-tinted soft shadows, approximated for React Native's shadow* / elevation. */
export const shadows = {
  xs: shadow(colors.plum900, 0.06, 1, 2, 1),
  sm: shadow(colors.plum900, 0.07, 2, 6, 2),
  md: shadow(colors.plum900, 0.16, 6, 16, 6),
  lg: shadow(colors.plum900, 0.22, 10, 24, 10),
  brand: shadow(colors.purple500, 0.45, 8, 20, 8),
  gold: shadow(colors.gold500, 0.5, 6, 16, 6),
} as const;

function shadow(
  color: string,
  opacity: number,
  offsetY: number,
  radius: number,
  elevation: number,
) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Platform.OS === 'android' ? elevation : 0,
  };
}

export const motion = {
  fast: 140,
  base: 240,
  slow: 420,
  // cubic-bezier(.22,1,.36,1) — feed into Easing.bezier(...)
  ease: [0.22, 1, 0.36, 1] as const,
  easeOut: [0.16, 1, 0.3, 1] as const,
};
