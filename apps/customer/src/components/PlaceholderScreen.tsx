import type { Icon } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeContext';
/** Centered "coming soon" placeholder for tabs not yet implemented. */
export function PlaceholderScreen({ icon: IconComp, title, children }: { icon: Icon; title: string; children?: ReactNode }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: theme.bgCanvas, padding: 24 }}>
      <IconComp size={40} color={theme.secondary} weight="duotone" />
      <Text variant="h3">{title}</Text>
      <Text variant="small" color={theme.fg3}>
        {t('common.comingSoon')}
      </Text>
      {children}
    </View>
  );
}
