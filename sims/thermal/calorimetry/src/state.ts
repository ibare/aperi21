// ========================================================================
// calorimetry — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가 가리킬
// **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133) 스테이지
// 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface CalorimetryState {
  /** 처음 온도 · 가운데 · 두 차례의 멈춘 온도(℃)의 글자. */
  hotText: string;
  coldText: string;
  midText: string;
  finalAText: string;
  finalBText: string;
  /** 두 차례의 질량(g) 글자. */
  massHotAText: string;
  massColdAText: string;
  massHotBText: string;
  massColdBText: string;
}

export function initialState(params: { stage: StageDef }): CalorimetryState {
  const c = readConstants(params.stage);
  return {
    hotText: String(c.tHot),
    coldText: String(c.tCold),
    midText: String(c.tMid),
    finalAText: String(c.tFinalA),
    finalBText: String(c.tFinalB),
    massHotAText: String(c.mHotA),
    massColdAText: String(c.mColdA),
    massHotBText: String(c.mHotB),
    massColdBText: String(c.mColdB),
  };
}
