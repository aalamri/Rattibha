import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ChatCircle, Crown, Heart, HeartStraight, MapPin, PaperPlaneTilt, SealCheck, Storefront } from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { PackageOption } from '@/components/planner/PackageOption';
import { ServiceCard } from '@/components/planner/ServiceCard';
import { Badge, Stars } from '@/components/ui/Badge';
import { Photo } from '@/components/ui/Photo';
import { Text } from '@/components/ui/Text';
import { type Planner } from '@/data/planners';
import { useIsRTL } from '@/i18n/useIsRTL';
import { type DBPlannerRow, PLANNER_SELECT, toPlanner } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii } from '@/theme/tokens';

export default function PlannerScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const router = useRouter();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const { id } = useLocalSearchParams<{ id: string }>();

  const [planner, setPlanner] = useState<Planner | null>(null);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);
  const [pkg, setPkg] = useState(0);
  const galleryScrollRef = useRef<ScrollView>(null);
  const servicesScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('planners')
      .select(PLANNER_SELECT)
      .eq('user_id', id)
      .single()
      .then(({ data }) => {
        if (data) setPlanner(toPlanner(data as unknown as DBPlannerRow));
        setLoading(false);
      });

  }, [id]);

  // Horizontal ScrollViews always anchor scroll position 0 at their physical
  // left edge — row-reverse only mirrors item order, so in RTL the first
  // item (rightmost) starts off-screen unless we explicitly scroll there.
  useEffect(() => {
    if (!isRTL || !planner) return;
    galleryScrollRef.current?.scrollToEnd({ animated: false });
    servicesScrollRef.current?.scrollToEnd({ animated: false });
  }, [isRTL, planner]);

  if (loading) return null;
  if (!planner) return <PlaceholderScreen icon={Storefront} title={t('placeholders.planner')} />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View>
          <Photo seed={planner.seed} style={{ height: 250 }} />
          <SafeAreaView
            edges={['top']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 }}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              style={{
                width: 40,
                height: 40,
                borderRadius: radii.pill,
                backgroundColor: 'rgba(255,255,255,0.92)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ArrowLeft size={19} color={theme.brand} style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined} />
            </Pressable>
            <Pressable
              onPress={() => setFav((f) => !f)}
              style={{
                width: 40,
                height: 40,
                borderRadius: radii.pill,
                backgroundColor: 'rgba(255,255,255,0.92)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {fav ? <Heart size={20} color={theme.brand} weight="fill" /> : <HeartStraight size={20} color={theme.brand} />}
            </Pressable>
          </SafeAreaView>
        </View>

        <View style={{ backgroundColor: theme.bgCanvas, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -22, paddingHorizontal: 18, paddingTop: 18 }}>
          <View style={[row, { justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }]}>
            <View style={{ flex: 1 }}>
              <Text variant="h2">
                {planner.name}
              </Text>
              <View style={[row, { alignItems: 'center', gap: 4, marginTop: 4 }]}>
                <MapPin size={15} color={theme.fg2} />
                <Text variant="small" color={theme.fg2}>
                  {t(`cities.${planner.city}`)} · {planner.type}
                </Text>
              </View>
            </View>
            <Stars rating={planner.rating} />
          </View>

          <View style={[row, { gap: 7, marginTop: 12, flexWrap: 'wrap' }]}>
            {planner.premium && (
              <Badge bg={theme.accentSoft} fg="#7A5A14" icon={Crown}>
                {t('foundation.premium')}
              </Badge>
            )}
            {planner.verified && (
              <Badge bg={theme.successBg} fg={theme.success} icon={SealCheck}>
                {t('foundation.verified')}
              </Badge>
            )}
            <Badge bg={theme.bgSunken} fg={theme.fg2}>
              {t('planner.eventsCount', { count: planner.events })}
            </Badge>
          </View>

          <Text variant="small" color={theme.fg2} style={{ marginTop: 14, lineHeight: 23 }}>
            {planner.blurb}
          </Text>

          {/* gallery */}
          <ScrollView
            ref={galleryScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: 'row',
              gap: 9,
              paddingTop: 14,
              minWidth: '100%',
              justifyContent: isRTL ? 'flex-end' : 'flex-start',
            }}>
            {(isRTL ? [4, 3, 2, 1] : [1, 2, 3, 4]).map((i) => (
              <Photo key={i} seed={planner.seed + i} style={{ width: 108, height: 78, borderRadius: radii.sm }} />
            ))}
          </ScrollView>

          {/* services */}
          {planner.services.length > 0 && (
            <>
              <Text variant="h3" style={{ marginTop: 22 }}>
                {t('planner.services')}
              </Text>
              <ScrollView
                ref={servicesScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  flexDirection: 'row',
                  gap: 11,
                  paddingTop: 11,
                  paddingBottom: 2,
                  minWidth: '100%',
                  justifyContent: isRTL ? 'flex-end' : 'flex-start',
                }}>
                {(isRTL ? [...planner.services].reverse() : planner.services).map((service, i) => (
                  <ServiceCard key={i} service={service} />
                ))}
              </ScrollView>
            </>
          )}

          {/* packages */}
          <Text variant="h3" style={{ marginTop: 22 }}>
            {t('planner.packages')}
          </Text>
          <View style={{ gap: 10, marginTop: 10 }}>
            {planner.packages.map((p, i) => (
              <PackageOption key={i} pkg={p} selected={pkg === i} onPress={() => setPkg(i)} />
            ))}
          </View>

          {/* reviews */}
          <View style={[row, { justifyContent: 'space-between', alignItems: 'baseline', marginTop: 22 }]}>
            <Text variant="h3">{t('planner.reviews')}</Text>
            <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 13, color: theme.brand }}>
              {t('planner.allReviews', { count: planner.events })}
            </Text>
          </View>
          <View style={{ gap: 10, marginTop: 10 }}>
            {/* Reviews are populated by the trigger after bookings complete */}
          </View>
        </View>
      </ScrollView>

      {/* footer */}
      <SafeAreaView edges={['bottom']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: theme.bgCanvas, borderTopWidth: 1, borderTopColor: theme.border }}>
        <View style={[row, { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 10, gap: 12, alignItems: 'center' }]}>
          <Pressable
            style={{
              width: 50,
              height: 50,
              borderRadius: radii.md,
              borderWidth: 1.5,
              borderColor: theme.borderStrong,
              backgroundColor: theme.bgSurface,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ChatCircle size={21} color={theme.fg1} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/post-request')}
            style={[
              row,
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: theme.brand,
                borderRadius: radii.md,
                paddingVertical: 13,
              },
            ]}>
            <PaperPlaneTilt size={17} color={theme.fgOnBrand} weight="fill" />
            <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 15, color: theme.fgOnBrand }}>
              {t('planner.requestToBook')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
