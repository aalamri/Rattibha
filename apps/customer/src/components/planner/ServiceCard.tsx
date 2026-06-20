import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Photo } from '@/components/ui/Photo';
import { Text } from '@/components/ui/Text';
import type { PlannerService } from '@/data/planners';
import { formatNumber } from '@/lib/format';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii, shadows } from '@/theme/tokens';
import { useIsRTL } from '@/i18n/useIsRTL';

export interface ServiceCardProps {
  service: PlannerService;
}

/** Planner service card — matches the services carousel in `PlannerScreen` (screens.jsx). */
export function ServiceCard({ service }: ServiceCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();

  return (
    <View
      style={[
        shadows.sm,
        {
          width: 152,
          backgroundColor: theme.bgSurface,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: radii.lg,
          overflow: 'hidden',
        },
      ]}>
      <Photo seed={service.seed} style={{ height: 92 }} />
      <View style={{ padding: 12, gap: 4 }}>
        <Text variant="small" style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold }} numberOfLines={1}>
          {service.name}
        </Text>
        <Text variant="caption" numberOfLines={2} style={{ lineHeight: 16 }}>
          {service.desc}
        </Text>
        <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 12.5, color: theme.brand, marginTop: 2 }}>
          {t('common.from')} {t('common.sar')} {formatNumber(service.from, isRTL)}
        </Text>
      </View>
    </View>
  );
}
