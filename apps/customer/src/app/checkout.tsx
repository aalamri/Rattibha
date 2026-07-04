import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CalendarBlank, CreditCard, HourglassMedium, Info, Lock, PenNib, ShieldCheck, SquaresFour, User } from 'phosphor-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useIsRTL } from '@/i18n/useIsRTL';
import { type DBOfferRow, PLANNER_SELECT } from '@/lib/db';
import { formatDate, formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii, shadows } from '@/theme/tokens';

type MethodKey = 'card' | 'applePay' | 'tabby';

export default function CheckoutScreen() {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const theme = useTheme();
  const router = useRouter();
  const { offerId, type } = useLocalSearchParams<{ offerId: string; type?: string }>();
  const isBalancePayment = type === 'balance';
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const fontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;
  const [method, setMethod] = useState<MethodKey>('card');
  const [offer, setOffer] = useState<DBOfferRow | null>(null);
  const [paying, setPaying] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { show: showToast } = useToast();

  const loadOffer = useCallback(async () => {
    if (!offerId) return;
    const { data } = await supabase
      .from('offers')
      .select(`id, request_id, planner_id, package, price, message, status, deal_status, created_at, planners(${PLANNER_SELECT}), requests:request_id(event_date)`)
      .eq('id', offerId)
      .single();
    if (data) setOffer(data as unknown as DBOfferRow);
  }, [offerId]);

  useEffect(() => {
    if (!offerId) return;
    loadOffer();

    // Subscribe to deal_status changes so the screen updates automatically
    // when the planner countersigns — no manual refresh needed.
    channelRef.current = supabase
      .channel(`checkout_offer:${offerId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'offers',
        filter: `id=eq.${offerId}`,
      }, () => { loadOffer(); })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [offerId, loadOffer]);

  // Fallback for when the realtime subscription above misses an update (e.g.
  // the countersign happened while this screen was backgrounded, or the
  // channel dropped) — re-fetch whenever the screen regains focus so the
  // customer always has a way to unstick "awaiting countersign" besides
  // waiting on the socket.
  useFocusEffect(
    useCallback(() => {
      loadOffer();
    }, [loadOffer])
  );

  const plannerName = offer?.planners?.business_name ?? '—';
  const seed = offer?.planners?.profiles?.avatar_seed ?? 0;
  const price = offer?.price ?? 0;
  const dealStatus = (offer as unknown as { deal_status: string } | null)?.deal_status;
  const awaitingCountersign = !!offer && dealStatus !== 'countersigned' && dealStatus !== 'deposit_paid' && dealStatus !== 'completed' && dealStatus !== 'reviewed';
  const serviceFee = Math.round(price * 0.05);
  const customerTotal = price + serviceFee;
  const deposit = Math.round(customerTotal * 0.2);
  const balance = customerTotal - deposit;
  const reqWithDate = offer as unknown as { requests: { event_date: string } | null } | null;
  const eventDate = reqWithDate?.requests?.event_date;
  const dateLabel = eventDate ? formatDate(new Date(eventDate), isRTL, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const METHODS: { key: MethodKey; label: string; icon: typeof CreditCard }[] = [
    { key: 'card', label: t('checkout.methods.card'), icon: CreditCard },
    { key: 'applePay', label: t('checkout.methods.applePay'), icon: CreditCard },
    { key: 'tabby', label: t('checkout.methods.tabby'), icon: SquaresFour },
  ];

  async function handlePay() {
    if (!offerId) return;
    setPaying(true);

    // Find the contract for this offer
    const { data: contracts, error: contractError } = await supabase
      .from('contracts')
      .select('id')
      .eq('offer_id', offerId)
      .limit(1);
    const contractId = contracts?.[0]?.id;

    if (contractError || !contractId) {
      setPaying(false);
      showToast(t('toast.error'));
      return;
    }

    // The planner's countersign step pre-creates pending deposit/balance rows
    // (estimated off the raw price, before this 5% customer fee). Update those
    // rather than inserting a second deposit row with a different amount.
    const { data: existingPayments, error: existingPaymentsError } = await supabase
      .from('payments')
      .select('id, type')
      .eq('contract_id', contractId);

    if (existingPaymentsError) {
      setPaying(false);
      showToast(t('toast.error'));
      return;
    }

    const depositRow = existingPayments?.find((p) => p.type === 'deposit');
    const balanceRow = existingPayments?.find((p) => p.type === 'balance');

    if (isBalancePayment) {
      const { error } = balanceRow
        ? await supabase
            .from('payments')
            .update({ amount: balance, status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', balanceRow.id)
        : await supabase.from('payments').insert({
            contract_id: contractId,
            type: 'balance',
            amount: balance,
            status: 'paid',
            paid_at: new Date().toISOString(),
          });

      setPaying(false);
      if (error) {
        showToast(t('toast.error'));
        return;
      }
      showToast(t('toast.balancePaid'));
      router.back();
      return;
    }

    const { error: depositError } = depositRow
      ? await supabase
          .from('payments')
          .update({ amount: deposit, status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', depositRow.id)
      : await supabase.from('payments').insert({
          contract_id: contractId,
          type: 'deposit',
          amount: deposit,
          status: 'paid',
          paid_at: new Date().toISOString(),
        });

    const { error: balanceError } = balanceRow
      ? await supabase.from('payments').update({ amount: balance }).eq('id', balanceRow.id)
      : await supabase.from('payments').insert({ contract_id: contractId, type: 'balance', amount: balance });

    // Upsert booking — store total platform fee (5% customer + 5% planner = 10%)
    const { error: bookingError } = await supabase.from('bookings').upsert({
      contract_id: contractId,
      stage: 'planning' as const,
      event_date: eventDate ?? new Date().toISOString().split('T')[0],
      platform_fee: Math.round(price * 0.10 * 100) / 100,
    }, { onConflict: 'contract_id' });

    // Best-effort: close the request now that it has a paid booking, so it
    // drops out of the open-requests list and shows up under "Booked".
    if (offer?.request_id) {
      await supabase.from('requests').update({ status: 'closed' }).eq('id', offer.request_id);
    }

    setPaying(false);

    if (depositError || balanceError || bookingError) {
      showToast(t('toast.error'));
      return;
    }

    showToast(t('toast.bookingConfirmed'));
    router.replace('/confirm');
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
                {t('checkout.title')}
              </Text>
              <Text variant="small" color={theme.fg2} style={{ marginTop: 1 }}>
                {plannerName}
              </Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 18, gap: 18 }}>
            {/* order summary — always visible */}
            <View style={[shadows.sm, { backgroundColor: theme.bgSurface, borderWidth: 1, borderColor: theme.border, borderRadius: radii.lg, padding: 16 }]}>
              <View style={[row, { gap: 12, alignItems: 'center' }]}>
                <Photo seed={seed} style={{ width: 50, height: 50, borderRadius: radii.sm, flexShrink: 0 }} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily, fontSize: 14.5, color: theme.fg1 }}>{offer?.package ?? '—'}</Text>
                  <Text variant="small" color={theme.fg3} style={{ marginTop: 1 }}>
                    {plannerName} · {dateLabel}
                  </Text>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 13 }} />

              <PriceLine label={t('checkout.packageTotal')} value={`${t('common.sar')} ${formatNumber(price, isRTL)}`} row={row} isRTL={isRTL} />
              <PriceLine label={t('checkout.serviceFee')} value={`+ ${t('common.sar')} ${formatNumber(serviceFee, isRTL)}`} row={row} isRTL={isRTL} muted />
              <PriceLine label={t('checkout.customerTotal')} value={`${t('common.sar')} ${formatNumber(customerTotal, isRTL)}`} row={row} isRTL={isRTL} />
              {isBalancePayment ? (
                <>
                  <PriceLine label={t('checkout.depositPaid')} value={`${t('common.sar')} ${formatNumber(deposit, isRTL)}`} row={row} isRTL={isRTL} muted />
                  <PriceLine label={t('checkout.balanceDueToday')} value={`${t('common.sar')} ${formatNumber(balance, isRTL)}`} row={row} isRTL={isRTL} strong />
                </>
              ) : (
                <>
                  <PriceLine label={t('checkout.depositDueToday')} value={`${t('common.sar')} ${formatNumber(deposit, isRTL)}`} row={row} isRTL={isRTL} strong />
                  <PriceLine label={t('checkout.balanceBeforeEvent')} value={`${t('common.sar')} ${formatNumber(balance, isRTL)}`} row={row} isRTL={isRTL} muted />
                </>
              )}
            </View>

            {awaitingCountersign ? (
              /* ── Waiting for planner countersign ── */
              <View style={[shadows.sm, { backgroundColor: theme.bgSurface, borderWidth: 1.5, borderColor: theme.border, borderRadius: radii.lg, padding: 20, alignItems: 'center', gap: 14 }]}>
                <View style={{ width: 56, height: 56, borderRadius: radii.pill, backgroundColor: theme.bgBlush, alignItems: 'center', justifyContent: 'center' }}>
                  <HourglassMedium size={26} color={theme.brand} weight="fill" />
                </View>
                <View style={{ alignItems: 'center', gap: 6 }}>
                  <Text variant="h4">{t('checkout.awaitingCountersign')}</Text>
                  <Text variant="small" color={theme.fg3} style={{ textAlign: 'center', lineHeight: 19 }}>
                    {t('checkout.awaitingCountersignNote')}
                  </Text>
                </View>
                <View style={[row, { alignItems: 'center', gap: 6 }]}>
                  <ActivityIndicator size="small" color={theme.brand} />
                  <Text style={{ fontFamily, fontSize: 12, color: theme.brand }}>
                    {t('checkout.awaitingCountersignSub')}
                  </Text>
                </View>
                <View style={[row, { alignItems: 'center', gap: 8, marginTop: 4 }]}>
                  <PenNib size={14} color={theme.fg3} />
                  <Text variant="caption" color={theme.fg3}>{t('checkout.secureNote')}</Text>
                </View>
              </View>
            ) : (
              <>
                {/* payment method */}
                <View>
                  <Text style={{ fontFamily, fontSize: 12.5, color: theme.fg2, marginBottom: 7 }}>{t('checkout.paymentMethod')}</Text>
                  <View style={{ gap: 10 }}>
                    {METHODS.map(({ key, label, icon: MethodIcon }) => {
                      const on = method === key;
                      return (
                        <Pressable key={key} onPress={() => setMethod(key)}>
                          <View
                            style={[
                              row,
                              {
                                alignItems: 'center',
                                gap: 12,
                                paddingVertical: 13,
                                paddingHorizontal: 15,
                                borderRadius: radii.md,
                                borderWidth: 1.5,
                                borderColor: on ? theme.brand : theme.border,
                                backgroundColor: on ? theme.bgBlush : theme.bgSurface,
                              },
                            ]}>
                            <MethodIcon size={22} color={on ? theme.brand : theme.fg1} weight={on ? 'fill' : 'regular'} />
                            <Text style={{ fontFamily, fontSize: 14, color: theme.fg1, flex: 1 }}>{label}</Text>
                            <View
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: radii.pill,
                                borderWidth: 2,
                                borderColor: on ? theme.brand : theme.borderStrong,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              {on && <View style={{ width: 10, height: 10, borderRadius: radii.pill, backgroundColor: theme.brand }} />}
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* card form */}
                {method === 'card' ? (
                  <View style={{ gap: 14 }}>
                    <FakeField label={t('checkout.cardNumber')} icon={CreditCard} value="4242 4242 4242 4242" row={row} isRTL={isRTL} fontFamily={fontFamily} />
                    <View style={[row, { gap: 12 }]}>
                      <View style={{ flex: 1 }}>
                        <FakeField label={t('checkout.expiry')} icon={CalendarBlank} value="08 / 27" row={row} isRTL={isRTL} fontFamily={fontFamily} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <FakeField label={t('checkout.cvv')} icon={Lock} value="•••" row={row} isRTL={isRTL} fontFamily={fontFamily} />
                      </View>
                    </View>
                    <FakeField label={t('checkout.nameOnCard')} icon={User} value="—" row={row} isRTL={isRTL} fontFamily={fontFamily} />
                  </View>
                ) : (
                  <View style={[row, { alignItems: 'center', gap: 10, backgroundColor: theme.bgBlush, borderRadius: radii.md, padding: 14 }]}>
                    <Info size={19} color={theme.brand} weight="fill" />
                    <Text variant="small" color={theme.brand} style={{ flex: 1, lineHeight: 18 }}>
                      {t('checkout.altMethodNote', { method: t(`checkout.methodNames.${method}`) })}
                    </Text>
                  </View>
                )}

                {/* security note */}
                <View style={[row, { alignItems: 'center', gap: 8 }]}>
                  <ShieldCheck size={17} color={theme.success} weight="fill" />
                  <Text variant="caption" color={theme.fg3}>
                    {t('checkout.secureNote')}
                  </Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* footer — hidden while awaiting countersign */}
      {!awaitingCountersign && (
        <SafeAreaView edges={['bottom']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          <LinearGradient
            colors={['transparent', `${theme.bgCanvas}F5`]}
            style={{ paddingHorizontal: 18, paddingTop: 24, paddingBottom: 12 }}>
            {paying ? (
              <ActivityIndicator color={theme.brand} />
            ) : (
              <Button icon={Lock} onPress={handlePay} full>
                {t('checkout.payNow', { sar: t('common.sar'), amount: formatNumber(isBalancePayment ? balance : deposit, isRTL) })}
              </Button>
            )}
          </LinearGradient>
        </SafeAreaView>
      )}
    </View>
  );
}

function PriceLine({
  label,
  value,
  row,
  isRTL,
  strong,
  muted,
}: {
  label: string;
  value: string;
  row: { flexDirection: 'row' | 'row-reverse' };
  isRTL: boolean;
  strong?: boolean;
  muted?: boolean;
}) {
  const theme = useTheme();
  const fontFamily = strong ? (isRTL ? fonts.arSans.bold : fonts.sans.bold) : isRTL ? fonts.arSans.semibold : fonts.sans.semibold;
  return (
    <View style={[row, { alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }]}>
      <Text variant="small" color={muted ? theme.fg3 : theme.fg2}>
        {label}
      </Text>
      <Text style={{ fontFamily, fontSize: strong ? 17 : 13.5, color: strong ? theme.brand : muted ? theme.fg3 : theme.fg1 }}>{value}</Text>
    </View>
  );
}

function FakeField({
  label,
  icon: IconComp,
  value,
  row,
  isRTL,
  fontFamily,
}: {
  label: string;
  icon: typeof CreditCard;
  value: string;
  row: { flexDirection: 'row' | 'row-reverse' };
  isRTL: boolean;
  fontFamily: string;
}) {
  const theme = useTheme();
  const labelFontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;
  return (
    <View>
      <Text style={{ fontFamily: labelFontFamily, fontSize: 12.5, color: theme.fg2, marginBottom: 7 }}>{label}</Text>
      <View
        style={[
          row,
          {
            alignItems: 'center',
            gap: 10,
            backgroundColor: theme.bgSurface,
            borderWidth: 1.5,
            borderColor: theme.borderStrong,
            borderRadius: radii.md,
            paddingVertical: 13,
            paddingHorizontal: 14,
          },
        ]}>
        <IconComp size={18} color={theme.fg3} />
        <Text style={{ fontFamily, fontSize: 14, color: theme.fg1, flex: 1, textAlign: isRTL ? 'right' : 'left' }}>{value}</Text>
      </View>
    </View>
  );
}
