// Planner dashboard service worker — shows incoming Web Push notifications
// and routes taps back into the app. Static file, no build step: registered
// directly from src/lib/webPush.ts via navigator.serviceWorker.register('/sw.js').

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const payload = event.data.json();
  const title = payload.title || 'Ratibha';
  const options = {
    body: payload.body || '',
    data: { url: '/messages' },
  };

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const focusedOnMessages = clientsList.some(
        (client) => client.visibilityState === 'visible' && client.url.includes('/messages')
      );

      // Planner already has the messages page open and focused — they'll
      // see the new message land via the existing realtime subscription
      // and the in-app notification bell, so don't also show an OS
      // notification on top of that.
      if (focusedOnMessages) {
        clientsList.forEach((client) => client.postMessage({ type: 'push-received', payload }));
        return;
      }

      await self.registration.showNotification(title, options);
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : '/messages';

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const targetPath = new URL(targetUrl, self.location.origin).pathname;
      const existing = clientsList.find((client) => client.url.includes(targetPath));

      if (existing) {
        await existing.focus();
        return;
      }

      const anyClient = clientsList[0];
      if (anyClient && 'navigate' in anyClient) {
        await anyClient.navigate(targetUrl);
        await anyClient.focus();
        return;
      }

      await self.clients.openWindow(targetUrl);
    })()
  );
});
