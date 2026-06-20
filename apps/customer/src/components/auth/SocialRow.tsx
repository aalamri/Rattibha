import { AppleLogo, GoogleLogo } from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii } from '@/theme/tokens';
import { Text } from '@/components/ui/Text';

export interface SocialRowProps {
  onPressApple?: () => void;
  onPressGoogle?: () => void;
}

/** Apple / Google continue buttons, matches the social row in screens3.jsx. */
export function SocialRow({ onPressApple, onPressGoogle }: SocialRowProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const fontFamily = isRTL ? fonts.arSans.semibold : fonts.sans.semibold;

  const buttons = [
    { key: 'apple', Icon: AppleLogo, label: t('auth.login.apple'), onPress: onPressApple },
    { key: 'google', Icon: GoogleLogo, label: t('auth.login.google'), onPress: onPressGoogle },
  ] as const;

  return (
    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 12 }}>
      {buttons.map(({ key, Icon, label, onPress }) => (
        <Pressable
          key={key}
          onPress={onPress}
          style={{
            flex: 1,
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: 48,
            borderWidth: 1.5,
            borderColor: theme.borderStrong,
            borderRadius: radii.md,
            backgroundColor: theme.bgSurface,
          }}>
          <Icon size={20} color={theme.fg1} weight="fill" />
          <Text style={{ fontFamily, fontSize: 13.5, color: theme.fg1 }}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
