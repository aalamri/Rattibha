'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarPlus, PaperPlaneRight, Paperclip } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/lib/AuthContext';
import { formatDate } from '@/lib/format';
import { supabase } from '@/lib/supabase';

interface Conversation {
  requestId: string;
  offerId: string;
  who: string;
  initials: string;
  seed: number;
}

interface ThreadMessage {
  id: string;
  requestId: string;
  senderId: string;
  body: string;
  createdAt: Date;
}

export default function MessagesPage() {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    supabase
      .from('offers')
      .select('id, request_id, requests(id, profiles(full_name, avatar_seed))')
      .eq('planner_id', session.user.id)
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as Array<{
          id: string;
          request_id: string;
          requests: { id: string; profiles: { full_name: string; avatar_seed: number } | null } | null;
        }>;

        const byRequest = new Map<string, Conversation>();
        rows.forEach((r) => {
          if (byRequest.has(r.request_id)) return;
          byRequest.set(r.request_id, {
            requestId: r.request_id,
            offerId: r.id,
            who: r.requests?.profiles?.full_name ?? '—',
            initials: (r.requests?.profiles?.full_name ?? '?').charAt(0),
            seed: r.requests?.profiles?.avatar_seed ?? 0,
          });
        });

        const convos = Array.from(byRequest.values());
        setConversations(convos);
        setActiveRequestId((current) => current ?? convos[0]?.requestId ?? null);

        if (convos.length === 0) {
          setLoading(false);
          return;
        }

        supabase
          .from('messages')
          .select('id, request_id, sender_id, body, created_at')
          .in('request_id', convos.map((c) => c.requestId))
          .order('created_at', { ascending: true })
          .then(({ data: msgData }) => {
            const msgRows = (msgData ?? []) as unknown as Array<{
              id: string;
              request_id: string;
              sender_id: string;
              body: string;
              created_at: string;
            }>;
            setMessages(
              msgRows.map((m) => ({
                id: m.id,
                requestId: m.request_id,
                senderId: m.sender_id,
                body: m.body,
                createdAt: new Date(m.created_at),
              }))
            );
            setLoading(false);
          });
      });
  }, [session]);

  useEffect(() => {
    if (!activeRequestId) return;

    const channel = supabase
      .channel(`messages-${activeRequestId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `request_id=eq.${activeRequestId}` },
        (payload) => {
          const m = payload.new as { id: string; request_id: string; sender_id: string; body: string; created_at: string };
          setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, {
            id: m.id,
            requestId: m.request_id,
            senderId: m.sender_id,
            body: m.body,
            createdAt: new Date(m.created_at),
          }]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRequestId]);

  const lastMessageByRequest = useMemo(() => {
    const map = new Map<string, ThreadMessage>();
    messages.forEach((m) => {
      const existing = map.get(m.requestId);
      if (!existing || m.createdAt > existing.createdAt) map.set(m.requestId, m);
    });
    return map;
  }, [messages]);

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort((a, b) => {
        const aTime = lastMessageByRequest.get(a.requestId)?.createdAt.getTime() ?? 0;
        const bTime = lastMessageByRequest.get(b.requestId)?.createdAt.getTime() ?? 0;
        return bTime - aTime;
      }),
    [conversations, lastMessageByRequest]
  );

  const activeConversation = conversations.find((c) => c.requestId === activeRequestId) ?? null;
  const thread = activeRequestId ? messages.filter((m) => m.requestId === activeRequestId) : [];

  async function handleSend() {
    if (!draft.trim() || !activeRequestId || !session) return;
    const body = draft.trim();
    setDraft('');

    const { data, error } = await supabase
      .from('messages')
      .insert({ request_id: activeRequestId, sender_id: session.user.id, body })
      .select('id, request_id, sender_id, body, created_at')
      .single();

    if (!error && data) {
      setMessages((prev) => [
        ...prev,
        { id: data.id, requestId: data.request_id, senderId: data.sender_id, body: data.body, createdAt: new Date(data.created_at) },
      ]);
    }
  }

  return (
    <DashboardShell title={t('messages.title')}>
      <div className="h-full p-7">
        <Card pad={0} className="flex h-full overflow-hidden">
          <div className="flex w-[290px] flex-shrink-0 flex-col border-e border-border">
            <div className="border-b border-border px-4.5 py-4">
              <div className="text-[15px] font-semibold text-fg1">{t('messages.title')}</div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col gap-3 p-4.5">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : sortedConversations.length === 0 ? (
                <div className="p-4.5">
                  <EmptyState icon={PaperPlaneRight} title={t('messages.emptyTitle')} subtitle={t('messages.emptySub')} />
                </div>
              ) : (
                sortedConversations.map((c) => {
                  const on = c.requestId === activeRequestId;
                  const last = lastMessageByRequest.get(c.requestId);
                  return (
                    <button
                      key={c.requestId}
                      type="button"
                      onClick={() => setActiveRequestId(c.requestId)}
                      className="block w-full text-start"
                    >
                      <div
                        className={`flex items-center gap-2.5 border-s-[3px] px-4.5 py-3 ${
                          on ? 'border-s-brand bg-purple-50' : 'border-s-transparent'
                        }`}
                      >
                        <Avatar seed={c.seed} size={42} initials={c.initials} />
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between gap-2">
                            <span className="truncate text-[13.5px] font-semibold text-fg1">{c.who}</span>
                            {last && (
                              <span className="flex-shrink-0 text-[11px] text-fg3">
                                {formatDate(last.createdAt, i18n.language, { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 truncate text-xs text-fg3" dir="auto">
                            {last?.body ?? ''}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            {!activeConversation ? (
              <div className="grid flex-1 place-items-center text-[13.5px] text-fg3">{t('messages.emptyThread')}</div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 border-b border-border px-5 py-3">
                  <Avatar seed={activeConversation.seed} size={40} initials={activeConversation.initials} />
                  <div className="flex-1 text-[14.5px] font-semibold text-fg1">{activeConversation.who}</div>
                  <Link href={`/offers/${activeConversation.offerId}`}>
                    <Button variant="secondary" size="sm" icon={CalendarPlus}>
                      {t('messages.createBooking')}
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto bg-bg-app p-5.5" style={{ direction: 'ltr' }}>
                  {thread.map((m) => {
                    const mine = m.senderId === session?.user.id;
                    return (
                      <div
                        key={m.id}
                        dir="auto"
                        className={`max-w-[70%] rounded-[16px] px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                          mine ? 'self-end rounded-br-[5px] bg-brand text-white' : 'self-start rounded-bl-[5px] border border-border bg-bg-surface text-fg1'
                        }`}
                      >
                        {m.body}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2.5 border-t border-border px-5 py-3.5">
                  <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-bg-app px-4 py-2.5">
                    <input
                      type="text"
                      dir="auto"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend();
                      }}
                      placeholder={t('messages.writeReply')}
                      className="flex-1 bg-transparent text-[13.5px] text-fg1 outline-none placeholder:text-fg3"
                    />
                    <Paperclip size={17} className="text-fg3" />
                  </div>
                  <button
                    type="button"
                    onClick={handleSend}
                    className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-brand text-white"
                  >
                    <PaperPlaneRight size={19} weight="fill" />
                  </button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
