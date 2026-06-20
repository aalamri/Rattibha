import { Translate } from 'phosphor-react-native';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import { setAppLanguage, type AppLanguage } from '@/i18n';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { Text } from './ui/Text';

/** "ع / EN" pill — flips the app language, matches the Discover header control. */
export function LanguageToggle() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const fontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;
  const next: AppLanguage = isRTL ? 'en' : 'ar';
  const label = isRTL ? 'EN' : 'ع';

  return (
    <Pressable
      onPress={() => setAppLanguage(next)}
      accessibilityRole="button"
      accessibilityLabel={t('common.toggleLanguage')}
      style={{
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 5,
        height: 42,
        paddingHorizontal: 13,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: theme.border,
        backgroundColor: theme.bgSurface,
      }}>
      <Translate size={16} color={theme.brand} />
      <Text style={{ fontFamily, fontSize: 13, color: theme.fg1 }}>{label}</Text>
    </Pressable>
  );
}
