import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { gradients } from '@/theme/colors';
import { Badge } from './Badge';

export interface PhotoProps {
  seed?: number;
  style?: ViewStyle;
  label?: string;
  children?: ReactNode;
}

/** Gradient placeholder for a planner/event photo — matches `Photo` in ui.jsx. */
export function Photo({ seed = 0, style, label, children }: PhotoProps) {
  const [from, to] = gradients[seed % gradients.length];
  return (
    <LinearGradient
      colors={[from, to]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ overflow: 'hidden', justifyContent: 'flex-end' }, style]}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Image size={30} color="rgba(255,255,255,0.28)" weight="regular" />
      </View>
      {label && (
        <View style={{ position: 'absolute', top: 8, left: 8 }}>
          <Badge bg="rgba(43,34,51,0.35)" fg="rgba(255,255,255,0.85)">
            {label}
          </Badge>
        </View>
      )}
      {children}
    </LinearGradient>
  );
}
