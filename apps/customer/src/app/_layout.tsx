import '@/global.css';

import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import i18n, { initI18n } from '@/i18n';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider, useTheme, useThemeMode } from '@/theme/ThemeContext';
import { useAppFonts } from '@/theme/fonts';

SplashScreen.preventAutoHideAsync();

function RouteGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/onboarding');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  if (loading) return null;

  return children;
}

function AppShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { resolvedScheme } = useThemeMode();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
      <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  const ready = (fontsLoaded || !!fontError) && i18nReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <SafeAreaProvider>
          <AuthProvider>
            <ToastProvider>
              <RouteGuard>
                <AppShell>
                  <Stack screenOptions={{ headerShown: false }} />
                </AppShell>
              </RouteGuard>
            </ToastProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
