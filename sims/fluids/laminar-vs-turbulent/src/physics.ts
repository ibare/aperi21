// ========================================================================
// laminar-vs-turbulent — 순수 물리
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import {
  GROWTH_K,
  NU,
  PIPE_DIAMETER,
  RE_CRITICAL,
  SPEED_STOPS,
  STOP_HOLD,
  STOP_RAMP,
} from './schema';
import type { LaminarVsTurbulentState } from './state';

export interface LaminarConstants {
  nu: number;
  reCritical: number;
  diameter: number;
}

export function readConstants(stage: StageDef): LaminarConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    nu: c.nu ?? NU,
    reCritical: c.reCritical ?? RE_CRITICAL,
    diameter: c.diameter ?? PIPE_DIAMETER,
  };
}

/** 레이놀즈 수. */
export function reynolds(v: number, c: LaminarConstants): number {
  return (v * c.diameter) / c.nu;
}

/**
 * 교란 성장률 σ.
 *
 *   Re < 2300 → 음수 (점성이 지운다)
 *   Re = 2300 → 0    (줄지도 늘지도 않는다)
 *   Re > 2300 → 양수 (스스로 커진다)
 */
export function growthRate(re: number, c: LaminarConstants): number {
  return GROWTH_K * (re / c.reCritical - 1);
}

/** 한 주기의 길이(초). 여섯 값을 훑고 첫 값으로 돌아온다. */
const CYCLE = SPEED_STOPS.length * (STOP_HOLD + STOP_RAMP);

/**
 * 선언적 자동 시퀀스 — 정박값 목록을 머무는 시간과 보간 시간으로 훑는다.
 *
 * 마지막에서 첫 값으로 **내려오는** 것이 이 조각의 논증이다. 흐트러짐이
 * 시간이나 이력의 문제가 아니라 그 수의 문제임을 보인다.
 */
export function sequencedSpeed(t: number): number {
  const phase = ((t % CYCLE) + CYCLE) % CYCLE;
  const slot = Math.floor(phase / (STOP_HOLD + STOP_RAMP));
  const within = phase - slot * (STOP_HOLD + STOP_RAMP);
  const from = SPEED_STOPS[slot % SPEED_STOPS.length]!;
  const to = SPEED_STOPS[(slot + 1) % SPEED_STOPS.length]!;
  if (within <= STOP_HOLD) return from;
  const u = (within - STOP_HOLD) / STOP_RAMP;
  // 부드럽게 건너간다. 입력이 매끄러워야 출력의 갑작스러움이 갑작스러워 보인다.
  const eased = u * u * (3 - 2 * u);
  return from + (to - from) * eased;
}

/**
 * 정박값 포매터.
 *
 * `0.1155 × 0.020 / 1.004e-6 = 2300.8` 은 반올림하면 **2301** 이 되어 표를
 * 배신한다. 선언된 값에 충분히 가까우면 그 값의 문자열을 쓴다.
 */
export function formatReynolds(re: number, c: LaminarConstants): string {
  if (Math.abs(re - c.reCritical) < 6) return String(c.reCritical);
  return String(Math.round(re));
}

/** 시간과 유속을 전진시킨다. 유속은 목표를 감쇠 추종한다. */
export function step(params: {
  state: LaminarVsTurbulentState;
  dt: number;
}): LaminarVsTurbulentState {
  const { state, dt } = params;
  const t = state.t + dt;
  const target = sequencedSpeed(t);
  const v = state.v + (target - state.v) * (1 - Math.exp(-dt / 0.18));
  return { t, v };
}
