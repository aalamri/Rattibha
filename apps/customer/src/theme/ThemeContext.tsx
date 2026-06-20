import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { darkTheme, lightTheme, type Theme } from './colors';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedScheme = 'light' | 'dark';

/** Persistence key, mirrors the `rtb_lang` pattern used for language preference. */
export const THEME_STORAGE_KEY = 'rtb_theme';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  resolvedScheme: ResolvedScheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Wraps the app; resolves light/dark from the device scheme unless the user overrides it. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') setModeState(stored);
    });
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
  };

  const resolvedScheme: ResolvedScheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const theme = resolvedScheme === 'dark' ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({ theme, mode, resolvedScheme, setMode }),
    [theme, mode, resolvedScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme/useThemeMode must be used within <ThemeProvider>');
  return ctx;
}

/** Active semantic color tokens — updates instantly on theme change. */
export function useTheme(): Theme {
  return useThemeContext().theme;
}

/** Theme mode control — for a settings toggle (Light / Dark / System). */
export function useThemeMode() {
  const { mode, resolvedScheme, setMode } = useThemeContext();
  return { mode, resolvedScheme, setMode };
}
