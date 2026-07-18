import { act, screen, waitFor } from '@testing-library/react';

import { mockSupabaseFrom, renderWithProviders } from '@/test-utils';
import { DashboardShell } from './DashboardShell';

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  usePathname: () => '/',
}));

/**
 * DashboardShell renders the real Sidebar/Topbar/NotificationsPanel, whose
 * own background data-fetching effects settle on a later microtask than
 * this test's main assertion — flushing here avoids an act() warning from
 * those (unrelated-to-this-test) state updates landing after the test ends.
 */
async function flushEffects() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

let mockAuth: {
  session: unknown;
  profile: { is_admin: boolean } | null;
  planner: { business_name: string; city: string } | null;
  loading: boolean;
  signOut: jest.Mock;
};
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

describe('DashboardShell', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSupabaseFrom();
  });

  test('loading: renders the loading status, not children', async () => {
    mockAuth = { session: null, profile: null, planner: null, loading: true, signOut: jest.fn() };
    await renderWithProviders(
      <DashboardShell title="Overview">
        <div>Page content</div>
      </DashboardShell>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Page content')).toBeNull();
  });

  test('no session, not loading: redirects to /login', async () => {
    mockAuth = { session: null, profile: null, planner: null, loading: false, signOut: jest.fn() };
    await renderWithProviders(
      <DashboardShell title="Overview">
        <div>Page content</div>
      </DashboardShell>
    );
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  test('session present, requireAdmin true, non-admin profile: redirects to /', async () => {
    mockAuth = {
      session: { user: { id: 'user-1' } },
      profile: { is_admin: false },
      planner: null,
      loading: false,
      signOut: jest.fn(),
    };
    await renderWithProviders(
      <DashboardShell title="Admin" requireAdmin>
        <div>Page content</div>
      </DashboardShell>
    );
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  test('session present, requireAdmin true, admin profile: renders children, no redirect', async () => {
    mockAuth = {
      session: { user: { id: 'user-1' } },
      profile: { is_admin: true },
      planner: { business_name: 'Layla Events', city: 'riyadh' },
      loading: false,
      signOut: jest.fn(),
    };
    await renderWithProviders(
      <DashboardShell title="Admin" requireAdmin>
        <div>Page content</div>
      </DashboardShell>
    );
    await waitFor(() => {
      expect(screen.getByText('Page content')).toBeInTheDocument();
    });
    expect(mockReplace).not.toHaveBeenCalled();
    await flushEffects();
  });

  test('session present, requireAdmin not set: renders children regardless of profile.is_admin', async () => {
    mockAuth = {
      session: { user: { id: 'user-1' } },
      profile: { is_admin: false },
      planner: { business_name: 'Layla Events', city: 'riyadh' },
      loading: false,
      signOut: jest.fn(),
    };
    await renderWithProviders(
      <DashboardShell title="Overview">
        <div>Page content</div>
      </DashboardShell>
    );
    await waitFor(() => {
      expect(screen.getByText('Page content')).toBeInTheDocument();
    });
    expect(mockReplace).not.toHaveBeenCalled();
    await flushEffects();
  });

  test('renders title/subtitle via the real Topbar', async () => {
    mockAuth = {
      session: { user: { id: 'user-1' } },
      profile: { is_admin: false },
      planner: { business_name: 'Layla Events', city: 'riyadh' },
      loading: false,
      signOut: jest.fn(),
    };
    await renderWithProviders(
      <DashboardShell title="Overview" subtitle="All your leads in one place">
        <div>Page content</div>
      </DashboardShell>
    );
    await waitFor(() => {
      expect(screen.getByText('Page content')).toBeInTheDocument();
    });
    expect(screen.getByText('All your leads in one place')).toBeInTheDocument();
    await flushEffects();
  });
});
