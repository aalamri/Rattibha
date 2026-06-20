import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, CalendarHeart, ChatsCircle, MagnifyingGlass, type Icon } from 'phosphor-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useIsRTL } from '@/i18n/useIsRTL';
import { gradients } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';

const SLIDES: { seed: number; icon: Icon; key: 'slide1' | 'slide2' | 'slide3' }[] = [
  { seed: 0, icon: MagnifyingGlass, key: 'slide1' },
  { seed: 3, icon: ChatsCircle, key: 'slide2' },
  { seed: 2, icon: CalendarHeart, key: 'slide3' },
];

const GLYPH_RATIO = 170 / 142;

/** 3-slide carousel — matches `OnboardingScreen` in screens3.jsx. */
export default function OnboardingScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const isRTL = useIsRTL();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];
  const IconComp = slide.icon;
  const [from, to] = gradients[slide.seed % gradients.length];
  const skipFontFamily = isRTL ? fonts.arSans.semibold : fonts.sans.semibold;

  const glyphPosition: { left?: number; right?: number } = isRTL ? { left: -30 } : { right: -30 };
  const skipPosition: { left?: number; right?: number } = isRTL ? { left: 18 } : { right: 18 };

  const goLogin = () => router.replace('/(auth)/login');

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
      <View style={{ flex: 1 }}>
        <LinearGradient colors={[from, to]} style={{ flex: 1, overflow: 'hidden' }}>
          <Image
            source={require('@/assets/images/brand/glyph-ra-light.png')}
            contentFit="contain"
            style={[
              {
                position: 'absolute',
                top: 40,
                width: 200,
                height: 200 * GLYPH_RATIO,
                opacity: 0.22,
                transform: [{ rotate: '-8deg' }],
              },
              glyphPosition,
            ]}
          />
          <View style={{ alignItems: 'center', marginTop: insets.top + 24 }}>
            <Image
              source={require('@/assets/images/brand/logo-wordmark-light.png')}
              contentFit="contain"
              style={{ width: 90, height: 30 }}
            />
          </View>
          <Pressable
            onPress={goLogin}
            hitSlop={8}
            style={[{ position: 'absolute', top: insets.top + 22 }, skipPosition]}>
            <Text style={{ fontFamily: skipFontFamily, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
              {t('auth.onboarding.skip')}
            </Text>
          </Pressable>
        </LinearGradient>
      </View>

      <View
        style={{
          backgroundColor: theme.bgCanvas,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          marginTop: -26,
          paddingHorizontal: 26,
          paddingTop: 28,
          paddingBottom: 32 + insets.bottom,
          alignItems: 'center',
        }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: theme.brandSubtle,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
          <IconComp size={28} color={theme.brand} weight="regular" />
        </View>

        <Text variant="h3" style={{ textAlign: 'center' }}>
          {t(`auth.onboarding.${slide.key}.title`)}
        </Text>
        <Text variant="small" color={theme.fg2} style={{ textAlign: 'center', marginTop: 10, marginBottom: 20 }}>
          {t(`auth.onboarding.${slide.key}.description`)}
        </Text>

        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 7, marginBottom: 22 }}>
          {SLIDES.map((_, k) => (
            <View
              key={k}
              style={{
                height: 7,
                width: k === index ? 22 : 7,
                borderRadius: 999,
                backgroundColor: k === index ? theme.brand : theme.borderStrong,
              }}
            />
          ))}
        </View>

        <Button
          full
          icon={isLast ? ArrowRight : undefined}
          onPress={() => (isLast ? goLogin() : setIndex((i) => i + 1))}>
          {isLast ? t('auth.onboarding.getStarted') : t('auth.onboarding.next')}
        </Button>
      </View>
    </View>
  );
}
