import { CheckCircle, GlobeHemisphereEast, MagnifyingGlass, MapPin, X } from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { CITY_KEYS, type CityKey } from '@/data/planners';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii } from '@/theme/tokens';

export interface CitySheetProps {
  visible: boolean;
  current?: CityKey;
  onSelect: (city: CityKey | undefined) => void;
  onClose: () => void;
}

/** Bottom-sheet city picker — matches `CitySheet` in screens.jsx. */
export function CitySheet({ visible, current, onSelect, onClose }: CitySheetProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };

  const options: { key: CityKey | undefined; label: string }[] = [
    { key: undefined, label: t('cities.all') },
    ...CITY_KEYS.map((c) => ({ key: c, label: t(`cities.${c}`) })),
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={onClose}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(43,34,51,0.45)' }}
        />
        <View
          style={{
            backgroundColor: theme.bgCanvas,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 14,
            paddingBottom: 28,
            maxHeight: '80%',
          }}>
          <View style={{ width: 40, height: 5, borderRadius: radii.pill, backgroundColor: theme.borderStrong, alignSelf: 'center', marginBottom: 14 }} />

          <View style={[row, { justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingBottom: 12 }]}>
            <Text variant="h3">{t('discover.chooseCity')}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={theme.fg2} />
            </Pressable>
          </View>

          <View
            style={[
              row,
              {
                alignItems: 'center',
                gap: 9,
                marginHorizontal: 22,
                marginBottom: 10,
                backgroundColor: theme.bgSurface,
                borderWidth: 1.5,
                borderColor: theme.borderStrong,
                borderRadius: radii.md,
                paddingVertical: 11,
                paddingHorizontal: 13,
              },
            ]}>
            <MagnifyingGlass size={17} color={theme.fg3} />
            <Text variant="small" color={theme.fg3}>
              {t('discover.searchCities')}
            </Text>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 14 }}>
            {options.map((opt) => {
              const on = current === opt.key;
              const IconComp = opt.key === undefined ? GlobeHemisphereEast : MapPin;
              return (
                <Pressable
                  key={opt.key ?? 'all'}
                  onPress={() => onSelect(opt.key)}
                  style={[
                    row,
                    {
                      alignItems: 'center',
                      gap: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderRadius: radii.md,
                      backgroundColor: on ? theme.bgBlush : 'transparent',
                      marginBottom: 2,
                    },
                  ]}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      backgroundColor: on ? theme.brand : theme.bgSurface,
                      borderWidth: on ? 0 : 1,
                      borderColor: theme.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <IconComp size={17} color={on ? '#fff' : theme.fg3} weight={on ? 'fill' : 'regular'} />
                  </View>
                  <Text
                    variant="small"
                    color={on ? theme.brand : theme.fg1}
                    style={{ flex: 1, fontFamily: on ? (isRTL ? fonts.arSans.bold : fonts.sans.bold) : (isRTL ? fonts.arSans.medium : fonts.sans.medium) }}>
                    {opt.label}
                  </Text>
                  {on && <CheckCircle size={20} color={theme.brand} weight="fill" />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
