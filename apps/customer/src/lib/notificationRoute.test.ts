import { notificationRoute } from './notificationRoute';

test('offer_received routes to /proposals with the request id', () => {
  const route = notificationRoute({
    type: 'offer_received',
    payload: { request_id: 'req-1', offer_id: 'off-1', planner_id: 'pl-1', planner_name: 'Lumière Events', price: 42000 },
  });
  expect(route).toEqual({ pathname: '/proposals', params: { id: 'req-1' } });
});

test('offer_accepted routes to /checkout with the offer id', () => {
  const route = notificationRoute({
    type: 'offer_accepted',
    payload: { request_id: 'req-1', offer_id: 'off-1', planner_id: 'pl-1', planner_name: 'Lumière Events' },
  });
  expect(route).toEqual({ pathname: '/checkout', params: { offerId: 'off-1' } });
});

test('booking_confirmed routes to /booking/[id] with the booking id', () => {
  const route = notificationRoute({
    type: 'booking_confirmed',
    payload: { booking_id: 'bk-1', request_id: 'req-1', planner_id: 'pl-1', planner_name: 'Lumière Events' },
  });
  expect(route).toEqual({ pathname: '/booking/[id]', params: { id: 'bk-1' } });
});

test('message routes to /chat/[requestId] with all chat params, coercing planner_seed to a string', () => {
  const route = notificationRoute({
    type: 'message',
    payload: {
      request_id: 'req-1',
      message_id: 'msg-1',
      planner_id: 'pl-1',
      planner_name: 'Lumière Events',
      planner_seed: 3,
      preview: 'Hi there',
    },
  });
  expect(route).toEqual({
    pathname: '/chat/[requestId]',
    params: {
      requestId: 'req-1',
      plannerId: 'pl-1',
      plannerName: 'Lumière Events',
      plannerSeed: '3',
    },
  });
});

test('an unknown event type returns null rather than a broken route', () => {
  const route = notificationRoute({ type: 'bogus_event', payload: {} });
  expect(route).toBeNull();
});

test('a malformed message payload missing planner_id returns null rather than an incomplete route', () => {
  const route = notificationRoute({ type: 'message', payload: { request_id: 'req-1' } });
  expect(route).toBeNull();
});
