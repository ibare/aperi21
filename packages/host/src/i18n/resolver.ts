import type { LocalizedText } from '@aperi21/schema';

/**
 * 호스트가 쓰는 확장 I18n 인터페이스. schema 의 최소 I18n 은 `currentLang`
 * 필드만 있지만, 호스트는 `format` 까지 제공한다. 차이는 Phase 2 에서 통일.
 */
export interface HostI18n {
  lang: string;
  resolve(text: LocalizedText): string;
  format(value: number, unit?: string): string;
}

/** 언어 토글에 따라 변경되는 사전. */
export type Dictionary = Record<string, Record<string, string>>;

export class I18nResolver implements HostI18n {
  constructor(
    public lang: string,
    private readonly dict: Dictionary = {},
  ) {}

  resolve(text: LocalizedText): string {
    if (typeof text === 'string') {
      if (text.startsWith('@i18n:')) {
        const key = text.slice(6);
        return this.dict[this.lang]?.[key] ?? this.dict['en']?.[key] ?? text;
      }
      return text;
    }
    return (
      text[this.lang] ??
      text['en'] ??
      Object.values(text)[0] ??
      ''
    );
  }

  format(value: number, unit?: string): string {
    const formatted = Intl.NumberFormat(this.lang, {
      maximumFractionDigits: 3,
    }).format(value);
    return unit ? `${formatted} ${unit}` : formatted;
  }
}
