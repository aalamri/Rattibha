import { useTranslation } from 'react-i18next';
import { isRTLLanguage } from './index';

/** Logical RTL flag driven by the active language — updates instantly on language change. */
export function useIsRTL() {
  const { i18n } = useTranslation();
  return isRTLLanguage(i18n.language);
}
