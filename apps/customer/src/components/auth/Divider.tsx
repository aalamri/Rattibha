import { View } from 'react-native';

import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';
import { Text } from '@/components/ui/Text';

/** Horizontal rule with a centered label, e.g. "or continue with". */
export function Divider({ label }: { label: string }) {
  const theme = useTheme();
  const isRTL = useIsRTL();
  return (
    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, marginVertical: 18 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
      <Text variant="caption">{label}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
    </View>
  );
}
