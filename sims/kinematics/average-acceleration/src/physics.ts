// ========================================================================
// average-acceleration — 순수 물리
// ========================================================================
// 모든 것이 운동 시각 s(0 ~ RUN)의 해석식이다. 쌓는 상태가 없다.
// ========================================================================

import { DIP, RUN, V0, V1 } from './schema';
import type { AverageAccelerationState } from './state';

/** 0 ~ RUN 동안의 평균 가속도(m/s²). 두 차 공통 — 2. */
export const A_AVG = (V1 - V0) / RUN;

/** 차 가: 고르게 가속. */
export function velocityA(s: number): number {
  return V0 + A_AVG * s;
}
export function positionA(s: number): number {
  return V0 * s + 0.5 * A_AVG * s * s;
}

/** 차 나: 늦췄다가 몰아서 가속 — 처음(10)과 끝(20) 속도는 차 가와 같다. */
export function velocityB(s: number): number {
  return V0 + A_AVG * s + DIP * Math.sin((Math.PI * s) / RUN);
}
export function positionB(s: number): number {
  return (
    V0 * s +
    0.5 * A_AVG * s * s +
    DIP * (RUN / Math.PI) * (1 - Math.cos((Math.PI * s) / RUN))
  );
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: AverageAccelerationState }): AverageAccelerationState {
  return params.state;
}
