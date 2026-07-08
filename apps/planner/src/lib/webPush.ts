import { supabase } from './supabase';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isWebPushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Registers the service worker, requests notification permission, subscribes
 * to push, and persists the subscription to profiles.web_push_subscription.
 * Only called from an explicit user action (a toggle) — never on page load,
 * since browsers penalize auto-prompting for notification permission.
 */
export async function subscribeToWebPush(userId: string): Promise<'subscribed' | 'denied' | 'unsupported'> {
  if (!isWebPushSupported()) return 'unsupported';

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return 'unsupported';

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
  });

  await supabase
    .from('profiles')
    .update({ web_push_subscription: subscription.toJSON() as Record<string, unknown> })
    .eq('id', userId);

  return 'subscribed';
}

/**
 * Unsubscribes at the browser level and clears the stored subscription so
 * send-push stops targeting this planner. Mirrors clearPushToken in the
 * customer app (apps/customer/src/lib/pushNotifications.ts).
 */
export async function unsubscribeFromWebPush(userId: string): Promise<void> {
  if (isWebPushSupported()) {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) await subscription.unsubscribe();
  }

  await supabase.from('profiles').update({ web_push_subscription: null }).eq('id', userId);
}
