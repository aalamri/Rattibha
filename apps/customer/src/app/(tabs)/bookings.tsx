import { useRouter } from 'expo-router';
import { CalendarBlank, CalendarCheck } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/Badge';
import { Photo } from '@/components/ui/Photo';
import { Skeleton, SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { bidiIsolate } from '@/i18n/bidi';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useAuth } from '@/lib/AuthContext';
import { type DBBookingRow } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { radii, shadows } from '@/theme/tokens';

export default function BookingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const router = useRouter();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const { session } = useAuth();

  const [bookings, setBookings] = useState<DBBookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('bookings')
      .select(`
        id, contract_id, stage, event_date,
        contracts(
          id, ref,
          payments(type, amount, status),
          offers:offer_id(
            price, package,
            requests:request_id(category, city, guests),
            planners:planner_id(business_name, profiles(avatar_seed))
          )
        )
      `)
      .then(({ data }) => { setBookings((data as unknown as DBBookingRow[]) ?? []); setLoading(false); });
  }, [session]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
          <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12 }}>
            <Text variant="h2">{t('myBookings.title')}</Text>
          </View>

          {loading ? (
            <View style={{ paddingHorizontal: 18, gap: 12 }}>
              {[0, 1, 2].map((i) => (
                <SkeletonCard key={i} style={{ flexDirection: 'row', gap: 12 }}>
                  <Skeleton width={70} height={70} radius={radii.md} style={{ flexShrink: 0 }} />
                  <View style={{ flex: 1, gap: 10 }}>
                    <SkeletonRow>
                      <Skeleton height={14} width="55%" />
                      <Skeleton height={20} width={72} radius={radii.pill} />
                    </SkeletonRow>
                    <Skeleton height={12} width="35%" />
                    <Skeleton height={12} width="45%" />
                  </View>
                </SkeletonCard>
              ))}
            </View>
          ) : bookings.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 }}>
              <View style={{ width: 64, height: 64, borderRadius: radii.pill, backgroundColor: theme.bgBlush, alignItems: 'center', justifyContent: 'center' }}>
                <CalendarCheck size={28} color={theme.brand} weight="fill" />
              </View>
              <Text variant="h4" color={theme.fg2}>{t('myBookings.empty')}</Text>
              <Text variant="small" color={theme.fg3}>{t('myBookings.emptySub')}</Text>
            </View>
          ) : (
          <View style={{ paddingHorizontal: 18, gap: 12 }}>
          {bookings.map((booking) => {
          const offer = booking.contracts?.offers;
          const plannerData = offer?.planners as unknown as { business_name: string; profiles: { avatar_seed: number } | null } | null;
          const plannerName = plannerData?.business_name ?? '—';
          const seed = plannerData?.profiles?.avatar_seed ?? 0;
          const pkgName = offer?.package ?? '—';
          const depositPaid = booking.contracts?.payments?.some((p) => p.type === 'deposit' && p.status === 'paid');
          const confirmed = depositPaid || booking.stage === 'completed';
          const dateLabel = formatDate(new Date(booking.event_date), isRTL, { day: 'numeric', month: 'short', year: 'numeric' });

          return (
            <Pressable key={booking.id} onPress={() => router.push({ pathname: '/booking/[id]', params: { id: booking.id } })}>
              <View
                style={[
                  shadows.sm,
                  row,
                  {
                    backgroundColor: theme.bgSurface,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: radii.lg,
                    padding: 12,
                    gap: 12,
                  },
                ]}>
                <Photo seed={seed} style={{ width: 70, height: 70, borderRadius: radii.md, flexShrink: 0 }} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={[row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
                    <Text variant="h4" style={{ flex: 1, minWidth: 0 }}>
                      {plannerName}
                    </Text>
                    {confirmed ? (
                      <Badge bg={theme.successBg} fg={theme.success}>
                        {t('myBookings.status.confirmed')}
                      </Badge>
                    ) : (
                      <Badge bg={theme.warningBg} fg={theme.warning}>
                        {t('myBookings.status.pending')}
                      </Badge>
                    )}
                  </View>
                  <Text variant="small" color={theme.fg2} style={{ marginTop: 3 }}>
                    {pkgName}
                  </Text>
                  <View style={[row, { alignItems: 'center', gap: 5, marginTop: 6 }]}>
                    <CalendarBlank size={14} color={theme.fg3} />
                    <Text variant="small" color={theme.fg3}>
                      {bidiIsolate(dateLabel, isRTL)}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
          })}
          </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
