import { Crown, MapPin } from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Badge, Stars } from '@/components/ui/Badge';
import { Photo } from '@/components/ui/Photo';
import { Text } from '@/components/ui/Text';
import type { Planner } from '@/data/planners';
import { useIsRTL } from '@/i18n/useIsRTL';
import { formatNumber } from '@/lib/format';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii, shadows } from '@/theme/tokens';

export interface PlannerRowProps {
  planner: Planner;
  onPress: (planner: Planner) => void;
}

/** Horizontal planner listing card — matches `PlannerRow` in screens.jsx. */
export function PlannerRow({ planner, onPress }: PlannerRowProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };

  return (
    <Pressable
      onPress={() => onPress(planner)}
      style={[
        row,
        shadows.sm,
        {
          gap: 12,
          backgroundColor: theme.bgSurface,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 10,
        },
      ]}>
      <Photo seed={planner.seed} style={{ width: 92, height: 92, borderRadius: 13 }} />
      <View style={{ flex: 1, paddingTop: 2, gap: 3 }}>
        <View style={[row, { justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }]}>
          <Text variant="h4" style={{ flex: 1 }} numberOfLines={1}>
            {planner.name}
          </Text>
          <Stars rating={planner.rating} />
        </View>
        <View style={[row, { alignItems: 'center', gap: 4 }]}>
          <MapPin size={14} color={theme.fg3} />
          <Text variant="caption">
            {t(`cities.${planner.city}`)} · {planner.type}
          </Text>
        </View>
        <View style={[row, { gap: 6, marginTop: 5, alignItems: 'center' }]}>
          {planner.premium && (
            <Badge bg={theme.accentSoft} fg="#7A5A14" icon={Crown}>
              {t('foundation.premium')}
            </Badge>
          )}
          <View style={{ flex: 1 }} />
          <Text style={{ fontFamily: isRTL ? fonts.arSans.regular : fonts.sans.regular, fontSize: 12, color: theme.fg3 }}>
            {t('common.from')}{' '}
            <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 14, color: theme.fg1 }}>
              {t('common.sar')} {formatNumber(planner.from, isRTL)}
            </Text>
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
