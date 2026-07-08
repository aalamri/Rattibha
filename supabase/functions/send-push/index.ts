import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// VAPID config is optional at the module level: Web Push is a secondary
// delivery path layered on top of Expo, and its secrets are deployed on a
// separate schedule. If they're absent or malformed, Web Push sends are
// skipped at request time (see `vapidConfigured` below) — the module must
// still load and Expo delivery must keep working regardless.
let vapidConfigured = false;
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(
      Deno.env.get('VAPID_SUBJECT') ?? 'mailto:support@ratibha.com',
      vapidPublicKey,
      vapidPrivateKey,
    );
    vapidConfigured = true;
  } catch (_err) {
    vapidConfigured = false;
  }
}

interface PushPayload {
  event: 'new_offer' | 'new_message' | 'countersigned' | 'booking_confirmed';
  // IDs needed to look up the target user's push token/subscription
  offer_id?: string;
  message_id?: string;
  booking_id?: string;
}

Deno.serve(async (req: Request) => {
  try {
    const body: PushPayload = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { expo, web } = await buildMessages(supabase, body);

    if (expo.length === 0 && web.length === 0) {
      return new Response('no-op', { status: 200 });
    }

    const results: Record<string, unknown> = {};

    if (expo.length > 0) {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(expo),
      });
      results.expo = await res.json();
    }

    if (web.length > 0 && vapidConfigured) {
      results.web = await Promise.allSettled(
        web.map((target) => webpush.sendNotification(target.subscription, JSON.stringify(target.payload))),
      );
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(String(err), { status: 500 });
  }
});

// ─── Message builders ────────────────────────────────────────────────────────

type SupabaseClient = ReturnType<typeof createClient>;

interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
  badge?: number;
}

interface WebPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

interface WebPushTarget {
  subscription: WebPushSubscription;
  payload: { title: string; body: string };
}

interface BuildResult {
  expo: ExpoMessage[];
  web: WebPushTarget[];
}

const EMPTY: BuildResult = { expo: [], web: [] };

async function buildMessages(supabase: SupabaseClient, payload: PushPayload): Promise<BuildResult> {
  switch (payload.event) {
    case 'new_offer':
      return newOfferMessages(supabase, payload.offer_id!);
    case 'new_message':
      return newMessageMessages(supabase, payload.message_id!);
    case 'countersigned':
      return countersignedMessages(supabase, payload.offer_id!);
    case 'booking_confirmed':
      return bookingConfirmedMessages(supabase, payload.booking_id!);
    default:
      return EMPTY;
  }
}

// New offer → notify customer
async function newOfferMessages(supabase: SupabaseClient, offerId: string): Promise<BuildResult> {
  const { data } = await supabase
    .from('offers')
    .select('request_id, planner_id, price, planners(business_name), requests(customer_id, profiles(language, push_subscriptions(expo_push_token)))')
    .eq('id', offerId)
    .single();

  if (!data) return EMPTY;

  const row = data as unknown as {
    request_id: string;
    planner_id: string;
    price: number;
    planners: { business_name: string } | null;
    requests: {
      customer_id: string;
      profiles: { language: string; push_subscriptions: { expo_push_token: string | null } | null } | null;
    } | null;
  };

  const token = row.requests?.profiles?.push_subscriptions?.expo_push_token;
  if (!token) return EMPTY;

  const ar = row.requests?.profiles?.language === 'ar';
  const plannerName = row.planners?.business_name ?? '';
  const price = row.price.toLocaleString();

  return {
    expo: [{
      to: token,
      sound: 'default',
      title: ar ? 'عرض جديد 🎉' : 'New offer 🎉',
      body: ar
        ? `${plannerName} أرسل لك عرضاً بـ ${price} ر.س`
        : `${plannerName} sent you an offer for SAR ${price}`,
      data: {
        type: 'offer_received',
        payload: {
          request_id: row.request_id,
          offer_id: offerId,
          planner_id: row.planner_id,
          planner_name: plannerName,
          price: row.price,
        },
      },
    }],
    web: [],
  };
}

// New message → notify the recipient (not the sender). Sender is either the
// customer (recipient is the planner, delivered via Web Push) or the planner
// (recipient is the customer, delivered via Expo — the existing path).
async function newMessageMessages(supabase: SupabaseClient, messageId: string): Promise<BuildResult> {
  const { data } = await supabase
    .from('messages')
    .select('sender_id, planner_id, body, request_id, requests(customer_id)')
    .eq('id', messageId)
    .single();

  if (!data) return EMPTY;

  const row = data as unknown as {
    sender_id: string;
    planner_id: string;
    body: string;
    request_id: string;
    requests: { customer_id: string } | null;
  };

  const customerId = row.requests?.customer_id;
  if (!customerId) return EMPTY;
  const preview = row.body.slice(0, 80);

  if (row.sender_id === customerId) {
    // Customer sent the message → notify the planner via Web Push.
    const { data: plannerProfile } = await supabase
      .from('profiles')
      .select('language, push_subscriptions(web_push_subscription)')
      .eq('id', row.planner_id)
      .single();

    const subscription = plannerProfile?.push_subscriptions?.web_push_subscription as unknown as WebPushSubscription | null;
    if (!subscription) return EMPTY;

    const ar = plannerProfile?.language === 'ar';

    return {
      expo: [],
      web: [{
        subscription,
        payload: {
          title: ar ? 'رسالة جديدة 💬' : 'New message 💬',
          body: preview,
        },
      }],
    };
  }

  // Planner sent the message → notify the customer via Expo (existing path).
  const { data: profile } = await supabase
    .from('profiles')
    .select('language, push_subscriptions(expo_push_token)')
    .eq('id', customerId)
    .single();

  const token = profile?.push_subscriptions?.expo_push_token;
  if (!token) return EMPTY;

  const { data: plannerRow } = await supabase
    .from('planners')
    .select('business_name, profiles(avatar_seed)')
    .eq('user_id', row.planner_id)
    .single();

  const plannerRowTyped = plannerRow as unknown as {
    business_name: string;
    profiles: { avatar_seed: number } | null;
  } | null;

  const ar = profile?.language === 'ar';

  return {
    expo: [{
      to: token,
      sound: 'default',
      title: ar ? 'رسالة جديدة 💬' : 'New message 💬',
      body: preview,
      data: {
        type: 'message',
        payload: {
          request_id: row.request_id,
          message_id: messageId,
          planner_id: row.planner_id,
          planner_name: plannerRowTyped?.business_name ?? '',
          planner_seed: plannerRowTyped?.profiles?.avatar_seed ?? 0,
          preview,
        },
      },
    }],
    web: [],
  };
}

// Planner countersigned → notify customer they can pay
async function countersignedMessages(supabase: SupabaseClient, offerId: string): Promise<BuildResult> {
  const { data } = await supabase
    .from('offers')
    .select('request_id, planner_id, price, planners(business_name), requests(customer_id, profiles(language, push_subscriptions(expo_push_token)))')
    .eq('id', offerId)
    .single();

  if (!data) return EMPTY;

  const row = data as unknown as {
    request_id: string;
    planner_id: string;
    price: number;
    planners: { business_name: string } | null;
    requests: {
      customer_id: string;
      profiles: { language: string; push_subscriptions: { expo_push_token: string | null } | null } | null;
    } | null;
  };

  const token = row.requests?.profiles?.push_subscriptions?.expo_push_token;
  if (!token) return EMPTY;

  const ar = row.requests?.profiles?.language === 'ar';
  const plannerName = row.planners?.business_name ?? '';

  return {
    expo: [{
      to: token,
      sound: 'default',
      title: ar ? 'وقّع المنظّم ✍️' : 'Agreement signed ✍️',
      body: ar
        ? `${plannerName} وقّع على الاتفاقية. يمكنك الآن دفع العربون.`
        : `${plannerName} countersigned. You can now pay your deposit.`,
      data: {
        type: 'offer_accepted',
        payload: {
          request_id: row.request_id,
          offer_id: offerId,
          planner_id: row.planner_id,
          planner_name: plannerName,
        },
      },
    }],
    web: [],
  };
}

// Booking confirmed → notify customer
async function bookingConfirmedMessages(supabase: SupabaseClient, bookingId: string): Promise<BuildResult> {
  const { data } = await supabase
    .from('bookings')
    .select('event_date, contracts(offers(request_id, planner_id, planners(business_name), requests(customer_id, profiles(language, push_subscriptions(expo_push_token)))))')
    .eq('id', bookingId)
    .single();

  if (!data) return EMPTY;

  const row = data as unknown as {
    event_date: string;
    contracts: {
      offers: {
        request_id: string;
        planner_id: string;
        planners: { business_name: string } | null;
        requests: {
          customer_id: string;
          profiles: { language: string; push_subscriptions: { expo_push_token: string | null } | null } | null;
        } | null;
      } | null;
    } | null;
  };

  const offer = row.contracts?.offers;
  const token = offer?.requests?.profiles?.push_subscriptions?.expo_push_token;
  if (!token) return EMPTY;

  const ar = offer?.requests?.profiles?.language === 'ar';
  const plannerName = offer?.planners?.business_name ?? '';

  return {
    expo: [{
      to: token,
      sound: 'default',
      title: ar ? 'تم الحجز! 🎉' : 'Booking confirmed! 🎉',
      body: ar
        ? `حجزك مع ${plannerName} مؤكّد. تحقق من تفاصيل فعاليتك.`
        : `Your booking with ${plannerName} is confirmed. Check your event details.`,
      data: {
        type: 'booking_confirmed',
        payload: {
          booking_id: bookingId,
          request_id: offer?.request_id,
          planner_id: offer?.planner_id,
          planner_name: plannerName,
        },
      },
    }],
    web: [],
  };
}
