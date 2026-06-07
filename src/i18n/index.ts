// App localization: device-locale detection + manual override persisted in
// the SQLite key-value store. Imported for its side effect at the app entry.

import { getLocales } from 'expo-localization';
import Storage from 'expo-sqlite/kv-store';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import es from './locales/es';
import pl from './locales/pl';
import ru from './locales/ru';
import uk from './locales/uk';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pl', label: 'Polski' },
  { code: 'ru', label: 'Русский' },
  { code: 'uk', label: 'Українська' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const STORAGE_KEY = 'language';

function isSupported(code: string | null | undefined): code is LanguageCode {
  return LANGUAGES.some((l) => l.code === code);
}

const saved = Storage.getItemSync(STORAGE_KEY);
const device = getLocales()[0]?.languageCode;
const initial: LanguageCode = isSupported(saved) ? saved : isSupported(device) ? device : 'en';

// eslint-disable-next-line import/no-named-as-default-member -- canonical i18next pattern
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    pl: { translation: pl },
    ru: { translation: ru },
    uk: { translation: uk },
  },
  lng: initial,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function setLanguage(code: LanguageCode) {
  Storage.setItemSync(STORAGE_KEY, code);
  // eslint-disable-next-line import/no-named-as-default-member -- canonical i18next pattern
  i18n.changeLanguage(code);
}

export default i18n;
