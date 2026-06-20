import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Stars } from '@/components/ui/Badge';
import { Photo } from '@/components/ui/Photo';
import { Text } from '@/components/ui/Text';
import type { Planner } from '@/data/planners';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';
import { radii, shadows } from '@/theme/tokens';

export interface FeaturedCardProps {
  planner: Planner;
  onPress: (planner: Planner) => void;
}

/** Featured-planner carousel card — matches the featured card in `DiscoverScreen` (screens.jsx). */
export function FeaturedCard({ planner, onPress }: FeaturedCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };

  return (
    <Pressable
      onPress={() => onPress(planner)}
      style={[
        shadows.md,
        {
          width: 220,
          backgroundColor: theme.bgSurface,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: theme.border,
          overflow: 'hidden',
        },
      ]}>
      <Photo seed={planner.seed} style={{ height: 116 }} label={planner.premium ? `★ ${t('foundation.premium')}` : undefined} />
      <View style={{ padding: 13 }}>
        <Text variant="h4" numberOfLines={1}>
          {planner.name}
        </Text>
        <View style={[row, { justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }]}>
          <Text variant="caption" numberOfLines={1} style={{ flex: 1 }}>
            {t(`cities.${planner.city}`)} · {planner.type}
          </Text>
          <Stars rating={planner.rating} />
        </View>
      </View>
    </Pressable>
  );
}
