import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';

import { mockSupabaseFrom, renderWithI18n } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import { Sidebar } from './Sidebar';

/**
 * Flushes Sidebar's own badge-fetching effects so their (React-double-
 * invoked) state updates settle before the test ends, avoiding a benign
 * act() warning in tests that aren't asserting on badge values themselves.
 */
async function flushEffects() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

jest.mock('next/navigation', () => ({
  usePathname: () => '/open-requests',
}));

// See Topbar.test.tsx for why this object must be referentially stable
// across calls (Sidebar's badge-fetching effect depends on [session]).
const mockAuthValue: { session: unknown; profile: { is_admin: boolean } } = {
  session: { user: { id: 'user-1' } },
  profile: { is_admin: false },
};
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

describe('Sidebar', () => {
  test('renders non-admin nav items, omits admin-only items, when profile.is_admin is false', async () => {
    mockAuthValue.profile.is_admin = false;
    mockSupabaseFrom();
    await renderWithI18n(<Sidebar open={false} onClose={() => {}} />);

    expect(screen.getByText(en.nav.overview)).toBeInTheDocument();
    expect(screen.getByText(en.nav.openRequests)).toBeInTheDocument();
    expect(screen.queryByText(en.nav.adminApprovals)).toBeNull();
    expect(screen.queryByText(en.nav.adminUsers)).toBeNull();
    await flushEffects();
  });

  test('renders admin-only items too when profile.is_admin is true', async () => {
    mockAuthValue.profile.is_admin = true;
    mockSupabaseFrom();
    await renderWithI18n(<Sidebar open={false} onClose={() => {}} />);

    expect(screen.getByText(en.nav.adminApprovals)).toBeInTheDocument();
    expect(screen.getByText(en.nav.adminUsers)).toBeInTheDocument();
    await flushEffects();
  });

  test('the nav item matching the current pathname gets aria-current="page"', async () => {
    mockAuthValue.profile.is_admin = false;
    mockSupabaseFrom();
    await renderWithI18n(<Sidebar open={false} onClose={() => {}} />);

    expect(screen.getByText(en.nav.openRequests).closest('a')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText(en.nav.overview).closest('a')).not.toHaveAttribute('aria-current');
    await flushEffects();
  });

  test('badge counts resolve correctly from the mocked Supabase queries, robust to effect re-invocation', async () => {
    mockAuthValue.profile.is_admin = false;
    mockSupabaseFrom({
      requests: () => ({ count: 5 }),
      offers: (calls) => {
        const isPendingCount = calls.some((c) => c.method === 'eq' && c.args[0] === 'status' && c.args[1] === 'pending');
        return isPendingCount ? { count: 2 } : { data: [{ request_id: 'r1' }] };
      },
      messages: () => ({
        data: [{ request_id: 'r1', sender_id: 'customer-1', created_at: '2026-07-18T00:00:00Z' }],
      }),
    });

    await renderWithI18n(<Sidebar open={false} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // browse badge (open requests)
    });
    expect(screen.getByText('2')).toBeInTheDocument(); // leads badge (pending offers)
    expect(screen.getByText('1')).toBeInTheDocument(); // messages badge (1 awaiting reply)
  });

  test('open controls the mobile drawer; the drawer close button calls onClose', async () => {
    mockAuthValue.profile.is_admin = false;
    mockSupabaseFrom();
    const onClose = jest.fn();
    const { container } = await renderWithI18n(<Sidebar open={true} onClose={onClose} />);

    const aside = container.querySelector('aside')!;
    expect(aside.className).toContain('flex');
    expect(aside.className).not.toContain('hidden');

    // Two elements share this aria-label (the full-screen backdrop button
    // and the drawer's own X button) — scope to the drawer to pick the X.
    fireEvent.click(within(aside).getByLabelText(en.sidebar.closeMenu));
    expect(onClose).toHaveBeenCalledTimes(1);
    await flushEffects();
  });

  test('open: clicking the backdrop also calls onClose', async () => {
    mockAuthValue.profile.is_admin = false;
    mockSupabaseFrom();
    const onClose = jest.fn();
    const { container } = await renderWithI18n(<Sidebar open={true} onClose={onClose} />);

    const backdrop = container.querySelector('button.fixed.inset-0')!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
    await flushEffects();
  });

  test('closed: the drawer is hidden (mobile) and no backdrop renders', async () => {
    mockAuthValue.profile.is_admin = false;
    mockSupabaseFrom();
    const { container } = await renderWithI18n(<Sidebar open={false} onClose={() => {}} />);

    const aside = container.querySelector('aside')!;
    expect(aside.className).toContain('hidden');
    expect(container.querySelector('[aria-label="' + en.sidebar.closeMenu + '"].fixed')).toBeNull();
    await flushEffects();
  });
});
