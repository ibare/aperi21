// ========================================================================
// direction-of-acceleration — 순수 물리
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { ACCEL, STROBE, V0 } from './schema';
import type { DirectionOfAccelerationState } from './state';

export interface MotionConstants {
  /** 초속도(m/s). */
  v0: number;
  /** 가속도 크기(m/s²). */
  a: number;
  /** 자취 간격(초). */
  strobe: number;
}

export function readConstants(stage: StageDef): MotionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return { v0: c.v0 ?? V0, a: c.a ?? ACCEL, strobe: c.strobe ?? STROBE };
}

/** 반대쪽 공이 멈추는 시각(초). 이 조각은 여기서 끊는다 — 되돌아오는 운동은 다른 주장이다. */
export function stopTime(c: MotionConstants): number {
  return c.v0 / c.a;
}

/** 주기 안 시각 → 운동 시각. 멈춘 뒤에는 멈춘 순간에 머문다. */
export function runTime(c: MotionConstants, u: number): number {
  return Math.min(Math.max(0, u), stopTime(c));
}

/** 출발선에서 간 거리(m). sign 은 가속도의 방향(+1 같은 쪽, −1 반대쪽). */
export function position(c: MotionConstants, sign: number, s: number): number {
  return c.v0 * s + 0.5 * sign * c.a * s * s;
}

/** 순간 속도(m/s). */
export function velocity(c: MotionConstants, sign: number, s: number): number {
  return c.v0 + sign * c.a * s;
}

/** 같은 쪽 공이 멈춤 시각까지 간 거리(m) — 트랙 끝. 축척의 기준이다. */
export function maxDistance(c: MotionConstants): number {
  return position(c, 1, stopTime(c));
}

/** 같은 쪽 공의 최대 속도(m/s) — 가장 긴 속도 화살표. */
export function maxVelocity(c: MotionConstants): number {
  return velocity(c, 1, stopTime(c));
}

/** 0 부터 s 까지 자취 간격마다 찍힌 거리들. */
export function strobeDistances(c: MotionConstants, sign: number, s: number): number[] {
  const out: number[] = [];
  for (let k = 0; k * c.strobe <= s + 1e-9; k++) out.push(position(c, sign, k * c.strobe));
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: DirectionOfAccelerationState }): DirectionOfAccelerationState {
  return params.state;
}
