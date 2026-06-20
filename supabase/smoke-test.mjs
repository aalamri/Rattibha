#!/usr/bin/env node
/**
 * End-to-end smoke test for the full deal lifecycle:
 *   request -> offer_sent -> accepted -> countersigned -> deposit_paid -> completed -> reviewed
 *
 * Exercises the same REST calls the customer + planner apps make (PostgREST + GoTrue),
 * against a running local Supabase stack, so it catches RLS/trigger regressions that
 * unit tests on isolated functions would miss.
 *
 * Usage:
 *   supabase start
 *   node supabase/smoke-test.mjs
 *
 * Exits non-zero on first failed assertion.
 */

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
// Used only for teardown — none of the relevant tables have DELETE RLS
// policies (by design: customers/planners never hard-delete deal history),
// so cleanup of smoke-test rows must bypass RLS via the service role.
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Seed accounts from supabase/seed.sql — all use password123.
const PLANNER_EMAIL = 'planner@lumiere-events.sa';
const PLANNER_ID = '11111111-0000-0000-0000-000000000001';
const CUSTOMER_EMAIL = 'noura.alqahtani@example.com';
const CUSTOMER_ID = '22222222-0000-0000-0000-000000000001';
const SEED_PASSWORD = 'password123';

let passed = 0;
let failed = 0;

function logStep(label) {
  console.log(`\n→ ${label}`);
}

function assert(condition, message) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${message}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${message}`);
  }
}

async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`Sign-in failed for ${email}: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token;
}

function client(accessToken) {
  const headers = {
    apikey: ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  async function call(method, path, body, extraHeaders = {}) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method,
      headers: { ...headers, ...extraHeaders },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    return { ok: res.ok, status: res.status, data };
  }

  return {
    insert: (table, row) => call('POST', table, row, { Prefer: 'return=representation' }),
    patch: (table, filter, row) => call('PATCH', `${table}?${filter}`, row, { Prefer: 'return=representation' }),
    select: (table, filter) => call('GET', `${table}?${filter}`),
    delete: (table, filter) => call('DELETE', `${table}?${filter}`),
  };
}

async function run() {
  logStep('Signing in seeded customer + planner accounts');
  const customerToken = await signIn(CUSTOMER_EMAIL, SEED_PASSWORD);
  const plannerToken = await signIn(PLANNER_EMAIL, SEED_PASSWORD);
  assert(!!customerToken, 'customer signed in');
  assert(!!plannerToken, 'planner signed in');

  const customer = client(customerToken);
  const planner = client(plannerToken);

  // 1. Customer posts a request -----------------------------------------
  logStep('1. Customer posts a request (deal state: request)');
  const reqRes = await customer.insert('requests', {
    customer_id: CUSTOMER_ID,
    category: 'weddings',
    city: 'riyadh',
    event_date: '2026-12-01',
    guests: 120,
    budget: '20to35',
    note: 'Smoke-test request — safe to delete.',
  });
  assert(reqRes.ok, `request created (${reqRes.status})`);
  const requestId = reqRes.data?.[0]?.id;
  assert(!!requestId, 'request id returned');

  // 2. Planner sends an offer ---------------------------------------------
  logStep('2. Planner sends an offer (deal state: offer_sent)');
  const offerRes = await planner.insert('offers', {
    request_id: requestId,
    planner_id: PLANNER_ID,
    package: 'signature',
    price: 42000,
    message: 'Smoke-test offer — safe to delete.',
  });
  assert(offerRes.ok, `offer created (${offerRes.status})`);
  const offerId = offerRes.data?.[0]?.id;
  assert(offerRes.data?.[0]?.deal_status === 'offer_sent', 'offer defaults to deal_status=offer_sent');

  async function offerStatus() {
    const r = await customer.select('offers', `id=eq.${offerId}&select=deal_status,status`);
    return r.data?.[0];
  }

  // 3. Customer accepts the offer -----------------------------------------
  logStep('3. Customer accepts the offer (deal state: accepted)');
  const acceptRes = await customer.patch('offers', `id=eq.${offerId}`, {
    status: 'accepted',
    deal_status: 'accepted',
  });
  assert(acceptRes.ok, `offer accepted (${acceptRes.status})`);
  assert((await offerStatus())?.deal_status === 'accepted', 'deal_status === accepted');

  // 4. Planner countersigns: contract + pending payments + booking --------
  logStep('4. Planner countersigns (deal state: countersigned)');
  const ref = `RTB-SMOKE-${Date.now()}`;
  const contractRes = await planner.insert('contracts', {
    offer_id: offerId,
    ref,
    signed_by_customer_at: new Date().toISOString(),
    signed_by_planner_at: new Date().toISOString(),
  });
  assert(contractRes.ok, `contract created (${contractRes.status})`);
  const contractId = contractRes.data?.[0]?.id;

  const countersignRes = await planner.patch('offers', `id=eq.${offerId}`, { deal_status: 'countersigned' });
  assert(countersignRes.ok, `offer countersigned (${countersignRes.status})`);
  assert((await offerStatus())?.deal_status === 'countersigned', 'deal_status === countersigned');

  const depositAmount = 8400;
  const balanceAmount = 33600;
  const pendingPaymentsRes = await planner.insert('payments', [
    { contract_id: contractId, type: 'deposit', amount: depositAmount, status: 'pending' },
    { contract_id: contractId, type: 'balance', amount: balanceAmount, status: 'pending' },
  ]);
  assert(pendingPaymentsRes.ok, `pending deposit + balance payment rows created (${pendingPaymentsRes.status})`);

  const bookingRes = await planner.insert('bookings', {
    contract_id: contractId,
    stage: 'planning',
    event_date: '2026-12-01',
    platform_fee: Math.round(42000 * 0.1 * 100) / 100,
  });
  assert(bookingRes.ok, `booking created (${bookingRes.status})`);
  const bookingId = bookingRes.data?.[0]?.id;

  // 5. Customer pays deposit — DB trigger should auto-advance the deal ----
  logStep('5. Customer pays the deposit (trigger should auto-advance to deposit_paid)');
  const depositPaidRes = await customer.insert('payments', {
    contract_id: contractId,
    type: 'deposit',
    amount: depositAmount,
    status: 'paid',
  });
  assert(depositPaidRes.ok, `deposit payment recorded (${depositPaidRes.status})`);
  assert((await offerStatus())?.deal_status === 'deposit_paid', 'trigger advanced deal_status to deposit_paid');

  // 6. Event completes ------------------------------------------------------
  logStep('6. Marking the offer completed (deal state: completed)');
  const completedRes = await customer.patch('offers', `id=eq.${offerId}`, { deal_status: 'completed' });
  assert(completedRes.ok, `offer marked completed (${completedRes.status})`);
  assert((await offerStatus())?.deal_status === 'completed', 'deal_status === completed');

  // 7. Customer leaves a review — trigger should auto-advance to reviewed -
  logStep('7. Customer submits a review (trigger should auto-advance to reviewed)');
  const reviewRes = await customer.insert('reviews', {
    booking_id: bookingId,
    customer_id: CUSTOMER_ID,
    rating: 5,
    comment: 'Smoke-test review — safe to delete.',
  });
  assert(reviewRes.ok, `review created (${reviewRes.status})`);
  const reviewId = reviewRes.data?.[0]?.id;
  assert((await offerStatus())?.deal_status === 'reviewed', 'trigger advanced deal_status to reviewed (terminal state)');

  // 8. Negative test: terminal state must reject further transitions ------
  logStep('8. Negative test: reviewed -> countersigned must be rejected');
  const illegalRes = await customer.patch('offers', `id=eq.${offerId}`, { deal_status: 'countersigned' });
  assert(!illegalRes.ok, `illegal transition from terminal state rejected (status ${illegalRes.status})`);

  // 9. Negative test: skipping straight from offer_sent to deposit_paid ----
  logStep('9. Negative test: a fresh offer cannot skip offer_sent -> deposit_paid');
  // Needs its own request — offers has a unique(request_id, planner_id) constraint,
  // so reusing requestId (which already has an offer from this planner) would conflict.
  const skipReqRes = await customer.insert('requests', {
    customer_id: CUSTOMER_ID,
    category: 'weddings',
    city: 'riyadh',
    event_date: '2026-12-02',
    guests: 50,
    budget: 'under10',
    note: 'Smoke-test negative-path request — safe to delete.',
  });
  const skipRequestId = skipReqRes.data?.[0]?.id;

  const skipOfferRes = await planner.insert('offers', {
    request_id: skipRequestId,
    planner_id: PLANNER_ID,
    package: 'essentials',
    price: 15000,
  });
  assert(skipOfferRes.ok, `throwaway offer created for negative test (${skipOfferRes.status})`);
  const skipOfferId = skipOfferRes.data?.[0]?.id;
  const skipRes = await planner.patch('offers', `id=eq.${skipOfferId}`, { deal_status: 'deposit_paid' });
  assert(!skipRes.ok, `illegal skip offer_sent -> deposit_paid rejected (status ${skipRes.status})`);

  // Cleanup -------------------------------------------------------------------
  // No DELETE RLS policies exist on these tables by design, so teardown uses
  // the service role to bypass RLS rather than the customer/planner sessions.
  logStep('Cleaning up smoke-test rows (service role, bypasses RLS)');
  const admin = client(SERVICE_ROLE_KEY);
  await admin.delete('requests', `id=eq.${requestId}`); // cascades offers/contracts/payments/bookings/reviews
  await admin.delete('requests', `id=eq.${skipRequestId}`); // cascades the throwaway offer
  console.log('  done');
}

run()
  .then(() => {
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
  })
  .catch((err) => {
    console.error('\nSmoke test crashed:', err);
    process.exit(1);
  });
