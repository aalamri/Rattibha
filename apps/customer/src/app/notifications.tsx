import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, CalendarCheck, ChatCircle, PaperPlaneTilt, SealCheck } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton, SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii } from '@/theme/tokens';

type NotifType = 'offer_received' | 'offer_accepted' | 'booking_confirmed' | 'message' | string;

interface Notif {
  id: string;
  type: NotifType;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<string, React.ComponentType<{ size: number; color: string; weight?: string }>> = {
  offer_received: PaperPlaneTilt,
  offer_accepted: SealCheck,
  booking_confirmed: CalendarCheck,
  message: ChatCircle,
};

function timeAgo(iso: string, isRTL: boolean, t: (k: string, opts?: object) => string) {
  const hours = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (hours < 24) return t('common.hoursAgo', { count: Math.max(1, Math.round(hours)) });
  return t('common.daysAgo', { count: Math.round(hours / 24) });
}

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const theme = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const fontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;

  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('notifications')
      .select('id, type, payload, read, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setNotifs((data as unknown as Notif[]) ?? []); setLoading(false); });
  }, [session]);

  const markAllRead = async () => {
    if (!session) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', session.user.id)
      .eq('read', false);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
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
            <ArrowLeft size={18} color={theme.fg1} style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined} />
          </Pressable>
          <Text variant="h3" style={{ flex: 1 }}>
            {t('notifications.title')}
          </Text>
          {notifs.some((n) => !n.read) && (
            <Pressable onPress={markAllRead}>
              <Text style={{ fontFamily, fontSize: 12.5, color: theme.brand }}>{t('notifications.markRead')}</Text>
            </Pressable>
          )}
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          {loading ? (
            <View style={{ paddingHorizontal: 18, gap: 10 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i}>
                  <SkeletonRow>
                    <Skeleton width={38} height={38} radius={radii.pill} style={{ flexShrink: 0 }} />
                    <View style={{ flex: 1, gap: 8 }}>
                      <Skeleton height={13} width="75%" />
                      <Skeleton height={11} width="45%" />
                    </View>
                  </SkeletonRow>
                </SkeletonCard>
              ))}
            </View>
          ) : notifs.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 60, gap: 10 }}>
              <Bell size={36} color={theme.fg3} />
              <Text variant="h4" color={theme.fg2}>
                {t('notifications.empty')}
              </Text>
              <Text variant="small" color={theme.fg3} style={{ textAlign: 'center', maxWidth: 240 }}>
                {t('notifications.emptyNote')}
              </Text>
            </View>
          ) : (
            <View style={{ paddingHorizontal: 18, gap: 10 }}>
              {notifs.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? Bell;
                return (
                  <View
                    key={n.id}
                    style={[
                      row,
                      {
                        alignItems: 'flex-start',
                        gap: 12,
                        backgroundColor: n.read ? theme.bgSurface : theme.bgBlush,
                        borderWidth: 1,
                        borderColor: n.read ? theme.border : theme.brand + '33',
                        borderRadius: radii.lg,
                        padding: 14,
                      },
                    ]}>
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: radii.sm,
                        backgroundColor: n.read ? theme.bgCanvas : theme.bgBlush,
                        borderWidth: 1,
                        borderColor: theme.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                      <Icon size={18} color={theme.brand} weight="fill" />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{ fontFamily, fontSize: 13.5, color: theme.fg1, lineHeight: 20 }}>
                        {String(n.payload?.title ?? t(`common.${n.type}`, { defaultValue: n.type }))}
                      </Text>
                      {n.payload?.body ? (
                        <Text variant="small" color={theme.fg2} style={{ marginTop: 2, lineHeight: 18 }}>
                          {String(n.payload.body)}
                        </Text>
                      ) : null}
                      <Text variant="caption" color={theme.fg3} style={{ marginTop: 5 }}>
                        {timeAgo(n.created_at, isRTL, t)}
                      </Text>
                    </View>
                    {!n.read && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: radii.pill,
                          backgroundColor: theme.brand,
                          marginTop: 4,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
