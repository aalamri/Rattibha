import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Balloon,
  Briefcase,
  CalendarBlank,
  Cake,
  CaretDown,
  CaretUp,
  Champagne,
  HeartStraight,
  MapPin,
  Megaphone,
  type Icon,
} from 'phosphor-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CitySheet } from '@/components/discover/CitySheet';
import { DateSheet } from '@/components/discover/DateSheet';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { CATEGORY_KEYS, CITY_KEYS, type CategoryKey, type CityKey } from '@/data/planners';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useAuth } from '@/lib/AuthContext';
import { formatDate } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { categoryColors } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii } from '@/theme/tokens';

const CATEGORY_ICONS: Record<CategoryKey, Icon> = {
  weddings: HeartStraight,
  birthdays: Cake,
  engagements: Balloon,
  corporate: Briefcase,
  galas: Champagne,
};

const BUDGET_KEYS = ['under10', '10to20', '20to35', 'over35'] as const;

export default function PostRequestScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const router = useRouter();
  const { session } = useAuth();
  const { show: showToast } = useToast();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const labelFont = { fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 12.5, color: theme.fg2, marginBottom: 7 };

  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState<CategoryKey>('weddings');
  const [guests, setGuests] = useState(150);
  const [budget, setBudget] = useState(1);
  const [city, setCity] = useState<CityKey>('riyadh');
  const [cityOpen, setCityOpen] = useState(false);
  const [vision, setVision] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date());
  const [dateOpen, setDateOpen] = useState(false);

  const dateLabel = formatDate(eventDate, isRTL, { day: 'numeric', month: 'short', year: 'numeric' });

  async function handlePost() {
    if (!session) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from('requests')
      .insert({
        customer_id: session.user.id,
        category,
        city,
        event_date: eventDate.toISOString().split('T')[0],
        guests,
        budget: BUDGET_KEYS[budget],
        note: vision.trim() || null,
        status: 'open',
      })
      .select('id')
      .single();
    setSubmitting(false);
    if (!error && data) {
      showToast(t('toast.requestPosted'));
      router.replace({ pathname: '/request-sent', params: { id: data.id } });
    } else {
      showToast(t('toast.error'), 'error');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
          {/* header */}
          <View style={[row, { alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12 }]}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              style={{
                width: 38,
                height: 38,
                borderRadius: radii.pill,
                borderWidth: 1.5,
                borderColor: theme.border,
                backgroundColor: theme.bgSurface,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {isRTL ? <ArrowLeft size={18} color={theme.fg1} style={{ transform: [{ scaleX: -1 }] }} /> : <ArrowLeft size={18} color={theme.fg1} />}
            </Pressable>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="h3">
                {t('postRequest.title')}
              </Text>
              <Text variant="small" color={theme.fg2} style={{ marginTop: 1 }}>
                {t('postRequest.subtitle')}
              </Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 18, gap: 18 }}>
            {/* intro banner */}
            <View style={[row, { alignItems: 'center', gap: 10, backgroundColor: theme.bgBlush, borderRadius: radii.md, padding: 13 }]}>
              <Megaphone size={19} color={theme.brand} weight="fill" />
              <Text variant="small" color={theme.brand} style={{ flex: 1, lineHeight: 19 }}>
                {t('postRequest.intro')}
              </Text>
            </View>

            {/* category grid */}
            <View>
              <Text style={labelFont}>{t('postRequest.whatPlanning')}</Text>
              <View style={[row, { flexWrap: 'wrap', gap: 9 }]}>
                {CATEGORY_KEYS.map((key) => {
                  const on = category === key;
                  const c = categoryColors[key];
                  const IconComp = CATEGORY_ICONS[key];
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setCategory(key)}
                      style={[
                        row,
                        {
                          width: '48%',
                          alignItems: 'center',
                          gap: 10,
                          paddingVertical: 13,
                          paddingHorizontal: 14,
                          borderRadius: radii.md,
                          borderWidth: 1.5,
                          borderColor: on ? theme.brand : theme.border,
                          backgroundColor: on ? theme.bgBlush : theme.bgSurface,
                        },
                      ]}>
                      <View style={{ width: 36, height: 36, borderRadius: radii.sm, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center' }}>
                        <IconComp size={19} color={c.color} />
                      </View>
                      <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 13.5, color: theme.fg1, flex: 1 }}>
                        {t(`categories.${key}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* date + city */}
            <View style={[row, { gap: 12 }]}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={labelFont}>{t('postRequest.eventDate')}</Text>
                <Pressable
                  onPress={() => setDateOpen(true)}
                  style={[
                    row,
                    {
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: theme.bgSurface,
                      borderWidth: 1.5,
                      borderColor: dateOpen ? theme.brand : theme.borderStrong,
                      borderRadius: radii.md,
                      paddingVertical: 12,
                      paddingHorizontal: 10,
                    },
                  ]}>
                  <CalendarBlank size={16} color={dateOpen ? theme.brand : theme.fg3} style={{ flexShrink: 0 }} />
                  <Text
                    numberOfLines={1}
                    style={{ fontFamily: isRTL ? fonts.arSans.medium : fonts.sans.medium, fontSize: 12.5, color: theme.fg1, flex: 1 }}>
                    {dateLabel}
                  </Text>
                </Pressable>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={labelFont}>{t('postRequest.city')}</Text>
                <Pressable
                  onPress={() => setCityOpen(true)}
                  style={[
                    row,
                    {
                      alignItems: 'center',
                      gap: 9,
                      backgroundColor: theme.bgSurface,
                      borderWidth: 1.5,
                      borderColor: cityOpen ? theme.brand : theme.borderStrong,
                      borderRadius: radii.md,
                      paddingVertical: 12,
                      paddingHorizontal: 13,
                    },
                  ]}>
                  <MapPin size={17} color={cityOpen ? theme.brand : theme.fg3} />
                  <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 14, color: theme.fg1, flex: 1 }}>
                    {t(`cities.${city}`)}
                  </Text>
                  {cityOpen ? <CaretUp size={13} color={theme.fg3} /> : <CaretDown size={13} color={theme.fg3} />}
                </Pressable>
              </View>
            </View>

            {/* guests */}
            <View>
              <Text style={labelFont}>{t('postRequest.guestsLabel', { count: guests })}</Text>
              <Slider
                minimumValue={20}
                maximumValue={600}
                step={10}
                value={guests}
                onValueChange={setGuests}
                minimumTrackTintColor={theme.brand}
                maximumTrackTintColor={theme.border}
                thumbTintColor={theme.brand}
              />
            </View>

            {/* budget */}
            <View>
              <Text style={labelFont}>{t('postRequest.budgetRange')}</Text>
              <View style={[row, { gap: 8 }]}>
                {BUDGET_KEYS.map((key, i) => {
                  const on = i === budget;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setBudget(i)}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: 10,
                        paddingHorizontal: 3,
                        borderRadius: radii.sm,
                        borderWidth: 1.5,
                        borderColor: on ? theme.brand : theme.borderStrong,
                        backgroundColor: on ? theme.bgBlush : theme.bgSurface,
                      }}>
                      <Text
                        numberOfLines={isRTL ? 2 : 1}
                        style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: isRTL ? 12.5 : 11.5, color: on ? theme.brand : theme.fg1, textAlign: 'center' }}>
                        {t(`postRequest.budgets.${key}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* description */}
            <View>
              <Text style={labelFont}>{t('postRequest.describeVision')}</Text>
              <TextInput
                value={vision}
                onChangeText={setVision}
                placeholder={t('postRequest.visionPlaceholder')}
                placeholderTextColor={theme.fg3}
                multiline
                textAlign={isRTL ? 'right' : 'left'}
                style={{
                  minHeight: 90,
                  backgroundColor: theme.bgSurface,
                  borderWidth: 1.5,
                  borderColor: theme.borderStrong,
                  borderRadius: radii.md,
                  padding: 13,
                  fontFamily: isRTL ? fonts.arSans.regular : fonts.sans.regular,
                  fontSize: 13.5,
                  color: theme.fg1,
                  lineHeight: 20,
                  textAlignVertical: 'top',
                }}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* footer */}
      <SafeAreaView edges={['bottom']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: theme.bgCanvas, borderTopWidth: 1, borderTopColor: theme.border }}>
        <View style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 10 }}>
          <Pressable
            onPress={handlePost}
            disabled={submitting}
            style={[
              row,
              {
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: theme.brand,
                borderRadius: radii.md,
                paddingVertical: 13,
                opacity: submitting ? 0.7 : 1,
              },
            ]}>
            {submitting ? (
              <ActivityIndicator size="small" color={theme.fgOnBrand} />
            ) : (
              <>
                <Megaphone size={17} color={theme.fgOnBrand} weight="fill" />
                <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 15, color: theme.fgOnBrand }}>
                  {t('postRequest.postToPlanners')}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </SafeAreaView>

      <DateSheet
        visible={dateOpen}
        value={eventDate}
        onSelect={setEventDate}
        onClose={() => setDateOpen(false)}
      />

      <CitySheet
        visible={cityOpen}
        current={city}
        onSelect={(c) => {
          if (c && CITY_KEYS.includes(c)) setCity(c);
          setCityOpen(false);
        }}
        onClose={() => setCityOpen(false)}
      />
    </View>
  );
}
