import { CaretLeft, CaretRight, X } from 'phosphor-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii } from '@/theme/tokens';

export interface DateSheetProps {
  visible: boolean;
  value: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Bottom-sheet month calendar — matches the `CitySheet` chrome. */
export function DateSheet({ visible, value, onSelect, onClose }: DateSheetProps) {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const theme = useTheme();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  // ar-SA defaults to the Hijri calendar on iOS/ICU; this app always shows Gregorian dates.
  const locale = isRTL ? 'ar-SA-u-ca-gregory' : 'en-GB';

  const today = startOfDay(new Date());
  const [viewDate, setViewDate] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));

  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(viewDate);

  const weekdayLabels = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, 7 + i)),
  );

  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();
  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1)),
  ];

  const PrevIcon = isRTL ? CaretRight : CaretLeft;
  const NextIcon = isRTL ? CaretLeft : CaretRight;

  function goToMonth(delta: number) {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }

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
            maxHeight: '85%',
          }}>
          <View style={{ width: 40, height: 5, borderRadius: radii.pill, backgroundColor: theme.borderStrong, alignSelf: 'center', marginBottom: 14 }} />

          <View style={[row, { justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 22 }]}>
            <Text variant="h3">{t('postRequest.selectDate')}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={theme.fg2} />
            </Pressable>
          </View>

          <View style={[row, { justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingHorizontal: 22 }]}>
            <Pressable
              onPress={() => goToMonth(-1)}
              hitSlop={8}
              style={{ width: 34, height: 34, borderRadius: radii.pill, borderWidth: 1.5, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' }}>
              <PrevIcon size={16} color={theme.fg1} />
            </Pressable>
            <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 15, color: theme.fg1 }}>{monthLabel}</Text>
            <Pressable
              onPress={() => goToMonth(1)}
              hitSlop={8}
              style={{ width: 34, height: 34, borderRadius: radii.pill, borderWidth: 1.5, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' }}>
              <NextIcon size={16} color={theme.fg1} />
            </Pressable>
          </View>

          <View style={[row, { paddingHorizontal: 22 }]}>
            {weekdayLabels.map((label, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', paddingBottom: 8 }}>
                <Text style={{ fontFamily: isRTL ? fonts.arSans.medium : fonts.sans.medium, fontSize: 11.5, color: theme.fg3 }}>{label}</Text>
              </View>
            ))}
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 22 }}>
            <View style={[row, { flexWrap: 'wrap' }]}>
              {cells.map((date, i) => {
                if (!date) return <View key={i} style={{ width: '14.2857%', aspectRatio: 1 }} />;
                const disabled = date < today;
                const selected = isSameDay(date, value);
                const isToday = isSameDay(date, today);
                return (
                  <View key={i} style={{ width: '14.2857%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Pressable
                      disabled={disabled}
                      onPress={() => {
                        onSelect(date);
                        onClose();
                      }}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: radii.pill,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: selected ? theme.brand : 'transparent',
                        borderWidth: isToday && !selected ? 1.5 : 0,
                        borderColor: theme.brand,
                      }}>
                      <Text
                        style={{
                          fontFamily: isRTL ? fonts.arSans.medium : fonts.sans.medium,
                          fontSize: 13.5,
                          color: selected ? theme.fgOnBrand : disabled ? theme.fg3 : theme.fg1,
                          opacity: disabled ? 0.5 : 1,
                        }}>
                        {new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(date)}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
