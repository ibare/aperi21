// ========================================================================
// mass-spectrometer — 상태
// ========================================================================
// 모든 움직임은 시간표 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 핵종 기호
// `{a}Ne` 의 `{a}` 에 끼울 **선언값의 글자** 뿐이다 — 스테이지 상수 `massLight` ·
// `massHeavy` 를 위첨자 숫자 글자로 옮긴다(`time-dilation` 선례, 장부 G133 우회).
// 표기만 바꾸고 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface MassSpectrometerState {
  /** 가벼운 · 무거운 이온의 질량수 — 위첨자 글자(`²⁰`). */
  massLightText: string;
  massHeavyText: string;
}

/** 숫자 글자 → 위첨자 글자. 표기 변환이다(자릿수를 바꾸지 않는다). */
const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';

function superscript(value: number): string {
  return [...String(value)].map((ch) => (ch >= '0' && ch <= '9' ? SUPERSCRIPT_DIGITS[Number(ch)] : ch)).join('');
}

export function initialState(params: { stage: StageDef }): MassSpectrometerState {
  const c = readConstants(params.stage);
  return {
    massLightText: superscript(c.massLight),
    massHeavyText: superscript(c.massHeavy),
  };
}
