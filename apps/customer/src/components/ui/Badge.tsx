import { Star, type Icon } from 'phosphor-react-native';
import { View } from 'react-native';

import { useIsRTL } from '@/i18n/useIsRTL';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { radii } from '@/theme/tokens';
import { Text } from './Text';

export interface BadgeProps {
  children: string;
  bg?: string;
  fg?: string;
  icon?: Icon;
  iconWeight?: 'regular' | 'fill';
}

/** Small pill label — matches the `Badge` primitive in ui.jsx. */
export function Badge({ children, bg = colors.purple100, fg = colors.purple700, icon: IconComp, iconWeight = 'fill' }: BadgeProps) {
  const isRTL = useIsRTL();
  const fontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;
  return (
    <View
      style={{
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        paddingVertical: 3,
        paddingHorizontal: 9,
        borderRadius: radii.pill,
        backgroundColor: bg,
      }}>
      {IconComp && <IconComp size={13} color={fg} weight={iconWeight} />}
      <Text style={{ fontFamily, fontSize: 11.5, color: fg, lineHeight: 14 }}>{children}</Text>
    </View>
  );
}

/** Rating pill — gold background with a filled star, matches `Stars` in ui.jsx. */
export function Stars({ rating }: { rating: number | string }) {
  return (
    <Badge bg={colors.gold200} fg="#7A5A14" icon={Star} iconWeight="fill">
      {String(rating)}
    </Badge>
  );
}
