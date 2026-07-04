import '@/global.css';

import { Stack, useRouter, useSegments, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import i18n, { initI18n } from '@/i18n';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider, useTheme, useThemeMode } from '@/theme/ThemeContext';
import { useAppFonts } from '@/theme/fonts';

SplashScreen.preventAutoHideAsync();

/**
 * Root-level crash fallback. Rendered by expo-router's Try boundary when a
 * route throws and nothing closer up the tree has its own ErrorBoundary.
 * Avoids useTheme()/useTranslation() since the crash could originate above
 * ThemeProvider/I18nextProvider (that context may not be safely available
 * here) — hardcoded brand color and both languages stacked instead of a
 * language toggle we can't reliably read. useRouter() is confirmed safe
 * (verified by test: it doesn't throw even when the crashed route is the
 * one currently active), so a "go home" escape hatch is provided in case
 * the failure isn't transient and retry() alone would just loop.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const router = useRouter();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF7F2', padding: 24, gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#2B2233', textAlign: 'center' }}>
        Something went wrong
      </Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#2B2233', textAlign: 'center' }}>
        حدث خطأ ما
      </Text>
      {__DEV__ && (
        <Text style={{ fontSize: 12, color: '#2B2233', opacity: 0.6, textAlign: 'center', marginTop: 4 }}>
          {error.message}
        </Text>
      )}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Pressable
          onPress={retry}
          style={{
            backgroundColor: '#5B2C83',
            borderRadius: 14,
            paddingVertical: 13,
            paddingHorizontal: 24,
          }}>
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Try again · أعد المحاولة</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            router.replace('/');
            retry();
          }}
          style={{
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: '#5B2C83',
            borderRadius: 14,
            paddingVertical: 13,
            paddingHorizontal: 24,
          }}>
          <Text style={{ color: '#5B2C83', fontSize: 15, fontWeight: '700' }}>Go home · الرئيسية</Text>
        </Pressable>
      </View>
    </View>
  );
}

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
