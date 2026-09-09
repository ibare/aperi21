import type { LocalizedText } from '@aperi21/schema';

/**
 * 호스트가 쓰는 확장 I18n 인터페이스. schema 의 최소 I18n 은 `currentLang`
 * 필드만 있지만, 호스트는 `format` 까지 제공한다. 차이는 Phase 2 에서 통일.
 */
export interface HostI18n {
  lang: string;
  resolve(text: LocalizedText): string;
  format(value: number, unit?: string): string;

  /**
   * 화면 문자 조회. 3층 순서로 찾는다 (C1).
   *
   * ```
   * 1. 선언의 messages[key]   저작자가 정한 문안   ← 언제나 이김
   * 2. locale 번들[key]        호스트가 주입
   * 3. en 원본                 호출부 리터럴 fallback
   * ```
   *
   * 3층이 반드시 있으므로 번역이 하나도 없고 저작자가 아무것도 쓰지 않아도 화면은
   * en 으로 온전히 동작한다.
   *
   * **en 원본은 호출부에 리터럴로 둔다.** 상수나 변수로 빼면 추출 대상에서 누락된다.
   * 값 삽입은 `{name}` 플레이스홀더 + `vars` 로 한다 — 이어붙이면 어순이 다른
   * 언어에서 문장이 깨진다.
   */
  t(key: string, en: string, vars?: Record<string, string | number>): string;

  /**
   * 저작자 문안(1층)을 얹은 조회기를 만든다.
   *
   * **러너가 이것을 한 번만 만들어** 렌더러와 임베드 UI 양쪽에 같은 것을 넘긴다.
   * 각자 만들면 저작자 오버라이드 적용 여부가 갈려 한 화면에서 문안 출처가 섞인다.
   */
  withMessages(messages?: Record<string, LocalizedText>): HostI18n;
}

/** `{name}` 플레이스홀더 치환. */
function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}

/** 언어 토글에 따라 변경되는 사전. */
export type Dictionary = Record<string, Record<string, string>>;

export class I18nResolver implements HostI18n {
  constructor(
    public lang: string,
    private readonly dict: Dictionary = {},
    /** 1층 — 선언에서 온 저작자 문안. */
    private readonly overrides: Record<string, LocalizedText> = {},
  ) {}

  t(key: string, en: string, vars?: Record<string, string | number>): string {
    const authored = this.overrides[key];
    if (authored !== undefined) return interpolate(this.resolve(authored), vars);
    const bundled = this.dict[this.lang]?.[key] ?? this.dict['en']?.[key];
    return interpolate(bundled ?? en, vars);
  }

  withMessages(messages?: Record<string, LocalizedText>): HostI18n {
    if (!messages) return this;
    return new I18nResolver(this.lang, this.dict, { ...this.overrides, ...messages });
  }

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
