import { StyleSheet } from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import ar from '@/i18n/locales/ar.json';
import { CitySheet } from './CitySheet';

/**
 * CitySheet's header row, search box, and every city row all share the same
 * `row` style object reference (flexDirection: row/row-reverse per
 * isRTL) — so a generic "find any row-reverse node" query matches many
 * unrelated rows. This walks the rendered JSON tree for the innermost `View`
 * that both contains the given text and carries a row/row-reverse
 * flexDirection, which lands on the specific city option's own Pressable.
 */
function findRowContaining(node: any, text: string): any {
  if (!node || typeof node === 'string') return null;
  const childTexts: string[] = [];
  (function collect(n: any) {
    if (typeof n === 'string') {
      childTexts.push(n);
      return;
    }
    (n.children || []).forEach(collect);
  })(node);

  const style = node.props?.style ? StyleSheet.flatten(node.props.style) : null;
  const isRow = style && (style.flexDirection === 'row' || style.flexDirection === 'row-reverse');
  if (childTexts.includes(text) && isRow && node.type === 'View') {
    for (const child of node.children || []) {
      const nested = findRowContaining(child, text);
      if (nested) return nested;
    }
    return node;
  }
  for (const child of node.children || []) {
    const found = findRowContaining(child, text);
    if (found) return found;
  }
  return null;
}

describe('CitySheet', () => {
  test('visible=false renders nothing', async () => {
    const { toJSON } = await renderWithProviders(
      <CitySheet visible={false} onSelect={() => {}} onClose={() => {}} />
    );
    expect(toJSON()).toBeNull();
  });

  test('visible=true renders every real city plus "all cities", each with its translated label', async () => {
    const { queryByText } = await renderWithProviders(
      <CitySheet visible={true} onSelect={() => {}} onClose={() => {}} />
    );
    expect(queryByText(en.cities.all)).toBeTruthy();
    expect(queryByText(en.cities.riyadh)).toBeTruthy();
    expect(queryByText(en.cities.jeddah)).toBeTruthy();
  });

  test('typing in the search field filters the list; clearing restores it', async () => {
    const { getByPlaceholderText, queryByText } = await renderWithProviders(
      <CitySheet visible={true} onSelect={() => {}} onClose={() => {}} />
    );
    const search = getByPlaceholderText(en.discover.searchCities);

    await fireEvent.changeText(search, 'xyz-no-match');
    expect(queryByText(en.discover.noCitiesFound)).toBeTruthy();
    expect(queryByText(en.cities.riyadh)).toBeNull();

    await fireEvent.changeText(search, '');
    expect(queryByText(en.cities.riyadh)).toBeTruthy();
    expect(queryByText(en.discover.noCitiesFound)).toBeNull();
  });

  test('pressing a city calls onSelect with its key', async () => {
    const onSelect = jest.fn();
    const { getByText } = await renderWithProviders(
      <CitySheet visible={true} onSelect={onSelect} onClose={() => {}} />
    );
    await fireEvent.press(getByText(en.cities.riyadh));
    expect(onSelect).toHaveBeenCalledWith('riyadh');
  });

  test('pressing "all cities" calls onSelect with undefined', async () => {
    const onSelect = jest.fn();
    const { getByText } = await renderWithProviders(
      <CitySheet visible={true} onSelect={onSelect} onClose={() => {}} />
    );
    await fireEvent.press(getByText(en.cities.all));
    expect(onSelect).toHaveBeenCalledWith(undefined);
  });

  test('LTR: the Riyadh row resolves flexDirection row; RTL: row-reverse', async () => {
    const ltr = await renderWithProviders(<CitySheet visible={true} onSelect={() => {}} onClose={() => {}} />, {
      lang: 'en',
    });
    const ltrRow = findRowContaining(ltr.toJSON(), en.cities.riyadh);
    expect(StyleSheet.flatten(ltrRow.props.style).flexDirection).toBe('row');

    const rtl = await renderWithProviders(<CitySheet visible={true} onSelect={() => {}} onClose={() => {}} />, {
      lang: 'ar',
    });
    const rtlRow = findRowContaining(rtl.toJSON(), ar.cities.riyadh);
    expect(StyleSheet.flatten(rtlRow.props.style).flexDirection).toBe('row-reverse');
  });
});
