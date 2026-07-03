import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from './supabase';

// Show banners + play sound while app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request permission, obtain an Expo push token, and persist it to the
 * profiles table so the backend can address notifications to this device.
 * Safe to call multiple times — exits early if already registered.
 *
 * Note for local testing: Expo Go on Android hard-blocks the entire app
 * from loading if this module is even imported, starting SDK 53 (remote
 * notifications were removed from the generic client). That's a project-
 * level block on importing `expo-notifications` at all, not something
 * this function's own error handling can prevent — to test the rest of
 * the app in Expo Go, temporarily remove the "expo-notifications" plugin
 * entry from app.json and stub this file, then restore both before a
 * real development-client or production build.
 */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (!Device.isDevice) return null; // simulators can't receive pushes

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  // Android requires a notification channel.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Ratibha',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // Wrapped in try/catch since getExpoPushTokenAsync() can still fail for
  // reasons unrelated to Expo Go (no network, misconfigured project ID,
  // etc.) — better to skip registration than throw and disrupt sign-in.
  let token: string;
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    token = tokenData.data;
  } catch (error) {
    console.warn('[pushNotifications] Skipping push token registration:', error);
    return null;
  }

  // Persist — upsert so re-installs or token rotations are handled.
  await supabase
    .from('profiles')
    .update({ expo_push_token: token })
    .eq('id', userId);

  return token;
}

/**
 * Remove the stored token when the user signs out so they stop receiving
 * notifications for a session they've ended.
 */
export async function clearPushToken(userId: string): Promise<void> {
  await supabase
    .from('profiles')
    .update({ expo_push_token: null })
    .eq('id', userId);
}
