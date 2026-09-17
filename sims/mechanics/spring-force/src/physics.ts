// ========================================================================
// spring-force — 순수 물리
// ========================================================================
// 탄성력 F = k·x. 힘의 축척을 "늘임 1칸의 힘 = 1칸 길이" 로 잡아 k 는 드러내지 않는다
// (수치는 문단의 몫). 쌓는 상태가 없다.
// ========================================================================

import type { SpringForceState } from './state';

/** 되돌리는 힘의 크기(칸 단위). 늘인 칸 수에 비례한다. */
export function restoringForce(stretch: number): number {
  return stretch;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: SpringForceState }): SpringForceState {
  return params.state;
}
