import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Balloon,
  Bell,
  Briefcase,
  Cake,
  CaretDown,
  Champagne,
  HeartStraight,
  MagnifyingGlass,
  MapPin,
  Megaphone,
  SlidersHorizontal,
  type Icon,
} from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CitySheet } from '@/components/discover/CitySheet';
import { FeaturedCard } from '@/components/discover/FeaturedCard';
import { PlannerRow } from '@/components/discover/PlannerRow';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Photo } from '@/components/ui/Photo';
import { Skeleton, SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { CATEGORY_KEYS, type CategoryKey, type CityKey, type Planner } from '@/data/planners';
import { useIsRTL } from '@/i18n/useIsRTL';
import { PLANNER_SELECT, type DBPlannerRow, toPlanner } from '@/lib/db';
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

/** English tag labels used to filter a planner's tags by category — listing data isn't translated. */
const CATEGORY_LABELS: Record<CategoryKey, string[]> = {
  weddings: ['Weddings'],
  birthdays: ['Birthdays'],
  engagements: ['Engagements'],
  corporate: ['Corporate'],
  galas: ['Galas'],
};

export default function DiscoverScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const router = useRouter();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const categoriesScrollRef = useRef<ScrollView>(null);
  const featuredScrollRef = useRef<ScrollView>(null);
  // flexDirection: 'row-reverse' directly on a horizontal ScrollView's content
  // can lay children out at negative x-offsets that scrollTo/scrollToEnd can
  // never reach — the row visually "disappears" with no valid scroll position
  // that reveals it. Keeping the ScrollView itself LTR and reversing the
  // array for RTL avoids that entirely while still showing the first item
  // (weddings) at the right edge once scrolled to the end.
  const orderedCategoryKeys = isRTL ? [...CATEGORY_KEYS].reverse() : CATEGORY_KEYS;

  useEffect(() => {
    if (isRTL) categoriesScrollRef.current?.scrollToEnd({ animated: false });
  }, [isRTL]);

  const PAGE_SIZE = 20;
  const [city, setCity] = useState<CityKey | undefined>(undefined);
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [cityOpen, setCityOpen] = useState(false);
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = (page: number, append: boolean) => {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    supabase
      .from('planners')
      .select(PLANNER_SELECT)
      .range(from, to)
      .then(({ data }) => {
        const rows = ((data as unknown as DBPlannerRow[]) ?? []).map(toPlanner);
        setPlanners((prev) => (append ? [...prev, ...rows] : rows));
        setHasMore(rows.length === PAGE_SIZE);
        setLoading(false);
        setLoadingMore(false);
      });
  };

  useEffect(() => {
    loadPage(0, false);
  }, []);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    loadPage(Math.floor(planners.length / PAGE_SIZE), true);
  };

  const inCity = (p: Planner) => !city || p.city === city;
  const inCategory = (p: Planner) => !category || p.tags.some((tag) => CATEGORY_LABELS[category].includes(tag));
  const visible = (p: Planner) => inCity(p) && inCategory(p);

  const featuredLtr = planners.filter((p) => p.premium && visible(p));
  const featured = isRTL ? [...featuredLtr].reverse() : featuredLtr;
  const nearby = planners.filter(visible);

  useEffect(() => {
    if (isRTL && featured.length > 0) featuredScrollRef.current?.scrollToEnd({ animated: false });
  }, [isRTL, featured.length]);

  const openPlanner = (planner: Planner) => router.push(`/planner/${planner.id}`);
  const cityLabel = city ? t(`cities.${city}`) : t('cities.all');

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 110 }}>
      {/* header */}
      <View style={{ paddingHorizontal: 18, paddingTop: 6 }}>
        <View style={[row, { justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }]}>
          <Image
            source={require('@/assets/images/brand/logo-wordmark.png')}
            contentFit="contain"
            style={{ height: 26, width: 110 }}
          />
          <View style={[row, { alignItems: 'center', gap: 10 }]}>
            <LanguageToggle />
            <Pressable
              onPress={() => router.push('/notifications')}
              accessibilityRole="button"
              accessibilityLabel={t('common.notifications')}
              style={{
                width: 42,
                height: 42,
                borderRadius: radii.pill,
                borderWidth: 1.5,
                borderColor: theme.border,
                backgroundColor: theme.bgSurface,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Bell size={19} color={theme.fg1} />
              <View
                style={{
                  position: 'absolute',
                  top: 8,
                  [isRTL ? 'left' : 'right']: 9,
                  width: 8,
                  height: 8,
                  borderRadius: radii.pill,
                  backgroundColor: theme.brand,
                  borderWidth: 2,
                  borderColor: theme.bgSurface,
                }}
              />
            </Pressable>
          </View>
        </View>

        <Text variant="small" color={theme.fg2}>
          {t('discover.greeting')}
        </Text>
        <Pressable onPress={() => setCityOpen(true)} style={[row, { alignItems: 'center', gap: 4, marginTop: 1 }]}>
          <MapPin size={16} color={theme.brand} weight="fill" />
          <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 15, color: theme.fg1 }}>
            {cityLabel}
          </Text>
          <CaretDown size={12} color={theme.fg1} />
        </Pressable>
      </View>

      {/* hero */}
      <View style={{ marginHorizontal: 18, marginTop: 8, marginBottom: 4, borderRadius: 22, overflow: 'hidden' }}>
        <Photo seed={0} style={{ height: 158 }}>
          <Image
            source={require('@/assets/images/brand/glyph-ra-light.png')}
            contentFit="contain"
            style={{
              position: 'absolute',
              top: -20,
              [isRTL ? 'left' : 'right']: -10,
              width: 138,
              height: 138,
              opacity: 0.34,
              transform: [{ rotate: '-8deg' }],
            }}
          />
          <View
            style={{
              paddingHorizontal: 18,
              paddingTop: 34,
              paddingBottom: 16,
              backgroundColor: 'rgba(43,34,51,0.35)',
            }}>
            <Text variant="h3" color="#fff">
              {t('discover.heroTitle')}
            </Text>
            <Text variant="caption" color="rgba(255,255,255,0.85)" style={{ marginTop: 4 }}>
              {t('discover.heroSubtitle')}
            </Text>
            <Pressable
              onPress={() => router.push('/post-request')}
              style={[
                row,
                {
                  alignSelf: 'flex-start',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 13,
                  backgroundColor: '#fff',
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: radii.md,
                },
              ]}>
              <Megaphone size={17} color={theme.brand} weight="fill" />
              <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 13.5, color: theme.brand }}>
                {t('discover.postRequest')}
              </Text>
            </Pressable>
          </View>
        </Photo>
      </View>

      {/* search */}
      <View style={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 4 }}>
        <Pressable
          onPress={() => router.push('/search')}
          style={[
            row,
            {
              alignItems: 'center',
              gap: 10,
              backgroundColor: theme.bgSurface,
              borderWidth: 1.5,
              borderColor: theme.borderStrong,
              borderRadius: radii.md,
              paddingVertical: 12,
              paddingHorizontal: 14,
            },
          ]}>
          <MagnifyingGlass size={18} color={theme.fg3} />
          <Text variant="small" color={theme.fg3} style={{ flex: 1 }}>
            {t('discover.searchPlaceholder')}
          </Text>
          <SlidersHorizontal size={18} color={theme.brand} />
        </Pressable>
      </View>

      {/* categories */}
      <ScrollView
        ref={categoriesScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: 'row',
          gap: 9,
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 6,
          minWidth: '100%',
          justifyContent: isRTL ? 'flex-end' : 'flex-start',
        }}>
        {orderedCategoryKeys.map((key) => {
          const on = category === key;
          const c = categoryColors[key];
          const IconComp = CATEGORY_ICONS[key];
          return (
            <Pressable
              key={key}
              onPress={() => setCategory(on ? null : key)}
              style={[
                row,
                {
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 9,
                  paddingHorizontal: 14,
                  borderRadius: radii.pill,
                  borderWidth: 1.5,
                  borderColor: on ? c.color : theme.borderStrong,
                  backgroundColor: on ? c.tint : theme.bgSurface,
                },
              ]}>
              <IconComp size={16} color={c.color} />
              <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 13, color: on ? c.color : theme.fg1 }}>
                {t(`categories.${key}`)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* featured */}
      <View style={[row, { justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 2 }]}>
        <Text variant="h3">{t('discover.featuredPlanners')}</Text>
        <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 13, color: theme.brand }}>
          {t('discover.seeAll')}
        </Text>
      </View>
      {loading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 13, paddingHorizontal: 18, paddingVertical: 4 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ width: 190, height: 220, borderRadius: radii.lg, overflow: 'hidden' }}>
              <Skeleton height={220} radius={radii.lg} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          ref={featuredScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: 'row',
            gap: 13,
            paddingHorizontal: 18,
            paddingVertical: 4,
            minWidth: '100%',
            justifyContent: isRTL ? 'flex-end' : 'flex-start',
          }}>
          {featured.map((p) => (
            <FeaturedCard key={p.id} planner={p} onPress={openPlanner} />
          ))}
        </ScrollView>
      )}

      {/* top rated */}
      <View style={[row, { justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 2 }]}>
        <Text variant="h3">{city ? t('discover.topRatedIn', { city: cityLabel }) : t('discover.topRatedNear')}</Text>
        <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 13, color: theme.brand }}>
          {t('discover.filters')}
        </Text>
      </View>
      {loading ? (
        <View style={{ gap: 11, paddingHorizontal: 18, paddingTop: 4 }}>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i}>
              <SkeletonRow>
                <Skeleton width={60} height={60} radius={radii.md} style={{ flexShrink: 0 }} />
                <View style={{ flex: 1, gap: 8 }}>
                  <Skeleton height={14} width="60%" />
                  <Skeleton height={12} width="40%" />
                </View>
              </SkeletonRow>
            </SkeletonCard>
          ))}
        </View>
      ) : (
        <View style={{ gap: 11, paddingHorizontal: 18, paddingTop: 4 }}>
          {nearby.map((p) => (
            <PlannerRow key={p.id} planner={p} onPress={openPlanner} />
          ))}
          {nearby.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 30, gap: 8 }}>
              <MapPin size={30} color={theme.fg3} />
              <Text variant="small" color={theme.fg3} style={{ textAlign: 'center' }}>
                <Trans
                  i18nKey="discover.emptyCity"
                  values={{ city: cityLabel }}
                  components={{
                    link: (
                      <Text
                        onPress={() => router.push('/post-request')}
                        style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, color: theme.brand }}
                      />
                    ),
                  }}
                />
              </Text>
            </View>
          )}
          {nearby.length > 0 && hasMore && !city && !category && (
            <Pressable
              onPress={loadMore}
              disabled={loadingMore}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 13,
                marginTop: 4,
                borderRadius: radii.md,
                borderWidth: 1.5,
                borderColor: theme.borderStrong,
                backgroundColor: theme.bgSurface,
              }}>
              <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 13.5, color: theme.brand }}>
                {loadingMore ? t('discover.loadingMore') : t('discover.loadMore')}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <CitySheet visible={cityOpen} current={city} onSelect={(c) => { setCity(c); setCityOpen(false); }} onClose={() => setCityOpen(false)} />
    </ScrollView>
    </SafeAreaView>
  );
}
