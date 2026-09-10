/**
 * 글자 재료 — 프리미티브 구현이 쓴다. 조각은 이것을 모른다.
 *
 * `tasks/engine-requirements/REQUIREMENTS.md` §4.2.
 */

import type { LocalizedText, RenderContext } from '@aperi21/schema';

/** `{name}` 자리에 값을 끼운다. 없는 이름은 그대로 둔다. */
export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}

/** 선언의 문안을 해석하고 값을 끼운다 (C1 3층 조회의 1층). */
export function resolveText(
  rc: RenderContext,
  text: LocalizedText | undefined,
  vars?: Record<string, string | number>,
): string {
  if (!text) return '';
  return interpolate(rc.i18n.resolve(text), vars);
}

/**
 * 주어진 폭에 담기는 글자 크기.
 *
 * **넘치면 자리를 넓히지 않고 글자를 줄인다** — 임베드 높이는 마운트 뒤 바뀌지
 * 않으므로 줄바꿈으로 밀어낼 수 없다 (원칙 6).
 */
export function fitFontSize(
  rc: RenderContext,
  text: string,
  available: number,
  preferred: number,
  minimum: number,
): number {
  const natural = rc.measure.textWidth(text, preferred);
  if (natural <= available) return preferred;
  return Math.max(minimum, (preferred * available) / natural);
}

/**
 * 정박값 포매터.
 *
 * 선언된 값에 충분히 가까우면 **그 값의 문자열을 쓴다.** 계산값을 그대로 반올림하면
 * `0.1155 × 0.020 / 1.004e-6 = 2300.8` 이 `2301` 이 되어, 화면이 표에 없는 수를
 * 말하게 된다. 유효숫자는 주장의 일부다.
 */
export function formatAnchored(
  value: number,
  digits: number,
  anchors?: readonly number[],
): string {
  if (anchors) {
    const tolerance = Math.pow(10, -digits) * 5;
    for (const a of anchors) {
      if (Math.abs(value - a) <= Math.max(tolerance, Math.abs(a) * 1e-3)) {
        return a.toFixed(digits);
      }
    }
  }
  return value.toFixed(digits);
}
