// ========================================================================
// connected-bodies — 순수 물리
// ========================================================================
// 마찰 없는 바닥에서 질량 합이 M 인 계를 힘 F 로 끈다. 끈이 팽팽하고 늘지 않으므로
// 계 전체가 한 가속도 a = F / M 로 움직인다 — 나누는 방식과 무관하다. 쌓는 상태가 없다.
// ========================================================================

import type { ConnectedBodiesState } from './state';

/** 계의 가속도. 질량을 어떻게 나눴는지는 들어오지 않는다 — 합만 들어온다. */
export function acceleration(force: number, masses: readonly number[]): number {
  const total = masses.reduce((a, b) => a + b, 0);
  return force / total;
}

/** 출발점에서 간 거리. x = ½·a·τ². */
export function distance(acc: number, tau: number): number {
  return 0.5 * acc * tau * tau;
}

/** 지금까지 남긴 눈금 간격의 수. 경계에서 부동소수 오차로 하나 모자라지 않게 한다. */
export function strobeCount(tau: number, interval: number): number {
  return Math.floor(tau / interval + 1e-9);
}

/** 쌓는 상태가 없다 — 모든 것이 달린 시간의 함수다. */
export function step(params: { state: ConnectedBodiesState }): ConnectedBodiesState {
  return params.state;
}
