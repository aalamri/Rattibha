import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { ChatCircle } from 'phosphor-react-native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Photo } from '@/components/ui/Photo';
import { Text } from '@/components/ui/Text';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useAuth } from '@/lib/AuthContext';
import { PLANNER_SELECT } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii, shadows } from '@/theme/tokens';

interface ConversationRow {
  request_id: string;
  planner_id: string;
  body: string;
  created_at: string;
  sender_id: string;
  plannerName: string;
  plannerSeed: number;
  unread: number;
}

// A conversation is scoped to a specific (request, planner) pair — a
// request can have offers from multiple planners, each with their own
// separate thread with the customer.
function threadKey(requestId: string, plannerId: string) {
  return `${requestId}:${plannerId}`;
}

function lastReadKey(requestId: string, plannerId: string) {
  return `rtb_last_read:${threadKey(requestId, plannerId)}`;
}

export async function markConversationRead(requestId: string, plannerId: string) {
  await AsyncStorage.setItem(lastReadKey(requestId, plannerId), new Date().toISOString());
}

export default function MessagesScreen() {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const theme = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const fontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;

  const [convos, setConvos] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownRequestIds, setOwnRequestIds] = useState<string[]>([]);

  const loadConversations = useCallback(async () => {
    if (!session?.user.id) return;
    setLoading(true);

    const { data: requests } = await supabase
      .from('requests')
      .select('id')
      .eq('customer_id', session.user.id);

    setOwnRequestIds(requests?.map((r) => r.id) ?? []);

    if (!requests || requests.length === 0) {
      setLoading(false);
      setConvos([]);
      return;
    }

    const requestIds = requests.map((r) => r.id);

    const { data: msgs } = await supabase
      .from('messages')
      .select('id, request_id, planner_id, sender_id, body, created_at')
      .in('request_id', requestIds)
      .order('created_at', { ascending: false });

    if (!msgs || msgs.length === 0) {
      setLoading(false);
      setConvos([]);
      return;
    }

    // Latest message per (request, planner) thread
    const seen = new Set<string>();
    const latestByThread: typeof msgs = [];
    for (const m of msgs) {
      const key = threadKey(m.request_id, m.planner_id);
      if (!seen.has(key)) {
        seen.add(key);
        latestByThread.push(m);
      }
    }

    const { data: offersData } = await supabase
      .from('offers')
      .select(`request_id, planner_id, planners(${PLANNER_SELECT})`)
      .in('request_id', requestIds);

    const offers = (offersData as unknown as {
      request_id: string;
      planner_id: string;
      planners: { business_name: string; profiles: { avatar_seed: number } | null } | null;
    }[]) ?? [];

    const offersByThread: Record<string, { plannerName: string; plannerSeed: number }> = {};
    for (const o of offers) {
      if (o.planners) {
        offersByThread[threadKey(o.request_id, o.planner_id)] = {
          plannerName: o.planners.business_name,
          plannerSeed: o.planners.profiles?.avatar_seed ?? 0,
        };
      }
    }

    // Load last-read timestamps from AsyncStorage for unread counts
    const lastReadMap: Record<string, Date> = {};
    await Promise.all(
      latestByThread.map(async (m) => {
        const key = threadKey(m.request_id, m.planner_id);
        const val = await AsyncStorage.getItem(lastReadKey(m.request_id, m.planner_id));
        if (val) lastReadMap[key] = new Date(val);
      })
    );

    const result: ConversationRow[] = latestByThread
      .filter((m) => offersByThread[threadKey(m.request_id, m.planner_id)])
      .map((m) => {
        const key = threadKey(m.request_id, m.planner_id);
        const lastRead = lastReadMap[key];
        const unread = msgs.filter(
          (msg) =>
            msg.request_id === m.request_id &&
            msg.planner_id === m.planner_id &&
            msg.sender_id !== session.user.id &&
            (!lastRead || new Date(msg.created_at) > lastRead)
        ).length;
        return {
          request_id: m.request_id,
          planner_id: m.planner_id,
          body: m.body,
          created_at: m.created_at,
          sender_id: m.sender_id,
          plannerName: offersByThread[key].plannerName,
          plannerSeed: offersByThread[key].plannerSeed,
          unread,
        };
      });

    setConvos(result);
    setLoading(false);
  }, [session?.user.id]);

  const ownRequestIdsKey = ownRequestIds.slice().sort().join(',');

  // Subscribe to any new messages across all the user's conversations
  useEffect(() => {
    if (!session?.user.id || !ownRequestIdsKey) return;

    const ids = ownRequestIdsKey.split(',').slice(0, 100);

    const channel = supabase
      .channel(`messages_list:${session.user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `request_id=in.(${ids.join(',')})` },
        () => { loadConversations(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session?.user.id, ownRequestIdsKey, loadConversations]);

  // Refresh on tab focus (picks up reads from other sessions)
  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* header */}
        <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12 }}>
          <Text variant="h2">{t('messages.title')}</Text>
        </View>

        {loading ? null : convos.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <View style={{ width: 64, height: 64, borderRadius: radii.pill, backgroundColor: theme.bgBlush, alignItems: 'center', justifyContent: 'center' }}>
              <ChatCircle size={28} color={theme.brand} weight="fill" />
            </View>
            <Text variant="h4" color={theme.fg2}>{t('messages.empty')}</Text>
            <Text variant="small" color={theme.fg3}>{t('messages.emptySub')}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
            <View style={[shadows.sm, { marginHorizontal: 18, backgroundColor: theme.bgSurface, borderWidth: 1, borderColor: theme.border, borderRadius: radii.lg }]}>
              {convos.map((c, i) => {
                const isMe = c.sender_id === session?.user.id;
                const preview = (isMe ? t('messages.you') : '') + c.body;
                const timeAgo = Math.round((Date.now() - new Date(c.created_at).getTime()) / 60000);
                const timeLabel =
                  timeAgo < 60
                    ? `${timeAgo}m`
                    : timeAgo < 1440
                    ? `${Math.round(timeAgo / 60)}h`
                    : `${Math.round(timeAgo / 1440)}d`;

                return (
                  <Pressable
                    key={threadKey(c.request_id, c.planner_id)}
                    onPress={() => {
                      markConversationRead(c.request_id, c.planner_id);
                      router.push({
                        pathname: '/chat/[requestId]',
                        params: {
                          requestId: c.request_id,
                          plannerId: c.planner_id,
                          plannerName: c.plannerName,
                          plannerSeed: String(c.plannerSeed),
                        },
                      });
                    }}>
                    <View
                      style={[
                        row,
                        {
                          alignItems: 'center',
                          gap: 13,
                          paddingHorizontal: 16,
                          paddingVertical: 13,
                          borderBottomWidth: i < convos.length - 1 ? 1 : 0,
                          borderBottomColor: theme.border,
                        },
                      ]}>
                      {/* Avatar with online dot */}
                      <View style={{ position: 'relative', flexShrink: 0 }}>
                        <Photo seed={c.plannerSeed} style={{ width: 50, height: 50, borderRadius: radii.pill }} />
                        <View
                          style={{
                            position: 'absolute',
                            bottom: 1,
                            right: isRTL ? undefined : 1,
                            left: isRTL ? 1 : undefined,
                            width: 13,
                            height: 13,
                            borderRadius: radii.pill,
                            backgroundColor: theme.success,
                            borderWidth: 2.5,
                            borderColor: theme.bgSurface,
                          }}
                        />
                      </View>

                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={[row, { justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }]}>
                          <Text style={{ fontFamily, fontSize: 15, color: theme.fg1 }}>{c.plannerName}</Text>
                          <Text style={{ fontFamily: isRTL ? fonts.arSans.regular : fonts.sans.regular, fontSize: 11.5, color: theme.fg3, flexShrink: 0 }}>
                            {timeLabel}
                          </Text>
                        </View>
                        <View style={[row, { justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 2 }]}>
                          <Text
                            style={{
                              fontFamily: c.unread > 0 ? fontFamily : (isRTL ? fonts.arSans.regular : fonts.sans.regular),
                              fontSize: 13,
                              color: c.unread > 0 ? theme.fg1 : theme.fg2,
                              flex: 1,
                            }}
                            numberOfLines={1}>
                            {preview}
                          </Text>
                          {c.unread > 0 && (
                            <View
                              style={{
                                backgroundColor: theme.brand,
                                borderRadius: radii.pill,
                                minWidth: 19,
                                height: 19,
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingHorizontal: 5,
                                flexShrink: 0,
                              }}>
                              <Text style={{ fontFamily, fontSize: 11, color: theme.fgOnBrand }}>{c.unread}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
