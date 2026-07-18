import { act, fireEvent, screen } from '@testing-library/react';

import { i18n, mockSupabaseFrom, renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import { Topbar } from './Topbar';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const mockSignOut = jest.fn();
// The mocked useAuth() return MUST be a referentially-stable object — Sidebar
// and NotificationsPanel both have useEffect(..., [session]), and a fresh
// object literal on every call makes that dependency "change" on every
// render, causing an infinite effect/render loop (confirmed empirically: an
// inline `() => ({...})` factory here crashed Jest with a heap OOM).
const mockAuthValue = {
  session: { user: { id: 'user-1' } },
  profile: { is_admin: false },
  planner: { business_name: 'Layla Events', city: 'riyadh' },
  loading: false,
  signOut: mockSignOut,
};
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

async function flushEffects() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe('Topbar', () => {
  beforeEach(() => {
    mockSignOut.mockClear();
    mockSupabaseFrom();
  });

  test('renders title and subtitle', async () => {
    await renderWithProviders(<Topbar title="Overview" subtitle="All your leads" onMenuClick={() => {}} />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('All your leads')).toBeInTheDocument();
    await flushEffects();
  });

  test('omits the subtitle row when not provided', async () => {
    await renderWithProviders(<Topbar title="Overview" onMenuClick={() => {}} />);
    expect(screen.queryByText('All your leads')).toBeNull();
    await flushEffects();
  });

  test('menu button fires onMenuClick', async () => {
    const onMenuClick = jest.fn();
    await renderWithProviders(<Topbar title="Overview" onMenuClick={onMenuClick} />);
    fireEvent.click(screen.getByLabelText(en.sidebar.openMenu));
    expect(onMenuClick).toHaveBeenCalledTimes(1);
    await flushEffects();
  });

  test('language toggle shows the opposite-language label and switches the real i18n language', async () => {
    await renderWithProviders(<Topbar title="Overview" onMenuClick={() => {}} />, { lang: 'en' });
    expect(screen.getByText('العربية')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(en.common.toggleLanguage));
    await act(async () => {
      await Promise.resolve();
    });
    expect(i18n.language).toBe('ar');
    await flushEffects();
  });

  test('sign-out button calls the mocked signOut', async () => {
    await renderWithProviders(<Topbar title="Overview" onMenuClick={() => {}} />);
    fireEvent.click(screen.getByLabelText(en.auth.signOut));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    await flushEffects();
  });

  test('renders planner business_name and city from useAuth', async () => {
    await renderWithProviders(<Topbar title="Overview" onMenuClick={() => {}} />);
    expect(screen.getByText('Layla Events')).toBeInTheDocument();
    expect(screen.getByText(en.cities.riyadh)).toBeInTheDocument();
    await flushEffects();
  });

  test('renders the real NotificationsPanel', async () => {
    await renderWithProviders(<Topbar title="Overview" onMenuClick={() => {}} />);
    expect(screen.getByLabelText(en.common.notifications)).toBeInTheDocument();
    await flushEffects();
  });
});
