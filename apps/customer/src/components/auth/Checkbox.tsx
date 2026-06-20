import { Check } from 'phosphor-react-native';
import { Pressable } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** 22px rounded checkbox, matches the terms-agreement control in screens3.jsx. */
export function Checkbox({ checked, onChange }: CheckboxProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={{
        width: 22,
        height: 22,
        borderRadius: 7,
        flexShrink: 0,
        backgroundColor: checked ? theme.brand : theme.bgSurface,
        borderWidth: 1.5,
        borderColor: checked ? theme.brand : theme.borderStrong,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {checked && <Check size={14} color="#fff" weight="bold" />}
    </Pressable>
  );
}
