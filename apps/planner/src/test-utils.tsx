import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n, { ensureI18nInitialized, type AppLanguage } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { ThemeProvider } from '@/theme/ThemeContext';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn(() => ({ on: jest.fn().mockReturnThis(), subscribe: jest.fn() })),
    removeChannel: jest.fn(),
  },
}));

/**
 * Configures the shared supabase.from() mock (see the jest.mock above).
 * Each call to `.from(table)` gets its own fresh chainable query builder;
 * `resolvers[table]` receives the list of chained calls actually made on
 * that specific builder (e.g. [{method: 'eq', args: ['status','pending']}])
 * and returns the response to resolve with. Resolving by inspecting the
 * actual chained calls — not by call order or a shared counter — is what
 * makes this robust to React's double-invoked effects in this environment
 * (confirmed empirically: Sidebar's badge-fetching effect fires twice per
 * render here). Tables with no configured resolver default to
 * `{ count: 0, data: [] }`, so components that transitively render
 * Supabase-calling children (e.g. DashboardShell rendering Sidebar) don't
 * need to configure every table just to avoid a crash.
 */
export function mockSupabaseFrom(
  resolvers: Record<string, (calls: Array<{ method: string; args: unknown[] }>) => unknown> = {}
) {
  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    const calls: Array<{ method: string; args: unknown[] }> = [];
    const builder: Record<string, unknown> = {};
    ['select', 'eq', 'in', 'order', 'limit', 'update'].forEach((method) => {
      builder[method] = jest.fn((...args: unknown[]) => {
        calls.push({ method, args });
        return builder;
      });
    });
    builder.then = (resolve: (value: unknown) => void) =>
      Promise.resolve(resolvers[table]?.(calls) ?? { count: 0, data: [] }).then(resolve);
    return builder;
  });
}

/**
 * Renders through the app's real I18nextProvider — the same wrapping
 * apps/planner/src/app/layout.tsx uses — so components exercise their
 * actual useIsRTL()/useTranslation() hook chain. Only components that read
 * i18n directly need this; most of components/ui/ doesn't and uses a bare
 * render() instead.
 */
export async function renderWithI18n(ui: ReactElement, { lang = 'en' as AppLanguage } = {}) {
  ensureI18nInitialized(lang);
  await i18n.changeLanguage(lang);
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

/**
 * Same as renderWithI18n, but also wraps the real ThemeProvider — for
 * components/layout/ components that call useThemeMode() (only Topbar, and
 * anything that transitively renders it). Kept separate from renderWithI18n
 * rather than folding ThemeProvider into it, so the 13 existing
 * components/ui/ tests (none of which use useTheme/useThemeMode) are
 * unaffected.
 */
export async function renderWithProviders(ui: ReactElement, { lang = 'en' as AppLanguage } = {}) {
  ensureI18nInitialized(lang);
  await i18n.changeLanguage(lang);
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>{ui}</ThemeProvider>
    </I18nextProvider>
  );
}

// i18n is a module-level singleton shared across every test file in the
// run — reset it after each test so a language change in one test/file
// can't leak into the next and produce order-dependent failures.
afterEach(async () => {
  await i18n.changeLanguage('en');
});

export { i18n };
