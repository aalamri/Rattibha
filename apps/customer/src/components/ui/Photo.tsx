import { LinearGradient } from 'expo-linear-gradient';
import { Image as ImageIcon } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { Image, View, type ViewStyle } from 'react-native';

import { useIsRTL } from '@/i18n/useIsRTL';
import { gradients } from '@/theme/colors';
import { Badge } from './Badge';

export interface PhotoProps {
  seed?: number;
  /** Real photo URL — renders this instead of the gradient placeholder when set. */
  uri?: string | null;
  style?: ViewStyle;
  label?: string;
  children?: ReactNode;
}

/** Real photo if `uri` is set, otherwise a gradient placeholder — matches `Photo` in ui.jsx. */
export function Photo({ seed = 0, uri, style, label, children }: PhotoProps) {
  const isRTL = useIsRTL();

  if (uri) {
    return (
      <View style={[{ overflow: 'hidden', justifyContent: 'flex-end' }, style]}>
        <Image source={{ uri }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" />
        {label && (
          <View style={{ position: 'absolute', top: 8, [isRTL ? 'right' : 'left']: 8 }}>
            <Badge bg="rgba(43,34,51,0.35)" fg="rgba(255,255,255,0.85)">
              {label}
            </Badge>
          </View>
        )}
        {children}
      </View>
    );
  }

  const [from, to] = gradients[seed % gradients.length];
  return (
    <LinearGradient
      colors={[from, to]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ overflow: 'hidden', justifyContent: 'flex-end' }, style]}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <ImageIcon size={30} color="rgba(255,255,255,0.28)" weight="regular" />
      </View>
      {label && (
        <View style={{ position: 'absolute', top: 8, [isRTL ? 'right' : 'left']: 8 }}>
          <Badge bg="rgba(43,34,51,0.35)" fg="rgba(255,255,255,0.85)">
            {label}
          </Badge>
        </View>
      )}
      {children}
    </LinearGradient>
  );
}
