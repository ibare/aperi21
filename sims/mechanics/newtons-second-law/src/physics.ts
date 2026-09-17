// ========================================================================
// newtons-second-law — 순수 물리
// ========================================================================
// 질량 1 인 수레를 일정한 힘 F 로 τ 초 민다. 가속도 = F. 쌓는 상태가 없다.
// ========================================================================

import type { NewtonsSecondLawState } from './state';

/** 출발선에서 간 거리. x = ½·F·τ². */
export function distance(force: number, tau: number): number {
  return 0.5 * force * tau * tau;
}

/** 속도. v = F·τ. */
export function velocity(force: number, tau: number): number {
  return force * tau;
}

/** 지난 정수 초의 수. 경계에서 부동소수 오차로 한 칸 모자라지 않게 한다. */
export function fullSeconds(tau: number): number {
  return Math.floor(tau + 1e-9);
}

/** 쌓는 상태가 없다 — 모든 것이 밀어 준 시간의 함수다. */
export function step(params: { state: NewtonsSecondLawState }): NewtonsSecondLawState {
  return params.state;
}
