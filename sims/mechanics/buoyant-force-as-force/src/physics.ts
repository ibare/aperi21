// ========================================================================
// buoyant-force-as-force — 순수 물리
// ========================================================================
// 손잡이 높이 → 평형(잠긴 깊이 · 각 힘 · 용수철 길이). 원본 `solve(s)` 를 그대로 옮겼다.
//
//   바닥 = 손잡이 + 원래 길이 + 늘어난 길이 + 물체 세로
//   늘어난 길이 ∝ 용수철이 당기는 힘 = 무게 − 물이 미는 힘
//   물이 미는 힘 ∝ 잠긴 깊이
//
// 잠긴 깊이와 늘어난 길이가 서로 얽혀 있어 고정점 반복으로 푼다. 누적이 없어 같은
// 손잡이 높이는 언제나 같은 평형이다. 힘은 무게를 1 로 둔 비율이다.
// ========================================================================

import { LOWER, PERIOD, PHYSICS } from './schema';
import type { BuoyantForceAsForceState } from './state';

export interface Equilibrium {
  /** 손잡이(용수철 윗끝) 높이. */
  readonly support: number;
  /** 잠긴 깊이. */
  readonly depth: number;
  /** 물이 미는 힘 / 무게. */
  readonly buoyancy: number;
  /** 용수철이 당기는 힘 / 무게. */
  readonly tension: number;
  /** 물체 윗면 높이. */
  readonly top: number;
}

export function solve(support: number): Equilibrium {
  const k = PHYSICS;
  let depth = 0;
  for (let i = 0; i < k.iterations; i++) {
    const tension = 1 - (k.beta * depth) / k.blockH;
    const bottom = support + k.restLength + k.extPerWeight * tension + k.blockH;
    depth = Math.max(0, Math.min(k.blockH, bottom - k.waterY));
  }
  const buoyancy = (k.beta * depth) / k.blockH;
  const tension = 1 - buoyancy;
  const top = support + k.restLength + k.extPerWeight * tension;
  return { support, depth, buoyancy, tension, top };
}

/** 내려간 정도(0 = 가장 높음, 1 = 가장 낮음) → 손잡이 높이. */
export function supportAt(lowered: number): number {
  return PHYSICS.supportTop + (PHYSICS.supportBottom - PHYSICS.supportTop) * lowered;
}

/**
 * 주기 안 시각 → 내려간 정도. **캡션 판정 전용**이다 — 그림은 `timeline.at('lower') −
 * at('raise')` 를 읽는다. 시간표의 `smooth` 이징(3x² − 2x³)과 같은 식이어야 캡션이 그림과
 * 한 걸음도 어긋나지 않는다 (NOTES.md 「어휘 부족」).
 */
function loweredAt(u: number): number {
  const smooth = (x: number): number => {
    const c = x < 0 ? 0 : x > 1 ? 1 : x;
    return c * c * (3 - 2 * c);
  };
  return smooth(u / LOWER) - smooth((u - LOWER) / (PERIOD - LOWER));
}

export function deriveFlags(u: number): BuoyantForceAsForceState {
  const wrapped = ((u % PERIOD) + PERIOD) % PERIOD;
  const { depth } = solve(supportAt(loweredAt(wrapped)));
  return {
    u: wrapped,
    out: depth <= PHYSICS.captionSlack,
    full: depth >= PHYSICS.blockH - PHYSICS.captionSlack,
  };
}

/** 쌓는 것은 캡션 판정용 시계뿐이다. */
export function step(params: { state: BuoyantForceAsForceState; dt: number }): BuoyantForceAsForceState {
  const { state, dt } = params;
  if (!(dt > 0)) return state;
  return deriveFlags(state.u + dt);
}
