import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { PlannerPackage } from '@/data/planners';
import { useIsRTL } from '@/i18n/useIsRTL';
import { formatNumber } from '@/lib/format';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii, shadows } from '@/theme/tokens';

export interface PackageOptionProps {
  pkg: PlannerPackage;
  selected: boolean;
  onPress: () => void;
}

/** Selectable package row — matches the packages list in `PlannerScreen` (screens.jsx). */
export function PackageOption({ pkg, selected, onPress }: PackageOptionProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };

  return (
    <Pressable
      onPress={onPress}
      style={[
        row,
        selected ? shadows.brand : null,
        {
          alignItems: 'center',
          gap: 12,
          backgroundColor: theme.bgSurface,
          borderWidth: 1.5,
          borderColor: selected ? theme.brand : theme.border,
          borderRadius: radii.lg,
          paddingVertical: 13,
          paddingHorizontal: 15,
        },
      ]}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: radii.pill,
          borderWidth: 2,
          borderColor: selected ? theme.brand : theme.borderStrong,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {selected && <View style={{ width: 11, height: 11, borderRadius: radii.pill, backgroundColor: theme.brand }} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 15, color: theme.fg1 }}>
          {pkg.name}
        </Text>
        <Text variant="caption" style={{ marginTop: 1 }}>
          {pkg.note}
        </Text>
      </View>
      <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 15, color: theme.brand }}>
        {t('common.sar')} {formatNumber(pkg.price, isRTL)}
      </Text>
    </Pressable>
  );
}
