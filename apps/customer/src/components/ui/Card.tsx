import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { radii, shadows } from '@/theme/tokens';

export interface CardProps extends ViewProps {
  padding?: number;
  /** Use the larger `shadows.md` for cards that should feel raised (e.g. featured). */
  elevated?: boolean;
}

/** White surface card — radius 20, hairline border, purple-tinted shadow. */
export function Card({ padding = 16, elevated, style, children, ...rest }: CardProps) {
  const theme = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: theme.bgSurface,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: theme.border,
          padding,
        },
        elevated ? shadows.md : shadows.sm,
        style,
      ]}>
      {children}
    </View>
  );
}
