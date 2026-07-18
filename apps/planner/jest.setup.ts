import '@testing-library/jest-dom';

// jsdom does not implement matchMedia — ThemeContext.tsx's ThemeProvider
// calls it unconditionally on mount (system-scheme detection), so any test
// rendering the real ThemeProvider throws without this polyfill. Guarded
// since this file also runs for @jest-environment node test files (e.g.
// proxy.test.ts), where `window` doesn't exist at all.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
