import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, ChatCircle, CheckCircle, FileText, Info, SealCheck } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useIsRTL } from '@/i18n/useIsRTL';
import { type DBOfferRow, PLANNER_SELECT } from '@/lib/db';
import { formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii } from '@/theme/tokens';

export default function OfferScreen() {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const displayFamily = isRTL ? fonts.arDisplay.semibold : fonts.display.semibold;

  const [offer, setOffer] = useState<DBOfferRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('offers')
      .select(`id, request_id, planner_id, package, price, message, status, deal_status, created_at, planners(${PLANNER_SELECT})`)
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setOffer(data as unknown as DBOfferRow);
        setLoading(false);
      });
  }, [id]);

  if (loading) return null;
  if (!offer) return <PlaceholderScreen icon={FileText} title={t('placeholders.offer')} />;

  const planner = offer.planners;
  const seed = planner?.profiles?.avatar_seed ?? 0;
  const plannerName = planner?.business_name ?? '—';
  const pkgName = offer.package;
  const price = offer.price;
  const deposit = Math.round(price * 0.2);
  const balance = price - deposit;

  const items = [
    t('offer.items.planning'),
    t('offer.items.styling'),
    t('offer.items.florals'),
  ];

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
                {t('offer.title')}
              </Text>
              <Text variant="small" color={theme.fg2} style={{ marginTop: 1 }}>
                {plannerName}
              </Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 18, gap: 16 }}>
            {/* planner message */}
            <View style={[row, { gap: 11, alignItems: 'flex-start' }]}>
              <Avatar seed={seed} size={40} initials={plannerName[0]} />
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.bgSurface,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: radii.lg,
                  [isRTL ? 'borderTopRightRadius' : 'borderTopLeftRadius']: 4,
                  padding: 13,
                }}>
                <Text variant="small" color={theme.fg1} style={{ lineHeight: 19.5 }}>
                  {offer.message ?? t('offer.noMessage')}
                </Text>
                <Text variant="caption" color={theme.fg3} style={{ marginTop: 6 }}>
                  {plannerName} · {t('offer.justNow')}
                </Text>
              </View>
            </View>

            {/* offer card */}
            <View style={{ backgroundColor: theme.bgSurface, borderWidth: 1.5, borderColor: theme.brand, borderRadius: radii.lg, overflow: 'hidden', shadowColor: colors.purple800, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 }}>
              <LinearGradient
                colors={[colors.purple500, colors.purple800]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[row, { alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, overflow: 'hidden' }]}>
                <Image
                  source={require('@/assets/images/brand/glyph-ra-light.png')}
                  contentFit="contain"
                  style={{ position: 'absolute', [isRTL ? 'left' : 'right']: -14, bottom: -18, width: 92, height: 92, opacity: 0.18 }}
                />
                <View>
                  <Text style={{ fontFamily: isRTL ? fonts.arSans.medium : fonts.sans.medium, fontSize: 11.5, color: 'rgba(255,255,255,0.8)' }}>
                    {t('offer.customOffer')}
                  </Text>
                  <Text style={{ fontFamily: displayFamily, fontSize: 21, color: '#fff' }}>{pkgName}</Text>
                </View>
                <Badge bg={colors.gold200} fg="#7A5A14" icon={SealCheck}>
                  {t('offer.validDays')}
                </Badge>
              </LinearGradient>

              <View style={{ padding: 16 }}>
                {items.map((item) => (
                  <View key={item} style={[row, { alignItems: 'center', gap: 9, paddingVertical: 6 }]}>
                    <CheckCircle size={18} color={theme.success} weight="fill" />
                    <Text variant="small" color={theme.fg1}>
                      {item}
                    </Text>
                  </View>
                ))}

                <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 12 }} />

                <PriceLine label={t('offer.totalPrice')} value={`${t('common.sar')} ${formatNumber(price, isRTL)}`} row={row} isRTL={isRTL} strong />
                <PriceLine label={t('offer.depositLabel')} value={`${t('common.sar')} ${formatNumber(deposit, isRTL)}`} row={row} isRTL={isRTL} />
                <PriceLine label={t('offer.balanceLabel')} value={`${t('common.sar')} ${formatNumber(balance, isRTL)}`} row={row} isRTL={isRTL} muted />
              </View>
            </View>

            {/* info note */}
            <View style={[row, { alignItems: 'flex-start', gap: 8 }]}>
              <Info size={16} color={theme.fg3} />
              <Text variant="small" color={theme.fg3} style={{ flex: 1, lineHeight: 18 }}>
                {t('offer.note')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* footer — fade-up gradient matching prototype */}
      <SafeAreaView edges={['bottom']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <LinearGradient
          colors={['transparent', `${theme.bgCanvas}F5`]}
          style={[row, { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 12, gap: 12 }]}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" full icon={ChatCircle} onPress={() => router.push('/(tabs)/messages')}>
              {t('offer.negotiate')}
            </Button>
          </View>
          <View style={{ flex: 1.5 }}>
            <Button full icon={Check} onPress={() => router.push({ pathname: '/contract', params: { offerId: id } })}>
              {t('offer.acceptOffer')}
            </Button>
          </View>
        </LinearGradient>
      </SafeAreaView>
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
