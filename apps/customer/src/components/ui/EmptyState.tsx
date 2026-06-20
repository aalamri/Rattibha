import { type Icon } from 'phosphor-react-native';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeContext';
import { radii } from '@/theme/tokens';

interface EmptyStateProps {
  icon: Icon;
  title: string;
  subtitle?: string;
  style?: object;
  children?: React.ReactNode;
}

export function EmptyState({ icon: IconComp, title, subtitle, style, children }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: 32, gap: 10 }, style]}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radii.pill,
          backgroundColor: theme.bgBlush,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <IconComp size={28} color={theme.brand} weight="fill" />
      </View>
      <Text variant="h4" color={theme.fg2} style={{ textAlign: 'center' }}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="small" color={theme.fg3} style={{ textAlign: 'center' }}>
          {subtitle}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
