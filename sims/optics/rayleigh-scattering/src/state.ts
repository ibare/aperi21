// ========================================================================
// rayleigh-scattering — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface RayleighScatteringState {
  /** 파랑 · 빨강 파장(nm) 글자. */
  blueNm: string;
  redNm: string;
  /** 파랑이 더 흩어지는 배수의 정박값 글자. */
  blueRatio: string;
}

export function initialState(params: { stage: StageDef }): RayleighScatteringState {
  const c = readConstants(params.stage);
  return {
    blueNm: String(c.lambdaBlue),
    redNm: String(c.lambdaRed),
    blueRatio: String(c.blueRatio),
  };
}
