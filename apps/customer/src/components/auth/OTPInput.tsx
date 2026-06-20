import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { Text } from '@/components/ui/Text';

export interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

/** Boxed 6-digit code entry — a hidden numeric input drives the visual boxes. */
export function OTPInput({ value, onChange, length = 6 }: OTPInputProps) {
  const theme = useTheme();
  const isRTL = useIsRTL();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 9, justifyContent: 'center' }}>
        {digits.map((digit, i) => {
          const active = focused && i === activeIndex;
          return (
            <View
              key={i}
              style={{
                width: 46,
                height: 56,
                borderRadius: 13,
                backgroundColor: digit ? theme.brandSubtle : theme.bgSurface,
                borderWidth: 1.5,
                borderColor: digit || active ? theme.brand : theme.borderStrong,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ fontFamily: fonts.sans.bold, fontSize: 24, color: theme.fg1 }}>{digit}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/[^0-9]/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
      />
    </Pressable>
  );
}
