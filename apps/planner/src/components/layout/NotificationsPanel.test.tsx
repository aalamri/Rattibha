import { fireEvent, screen, waitFor } from '@testing-library/react';

import { mockSupabaseFrom, renderWithI18n } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import { NotificationsPanel } from './NotificationsPanel';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// See Topbar.test.tsx for why this object must be referentially stable
// across calls (NotificationsPanel's fetch/subscribe effect depends on [session]).
const mockAuthValue = { session: { user: { id: 'user-1' } } };
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

describe('NotificationsPanel', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  test('closed by default; clicking the bell opens the panel', async () => {
    mockSupabaseFrom();
    await renderWithI18n(<NotificationsPanel />);

    expect(screen.queryByText(en.notifications.title)).toBeNull();
    fireEvent.click(screen.getByLabelText(en.common.notifications));
    await waitFor(() => {
      expect(screen.getByText(en.notifications.title)).toBeInTheDocument();
    });
  });

  test('renders the empty state when there are no notifications', async () => {
    mockSupabaseFrom({ notifications: () => ({ data: [] }) });
    await renderWithI18n(<NotificationsPanel />);

    fireEvent.click(screen.getByLabelText(en.common.notifications));
    await waitFor(() => {
      expect(screen.getByText(en.notifications.empty)).toBeInTheDocument();
    });
  });

  test('renders a fetched notification with its real translated description', async () => {
    mockSupabaseFrom({
      notifications: () => ({
        data: [{ id: 'n1', type: 'new_message', payload: {}, read: false, created_at: '2026-07-18T00:00:00Z' }],
      }),
    });
    await renderWithI18n(<NotificationsPanel />);

    fireEvent.click(screen.getByLabelText(en.common.notifications));
    await waitFor(() => {
      expect(screen.getByText(en.notifications.types.newMessage)).toBeInTheDocument();
    });
  });

  test('unread dot and "mark all read" show only when there are unread notifications', async () => {
    mockSupabaseFrom({
      notifications: () => ({
        data: [{ id: 'n1', type: 'new_message', payload: {}, read: false, created_at: '2026-07-18T00:00:00Z' }],
      }),
    });
    await renderWithI18n(<NotificationsPanel />);

    fireEvent.click(screen.getByLabelText(en.common.notifications));
    await waitFor(() => {
      expect(screen.getByText(en.notifications.markAllRead)).toBeInTheDocument();
    });
  });

  test('no unread notifications: "mark all read" is not rendered', async () => {
    mockSupabaseFrom({
      notifications: () => ({
        data: [{ id: 'n1', type: 'new_message', payload: {}, read: true, created_at: '2026-07-18T00:00:00Z' }],
      }),
    });
    await renderWithI18n(<NotificationsPanel />);

    fireEvent.click(screen.getByLabelText(en.common.notifications));
    await waitFor(() => {
      expect(screen.getByText(en.notifications.types.newMessage)).toBeInTheDocument();
    });
    expect(screen.queryByText(en.notifications.markAllRead)).toBeNull();
  });

  test('clicking a notification closes the panel, marks it read, and navigates via notificationHref', async () => {
    mockSupabaseFrom({
      notifications: () => ({
        data: [
          {
            id: 'n1',
            type: 'new_request',
            payload: { request_id: 'req-1', category: 'weddings', city: 'riyadh' },
            read: false,
            created_at: '2026-07-18T00:00:00Z',
          },
        ],
      }),
    });
    await renderWithI18n(<NotificationsPanel />);

    fireEvent.click(screen.getByLabelText(en.common.notifications));
    const expectedText = en.notifications.types.newRequest
      .replace('{{category}}', en.categories.weddings)
      .replace('{{city}}', en.cities.riyadh);
    await waitFor(() => {
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(expectedText).closest('button')!);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/open-requests/req-1/quote');
    });
    expect(screen.queryByText(en.notifications.title)).toBeNull();
  });
});
