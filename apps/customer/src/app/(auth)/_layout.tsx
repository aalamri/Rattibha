import { Stack } from 'expo-router';

/** Auth flow stack — onboarding, login, register, forgot password, OTP. */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
