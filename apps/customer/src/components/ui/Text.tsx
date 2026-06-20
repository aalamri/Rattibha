import { Text as RNText, type TextProps } from 'react-native';

import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';
import { getDisplayItalicFont, getTextStyle, type TypographyVariant } from '@/theme/typography';

export interface AppTextProps extends TextProps {
  /** Type-scale variant, matches the .display/.h1-.h4/.lead/.body/.small/.caption/.overline classes. */
  variant?: TypographyVariant;
  color?: string;
}

export function Text({ variant = 'body', color, style, ...rest }: AppTextProps) {
  const isRTL = useIsRTL();
  const base = getTextStyle(variant, isRTL);
  return <RNText {...rest} style={[base, color ? { color } : null, style]} />;
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
      style={[base, { fontFamily: getDisplayItalicFont('semibold', isRTL), color: theme.brand }, style]}
    />
  );
}
