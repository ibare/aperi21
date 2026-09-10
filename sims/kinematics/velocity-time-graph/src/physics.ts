// ========================================================================
// velocity-time-graph — 순수 물리 · 떼어 옮기는 계산
// ========================================================================
// 모든 것이 주기 안 시각 u 의 함수다. 쌓아 둘 것이 없다 — 같은 u 는 같은 화면이다.
// 시각과 단계는 엔진이 시간표 선언(`schema.timeline`)에서 준다.
// ========================================================================

import { KNOTS, STAGGER, SUB, T_END } from './schema';
import type { VelocityTimeGraphState } from './state';

/** 꺾은선 속도 v(t) (m/s). */
export function velocity(t: number): number {
  if (t <= 0) return KNOTS[0]![1];
  for (let i = 1; i < KNOTS.length; i++) {
    const a = KNOTS[i - 1]!;
    const b = KNOTS[i]!;
    if (t <= b[0]) return a[1] + ((b[1] - a[1]) * (t - a[0])) / (b[0] - a[0]);
  }
  return KNOTS[KNOTS.length - 1]![1];
}

/**
 * 간 거리 x(t) (m). 꺾은선 아래 사다리꼴을 **정확히** 더한다 — dt 누적 적분이면
 * 오차가 말뚝과 띠 끝을 어긋나게 해 "꼭 맞는다" 가 "대충 맞는다" 가 된다.
 */
export function distance(t: number): number {
  let s = 0;
  for (let i = 1; i < KNOTS.length; i++) {
    const a = KNOTS[i - 1]!;
    const b = KNOTS[i]!;
    if (t <= a[0]) break;
    const te = Math.min(t, b[0]);
    s += ((a[1] + velocity(te)) / 2) * (te - a[0]);
  }
  return s;
}

/** 운동 전체의 간 거리 (30.75 m). 길의 길이다. */
export const TOTAL_DISTANCE = distance(T_END);

export function clamp01(u: number): number {
  return u < 0 ? 0 : u > 1 ? 1 : u;
}

/**
 * 기둥 i(1..9)의 띠 j 가 얼마나 날아갔는가 (0..1). 기둥 i 는 u = i 에 떠나
 * `flight` 초 동안 난다.
 */
export function stripProgress(i: number, j: number, u: number, flight: number): number {
  return clamp01((u - i - (STAGGER * j) / (SUB - 1)) / flight);
}

/** 지금까지 길에 내려앉은 끝 — 운동 시각으로. */
export function landedUntil(u: number, flight: number): number {
  let edge = 0;
  for (let i = 1; i <= T_END; i++) {
    if (u < i) break;
    let n = 0;
    for (let j = 0; j < SUB; j++) {
      if (stripProgress(i, j, u, flight) >= 1) n++;
      else break;
    }
    edge = i - 1 + n / SUB;
    if (n < SUB) break;
  }
  return edge;
}

/** 쌓는 상태가 없다 — 모든 것이 주기 안 시각의 함수다. */
export function step(params: { state: VelocityTimeGraphState }): VelocityTimeGraphState {
  return params.state;
}
