// ========================================================================
// rl-circuit — 순수 물리
// ========================================================================
// 스위치 날이 닿는 순간(`close` 단계가 끝나는 순간)을 s = 0 으로 두면
//   I(s)   = (ε / R) · (1 − e^(−s/τ)),   τ = L / R
//   V_R(s) = I · R      — 저항에 걸린 전압. 전류와 함께 찬다
//   V_L(s) = ε − V_R    — 코일이 맡은 몫. 닿는 순간 ε 전부, 전류가 차는 만큼 준다
// 닿기 전에는 고리가 끊겨 있어 전류도 두 몫도 0 이다.
//
// 모든 것이 시각의 함수라 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { ARROW_SCALE, EMF, INDUCTANCE, INDUCTANCE_LARGE, RESISTANCE, VOLT_SCALE } from './schema';
import type { RlCircuitState } from './state';

export interface RlCircuitConstants {
  emf: number;
  resistance: number;
  inductance: number;
  inductanceLarge: number;
  voltScale: number;
  arrowScale: number;
}

export function readConstants(stage: StageDef): RlCircuitConstants {
  const c = stage.constants ?? {};
  return {
    emf: c.emf ?? EMF,
    resistance: c.resistance ?? RESISTANCE,
    inductance: c.inductance ?? INDUCTANCE,
    inductanceLarge: c.inductanceLarge ?? INDUCTANCE_LARGE,
    voltScale: c.voltScale ?? VOLT_SCALE,
    arrowScale: c.arrowScale ?? ARROW_SCALE,
  };
}

/** 고른 코일의 인덕턴스(H). */
export function inductanceOf(state: RlCircuitState, c: RlCircuitConstants): number {
  return state.coil === 'large' ? c.inductanceLarge : c.inductance;
}

/** 다 찬 전류(A) = 전지 전압 ÷ 저항. */
export function fullCurrent(c: RlCircuitConstants): number {
  return c.emf / c.resistance;
}

/** 날이 닿는 순간 — 주기 안 시각. `close` 단계가 끝나는 때다. */
export function contactTime(tl: TimelineFrame): number {
  return tl.end('close');
}

export interface RlCircuitReading {
  /** 고리가 닫혀 있는가 (날이 닿은 뒤). */
  closed: boolean;
  /** 전류(A). */
  current: number;
  /** 저항에 걸린 전압(V). */
  resistorVolt: number;
  /** 코일이 맡은 전압(V). */
  coilVolt: number;
}

/** 주기 안 시각 u 의 전류와 두 전압. */
export function readingAt(
  u: number,
  tl: TimelineFrame,
  state: RlCircuitState,
  c: RlCircuitConstants,
): RlCircuitReading {
  const s = u - contactTime(tl);
  if (s < 0) return { closed: false, current: 0, resistorVolt: 0, coilVolt: 0 };
  const tau = inductanceOf(state, c) / c.resistance;
  const current = fullCurrent(c) * (1 - Math.exp(-s / tau));
  const resistorVolt = current * c.resistance;
  return { closed: true, current, resistorVolt, coilVolt: c.emf - resistorVolt };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. 고른 코일은 칩이 적는다. */
export function step(params: { state: RlCircuitState }): RlCircuitState {
  return params.state;
}
