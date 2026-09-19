// ========================================================================
// kirchhoffs-current-law — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface KirchhoffsCurrentLawState {
  /** 아래 가지의 처음 저항 · 바꾼 저항(Ω) — 선언값 그대로의 글자. */
  r3a: string;
  r3b: string;
}

export function initialState(params: { stage: StageDef }): KirchhoffsCurrentLawState {
  const c = readConstants(params.stage);
  return { r3a: String(c.r3a), r3b: String(c.r3b) };
}
