'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedScheme = 'light' | 'dark';

/** Persistence key — mirrors the customer app's `rtb_theme` AsyncStorage key. */
export const THEME_STORAGE_KEY = 'rtb_theme';

function systemPrefersDark() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolve(mode: ThemeMode): ResolvedScheme {
  return mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode;
}

function applyScheme(scheme: ResolvedScheme) {
  document.documentElement.classList.toggle('dark', scheme === 'dark');
}

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedScheme: ResolvedScheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Wraps the dashboard. The blocking inline script in layout.tsx applies the
 * right class before paint (no flash) — this provider just keeps React state
 * in sync so a settings toggle can react to and change the mode.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolvedScheme, setResolvedScheme] = useState<ResolvedScheme>('light');

  useEffect(() => {
    // Reading localStorage during render would throw/mismatch under SSR —
    // this effect exists specifically to sync React state from that
    // external source once we're safely on the client, exactly the
    // "synchronize with an external system" case this rule allows.
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null) ?? 'system';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModeState(stored);
    setResolvedScheme(resolve(stored));
  }, []);

  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const scheme = resolve('system');
      setResolvedScheme(scheme);
      applyScheme(scheme);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    const scheme = resolve(next);
    setResolvedScheme(scheme);
    applyScheme(scheme);
  };

  return <ThemeContext.Provider value={{ mode, resolvedScheme, setMode }}>{children}</ThemeContext.Provider>;
}

/** Theme mode control — for a settings toggle (Light / Dark / System). */
export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within <ThemeProvider>');
  return ctx;
}
