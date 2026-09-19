// ========================================================================
// heat-engine — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가 가리킬
// **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133) 스테이지
// 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface HeatEngineState {
  /** 한 바퀴에 받는 열 · 내놓는 일 · 버리는 열 — 선언값 그대로의 글자. */
  qHot: string;
  work: string;
  qCold: string;
}

export function initialState(params: { stage: StageDef }): HeatEngineState {
  const c = readConstants(params.stage);
  return { qHot: String(c.qHot), work: String(c.work), qCold: String(c.qCold) };
}
