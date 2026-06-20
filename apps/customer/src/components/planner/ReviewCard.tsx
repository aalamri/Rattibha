import { Star } from 'phosphor-react-native';
import { View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Text } from '@/components/ui/Text';
import type { REVIEWS } from '@/data/planners';
import { useIsRTL } from '@/i18n/useIsRTL';
import { colors } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii } from '@/theme/tokens';

export interface ReviewCardProps {
  review: (typeof REVIEWS)[number];
}

/** Customer review card — matches the reviews list in `PlannerScreen` (screens.jsx). */
export function ReviewCard({ review }: ReviewCardProps) {
  const theme = useTheme();
  const isRTL = useIsRTL();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };

  return (
    <View style={{ backgroundColor: theme.bgSurface, borderWidth: 1, borderColor: theme.border, borderRadius: radii.lg, padding: 14 }}>
      <View style={[row, { alignItems: 'center', gap: 10 }]}>
        <Avatar seed={review.seed} size={36} initials={review.who[0]} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 13.5, color: theme.fg1 }}>
            {review.who}
          </Text>
          <View style={[row, { gap: 1, marginTop: 1 }]}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12} weight="fill" color={i < review.rating ? theme.accent : colors.warm100} />
            ))}
          </View>
        </View>
      </View>
      <Text variant="small" style={{ marginTop: 9, lineHeight: 21 }}>
        {review.text}
      </Text>
    </View>
  );
}
