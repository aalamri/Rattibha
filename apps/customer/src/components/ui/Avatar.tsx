import { LinearGradient } from 'expo-linear-gradient';

import { useIsRTL } from '@/i18n/useIsRTL';
import { gradients } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { Text } from './Text';

export interface AvatarProps {
  /** Picks a gradient from the brand palette, matches GRADS in ui.jsx. */
  seed?: number;
  size?: number;
  initials: string;
}

/** Circular gradient avatar with initials — matches `Avatar` in ui.jsx. */
export function Avatar({ seed = 0, size = 40, initials }: AvatarProps) {
  const isRTL = useIsRTL();
  const [from, to] = gradients[seed % gradients.length];
  const fontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;

  return (
    <LinearGradient
      colors={[from, to]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ fontFamily, fontSize: size * 0.36, lineHeight: size * 0.42, color: '#fff' }}>{initials}</Text>
    </LinearGradient>
  );
}
