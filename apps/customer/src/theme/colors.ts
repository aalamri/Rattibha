/**
 * Rattibha design tokens — colors.
 * Ported from colors_and_type.css. Keep in sync with tailwind.config.js.
 */

export const colors = {
  // Royal Purple — primary brand
  purple50: '#F2EAF7',
  purple100: '#E4D4EF',
  purple200: '#C9A9DE',
  purple300: '#A875C9',
  purple400: '#7E3FAE',
  purple500: '#4B0082',
  purple600: '#3D0069',
  purple700: '#2E014F',
  purple800: '#21013A',

  // Soft Gold — accent
  gold200: '#F2E2A6',
  gold300: '#EBD083',
  gold400: '#E3BE55',
  gold500: '#DAA520',
  gold600: '#B5881A',

  // Lavender — secondary
  lavender50: '#F4EFF9',
  lavender100: '#EAE2F4',
  lavender200: '#D8C9E8',
  lavender300: '#B6A1D4',
  lavender400: '#9C82C2',

  // Plum / ink — dark text
  plum900: '#2B2233',
  plum800: '#352A41',
  plum700: '#41324F',
  plum600: '#574667',
  plum500: '#6E5C80',

  // Emerald — success
  emerald100: '#DCEFE4',
  emerald500: '#2E9E68',
  emerald600: '#1F7B4F',

  // Celebration accents — category tags
  coral100: '#F7E0D8',
  coral500: '#C9663F',
  coral600: '#A84E2C',
  marigold100: '#F6E7C4',
  marigold500: '#D4992F',
  marigold600: '#B27C1E',
  grape100: '#EADFF7',
  grape500: '#7B4FB0',
  grape600: '#623C90',
  sky100: '#D9E8F5',
  sky500: '#3E7EB0',
  sky600: '#2C6390',

  // Neutrals
  cream: '#FAF7F2',
  ivory: '#FFFFFF',
  warm50: '#F4F0EA',
  warm100: '#ECE6DE',
  warm200: '#E0D8CE',
  warm300: '#C9BFB3',
  warm400: '#A99E92',
  warm500: '#847A70',
  warm600: '#635A52',
  warm700: '#423B35',
} as const;

/** Light-mode semantic roles — what components should reference. */
export const lightTheme = {
  bgCanvas: colors.cream,
  bgSurface: colors.ivory,
  bgSunken: colors.warm50,
  bgInverse: colors.plum900,
  bgBlush: colors.purple50,

  fg1: colors.plum900,
  fg2: '#5C5266',
  fg3: '#877E92',
  fgOnBrand: '#FBF7FF',
  fgOnDark: '#EFE9F3',

  brand: colors.purple500,
  brandHover: colors.purple600,
  brandPress: colors.purple700,
  brandSubtle: colors.purple50,

  accent: colors.gold500,
  accentSoft: colors.gold200,

  secondary: colors.lavender300,
  secondarySoft: colors.lavender100,

  border: '#E9E1EE',
  borderStrong: '#D8CDE0',
  borderBrand: colors.purple200,

  success: colors.emerald500,
  successBg: colors.emerald100,
  warning: '#C9871F',
  warningBg: '#F6E8C9',
  danger: '#C24436',
  dangerBg: '#F6DED9',
  info: colors.purple500,
  infoBg: colors.purple50,

  focusRing: colors.purple400,
} as const;

/**
 * Dark-mode semantic roles. Surfaces/borders/text invert; brand, accent and
 * status hues are lifted a step lighter so they keep enough contrast on
 * near-black surfaces (the raw light-mode hexes read as muddy on dark bg).
 */
export const darkTheme = {
  bgCanvas: '#18141D',
  bgSurface: '#221C2B',
  bgSunken: '#2B2435',
  bgInverse: colors.cream,
  bgBlush: '#2E2238',

  fg1: '#F3EEF7',
  fg2: '#C7BDD1',
  fg3: '#8E8398',
  fgOnBrand: '#FBF7FF',
  fgOnDark: colors.plum900,

  brand: colors.purple300,
  brandHover: colors.purple200,
  brandPress: colors.lavender300,
  brandSubtle: '#352A45',

  accent: colors.gold400,
  accentSoft: '#4A3D1E',

  secondary: colors.lavender300,
  secondarySoft: '#3A3046',

  border: '#372E42',
  borderStrong: '#4A3F56',
  borderBrand: colors.purple600,

  success: '#4FBE85',
  successBg: '#1C3A2A',
  warning: '#E0AE4C',
  warningBg: '#3D3217',
  danger: '#E3766A',
  dangerBg: '#3D2220',
  info: colors.purple300,
  infoBg: '#352A45',

  focusRing: colors.purple300,
} as const;

export type Theme = { [K in keyof typeof lightTheme]: string };

/**
 * Static light theme — kept for the rare module-level reference that can't
 * call a hook. Components should use `useTheme()` from `./ThemeContext` so
 * they react live to dark-mode changes.
 */
export const theme = lightTheme;

/** Category accent colors, matching CATEGORIES in ui.jsx. */
export const categoryColors = {
  weddings: { color: colors.purple500, tint: colors.purple50 },
  birthdays: { color: colors.gold600, tint: colors.marigold100 },
  engagements: { color: colors.grape500, tint: colors.grape100 },
  corporate: { color: colors.purple600, tint: colors.purple100 },
  galas: { color: colors.gold500, tint: colors.gold200 },
} as const;

/** Gradient pairs for Photo/Avatar placeholders, matching GRADS in ui.jsx. */
export const gradients: [string, string][] = [
  [colors.purple400, colors.purple700],
  [colors.purple400, colors.purple600],
  [colors.lavender300, colors.purple500],
  [colors.gold500, colors.purple500],
  [colors.purple500, colors.purple800],
  [colors.purple300, colors.purple700],
];
