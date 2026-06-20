'use client';

import { useTranslation } from 'react-i18next';

import { isRTLLanguage } from './index';

export function useIsRTL() {
  const { i18n } = useTranslation();
  return isRTLLanguage(i18n.language);
}
