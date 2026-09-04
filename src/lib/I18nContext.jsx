import { createContext, useContext, useMemo } from 'react';
import { useSettings } from '@/lib/SettingsContext';
import { translate, DATE_LOCALES } from '@/lib/i18n';

const fallback = {
  lang: 'en',
  t: (key, params) => translate('en', key, params),
  dateLocale: DATE_LOCALES.en,
};
const I18nContext = createContext(fallback);

export function I18nProvider({ children }) {
  const { settings } = useSettings();
  const lang = settings.language || 'en';
  const value = useMemo(() => ({
    lang,
    t: (key, params) => translate(lang, key, params),
    dateLocale: DATE_LOCALES[lang] || DATE_LOCALES.en,
  }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}