import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, PaperPlaneRight, Paperclip } from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';

import { markConversationRead } from '@/app/(tabs)/messages';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Photo } from '@/components/ui/Photo';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii, shadows } from '@/theme/tokens';

interface MessageRow {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export default function ChatScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const router = useRouter();
  const { session } = useAuth();
  const { show: showToast } = useToast();
  const { requestId, plannerName, plannerSeed } = useLocalSearchParams<{
    requestId: string;
    plannerName: string;
    plannerSeed: string;
  }>();

  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const fontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;
  const regularFont = isRTL ? fonts.arSans.regular : fonts.sans.regular;
  const seed = parseInt(plannerSeed ?? '0', 10);

  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!requestId) return;
    markConversationRead(requestId);
    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`chat:${requestId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `request_id=eq.${requestId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as MessageRow]);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        markConversationRead(requestId);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [requestId]);

  async function loadMessages() {
    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, body, created_at')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data as MessageRow[]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }

  async function sendMessage() {
    const body = draft.trim();
    if (!body || !session?.user.id || !requestId) return;
    setSending(true);
    setDraft('');
    const { error } = await supabase.from('messages').insert({
      request_id: requestId,
      sender_id: session.user.id,
      body,
    });
    setSending(false);
    if (error) {
      setDraft(body);
      showToast(t('toast.error'));
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bgCanvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* header */}
        <View style={[row, { alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12,
          borderBottomWidth: 1, borderBottomColor: theme.border }]}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            style={{ width: 38, height: 38, borderRadius: radii.pill, borderWidth: 1.5,
              borderColor: theme.border, backgroundColor: theme.bgSurface, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={18} color={theme.fg1} style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined} />
          </Pressable>
          <Photo seed={seed} style={{ width: 40, height: 40, borderRadius: radii.pill, flexShrink: 0 }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily, fontSize: 15, color: theme.fg1 }}>{plannerName ?? '—'}</Text>
            <Text style={{ fontFamily: regularFont, fontSize: 12, color: theme.success }}>● {t('messages.online')}</Text>
          </View>
        </View>

        {/* message list */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 18, gap: 9, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const isMe = item.sender_id === session?.user.id;
            return (
              <View style={{ alignSelf: isMe ? (isRTL ? 'flex-start' : 'flex-end') : (isRTL ? 'flex-end' : 'flex-start'), maxWidth: '78%' }}>
                <View style={[
                  shadows.xs,
                  {
                    backgroundColor: isMe ? theme.brand : theme.bgSurface,
                    borderWidth: isMe ? 0 : 1,
                    borderColor: theme.border,
                    borderRadius: isMe
                      ? (isRTL ? 18 : 18)
                      : 18,
                    borderBottomRightRadius: isMe && !isRTL ? 5 : 18,
                    borderBottomLeftRadius: isMe && isRTL ? 5 : (!isMe && !isRTL ? 5 : 18),
                    padding: 10,
                    paddingHorizontal: 14,
                  },
                ]}>
                  <Text style={{ fontFamily: regularFont, fontSize: 14, color: isMe ? theme.fgOnBrand : theme.fg1, lineHeight: 20 }}>
                    {item.body}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text variant="small" color={theme.fg3}>{t('messages.emptySub')}</Text>
            </View>
          }
        />

        {/* input bar */}
        <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.bgCanvas }}>
          <View style={[row, { gap: 10, alignItems: 'center', paddingHorizontal: 18, paddingVertical: 10 }]}>
            <View style={[row, { flex: 1, alignItems: 'center', gap: 8, backgroundColor: theme.bgSurface,
              borderWidth: 1.5, borderColor: theme.borderStrong, borderRadius: radii.pill,
              paddingVertical: 11, paddingHorizontal: 16 }]}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={t('messages.placeholder')}
                placeholderTextColor={theme.fg3}
                style={{ flex: 1, fontFamily: regularFont, fontSize: 14, color: theme.fg1,
                  textAlign: isRTL ? 'right' : 'left' }}
                multiline
                returnKeyType="send"
                onSubmitEditing={sendMessage}
              />
              <Paperclip size={18} color={theme.fg3} />
            </View>
            <View style={{ width: 46, height: 46, borderRadius: radii.pill, backgroundColor: theme.brand,
              ...shadows.brand, overflow: 'hidden' }}>
              <Pressable
                onPress={sendMessage}
                disabled={!draft.trim() || sending}
                style={{ width: 46, height: 46, alignItems: 'center', justifyContent: 'center' }}>
                <PaperPlaneRight size={20} color={theme.fgOnBrand} weight="fill" />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
