import type { Icon } from 'phosphor-react-native';
import { ActivityIndicator, Pressable, type PressableProps, View } from 'react-native';

import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii, shadows } from '@/theme/tokens';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'gold' | 'secondary' | 'ghost' | 'dark';
export type ButtonSize = 'sm' | 'md';
export type ButtonIconWeight = 'regular' | 'fill' | 'bold' | 'duotone' | 'light' | 'thin';

const SIZES: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number; iconSize: number }> = {
  sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13, iconSize: 15 },
  md: { paddingVertical: 13, paddingHorizontal: 20, fontSize: 15, iconSize: 17 },
};

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Phosphor icon component, rendered before the label (after in RTL). */
  icon?: Icon;
  /** Icon weight — defaults to 'regular'. Use 'fill' for filled icons. */
  iconWeight?: ButtonIconWeight;
  full?: boolean;
  loading?: boolean;
}

/**
 * Three-layer button:
 *   1. Outer View  — holds backgroundColor/border/shadow (immune to NativeWind CssInterop stripping)
 *   2. Pressable   — touch target with pressed-opacity feedback
 *   3. Inner View  — static flexDirection:'row' so layout is never subject to Pressable style-function timing
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: IconComp,
  iconWeight = 'regular',
  full,
  loading,
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  onLongPress,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isRTL = useIsRTL();
  const VARIANTS: Record<ButtonVariant, { bg: string; fg: string; borderColor?: string; shadow?: object }> = {
    primary: { bg: theme.brand, fg: theme.fgOnBrand, shadow: shadows.brand },
    gold: { bg: theme.accent, fg: theme.fg1 },
    secondary: { bg: theme.bgSurface, fg: theme.fg1, borderColor: theme.borderStrong },
    ghost: { bg: 'transparent', fg: theme.brand },
    dark: { bg: theme.fg1, fg: theme.fgOnDark },
  };
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const fontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;
  const dir: 'row' | 'row-reverse' = isRTL ? 'row-reverse' : 'row';

  return (
    <View
      style={[
        {
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderColor: v.borderColor ?? 'transparent',
          backgroundColor: v.bg,
          alignSelf: full ? 'stretch' : undefined,
          opacity: disabled ? 0.5 : 1,
          overflow: 'hidden',
        },
        v.shadow,
      ]}>
      <Pressable
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={children}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onLongPress={onLongPress}
        {...rest}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
        {/* Static View ensures flexDirection:'row' is always applied — never subject to Pressable style-function timing */}
        <View
          style={{
            flexDirection: dir,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: s.paddingVertical,
            paddingHorizontal: s.paddingHorizontal,
          }}>
          {loading ? (
            <ActivityIndicator color={v.fg} size="small" />
          ) : (
            <>
              {IconComp && <IconComp size={s.iconSize} color={v.fg} weight={iconWeight} />}
              <Text style={{ fontFamily, fontSize: s.fontSize, color: v.fg, lineHeight: s.fontSize * 1.2 }}>
                {children}
              </Text>
            </>
          )}
        </View>
      </Pressable>
    </View>
  );
}
