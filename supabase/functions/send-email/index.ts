import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_ADDRESS = 'Ratibha <no-reply@ratibha.com>';
const LOGIN_URL = 'https://app.ratibha.com/login';

interface EmailPayload {
  event: 'planner_approved';
  planner_id?: string;
}

Deno.serve(async (req: Request) => {
  try {
    const body: EmailPayload = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const message = await buildMessage(supabase, body);
    if (!message) return new Response('no-op', { status: 200 });

    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      },
      body: JSON.stringify(message),
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(String(err), { status: 500 });
  }
});

// ─── Message builders ────────────────────────────────────────────────────────

type SupabaseClient = ReturnType<typeof createClient>;

interface ResendMessage {
  from: string;
  to: string;
  subject: string;
  html: string;
}

async function buildMessage(supabase: SupabaseClient, payload: EmailPayload): Promise<ResendMessage | null> {
  switch (payload.event) {
    case 'planner_approved':
      return plannerApprovedMessage(supabase, payload.planner_id!);
    default:
      return null;
  }
}

// Planner approved -> email them with a link to sign in.
async function plannerApprovedMessage(supabase: SupabaseClient, plannerId: string): Promise<ResendMessage | null> {
  const { data } = await supabase
    .from('planners')
    .select('business_name, profiles(language)')
    .eq('user_id', plannerId)
    .single();

  if (!data) return null;

  const row = data as unknown as { business_name: string; profiles: { language: string } | null };

  const { data: userRes } = await supabase.auth.admin.getUserById(plannerId);
  const email = userRes?.user?.email;
  if (!email) return null;

  const ar = row.profiles?.language === 'ar';
  const businessName = row.business_name;

  return {
    from: FROM_ADDRESS,
    to: email,
    subject: ar ? 'تمت الموافقة على ملفك في رتّبها! 🎉' : 'Your Ratibha planner profile is approved! 🎉',
    html: ar
      ? `<h2>تهانينا، ${businessName}!</h2><p>راجع فريقنا ملفك التعريفي وتمت الموافقة عليه. أنت الآن جاهز لاستقبال طلبات العملاء.</p><p><a href="${LOGIN_URL}">تسجيل الدخول إلى لوحة التحكم</a></p>`
      : `<h2>Congratulations, ${businessName}!</h2><p>Our team reviewed your profile and it's been approved. You're now ready to receive client requests.</p><p><a href="${LOGIN_URL}">Sign in to your dashboard</a></p>`,
  };
}
