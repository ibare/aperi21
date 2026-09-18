// ========================================================================
// time-dilation — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface TimeDilationState {
  /** 줄 옆을 지나는 동안 정지 시계가 째깍인 수 = 정지 시계 개수 − 1. */
  restTicks: string;
  /** 그동안 지나가는 시계가 째깍인 수 = 정지 째깍 수 × gammaDen / gammaNum. */
  movingTicks: string;
  /** 선언한 γ 의 분자 · 분모. */
  gammaNum: string;
  gammaDen: string;
}

export function initialState(params: { stage: StageDef }): TimeDilationState {
  const c = readConstants(params.stage);
  const rest = c.restClocks - 1;
  return {
    restTicks: String(rest),
    movingTicks: String((rest * c.gammaDen) / c.gammaNum),
    gammaNum: String(c.gammaNum),
    gammaDen: String(c.gammaDen),
  };
}
