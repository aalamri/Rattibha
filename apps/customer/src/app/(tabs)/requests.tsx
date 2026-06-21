import { useRouter } from 'expo-router';
import {
  Balloon,
  Briefcase,
  Cake,
  Champagne,
  ClipboardText,
  HeartStraight,
  Megaphone,
  Plus,
  SealCheck,
  type Icon,
} from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton, SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { type CategoryKey } from '@/data/planners';
import { bidiIsolate } from '@/i18n/bidi';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useAuth } from '@/lib/AuthContext';
import { type DBRequestRow } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { categoryColors, colors } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii, shadows } from '@/theme/tokens';

type UIStatus = 'open' | 'booked';

const CATEGORY_ICONS: Record<CategoryKey, Icon> = {
  weddings: HeartStraight,
  birthdays: Cake,
  engagements: Balloon,
  corporate: Briefcase,
  galas: Champagne,
};

// Decorative avatar-stack variety colors — brand palette, intentionally
// the same in both light and dark mode (not a semantic surface token).
const AVATAR_COLORS = [colors.purple500, '#7B4FB0', '#B5881A'];

const FILTERS: { key: UIStatus | 'all'; labelKey: string }[] = [
  { key: 'all', labelKey: 'myRequests.filters.all' },
  { key: 'open', labelKey: 'myRequests.filters.open' },
  { key: 'booked', labelKey: 'myRequests.filters.booked' },
];

function uiStatus(dbStatus: string): UIStatus {
  return dbStatus === 'closed' ? 'booked' : 'open';
}

export default function RequestsScreen() {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const theme = useTheme();
  const router = useRouter();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const fontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;
  const { session } = useAuth();

  const [filter, setFilter] = useState<UIStatus | 'all'>('all');
  const [requests, setRequests] = useState<DBRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const fetchRequests = () =>
      supabase
        .from('requests')
        .select('id, customer_id, category, city, event_date, guests, budget, note, status, created_at, offers(id, status)')
        .eq('customer_id', session.user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => { setRequests((data as unknown as DBRequestRow[]) ?? []); setLoading(false); });

    fetchRequests();

    const channel = supabase
      .channel(`customer-offers-${session.user.id}-${Date.now()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'offers' }, () => fetchRequests())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session]);

  const shown = requests.filter((r) => filter === 'all' || uiStatus(r.status) === filter);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
    <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
      {/* header */}
      <View style={[row, { justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 6, marginBottom: 12 }]}>
        <Text variant="h2">
          {t('myRequests.title')}
        </Text>
        <Pressable
          onPress={() => router.push('/post-request')}
          style={[
            {
              width: 40,
              height: 40,
              borderRadius: radii.pill,
              backgroundColor: theme.brand,
              alignItems: 'center',
              justifyContent: 'center',
            },
            shadows.brand,
          ]}>
          <Plus size={19} color={theme.fgOnBrand} weight="bold" />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 18 }}>
        {/* filter tabs */}
        <View style={[row, { gap: 8, marginBottom: 14 }]}>
          {FILTERS.map(({ key, labelKey }) => {
            const on = filter === key;
            return (
              <Pressable
                key={key}
                onPress={() => setFilter(key)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 15,
                  borderRadius: radii.pill,
                  borderWidth: 1.5,
                  borderColor: on ? theme.brand : theme.borderStrong,
                  backgroundColor: on ? theme.bgBlush : theme.bgSurface,
                }}>
                <Text style={{ fontFamily, fontSize: 13, color: on ? theme.brand : theme.fg2 }}>{t(labelKey)}</Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View style={{ gap: 13 }}>
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i}>
                <SkeletonRow>
                  <Skeleton width={46} height={46} radius={radii.sm} style={{ flexShrink: 0 }} />
                  <View style={{ flex: 1, gap: 8 }}>
                    <Skeleton height={14} width="65%" />
                    <Skeleton height={12} width="80%" />
                  </View>
                </SkeletonRow>
                <Skeleton height={1} />
                <SkeletonRow>
                  <Skeleton height={12} width="30%" />
                  <Skeleton height={22} width={60} radius={radii.pill} />
                </SkeletonRow>
              </SkeletonCard>
            ))}
          </View>
        ) : shown.length === 0 ? (
          <EmptyState
            icon={ClipboardText}
            title={t('myRequests.emptyTitle')}
            subtitle={t('myRequests.emptySub')}>
            <View style={{ marginTop: 6 }}>
              <Button icon={Plus} onPress={() => router.push('/post-request')}>
                {t('myRequests.emptyCta')}
              </Button>
            </View>
          </EmptyState>
        ) : null}
        <View style={{ gap: 13 }}>
          {shown.map((request) => {
            const status = uiStatus(request.status);
            const booked = status === 'booked';
            const CategoryIcon = CATEGORY_ICONS[request.category as CategoryKey] ?? CATEGORY_ICONS.weddings;
            const tint = categoryColors[request.category as CategoryKey] ?? categoryColors.weddings;
            const cityLabel = t(`cities.${request.city}`);
            const dateLabel = formatDate(new Date(request.event_date), isRTL, { day: 'numeric', month: 'short', year: 'numeric' });
            const offerList = request.offers as unknown as { id: string; status: string }[];
            const offerCount = offerList?.length ?? 0;
            const newOffers = offerList?.filter((o) => o.status === 'pending').length ?? 0;

            return (
              <Pressable key={request.id} onPress={() => router.push({ pathname: '/proposals', params: { id: request.id } })}>
                <View
                  style={[
                    shadows.sm,
                    {
                      backgroundColor: theme.bgSurface,
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: radii.lg,
                      padding: 15,
                    },
                  ]}>
                  <View style={[row, { gap: 12, alignItems: 'center' }]}>
                    <View style={{ width: 46, height: 46, borderRadius: radii.sm, backgroundColor: tint.tint, alignItems: 'center', justifyContent: 'center' }}>
                      <CategoryIcon size={22} color={tint.color} weight="fill" />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontFamily, fontSize: 14.5, color: theme.fg1 }}>
                        {t(`categories.${request.category}`)} · {t('myRequests.guests', { count: request.guests })}
                      </Text>
                      <Text variant="small" color={theme.fg3} style={{ marginTop: 2 }}>
                        {cityLabel} · {bidiIsolate(dateLabel, isRTL)} · {bidiIsolate(`${t('common.sar')} ${t(`postRequest.budgets.${request.budget}`)}`, isRTL)}
                      </Text>
                    </View>
                    {booked ? (
                      <Badge bg={theme.successBg} fg={theme.success} icon={SealCheck}>
                        {t('myRequests.filters.booked')}
                      </Badge>
                    ) : (
                      <Badge bg={theme.bgBlush} fg={theme.brand}>
                        {t('myRequests.filters.open')}
                      </Badge>
                    )}
                  </View>

                  <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 13 }} />

                  <View style={[row, { alignItems: 'center', justifyContent: 'space-between' }]}>
                    <View style={[row, { alignItems: 'center', gap: 8 }]}>
                      <View style={[row]}>
                        {AVATAR_COLORS.slice(0, Math.min(3, offerCount)).map((c, i) => (
                          <View
                            key={i}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: radii.pill,
                              backgroundColor: c,
                              borderWidth: 2,
                              borderColor: theme.bgSurface,
                              [isRTL ? 'marginRight' : 'marginLeft']: i ? -9 : 0,
                            }}
                          />
                        ))}
                      </View>
                      <Text variant="small" color={theme.fg2}>
                        <Text style={{ fontFamily, fontSize: 12.5, color: theme.fg1 }}>{offerCount}</Text>{' '}
                        {booked ? t('myRequests.offersReceived') : t('myRequests.offers')}
                      </Text>
                    </View>
                    {booked ? (
                      <Text style={{ fontFamily, fontSize: 12.5, color: theme.fg3 }}>{t('myRequests.viewBooking')} {isRTL ? '←' : '→'}</Text>
                    ) : (
                      <View style={[row, { alignItems: 'center', gap: 6 }]}>
                        {newOffers > 0 && (
                          <View style={{ backgroundColor: theme.brand, borderRadius: radii.pill, paddingVertical: 1, paddingHorizontal: 7 }}>
                            <Text style={{ fontFamily, fontSize: 10, color: theme.fgOnBrand }}>{t('myRequests.new', { count: newOffers })}</Text>
                          </View>
                        )}
                        <Text style={{ fontFamily, fontSize: 12.5, color: theme.brand }}>{t('myRequests.compare')} {isRTL ? '←' : '→'}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* post CTA */}
        <Pressable onPress={() => router.push('/post-request')} style={{ marginTop: 16 }}>
          <View
            style={[
              row,
              {
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: theme.borderStrong,
                borderRadius: radii.md,
                paddingVertical: 15,
                backgroundColor: theme.bgBlush,
              },
            ]}>
            <Megaphone size={19} color={theme.brand} weight="fill" />
            <Text style={{ fontFamily, fontSize: 13.5, color: theme.brand }}>{t('myRequests.postNew')}</Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
