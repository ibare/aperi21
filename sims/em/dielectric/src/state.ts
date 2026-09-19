// ========================================================================
// dielectric — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface DielectricState {
  /** 유전율(`kappa`)의 글자 — 캡션 「{k}분의 1」. */
  kappa: string;
}

export function initialState(params: { stage: StageDef }): DielectricState {
  const c = readConstants(params.stage);
  return { kappa: String(c.kappa) };
}
