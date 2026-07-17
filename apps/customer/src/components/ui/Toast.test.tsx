import { render, fireEvent, act } from '@testing-library/react-native';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '@/test-utils';
import { initI18n } from '@/i18n';
import { lightTheme } from '@/theme/colors';
import { ThemeProvider } from '@/theme/ThemeContext';
import { Text } from './Text';
import { ToastProvider, useToast } from './Toast';

const TEST_METRICS = {
  frame: { width: 320, height: 640, x: 0, y: 0 },
  insets: { left: 0, right: 0, top: 0, bottom: 0 },
};

/** The toast item's outer Animated.View is the only node with both a borderWidth and a paddingVertical set. */
function findToastContainer(root: any) {
  return root.queryAll((node: any) => {
    const style = node.props?.style;
    const flat = style && StyleSheet.flatten(style);
    return !!flat && flat.borderWidth === 1 && flat.paddingVertical === 12;
  })[0];
}

function Probe({ tone = 'success' as 'success' | 'error' | 'info' }) {
  const { show } = useToast();
  return (
    <Pressable testID="trigger" onPress={() => show('Hello there', tone)}>
      <Text>trigger</Text>
    </Pressable>
  );
}

async function renderToast(tone?: 'success' | 'error' | 'info') {
  await initI18n();
  await i18n.changeLanguage('en');
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={TEST_METRICS}>
          <ToastProvider>
            <Probe tone={tone} />
          </ToastProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe('ToastProvider', () => {
  test('show() renders the message text', async () => {
    jest.useFakeTimers();
    const { getByTestId, getByText } = await renderToast();
    await fireEvent.press(getByTestId('trigger'));
    expect(getByText('Hello there')).toBeTruthy();
  });

  test('keeps only the last 3 toasts when shown more than 3 times', async () => {
    jest.useFakeTimers();
    const { getByTestId, queryByText, queryAllByText } = await renderToast();
    const trigger = getByTestId('trigger');
    await fireEvent.press(trigger); // 1st — will be evicted
    await fireEvent.press(trigger);
    await fireEvent.press(trigger);
    await fireEvent.press(trigger); // 4th
    // All 4 calls used the same message text, so assert count rather than distinct content.
    expect(queryAllByText('Hello there')).toHaveLength(3);
  });

  test('auto-dismisses 3200ms after being shown', async () => {
    jest.useFakeTimers();
    const { getByTestId, queryByText } = await renderToast();
    await fireEvent.press(getByTestId('trigger'));
    expect(queryByText('Hello there')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(3200 + 200 + 50); // + the 200ms dismiss animation + margin
    });
    expect(queryByText('Hello there')).toBeNull();
  });

  test.each([
    ['success', '#F0FDF4', '#86EFAC'],
    ['error', '#FEF2F2', '#FCA5A5'],
  ] as const)('%s tone renders with its configured background/border colors', async (tone, bg, border) => {
    jest.useFakeTimers();
    const { getByTestId, root } = await renderToast(tone);
    await fireEvent.press(getByTestId('trigger'));
    const style = StyleSheet.flatten(findToastContainer(root!).props.style);
    expect(style.backgroundColor).toBe(bg);
    expect(style.borderColor).toBe(border);
  });

  test('info tone renders with the theme surface/border colors', async () => {
    jest.useFakeTimers();
    const { getByTestId, root } = await renderToast('info');
    await fireEvent.press(getByTestId('trigger'));
    const style = StyleSheet.flatten(findToastContainer(root!).props.style);
    expect(style.backgroundColor).toBe(lightTheme.bgSurface);
    expect(style.borderColor).toBe(lightTheme.border);
  });
});
