/**
 * Rattibha type families.
 * Latin: Playfair Display (display) + Poppins (UI/body).
 * Arabic: El Messiri (display) + Tajawal (UI/body).
 */
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_500Medium_Italic,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_600SemiBold_Italic,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  ElMessiri_400Regular,
  ElMessiri_500Medium,
  ElMessiri_600SemiBold,
  ElMessiri_700Bold,
} from '@expo-google-fonts/el-messiri';
import { Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold } from '@expo-google-fonts/tajawal';

export const fonts = {
  display: {
    semibold: 'PlayfairDisplay_600SemiBold',
    bold: 'PlayfairDisplay_700Bold',
    semiboldItalic: 'PlayfairDisplay_600SemiBold_Italic',
    mediumItalic: 'PlayfairDisplay_500Medium_Italic',
  },
  sans: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semibold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
  },
  arDisplay: {
    regular: 'ElMessiri_400Regular',
    medium: 'ElMessiri_500Medium',
    semibold: 'ElMessiri_600SemiBold',
    bold: 'ElMessiri_700Bold',
  },
  arSans: {
    regular: 'Tajawal_400Regular',
    medium: 'Tajawal_500Medium',
    // Tajawal has no 600 weight — semibold falls back to medium.
    semibold: 'Tajawal_500Medium',
    bold: 'Tajawal_700Bold',
  },
} as const;

export function useAppFonts() {
  return useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600SemiBold_Italic,
    PlayfairDisplay_500Medium_Italic,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    ElMessiri_400Regular,
    ElMessiri_500Medium,
    ElMessiri_600SemiBold,
    ElMessiri_700Bold,
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  });
}
