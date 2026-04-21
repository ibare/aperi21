/*
 * i18n 인프라 — 웹사이트 UI 자체는 한국어 고정 (이번 단계)
 *
 * 향후 시각화 컴포넌트(@aperi21/*)가 useTranslation() 훅으로
 * 다국어 키에 접근할 수 있도록 기반만 마련한다.
 *
 * en.json 에는 예시 키만 몇 개 정의해두었으며, 실제 시각화 번역은
 * 각 시각화 패키지가 추가될 때 확장한다.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './ko.json';
import en from './en.json';

export const DEFAULT_LOCALE = 'ko' as const;
export type Locale = 'ko' | 'en';

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
