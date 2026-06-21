import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, FileText, PenNib, Signature } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccentText, Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { bidiIsolate } from '@/i18n/bidi';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useAuth } from '@/lib/AuthContext';
import { type DBOfferRow, PLANNER_SELECT } from '@/lib/db';
import { formatDate, formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii, shadows } from '@/theme/tokens';

export default function ContractScreen() {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const theme = useTheme();
  const router = useRouter();
  const { offerId } = useLocalSearchParams<{ offerId: string }>();
  const { session, profile } = useAuth();
  const { show: showToast } = useToast();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const fontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;
  const [signed, setSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [offer, setOffer] = useState<DBOfferRow | null>(null);

  const customerName = profile?.full_name ?? session?.user.email ?? '—';

  useEffect(() => {
    if (!offerId) return;
    supabase
      .from('offers')
      .select(`id, request_id, planner_id, package, price, message, status, deal_status, created_at, planners(${PLANNER_SELECT}), requests:request_id(category, city, event_date, guests, budget)`)
      .eq('id', offerId)
      .single()
      .then(({ data }) => { if (data) setOffer(data as unknown as DBOfferRow); });
  }, [offerId]);

  const plannerName = offer?.planners?.business_name ?? '—';
  const price = offer?.price ?? 0;
  const deposit = Math.round(price * 0.2);

  // Safely extract nested request fields
  const req = offer ? (offer as unknown as { requests: { category: string; city: string; event_date: string; guests: number; budget: string } | null }).requests : null;
  const cityLabel = req ? t(`cities.${req.city}`) : '';
  const dateLabel = req ? formatDate(new Date(req.event_date), isRTL, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const eventValue = req
    ? `${t(`categories.${req.category}`)} · ${bidiIsolate(dateLabel, isRTL)} · ${bidiIsolate(t('myRequests.guests', { count: req.guests }), isRTL)}`
    : '';

  const terms = [t('contract.terms.scope'), t('contract.terms.policy'), t('contract.terms.deposit')];

  async function handleSign() {
    if (!signed || !offerId) return;
    setSubmitting(true);
    // Upsert contract (planner may have created one already via their dashboard)
    const ref = `RTB-${Date.now()}`;
    const { data: existingContracts } = await supabase
      .from('contracts')
      .select('id')
      .eq('offer_id', offerId)
      .limit(1);

    let contractId: string | null = existingContracts?.[0]?.id ?? null;
    if (!contractId) {
      const { data } = await supabase
        .from('contracts')
        .insert({ offer_id: offerId, ref })
        .select('id')
        .single();
      contractId = data?.id ?? null;
    }

    // Mark customer signature
    if (contractId) {
      await supabase.from('contracts').update({ signed_by_customer_at: new Date().toISOString() }).eq('id', contractId);
    }
    await supabase.from('offers').update({ status: 'accepted', deal_status: 'accepted' }).eq('id', offerId);

    setSubmitting(false);
    showToast(t('toast.contractSigned'));
    router.push({ pathname: '/checkout', params: { offerId } });
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
                {t('contract.title')}
              </Text>
              <Text variant="small" color={theme.fg2} style={{ marginTop: 1 }}>
                {plannerName}
              </Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 18, gap: 16 }}>
            {/* document */}
            <View style={[shadows.sm, { backgroundColor: theme.bgSurface, borderWidth: 1, borderColor: theme.border, borderRadius: radii.lg, padding: 18 }]}>
              <View style={[row, { alignItems: 'center', gap: 10, marginBottom: 14 }]}>
                <View style={{ width: 38, height: 38, borderRadius: radii.sm, backgroundColor: theme.bgBlush, alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color={theme.brand} weight="fill" />
                </View>
                <View>
                  <Text style={{ fontFamily, fontSize: 14, color: theme.fg1 }}>{t('contract.docTitle')}</Text>
                  <Text variant="caption" color={theme.fg3}>
                    {t('contract.docRef', { city: cityLabel })}
                  </Text>
                </View>
              </View>

              <CRow label={t('contract.rows.client')} value={customerName} row={row} fontFamily={fontFamily} />
              <CRow label={t('contract.rows.planner')} value={plannerName} row={row} fontFamily={fontFamily} />
              <CRow label={t('contract.rows.event')} value={eventValue} row={row} fontFamily={fontFamily} />
              <CRow label={t('contract.rows.package')} value={offer?.package ?? '—'} row={row} fontFamily={fontFamily} />
              <CRow label={t('contract.rows.totalFee')} value={`${t('common.sar')} ${formatNumber(price, isRTL)}`} row={row} fontFamily={fontFamily} />
              <CRow label={t('contract.rows.depositOnSigning')} value={`${t('common.sar')} ${formatNumber(deposit, isRTL)}`} row={row} fontFamily={fontFamily} />
              <CRow label={t('contract.rows.cancellation')} value={t('contract.cancellationValue')} row={row} fontFamily={fontFamily} last />
            </View>

            {/* terms */}
            <View style={{ gap: 8 }}>
              {terms.map((term) => (
                <View key={term} style={[row, { alignItems: 'center', gap: 10 }]}>
                  <CheckCircle size={19} color={theme.success} weight="fill" />
                  <Text variant="small" color={theme.fg2} style={{ flex: 1 }}>
                    {term}
                  </Text>
                </View>
              ))}
            </View>

            {/* signature */}
            <View>
              <Text style={{ fontFamily, fontSize: 12.5, color: theme.fg2, marginBottom: 7 }}>{t('contract.yourSignature')}</Text>
              <Pressable onPress={() => setSigned((s) => !s)}>
                <View
                  style={{
                    height: 92,
                    borderRadius: radii.md,
                    borderWidth: 1.5,
                    borderStyle: signed ? 'solid' : 'dashed',
                    borderColor: signed ? theme.brand : theme.borderStrong,
                    backgroundColor: signed ? theme.bgBlush : theme.bgSurface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}>
                  {signed ? (
                    <AccentText variant="h2" style={{ fontSize: 30 }}>
                      {customerName}
                    </AccentText>
                  ) : (
                    <>
                      <Signature size={26} color={theme.fg3} />
                      <Text variant="small" color={theme.fg3}>
                        {t('contract.tapToSign')}
                      </Text>
                    </>
                  )}
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* footer */}
      <SafeAreaView edges={['bottom']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <LinearGradient
          colors={['transparent', `${theme.bgCanvas}F5`]}
          style={{ paddingHorizontal: 18, paddingTop: 24, paddingBottom: 12 }}>
          {submitting ? (
            <ActivityIndicator color={theme.brand} />
          ) : (
            <Button icon={PenNib} iconWeight="fill" disabled={!signed} onPress={handleSign} full>
              {t('contract.signAndPay')}
            </Button>
          )}
        </LinearGradient>
      </SafeAreaView>
    </View>
  );
}

function CRow({
  label,
  value,
  row,
  fontFamily,
  last,
}: {
  label: string;
  value: string;
  row: { flexDirection: 'row' | 'row-reverse' };
  fontFamily: string;
  last?: boolean;
}) {
  const theme = useTheme();
  const textAlign = row.flexDirection === 'row-reverse' ? 'left' : ('right' as const);
  return (
    <View style={[row, { alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 7, borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.border }]}>
      <Text variant="small" color={theme.fg3}>
        {label}
      </Text>
      <Text style={{ fontFamily, fontSize: 13, color: theme.fg1, flexShrink: 1, textAlign }}>{value}</Text>
    </View>
  );
}
