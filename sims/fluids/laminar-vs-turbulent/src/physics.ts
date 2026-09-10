// ========================================================================
// laminar-vs-turbulent — 순수 물리
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import {
  GROWTH_K,
  NU,
  PIPE_DIAMETER,
  RE_CRITICAL,
  RESUME_AFTER,
  SPEED_STOPS,
  STOP_HOLD,
  STOP_RAMP,
} from './schema';
import type { LaminarVsTurbulentState } from './state';

export interface LaminarConstants {
  nu: number;
  reCritical: number;
  diameter: number;
  /** 한 정박값에 머무는 시간(초). */
  stopHold: number;
  /** 다음 정박값으로 건너가는 시간(초). */
  stopRamp: number;
  /** 손을 뗀 뒤 자동 진행으로 돌아가기까지(초). */
  resumeAfter: number;
}

export function readConstants(stage: StageDef): LaminarConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    nu: c.nu ?? NU,
    reCritical: c.reCritical ?? RE_CRITICAL,
    diameter: c.diameter ?? PIPE_DIAMETER,
    stopHold: c.stopHold ?? STOP_HOLD,
    stopRamp: c.stopRamp ?? STOP_RAMP,
    resumeAfter: c.resumeAfter ?? RESUME_AFTER,
  };
}

/** 유속 → 레이놀즈 수의 역. 조작기의 범위를 눈금(Re)과 같은 자리로 맞출 때 쓴다. */
export function speedOf(re: number, c: Pick<LaminarConstants, 'nu' | 'diameter'>): number {
  return (re * c.nu) / c.diameter;
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

/**
 * 선언적 자동 시퀀스 — 정박값 목록을 머무는 시간과 보간 시간으로 훑는다.
 *
 * 마지막에서 첫 값으로 **내려오는** 것이 이 조각의 논증이다. 흐트러짐이
 * 시간이나 이력의 문제가 아니라 그 수의 문제임을 보인다.
 *
 * 엔진 시간표(`schema.timeline`)를 쓰지 않는 이유 — 손을 뗀 뒤 "가장 가까운 정박값"
 * 으로 돌아가려면 시퀀스 시계를 옮겨야 하는데, 시간표의 시계는 임베드의 시간 엔진이라
 * 조각이 옮길 수 없다. 그래서 시계를 상태(`t`)에 둔다.
 */
export function sequencedSpeed(t: number, c: LaminarConstants): number {
  const slotLength = c.stopHold + c.stopRamp;
  const cycle = SPEED_STOPS.length * slotLength;
  const phase = ((t % cycle) + cycle) % cycle;
  const slot = Math.floor(phase / slotLength);
  const within = phase - slot * slotLength;
  const from = SPEED_STOPS[slot % SPEED_STOPS.length]!;
  const to = SPEED_STOPS[(slot + 1) % SPEED_STOPS.length]!;
  if (within <= c.stopHold) return from;
  const u = (within - c.stopHold) / c.stopRamp;
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

/**
 * 손을 뗀 뒤 돌아갈 시퀀스 시각 — 지금 유속에 가장 가까운 정박값의 머묾이 시작하는 곳.
 * 거기서부터 자동 진행이 이어진다.
 */
export function resumeTime(v: number, c: LaminarConstants): number {
  let nearest = 0;
  SPEED_STOPS.forEach((s, i) => {
    if (Math.abs(s - v) < Math.abs(SPEED_STOPS[nearest]! - v)) nearest = i;
  });
  return nearest * (c.stopHold + c.stopRamp);
}

/**
 * 한 스텝.
 *
 * - 눈금을 잡고 있는 동안: 시퀀스가 멈추고, 유속은 조작기가 쓴 값 그대로다.
 * - 놓은 뒤 `resumeAfter` 동안: 그 값에 머문다. 독자가 결과를 볼 시간이다.
 * - 그 뒤: 가장 가까운 정박값으로 시퀀스 시계를 옮겨 자동 진행을 잇는다. 유속은
 *   목표를 감쇠 추종하므로 그 정박값으로 미끄러져 간다.
 */
export function step(params: {
  state: LaminarVsTurbulentState;
  dt: number;
  stage: StageDef;
}): LaminarVsTurbulentState {
  const { state, dt } = params;
  const c = readConstants(params.stage);
  if (state.held) return state.idle === 0 ? state : { ...state, idle: 0 };
  if (state.idle !== null) {
    const idle = state.idle + dt;
    if (idle < c.resumeAfter) return { ...state, idle };
    return { ...state, idle: null, t: resumeTime(state.v, c) };
  }
  const t = state.t + dt;
  const target = sequencedSpeed(t, c);
  const v = state.v + (target - state.v) * (1 - Math.exp(-dt / 0.18));
  return { ...state, t, v };
}
