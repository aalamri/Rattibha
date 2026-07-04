import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  CalendarBlank,
  Check,
  Confetti,
  ClipboardText,
  CreditCard,
  Palette,
  SealCheck,
  Star,
  type Icon,
} from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { Text } from '@/components/ui/Text';
import { bidiIsolate } from '@/i18n/bidi';
import { useIsRTL } from '@/i18n/useIsRTL';
import { type DBBookingRow } from '@/lib/db';
import { formatDate, formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii, shadows } from '@/theme/tokens';

interface TimelineStep {
  key: 'confirmed' | 'planning' | 'walkthrough' | 'eventDay';
  icon: Icon;
  done: boolean;
  desc?: string;
}

export default function BookingDetailScreen() {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const fontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;

  const [booking, setBooking] = useState<DBBookingRow | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('bookings')
      .select(`
        id, contract_id, stage, event_date,
        contracts(
          id, ref,
          payments(type, amount, status),
          offers:offer_id(
            id, price, package,
            requests:request_id(category, city, guests),
            planners:planner_id(business_name, city, profiles(avatar_seed))
          )
        )
      `)
      .eq('id', id)
      .single()
      .then(({ data }) => { if (data) setBooking(data as unknown as DBBookingRow); });
  }, [id]);

  if (!booking) return null;

  const offer = booking.contracts?.offers;
  const plannerData = offer?.planners as unknown as { business_name: string; city?: string; profiles: { avatar_seed: number } | null } | null;
  const plannerName = plannerData?.business_name ?? '—';
  const plannerCity = plannerData?.city ?? '';
  const seed = plannerData?.profiles?.avatar_seed ?? 0;
  const pkgName = offer?.package ?? '—';
  const price = offer?.price ?? 0;
  const depositPaid = booking.contracts?.payments?.some((p) => p.type === 'deposit' && p.status === 'paid');
  const balancePaid = booking.contracts?.payments?.some((p) => p.type === 'balance' && p.status === 'paid');
  const confirmed = depositPaid || booking.stage === 'completed';
  const cityLabel = plannerCity ? t(`cities.${plannerCity}`) : '';
  const dateLabel = formatDate(new Date(booking.event_date), isRTL, { day: 'numeric', month: 'short', year: 'numeric' });
  const deposit = Math.round(price * 0.2);
  const balance = price - deposit;

  const timeline: TimelineStep[] = [
    { key: 'confirmed', icon: Check, done: confirmed },
    { key: 'planning', icon: Palette, done: confirmed },
    { key: 'walkthrough', icon: ClipboardText, done: false },
    { key: 'eventDay', icon: Confetti, done: false, desc: bidiIsolate(dateLabel, isRTL) },
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
                {t('bookingDetail.title')}
              </Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 18 }}>
            {/* planner summary */}
            <View
              style={[
                shadows.sm,
                row,
                {
                  gap: 13,
                  backgroundColor: theme.bgSurface,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: radii.lg,
                  padding: 13,
                },
              ]}>
              <Photo seed={seed} style={{ width: 64, height: 64, borderRadius: radii.md, flexShrink: 0 }} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={[row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
                  <Text variant="h4" style={{ flex: 1, minWidth: 0 }}>
                    {plannerName}
                  </Text>
                  {confirmed ? (
                    <Badge bg={theme.successBg} fg={theme.success} icon={SealCheck}>
                      {t('myBookings.status.confirmed')}
                    </Badge>
                  ) : (
                    <Badge bg={theme.warningBg} fg={theme.warning}>
                      {t('myBookings.status.pending')}
                    </Badge>
                  )}
                </View>
                <Text variant="small" color={theme.fg2} style={{ marginTop: 2 }}>
                  {pkgName}
                </Text>
                <View style={[row, { alignItems: 'center', gap: 5, marginTop: 6 }]}>
                  <CalendarBlank size={14} color={theme.fg3} />
                  <Text variant="small" color={theme.fg3}>
                    {bidiIsolate(dateLabel, isRTL)} · {cityLabel}
                  </Text>
                </View>
              </View>
            </View>

            {/* timeline */}
            <Text variant="h4" style={{ marginTop: 20, marginBottom: 11 }}>
              {t('bookingDetail.timelineTitle')}
            </Text>
            <View style={{ backgroundColor: theme.bgSurface, borderWidth: 1, borderColor: theme.border, borderRadius: radii.lg, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>
              {timeline.map((step, i) => (
                <View key={step.key} style={[row, { gap: 13, paddingBottom: 16 }]}>
                  <View style={{ alignItems: 'center' }}>
                    <View
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: radii.pill,
                        flexShrink: 0,
                        backgroundColor: step.done ? theme.brand : theme.bgSurface,
                        borderWidth: 1.5,
                        borderColor: step.done ? theme.brand : theme.borderStrong,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {step.done ? <Check size={15} color="#fff" weight="bold" /> : <step.icon size={15} color={theme.fg3} />}
                    </View>
                    {i < timeline.length - 1 && (
                      <View style={{ width: 2, flex: 1, minHeight: 22, marginTop: 2, backgroundColor: step.done ? theme.brand : theme.border }} />
                    )}
                  </View>
                  <View style={{ paddingTop: 4 }}>
                    <Text style={{ fontFamily, fontSize: 14, color: step.done ? theme.fg1 : theme.fg2 }}>{t(`bookingDetail.timeline.${step.key}.title`)}</Text>
                    <Text variant="small" color={theme.fg3} style={{ marginTop: 1 }}>
                      {step.desc ?? t(`bookingDetail.timeline.${step.key}.desc`)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* payment */}
            <Text variant="h4" style={{ marginTop: 20, marginBottom: 11 }}>
              {t('bookingDetail.payment')}
            </Text>
            <View style={{ backgroundColor: theme.bgSurface, borderWidth: 1, borderColor: theme.border, borderRadius: radii.lg, padding: 16 }}>
              <PayRow
                label={t('bookingDetail.deposit')}
                value={`${t('common.sar')} ${formatNumber(deposit, isRTL)}`}
                tag={confirmed ? t('bookingDetail.paid') : t('bookingDetail.depositDue')}
                tagColor={confirmed ? theme.success : theme.warning}
                tagBg={confirmed ? theme.successBg : theme.warningBg}
                row={row}
                fontFamily={fontFamily}
              />
              <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 12 }} />
              <PayRow
                label={t('bookingDetail.balance')}
                value={`${t('common.sar')} ${formatNumber(balance, isRTL)}`}
                tag={t('bookingDetail.dueBeforeEvent')}
                tagColor={theme.warning}
                tagBg={theme.warningBg}
                row={row}
                fontFamily={fontFamily}
              />
              <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 12 }} />
              <View style={[row, { alignItems: 'center', justifyContent: 'space-between' }]}>
                <Text style={{ fontFamily, fontSize: 14.5, color: theme.fg1 }}>{t('bookingDetail.total')}</Text>
                <Text style={{ fontFamily: isRTL ? fonts.arSans.bold : fonts.sans.bold, fontSize: 17, fontWeight: '800', color: theme.brand }}>
                  {t('common.sar')} {formatNumber(price, isRTL)}
                </Text>
              </View>
            </View>

            {/* actions */}
            <View style={[row, { gap: 12, marginTop: 18 }]}>
              <View style={{ flex: 1 }}>
                <Button
                  variant="secondary"
                  icon={Star}
                  onPress={() => router.push({ pathname: '/review', params: { plannerId: booking.contracts?.offers?.planners ? (booking.contracts.offers.planners as unknown as { user_id?: string }).user_id ?? '' : '', bookingId: booking.id } })}
                  full>
                  {t('bookingDetail.review')}
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  icon={CreditCard}
                  disabled={!depositPaid || balancePaid}
                  onPress={() =>
                    router.push({
                      pathname: '/checkout',
                      params: { offerId: offer?.id ?? '', type: 'balance' },
                    })
                  }
                  full>
                  {balancePaid ? t('bookingDetail.balancePaid') : t('bookingDetail.payBalance')}
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function PayRow({
  label,
  value,
  tag,
  tagColor,
  tagBg,
  row,
  fontFamily,
}: {
  label: string;
  value: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  row: { flexDirection: 'row' | 'row-reverse' };
  fontFamily: string;
}) {
  const theme = useTheme();
  return (
    <View style={[row, { alignItems: 'center', justifyContent: 'space-between' }]}>
      <View>
        <Text variant="small" color={theme.fg2}>
          {label}
        </Text>
        <View style={{ marginTop: 4 }}>
          <Badge bg={tagBg} fg={tagColor}>
            {tag}
          </Badge>
        </View>
      </View>
      <Text style={{ fontFamily, fontSize: 15, color: theme.fg1 }}>{value}</Text>
    </View>
  );
}
