import type { Icon } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii } from '@/theme/tokens';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  /** Leading icon, e.g. ph-envelope-simple. */
  icon?: Icon;
  /** Trailing icon, e.g. the password-reveal eye. */
  trailingIcon?: Icon;
  onTrailingIconPress?: () => void;
  error?: string;
}

/** Text field — matches the `FakeField` layout in screens3.jsx. */
export function Input({
  label,
  icon: LeadingIcon,
  trailingIcon: TrailingIcon,
  onTrailingIconPress,
  error,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const isRTL = useIsRTL();
  const [focused, setFocused] = useState(false);
  const fontFamily = isRTL ? fonts.arSans.regular : fonts.sans.regular;
  const labelFontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;
  const borderColor = error ? theme.danger : focused ? theme.brand : theme.borderStrong;

  return (
    <View>
      {label && (
        <Text style={{ fontFamily: labelFontFamily, fontSize: 12.5, color: theme.fg2, marginBottom: 7 }}>
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: theme.bgSurface,
          borderWidth: 1.5,
          borderColor,
          borderRadius: radii.md,
          paddingVertical: 13,
          paddingHorizontal: 14,
        }}>
        {LeadingIcon && <LeadingIcon size={18} color={theme.fg3} />}
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={error}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={theme.fg3}
          textAlign={isRTL ? 'right' : 'left'}
          style={[{ flex: 1, fontFamily, fontSize: 14, color: theme.fg1, padding: 0 }, style]}
        />
        {TrailingIcon && (
          <Pressable onPress={onTrailingIconPress} hitSlop={8} accessibilityRole="button" accessibilityLabel="Toggle">
            <TrailingIcon size={18} color={theme.fg3} />
          </Pressable>
        )}
      </View>
      {error && (
        <Text variant="caption" color={theme.danger} style={{ marginTop: 6 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
