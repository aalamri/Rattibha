import { useRouter } from 'expo-router';
import { CalendarCheck, Check, ChatCircle, House } from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii, shadows } from '@/theme/tokens';

export default function ConfirmScreen() {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const theme = useTheme();
  const router = useRouter();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const fontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 24 }}>
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: radii.xl,
            backgroundColor: theme.bgBlush,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
          <CalendarCheck size={42} color={theme.brand} weight="fill" />
          <View
            style={[
              shadows.sm,
              {
                position: 'absolute',
                [isRTL ? 'left' : 'right']: -4,
                bottom: -4,
                width: 32,
                height: 32,
                borderRadius: radii.pill,
                backgroundColor: theme.success,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: theme.bgCanvas,
              },
            ]}>
            <Check size={16} color="#fff" weight="bold" />
          </View>
        </View>

        <Text variant="h2" style={{ textAlign: 'center', lineHeight: 42 }}>
          {t('confirm.title')}
        </Text>

        <Text variant="small" color={theme.fg2} style={{ textAlign: 'center', lineHeight: 22, marginTop: 10, marginBottom: 22 }}>
          {t('confirm.subtitleGeneric')}
        </Text>

        <View style={{ width: '100%', backgroundColor: theme.bgSurface, borderWidth: 1, borderColor: theme.border, borderRadius: radii.lg, padding: 16 }}>
          <ConfirmRow label={t('confirm.rows.status')} value={t('confirm.statusConfirmed')} row={row} fontFamily={fontFamily} strong last />
        </View>

        <View style={[row, { gap: 12, width: '100%', marginTop: 20 }]}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" icon={ChatCircle} onPress={() => router.replace('/(tabs)/messages')} full>
              {t('confirm.message')}
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button icon={House} onPress={() => router.replace('/(tabs)')} full>
              {t('confirm.done')}
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function ConfirmRow({
  label,
  value,
  row,
  fontFamily,
  strong,
  last,
}: {
  label: string;
  value: string;
  row: { flexDirection: 'row' | 'row-reverse' };
  fontFamily: string;
  strong?: boolean;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[row, { alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5, marginBottom: last ? 0 : 0 }]}>
      <Text variant="small" color={theme.fg2}>
        {label}
      </Text>
      <Text style={{ fontFamily, fontSize: strong ? 15 : 13.5, color: strong ? theme.brand : theme.fg1 }}>{value}</Text>
    </View>
  );
}
