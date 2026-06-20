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
      name: 'Rattibha',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

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
