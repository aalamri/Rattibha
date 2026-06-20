import { Image } from 'expo-image';
import { ArrowLeft } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';

const TILE = 54;
const GLYPH_RATIO = 170 / 142;

/** White dot-grid watermark, matches `pattern.svg` inverted to white at 12% opacity. */
function DotPattern() {
  return (
    <Svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.12 }}>
      <Defs>
        <Pattern id="dots" x={0} y={0} width={TILE} height={TILE} patternUnits="userSpaceOnUse">
          <Circle cx={TILE * 0.25} cy={TILE * 0.25} r={2} fill="#fff" />
          <Circle cx={TILE * 0.75} cy={TILE * 0.75} r={2} fill="#fff" />
          <Circle cx={TILE * 0.75} cy={TILE * 0.25} r={2} fill="#fff" />
          <Circle cx={TILE * 0.25} cy={TILE * 0.75} r={2} fill="#fff" />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#dots)" />
    </Svg>
  );
}

export interface AuthHeaderProps {
  /** Band height in px — 280 for the login hero, 230 for the rest. */
  height: number;
  /** Shows a circular back button when provided. */
  onBack?: () => void;
  /** Width of the rotated glyph watermark — 190 for login, 170 elsewhere. */
  glyphWidth?: number;
  /** Centered content — primary logo or icon badge. */
  children?: ReactNode;
}

/** Purple header band — dot pattern + rotated glyph watermark + optional back button. */
export function AuthHeader({ height, onBack, glyphWidth = 170, children }: AuthHeaderProps) {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const theme = useTheme();
  const glyphPosition: { left?: number; right?: number } = isRTL ? { left: -28 } : { right: -28 };
  const backPosition: { left?: number; right?: number } = isRTL ? { right: 18 } : { left: 18 };

  return (
    <View style={{ height, backgroundColor: theme.brand, overflow: 'hidden' }}>
      <DotPattern />
      <Image
        source={require('@/assets/images/brand/glyph-ra-light.png')}
        contentFit="contain"
        style={[
          {
            position: 'absolute',
            top: 24,
            width: glyphWidth,
            height: glyphWidth * GLYPH_RATIO,
            opacity: 0.2,
            transform: [{ rotate: '-8deg' }],
          },
          glyphPosition,
        ]}
      />
      {onBack && (
        <View style={[{ position: 'absolute', top: 52 }, backPosition]}>
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ArrowLeft size={19} color="#fff" mirrored={isRTL} />
          </Pressable>
        </View>
      )}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}
