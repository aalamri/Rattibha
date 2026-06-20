import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushPayload {
  event: 'new_offer' | 'new_message' | 'countersigned' | 'booking_confirmed';
  // IDs needed to look up the target user's push token
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

    const messages = await buildMessages(supabase, body);
    if (messages.length === 0) return new Response('no-op', { status: 200 });

    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), {
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

async function buildMessages(
  supabase: SupabaseClient,
  payload: PushPayload,
): Promise<ExpoMessage[]> {
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
      return [];
  }
}

// New offer → notify customer
async function newOfferMessages(supabase: SupabaseClient, offerId: string): Promise<ExpoMessage[]> {
  const { data } = await supabase
    .from('offers')
    .select('price, planners(business_name), requests(customer_id, profiles(expo_push_token, language))')
    .eq('id', offerId)
    .single();

  if (!data) return [];

  const row = data as unknown as {
    price: number;
    planners: { business_name: string } | null;
    requests: {
      customer_id: string;
      profiles: { expo_push_token: string | null; language: string } | null;
    } | null;
  };

  const token = row.requests?.profiles?.expo_push_token;
  if (!token) return [];

  const ar = row.requests?.profiles?.language === 'ar';
  const plannerName = row.planners?.business_name ?? '';
  const price = row.price.toLocaleString();

  return [{
    to: token,
    sound: 'default',
    title: ar ? 'عرض جديد 🎉' : 'New offer 🎉',
    body: ar
      ? `${plannerName} أرسل لك عرضاً بـ ${price} ر.س`
      : `${plannerName} sent you an offer for SAR ${price}`,
    data: { screen: 'offers', offerId },
  }];
}

// New message → notify the recipient (not the sender)
async function newMessageMessages(supabase: SupabaseClient, messageId: string): Promise<ExpoMessage[]> {
  const { data } = await supabase
    .from('messages')
    .select('sender_id, body, request_id, requests(customer_id)')
    .eq('id', messageId)
    .single();

  if (!data) return [];

  const row = data as unknown as {
    sender_id: string;
    body: string;
    request_id: string;
    requests: { customer_id: string } | null;
  };

  // Determine recipient: if sender is the customer, recipient is the planner,
  // and vice versa. For now, only the customer side has push tokens.
  const customerId = row.requests?.customer_id;
  if (!customerId || row.sender_id === customerId) {
    // Message was sent by customer — would notify planner (no push token yet on planner side)
    return [];
  }

  // Message sent by planner → notify customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('expo_push_token, language, full_name')
    .eq('id', customerId)
    .single();

  const token = profile?.expo_push_token;
  if (!token) return [];

  const ar = profile?.language === 'ar';
  const preview = row.body.slice(0, 80);

  return [{
    to: token,
    sound: 'default',
    title: ar ? 'رسالة جديدة 💬' : 'New message 💬',
    body: preview,
    data: { screen: 'messages', requestId: row.request_id },
  }];
}

// Planner countersigned → notify customer they can pay
async function countersignedMessages(supabase: SupabaseClient, offerId: string): Promise<ExpoMessage[]> {
  const { data } = await supabase
    .from('offers')
    .select('price, planners(business_name), requests(customer_id, profiles(expo_push_token, language))')
    .eq('id', offerId)
    .single();

  if (!data) return [];

  const row = data as unknown as {
    price: number;
    planners: { business_name: string } | null;
    requests: {
      customer_id: string;
      profiles: { expo_push_token: string | null; language: string } | null;
    } | null;
  };

  const token = row.requests?.profiles?.expo_push_token;
  if (!token) return [];

  const ar = row.requests?.profiles?.language === 'ar';
  const plannerName = row.planners?.business_name ?? '';

  return [{
    to: token,
    sound: 'default',
    title: ar ? 'وقّع المنظّم ✍️' : 'Agreement signed ✍️',
    body: ar
      ? `${plannerName} وقّع على الاتفاقية. يمكنك الآن دفع العربون.`
      : `${plannerName} countersigned. You can now pay your deposit.`,
    data: { screen: 'checkout', offerId },
  }];
}

// Booking confirmed → notify customer
async function bookingConfirmedMessages(supabase: SupabaseClient, bookingId: string): Promise<ExpoMessage[]> {
  const { data } = await supabase
    .from('bookings')
    .select('event_date, contracts(offers(planners(business_name), requests(customer_id, profiles(expo_push_token, language))))')
    .eq('id', bookingId)
    .single();

  if (!data) return [];

  const row = data as unknown as {
    event_date: string;
    contracts: {
      offers: {
        planners: { business_name: string } | null;
        requests: {
          customer_id: string;
          profiles: { expo_push_token: string | null; language: string } | null;
        } | null;
      } | null;
    } | null;
  };

  const token = row.contracts?.offers?.requests?.profiles?.expo_push_token;
  if (!token) return [];

  const ar = row.contracts?.offers?.requests?.profiles?.language === 'ar';
  const plannerName = row.contracts?.offers?.planners?.business_name ?? '';

  return [{
    to: token,
    sound: 'default',
    title: ar ? 'تم الحجز! 🎉' : 'Booking confirmed! 🎉',
    body: ar
      ? `حجزك مع ${plannerName} مؤكّد. تحقق من تفاصيل فعاليتك.`
      : `Your booking with ${plannerName} is confirmed. Check your event details.`,
    data: { screen: 'bookings', bookingId },
  }];
}
