import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Clock, PaperPlaneTilt, Stack } from 'phosphor-react-native';
import { Trans, useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii, shadows } from '@/theme/tokens';

const STEPS = [
  { key: 'posted', status: 'done' as const },
  { key: 'quoting', status: 'active' as const },
  { key: 'compare', status: 'todo' as const },
  { key: 'sign', status: 'todo' as const },
];

export default function RequestSentScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const fontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 24 }}>

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
          <PaperPlaneTilt size={42} color={theme.brand} weight="fill" />
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
                backgroundColor: theme.accent,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: theme.bgCanvas,
              },
            ]}>
            <Clock size={16} color={theme.fg1} weight="fill" />
          </View>
        </View>

        <Text variant="h2" style={{ textAlign: 'center', lineHeight: 42 }}>
          {t('requestSent.title')}
        </Text>

        <Text variant="small" color={theme.fg2} style={{ textAlign: 'center', lineHeight: 22, marginTop: 10, marginBottom: 22 }}>
          <Trans
            i18nKey="requestSent.subtitle"
            components={{ bold: <Text style={{ fontFamily, color: theme.fg1 }} /> }}
          />
        </Text>

        {/* status steps */}
        <View
          style={{
            width: '100%',
            backgroundColor: theme.bgSurface,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: radii.lg,
            padding: 16,
            marginBottom: 22,
          }}>
          {STEPS.map((step) => (
            <View key={step.key} style={[row, { alignItems: 'center', gap: 11, paddingVertical: 5 }]}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: radii.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: step.status === 'done' ? theme.success : step.status === 'active' ? theme.accentSoft : theme.bgSurface,
                  borderWidth: step.status === 'todo' ? 1.5 : 0,
                  borderColor: theme.borderStrong,
                }}>
                {step.status === 'done' && <Check size={13} color="#fff" weight="bold" />}
                {step.status === 'active' && <Clock size={13} color="#B5881A" weight="fill" />}
              </View>
              <Text
                style={{
                  fontFamily: step.status === 'active' ? fontFamily : isRTL ? fonts.arSans.medium : fonts.sans.medium,
                  fontSize: 13.5,
                  color: step.status === 'todo' ? theme.fg3 : theme.fg1,
                }}>
                {t(`requestSent.steps.${step.key}`)}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => router.replace({ pathname: '/proposals', params: { id } })}
          style={[
            row,
            {
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: theme.brand,
              borderRadius: radii.md,
              paddingVertical: 13,
            },
            shadows.brand,
          ]}>
          <Stack size={17} color={theme.fgOnBrand} weight="fill" />
          <Text style={{ fontFamily, fontSize: 15, color: theme.fgOnBrand }}>{t('requestSent.viewOffers')}</Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/')} style={{ marginTop: 14 }}>
          <Text style={{ fontFamily, fontSize: 13.5, color: theme.fg2 }}>{t('requestSent.backToDiscover')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
