/**
 * Type scale, ported from the .display/.h1-.h4/.lead/.body/.small/.caption/.overline
 * classes in colors_and_type.css. Arabic uses El Messiri (display) + Tajawal (sans);
 * Tajawal has no semibold, so semibold falls back to medium.
 */
import type { TextStyle } from 'react-native';
import { theme } from './colors';
import { fonts } from './fonts';

export type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'lead'
  | 'body'
  | 'small'
  | 'caption'
  | 'overline';

type FamilyGroup = 'display' | 'sans';
type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

interface VariantSpec {
  size: number;
  arSize?: number;
  lineHeight: number;
  letterSpacingEm: number;
  arLetterSpacingEm?: number;
  family: FamilyGroup;
  weight: Weight;
  color: keyof typeof theme;
  uppercase?: boolean;
}

const VARIANTS: Record<TypographyVariant, VariantSpec> = {
  display: { size: 76, arSize: 80, lineHeight: 1.0, letterSpacingEm: -0.01, family: 'display', weight: 'bold', color: 'fg1' },
  h1: { size: 52, lineHeight: 1.06, letterSpacingEm: -0.01, family: 'display', weight: 'bold', color: 'fg1' },
  h2: { size: 24, lineHeight: 1.15, letterSpacingEm: -0.005, family: 'display', weight: 'semibold', color: 'fg1' },
  h3: { size: 19, lineHeight: 1.25, letterSpacingEm: 0, family: 'display', weight: 'semibold', color: 'fg1' },
  h4: { size: 21, lineHeight: 1.3, letterSpacingEm: 0, family: 'sans', weight: 'semibold', color: 'fg1' },
  lead: { size: 19, lineHeight: 1.55, letterSpacingEm: 0, family: 'sans', weight: 'regular', color: 'fg2' },
  body: { size: 16, lineHeight: 1.65, letterSpacingEm: 0, family: 'sans', weight: 'regular', color: 'fg1' },
  small: { size: 14, lineHeight: 1.55, letterSpacingEm: 0, family: 'sans', weight: 'regular', color: 'fg2' },
  caption: { size: 12.5, lineHeight: 1.45, letterSpacingEm: 0, family: 'sans', weight: 'regular', color: 'fg3' },
  overline: {
    size: 12,
    lineHeight: 1.2,
    letterSpacingEm: 0.18,
    arLetterSpacingEm: 0,
    family: 'sans',
    weight: 'semibold',
    color: 'accent',
    uppercase: true,
  },
};

/** Display variants get an italic counterpart for the brand's one-word accent. */
export function getDisplayItalicFont(weight: 'medium' | 'semibold' = 'semibold', isArabic = false) {
  if (isArabic) return fonts.arDisplay.semibold; // El Messiri has no italic; reuse upright semibold
  return weight === 'medium' ? fonts.display.mediumItalic : fonts.display.semiboldItalic;
}

export function getTextStyle(variant: TypographyVariant, isArabic: boolean): TextStyle {
  const spec = VARIANTS[variant];
  const fontSize = (isArabic && spec.arSize) || spec.size;
  const letterSpacingEm = (isArabic && spec.arLetterSpacingEm !== undefined)
    ? spec.arLetterSpacingEm
    : spec.letterSpacingEm;

  const group = spec.family === 'display'
    ? (isArabic ? fonts.arDisplay : fonts.display)
    : (isArabic ? fonts.arSans : fonts.sans);

  // arDisplay (El Messiri) has a full regular/medium/semibold/bold set;
  // the display group only exposes semibold/bold (matches .display/.h1-.h3 usage).
  const weight = spec.family === 'display' && !isArabic && spec.weight !== 'bold' ? 'semibold' : spec.weight;

  // El Messiri/Tajawal's diacritics (dots, tanween marks) sit further from the
  // baseline than Latin metrics assume — line-heights tuned for the English
  // type scale clip them, which can make adjacent letters visually merge
  // (e.g. a clipped ن + ش can read as a single س). Arabic gets extra headroom,
  // most needed for the larger 'display' family used by every page title.
  const arabicLineHeightBoost = isArabic ? (spec.family === 'display' ? 1.35 : 1.08) : 1;

  return {
    fontFamily: (group as Record<Weight, string>)[weight],
    fontSize,
    lineHeight: Math.round(fontSize * spec.lineHeight * arabicLineHeightBoost),
    letterSpacing: Math.round(letterSpacingEm * fontSize * 100) / 100,
    color: theme[spec.color] as string,
    // Don't rely on inherited CSS `direction` for alignment — react-native-web
    // doesn't reliably propagate document.dir down through arbitrary Views, so
    // every Text needs its own explicit start-edge alignment for Arabic.
    textAlign: isArabic ? 'right' : 'left',
    ...(spec.uppercase ? { textTransform: 'uppercase' as const } : {}),
  };
}
