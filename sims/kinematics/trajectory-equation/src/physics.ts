// ========================================================================
// trajectory-equation — 순수 물리
// ========================================================================

import type { TimelineFrame, Vec2 } from '@aperi21/schema';
import { ERASE_FADE_M, G, RANGE, T_FLIGHT, TICK, VX, VY } from './schema';
import type { TrajectoryEquationState } from './state';

/** 매개 표현 — 시각 s 에 공이 있는 자리 (x(s), y(s)). */
export function posAt(s: number): Vec2 {
  return [VX * s, VY * s - 0.5 * G * s * s];
}

/** 시각 눈금이 놓이는 시각들. 0 부터 TICK 간격으로 착지 전까지. */
export const TICK_TIMES: readonly number[] = (() => {
  const out: number[] = [];
  for (let k = 0; k * TICK <= T_FLIGHT + 1e-9; k++) out.push(k * TICK);
  return out;
})();

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** 공이 지금까지 날아간 시간(초). 착지 뒤에는 떠 있던 시간에 머문다. */
export function flown(tl: TimelineFrame): number {
  return tl.at('fly') * tl.duration('fly');
}

/**
 * 지우개의 x(m). 지나가기 전에는 경로 왼쪽 밖, 지나간 뒤에는 오른쪽 밖이다.
 * 원본 `eraserX` 의 진행도를 시간표 `erase` 단계가 준다.
 */
export function eraserX(tl: TimelineFrame): number {
  return -ERASE_FADE_M + tl.at('erase') * (RANGE + 2 * ERASE_FADE_M);
}

/** 지우개가 화면에 있는가 — 쓸고 지나가는 단계 동안만. */
export function eraserVisible(tl: TimelineFrame): boolean {
  return tl.phase === 'erase';
}

/** 눈금 하나의 세기. 지우개가 지나간 뒤 ERASE_FADE_M 에 걸쳐 투명해진다. */
export function tickAlpha(x: number, ex: number): number {
  return clamp01((x - ex) / ERASE_FADE_M + 1);
}

/** 경로의 세기. `fade` 단계에서 흐려지고 `rest` 에서는 비어 있다. */
export function pathAlpha(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 공의 세기. 착지 뒤 `land` 동안 옅어져 지우기 전에 퇴장한다. */
export function ballAlpha(tl: TimelineFrame): number {
  return 1 - tl.at('land');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: TrajectoryEquationState }): TrajectoryEquationState {
  return params.state;
}
