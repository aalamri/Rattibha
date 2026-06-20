import { StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';
import { getDisplayItalicFont, getTextStyle, type TypographyVariant } from '@/theme/typography';

export interface AppTextProps extends TextProps {
  /** Type-scale variant, matches the .display/.h1-.h4/.lead/.body/.small/.caption/.overline classes. */
  variant?: TypographyVariant;
  color?: string;
}

/**
 * Many screens pass a one-off `lineHeight` tuned by eye for the English copy
 * (e.g. `style={{ lineHeight: 28 }}`). Those values are routinely too tight
 * for Arabic — see the comment in typography.ts — so in RTL we drop any
 * caller-provided `lineHeight` and keep the font-appropriate one from
 * `getTextStyle`. Everything else in the override (color, textAlign, etc.)
 * still applies normally.
 */
function dropLineHeightOverride(style: TextProps['style'], isRTL: boolean) {
  if (!isRTL || !style) return style;
  const flat = StyleSheet.flatten(style) as TextStyle;
  if (flat.lineHeight === undefined) return style;
  const { lineHeight: _omit, ...rest } = flat;
  return rest;
}

export function Text({ variant = 'body', color, style, ...rest }: AppTextProps) {
  const isRTL = useIsRTL();
  const base = getTextStyle(variant, isRTL);
  return <RNText {...rest} style={[base, color ? { color } : null, dropLineHeightOverride(style, isRTL)]} />;
}

/**
 * Italic brand-purple accent word used inside display headings
 * (e.g. "Plan your *perfect* celebration").
 */
export function AccentText({ variant = 'display', style, ...rest }: AppTextProps) {
  const isRTL = useIsRTL();
  const theme = useTheme();
  const base = getTextStyle(variant, isRTL);
  return (
    <RNText
      {...rest}
      style={[
        base,
        { fontFamily: getDisplayItalicFont('semibold', isRTL), color: theme.brand },
        dropLineHeightOverride(style, isRTL),
      ]}
    />
  );
}
