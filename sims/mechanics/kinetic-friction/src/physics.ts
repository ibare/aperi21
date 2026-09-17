// ========================================================================
// kinetic-friction — 순수 물리
// ========================================================================
// 등감속 운동의 닫힌 식. 두 상자는 감속도가 같고 처음 빠르기만 다르다.

import type { StageDef } from '@aperi21/schema';
import { DECEL, TICK_EVERY, V0_FAST, V0_SLOW } from './schema';
import type { KineticFrictionState } from './state';

export interface SlideConstants {
  /** 감속도 (m/s²). 두 상자가 같다 — 이것이 주장이다. */
  decel: number;
  /** 두 줄의 처음 빠르기 (m/s). 위 줄이 빠르다. */
  v0: readonly [number, number];
  /** 자리 눈금 간격 (s). */
  tickEvery: number;
}

export function readConstants(stage: StageDef): SlideConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    decel: c.decel ?? DECEL,
    v0: [c.v0Fast ?? V0_FAST, c.v0Slow ?? V0_SLOW],
    tickEvery: c.tickEvery ?? TICK_EVERY,
  };
}

export interface SlideReading {
  /** 출발선에서 간 거리 (m). */
  x: number;
  /** 지금 빠르기 (m/s). 멈추면 0. */
  v: number;
  /** 멈췄는가. */
  stopped: boolean;
  /** 멈추는 시각 (s). */
  tStop: number;
}

/** 주기 안 시각 `tc` 에서 처음 빠르기 `v0` 인 상자의 상태 (원본 laneAt). */
export function slideAt(v0: number, decel: number, tc: number): SlideReading {
  const tStop = v0 / decel;
  const s = Math.min(tc, tStop);
  return {
    x: v0 * s - 0.5 * decel * s * s,
    v: Math.max(0, v0 - decel * tc),
    stopped: tc >= tStop,
    tStop,
  };
}

/**
 * 1 초마다 상자 앞면이 있던 자리 (m). 지나간 정수 초만 — 멈춘 뒤에는 멈춘 시각까지.
 * 지난 눈금을 쌓지 않고 `tc` 에서 매번 다시 계산한다 (원본과 같다).
 */
export function tickPositions(v0: number, decel: number, tickEvery: number, tc: number): number[] {
  const tStop = v0 / decel;
  const until = Math.min(tc, tStop) + 1e-9;
  const out: number[] = [];
  for (let k = 0; k * tickEvery <= until; k++) out.push(slideAt(v0, decel, k * tickEvery).x);
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: KineticFrictionState }): KineticFrictionState {
  return params.state;
}
