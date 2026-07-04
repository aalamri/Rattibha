import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Balloon,
  Briefcase,
  Cake,
  ChatCircle,
  Champagne,
  Clock,
  HeartStraight,
  HourglassMedium,
  MapPin,
  Sparkle,
  type Icon,
} from 'phosphor-react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Stars } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Photo } from '@/components/ui/Photo';
import { Skeleton, SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { type CategoryKey } from '@/data/planners';
import { bidiIsolate } from '@/i18n/bidi';
import { useIsRTL } from '@/i18n/useIsRTL';
import { type DBOfferRow, type DBRequestRow, PLANNER_SELECT } from '@/lib/db';
import { formatDate, formatNumber } from '@/lib/format';
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

type SortKey = 'best' | 'price' | 'rating';

export default function ProposalsScreen() {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const fontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;

  const [request, setRequest] = useState<DBRequestRow | null>(null);
  const [offers, setOffers] = useState<DBOfferRow[]>([]);
  const [sort, setSort] = useState<SortKey>('best');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let requestDone = false;
    let offersDone = false;
    const maybeFinish = () => { if (requestDone && offersDone) setLoading(false); };

    supabase
      .from('requests')
      .select('id, customer_id, category, city, event_date, guests, budget, note, status, created_at')
      .eq('id', id)
      .single()
      .then(({ data }) => { if (data) setRequest(data as unknown as DBRequestRow); requestDone = true; maybeFinish(); });

    supabase
      .from('offers')
      .select(`id, request_id, planner_id, package, price, message, status, deal_status, created_at, planners(${PLANNER_SELECT})`)
      .eq('request_id', id)
      .then(({ data }) => { setOffers((data as unknown as DBOfferRow[]) ?? []); offersDone = true; maybeFinish(); });
  }, [id]);

  const sorted = useMemo(() => {
    const list = [...offers];
    if (sort === 'price') list.sort((a, b) => a.price - b.price);
    else if (sort === 'rating') list.sort((a, b) => (b.planners?.rating ?? 0) - (a.planners?.rating ?? 0));
    return list;
  }, [offers, sort]);

  const cityLabel = request ? t(`cities.${request.city}`) : '';
  const CategoryIcon = request ? (CATEGORY_ICONS[request.category as CategoryKey] ?? CATEGORY_ICONS.weddings) : CATEGORY_ICONS.weddings;
  const categoryTint = request ? (categoryColors[request.category as CategoryKey] ?? categoryColors.weddings) : categoryColors.weddings;
  const dateLabel = request ? formatDate(new Date(request.event_date), isRTL, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const SORTS: { key: SortKey; label: string }[] = [
    { key: 'best', label: t('proposals.sortBest') },
    { key: 'price', label: t('proposals.sortPrice') },
    { key: 'rating', label: t('proposals.sortRating') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
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
                {t('proposals.title')}
              </Text>
              <Text variant="small" color={theme.fg2} style={{ marginTop: 1 }}>
                {sorted.length > 0 ? t('proposals.respondedCount', { count: sorted.length, city: cityLabel }) : t('proposals.noneYet', { city: cityLabel })}
              </Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 18, gap: 14 }}>
            {/* request brief recap */}
            {request && (
              <View
                style={{
                  backgroundColor: theme.bgSurface,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: radii.lg,
                  padding: 13,
                }}>
                <View style={[row, { alignItems: 'center', gap: 11 }]}>
                  <View style={{ width: 42, height: 42, borderRadius: radii.sm, backgroundColor: categoryTint.tint, alignItems: 'center', justifyContent: 'center' }}>
                    <CategoryIcon size={20} color={categoryTint.color} weight="fill" />
                  </View>
                  <Text style={{ fontFamily, fontSize: 13.5, color: theme.fg1, flex: 1 }}>
                    {t(`categories.${request.category}`)} · {t('myRequests.guests', { count: request.guests })}
                  </Text>
                  <Pressable onPress={() => router.push('/post-request')}>
                    <Text style={{ fontFamily, fontSize: 12, color: theme.brand }}>{t('proposals.edit')}</Text>
                  </Pressable>
                </View>
                <View style={[row, { alignItems: 'center', gap: 5, marginTop: 6, marginStart: 53 }]}>
                  <MapPin size={12} color={theme.brand} weight="fill" />
                  <Text variant="small" color={theme.fg3} style={{ flex: 1 }}>
                    {cityLabel} · {bidiIsolate(dateLabel, isRTL)} · {bidiIsolate(`${t('common.sar')} ${t(`postRequest.budgets.${request.budget}`)}`, isRTL)}
                  </Text>
                </View>
              </View>
            )}

            {/* sort tabs */}
            <View style={[row, { gap: 8 }]}>
              {SORTS.map(({ key, label }) => {
                const on = sort === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setSort(key)}
                    style={{
                      paddingVertical: 7,
                      paddingHorizontal: 12,
                      borderRadius: radii.pill,
                      borderWidth: 1.5,
                      borderColor: on ? theme.brand : theme.borderStrong,
                      backgroundColor: on ? theme.bgBlush : theme.bgSurface,
                    }}>
                    <Text style={{ fontFamily, fontSize: 12.5, color: on ? theme.brand : theme.fg2 }}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* offer cards */}
            <View style={{ gap: 13 }}>
              {loading ? (
                [0, 1, 2].map((i) => (
                  <SkeletonCard key={i}>
                    <SkeletonRow>
                      <Skeleton width={52} height={52} radius={radii.md} style={{ flexShrink: 0 }} />
                      <View style={{ flex: 1, gap: 8 }}>
                        <Skeleton height={14} width="55%" />
                        <Skeleton height={12} width="35%" />
                      </View>
                      <Skeleton width={70} height={26} radius={radii.pill} />
                    </SkeletonRow>
                    <Skeleton height={12} />
                    <Skeleton height={12} width="70%" />
                    <SkeletonRow>
                      <Skeleton width={80} height={34} radius={radii.md} />
                      <Skeleton width={100} height={34} radius={radii.md} />
                    </SkeletonRow>
                  </SkeletonCard>
                ))
              ) : sorted.length === 0 ? (
                <EmptyState
                  icon={HourglassMedium}
                  title={t('proposals.emptyTitle')}
                  subtitle={t('proposals.emptySub')}
                />
              ) : sorted.map((offer, i) => (
                <OfferCard key={offer.id} offer={offer} isRTL={isRTL} fontFamily={fontFamily} row={row} isBest={i === 0 && sort === 'best'} />
              ))}
            </View>

            {sorted.length > 0 && (
              <View style={[row, { justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 8 }]}>
                <Clock size={14} color={theme.fg3} />
                <Text variant="small" color={theme.fg3}>
                  {t('proposals.morePlanners')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function OfferCard({
  offer,
  isRTL,
  fontFamily,
  row,
  isBest,
}: {
  offer: DBOfferRow;
  isRTL: boolean;
  fontFamily: string;
  row: { flexDirection: 'row' | 'row-reverse' };
  isBest: boolean;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const planner = offer.planners;
  const cityLabel = planner ? t(`cities.${planner.city}`) : '';
  const seed = planner?.profiles?.avatar_seed ?? 0;

  const hoursAgo = Math.max(1, Math.round((Date.now() - new Date(offer.created_at).getTime()) / 3600000));
  const timeLabel = t('common.hoursAgo', { count: hoursAgo });

  return (
    <View
      style={{
        backgroundColor: theme.bgSurface,
        borderWidth: 1,
        borderColor: isBest ? theme.brand : theme.border,
        borderRadius: radii.lg,
      }}>
      {isBest && (
        <View style={[row, { alignItems: 'center', gap: 6, backgroundColor: theme.bgBlush, paddingVertical: 5, paddingHorizontal: 14, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg }]}>
          <Sparkle size={13} color={theme.brand} weight="fill" />
          <Text style={{ fontFamily, fontSize: 11, color: theme.brand }}>{t('proposals.bestMatch')}</Text>
        </View>
      )}
      <View style={{ padding: 14 }}>
        <View style={[row, { gap: 12 }]}>
          <Photo seed={seed} style={{ width: 54, height: 54, borderRadius: 13, flexShrink: 0 }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={[row, { justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }]}>
              <Text variant="h4" style={{ flex: 1, lineHeight: 24 }}>
                {planner?.business_name ?? '—'}
              </Text>
              <Stars rating={planner?.rating ?? 0} />
            </View>
            <View style={[row, { alignItems: 'center', gap: 5, marginTop: 2 }]}>
              <MapPin size={13} color={theme.fg3} />
              <Text variant="small" color={theme.fg3}>
                {cityLabel} · {t('proposals.repliedAgo', { time: timeLabel })}
              </Text>
            </View>
          </View>
        </View>

        {offer.message && (
          <Text variant="small" color={theme.fg2} style={{ lineHeight: 19, marginVertical: 11 }}>
            "{offer.message}"
          </Text>
        )}

        <View style={[row, { alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: offer.message ? 0 : 10 }]}>
          <View>
            <Text variant="small" color={theme.fg3}>{t('proposals.theirQuote')}</Text>
            <Text style={{ fontFamily, fontSize: 18, fontWeight: '800', color: theme.fg1 }}>{t('common.sar')} {formatNumber(offer.price, isRTL)}</Text>
          </View>
          <View style={[row, { gap: 8, flexShrink: 0 }]}>
            <Button
              variant="secondary"
              size="sm"
              icon={ChatCircle}
              onPress={() =>
                router.push({
                  pathname: '/chat/[requestId]',
                  params: {
                    requestId: offer.request_id,
                    plannerId: offer.planner_id,
                    plannerName: planner?.business_name ?? '',
                    plannerSeed: String(seed),
                  },
                })
              }>
              {t('proposals.chat')}
            </Button>
            <Button size="sm" icon={ArrowRight} onPress={() => router.push({ pathname: '/offer/[id]', params: { id: offer.id } })}>
              {t('proposals.viewOffer')}
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}
