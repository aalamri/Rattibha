export type NotifType = 'offer_received' | 'offer_accepted' | 'booking_confirmed' | 'message' | string;

export interface Notif {
  id: string;
  type: NotifType;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export function notificationRoute(
  n: Pick<Notif, 'type' | 'payload'>
): { pathname: string; params?: Record<string, string> } | null {
  const p = n.payload ?? {};
  switch (n.type) {
    case 'offer_received':
      return p.request_id ? { pathname: '/proposals', params: { id: String(p.request_id) } } : null;
    case 'offer_accepted':
      return p.offer_id ? { pathname: '/checkout', params: { offerId: String(p.offer_id) } } : null;
    case 'booking_confirmed':
      return p.booking_id ? { pathname: '/booking/[id]', params: { id: String(p.booking_id) } } : null;
    case 'message':
      return p.request_id && p.planner_id
        ? {
            pathname: '/chat/[requestId]',
            params: {
              requestId: String(p.request_id),
              plannerId: String(p.planner_id),
              plannerName: String(p.planner_name ?? ''),
              plannerSeed: String(p.planner_seed ?? 0),
            },
          }
        : null;
    default:
      return null;
  }
}
