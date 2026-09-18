// ========================================================================
// physical-pendulum — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 각은 시간표 주기 안 시각의 함수다.
//
//   관성 모멘트(핀 둘레)  I = M(L²/12 + d²)          (평행축 정리)
//   되돌리는 돌림힘       τ = −M g d sinθ
//   주기(작은 각)         T = 2π √((L²/12 + d²) / (g d))
//   각                    θ(s) = θ₀ cos(2π s / T)     (놓은 뒤 s 초)
//
// d 를 줄이면 분자(돌리기 어려움)가 줄어 빨라지다가, d 가 L/√12 보다 작아지면 분모
// (되돌리는 힘)가 더 빨리 줄어 다시 느려진다. d 와 L²/(12d) 는 주기가 같다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { GRAVITY, PIVOT_RATIOS, RELEASE_DEG, ROD_LENGTH } from './schema';
import type { PhysicalPendulumState } from './state';

export interface PhysicalPendulumConstants {
  rodLength: number;
  g: number;
  /** 놓는 각(라디안). */
  release: number;
  /** 핀에서 질량 중심까지의 거리(m), 왼쪽부터. */
  pivots: readonly number[];
}

export function readConstants(stage: StageDef): PhysicalPendulumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const L = c.rodLength ?? ROD_LENGTH;
  const ratios = [
    c.pivot1 ?? PIVOT_RATIOS[0],
    c.pivot2 ?? PIVOT_RATIOS[1],
    c.pivot3 ?? PIVOT_RATIOS[2],
    c.pivot4 ?? PIVOT_RATIOS[3],
  ];
  return {
    rodLength: L,
    g: c.g ?? GRAVITY,
    release: ((c.releaseDeg ?? RELEASE_DEG) * Math.PI) / 180,
    pivots: ratios.map((r) => r * L),
  };
}

/** 작은 각의 주기(초). */
export function period(L: number, d: number, g: number): number {
  return 2 * Math.PI * Math.sqrt((L * L) / 12 + d * d) / Math.sqrt(g * d);
}

export interface RodReading {
  /** 핀에서 질량 중심까지(m). */
  d: number;
  /** 주기(초). */
  period: number;
  /** 지금 각(라디안, 연직 아래에서 반시계). */
  theta: number;
  /** 놓은 자리로 돌아온 횟수 — 다 흔든 번 수. */
  swings: number;
  /** 가장 최근에 돌아온 뒤 흐른 시간(초). 한 번도 안 돌아왔으면 없다. */
  sinceReturn?: number;
}

export interface Reading {
  /** 놓은 뒤 흐른 시간(초). */
  swingTime: number;
  rods: RodReading[];
  /** 물러나며 옅어지는 정도(1 이면 또렷하다). */
  opacity: number;
}

/**
 * 시간표 → 화면에 놓을 값들. 같은 시각은 언제나 같은 값이다.
 *
 * `hold` 단계 동안은 놓는 각에 붙잡혀 있고, 그 단계가 끝나는 순간 넷을 함께 놓는다.
 * 그 뒤로 흔들림은 단계와 무관하게 이어진다 — 단계는 캡션만 바꾼다.
 */
export function derive(tl: TimelineFrame, c: PhysicalPendulumConstants): Reading {
  const s = Math.max(0, tl.u - tl.end('hold'));
  const rods = c.pivots.map((d): RodReading => {
    const T = period(c.rodLength, d, c.g);
    const swings = Math.floor(s / T);
    return {
      d,
      period: T,
      theta: c.release * Math.cos((2 * Math.PI * s) / T),
      swings,
      sinceReturn: swings > 0 ? s - swings * T : undefined,
    };
  });
  return { swingTime: s, rods, opacity: 1 - tl.at('fade') };
}

/** 쌓는 상태가 없다 — 모든 것이 시간표 시각의 함수다 (S-sim 「상태가 시계뿐인 조각」). */
export function step(params: { state: PhysicalPendulumState }): PhysicalPendulumState {
  return params.state;
}
