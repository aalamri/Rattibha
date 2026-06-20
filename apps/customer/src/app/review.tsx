import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, PaperPlaneTilt, Plus, Star } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii } from '@/theme/tokens';

const TAG_KEYS = ['professional', 'onTime', 'greatValue', 'creative', 'responsive', 'flawlessSetup'] as const;

export default function ReviewScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const router = useRouter();
  const { plannerId, bookingId } = useLocalSearchParams<{ plannerId?: string; bookingId?: string }>();
  const { session } = useAuth();
  const { show: showToast } = useToast();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const fontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;
  const labelFontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;

  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<string[]>(['professional', 'onTime']);
  const [comment, setComment] = useState('');
  const [plannerName, setPlannerName] = useState('');
  const [seed, setSeed] = useState(0);
  const [pkgName, setPkgName] = useState('');

  useEffect(() => {
    if (!plannerId) return;
    supabase
      .from('planners')
      .select('business_name, profiles(avatar_seed)')
      .eq('user_id', plannerId)
      .single()
      .then(({ data }) => {
        const row = data as unknown as { business_name: string; profiles: { avatar_seed: number } | null } | null;
        if (row) {
          setPlannerName(row.business_name);
          setSeed(row.profiles?.avatar_seed ?? 0);
        }
      });

    if (bookingId) {
      supabase
        .from('bookings')
        .select('contracts(offers:offer_id(package))')
        .eq('id', bookingId)
        .single()
        .then(({ data }) => {
          const pkg = (data as unknown as { contracts: { offers: { package: string } | null } | null } | null)?.contracts?.offers?.package;
          if (pkg) setPkgName(pkg);
        });
    }
  }, [plannerId, bookingId]);

  const toggleTag = (key: string) => setTags((s) => (s.includes(key) ? s.filter((x) => x !== key) : [...s, key]));

  const ratingLabels = t('review.ratingLabels', { returnObjects: true }) as string[];

  async function handleSubmit() {
    if (bookingId && session) {
      // Advance deal to 'completed' first (required by state machine before 'reviewed')
      const { data: booking } = await supabase
        .from('bookings')
        .select('contracts(offer_id)')
        .eq('id', bookingId)
        .single();
      const offerId = (booking as unknown as { contracts: { offer_id: string } | null } | null)?.contracts?.offer_id;
      if (offerId) {
        await supabase.from('offers').update({ deal_status: 'completed' }).eq('id', offerId).eq('deal_status', 'deposit_paid');
      }

      await supabase.from('reviews').insert({
        booking_id: bookingId,
        customer_id: session.user.id,
        rating,
        comment: comment.trim() || tags.map((k) => t(`review.tags.${k}`)).join(', '),
      });
    }
    showToast(t('toast.reviewSubmitted'));
    router.replace('/(tabs)/bookings');
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
              <Text variant="h3" style={{ lineHeight: 28 }}>
                {t('review.title')}
              </Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 18, gap: 20 }}>
            {/* planner */}
            <View style={{ alignItems: 'center', gap: 10, paddingTop: 6 }}>
              <Photo seed={seed} style={{ width: 74, height: 74, borderRadius: radii.lg }} />
              <View style={{ alignItems: 'center' }}>
                <Text variant="h4">{plannerName || '—'}</Text>
                {pkgName ? (
                  <Text variant="small" color={theme.fg3} style={{ marginTop: 1 }}>
                    {pkgName}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* stars */}
            <View style={{ alignItems: 'center', gap: 8 }}>
              <View style={[row, { gap: 10 }]}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable key={n} onPress={() => setRating(n)}>
                    <Star size={38} color={n <= rating ? theme.accent : theme.bgSunken} weight="fill" />
                  </Pressable>
                ))}
              </View>
              <Text style={{ fontFamily, fontSize: 13.5, color: theme.accent }}>{ratingLabels[rating]}</Text>
            </View>

            {/* tags */}
            <View>
              <Text style={{ fontFamily: labelFontFamily, fontSize: 12.5, color: theme.fg2, marginBottom: 9 }}>{t('review.whatStoodOut')}</Text>
              <View style={[row, { flexWrap: 'wrap', gap: 8 }]}>
                {TAG_KEYS.map((key) => {
                  const on = tags.includes(key);
                  return (
                    <Pressable key={key} onPress={() => toggleTag(key)}>
                      <View
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 14,
                          borderRadius: radii.pill,
                          borderWidth: 1.5,
                          borderColor: on ? theme.brand : theme.borderStrong,
                          backgroundColor: on ? theme.bgBlush : theme.bgSurface,
                        }}>
                        <Text style={{ fontFamily, fontSize: 13, color: on ? theme.brand : theme.fg1 }}>
                          {on ? '✓ ' : ''}
                          {t(`review.tags.${key}`)}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* comment */}
            <View>
              <Text style={{ fontFamily: labelFontFamily, fontSize: 12.5, color: theme.fg2, marginBottom: 9 }}>{t('review.commentLabel')}</Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder={t('review.commentPlaceholder')}
                placeholderTextColor={theme.fg3}
                multiline
                textAlignVertical="top"
                style={{
                  borderWidth: 1.5,
                  borderColor: theme.borderStrong,
                  borderRadius: radii.md,
                  padding: 14,
                  backgroundColor: theme.bgSurface,
                  minHeight: 96,
                  fontFamily: isRTL ? fonts.arSans.regular : fonts.sans.regular,
                  fontSize: 13.5,
                  color: theme.fg1,
                  lineHeight: 21,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              />
            </View>

            {/* photos */}
            <View>
              <Text style={{ fontFamily: labelFontFamily, fontSize: 12.5, color: theme.fg2, marginBottom: 9 }}>{t('review.addPhotos')}</Text>
              <View style={[row, { gap: 10 }]}>
                <Photo seed={1} style={{ width: 70, height: 70, borderRadius: radii.sm }} />
                <Photo seed={4} style={{ width: 70, height: 70, borderRadius: radii.sm }} />
                <View
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: radii.sm,
                    borderWidth: 1.5,
                    borderStyle: 'dashed',
                    borderColor: theme.borderStrong,
                    backgroundColor: theme.bgBlush,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Plus size={22} color={theme.brand} />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* footer */}
      <SafeAreaView edges={['bottom']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: theme.bgCanvas, borderTopWidth: 1, borderTopColor: theme.border }}>
        <View style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 10 }}>
          <Button icon={PaperPlaneTilt} onPress={handleSubmit} full>
            {t('review.submitReview')}
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}
