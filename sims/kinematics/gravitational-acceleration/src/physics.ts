// ========================================================================
// gravitational-acceleration — 순수 물리
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { G, SAMPLE_DT, V0 } from './schema';
import type { GravitationalAccelerationState } from './state';

/** 칸 경계의 부동소수 여유 — 0.6/0.2 가 2.9999… 로 떨어지는 것을 막는다. */
const SAMPLE_EPS = 1e-6;

export interface GravitationalAccelerationConstants {
  g: number;
  v0: number;
}

export function readConstants(stage: StageDef): GravitationalAccelerationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return { g: c.g ?? G, v0: c.v0 ?? V0 };
}

/** 체공 시간(s). */
export function flightTime(c: GravitationalAccelerationConstants): number {
  return (2 * c.v0) / c.g;
}

/** 순간 속도(m/s, 위가 +). */
export function velocityAt(c: GravitationalAccelerationConstants, s: number): number {
  return c.v0 - c.g * s;
}

/** 높이(m). */
export function heightAt(c: GravitationalAccelerationConstants, s: number): number {
  return c.v0 * s - 0.5 * c.g * s * s;
}

/** 줄의 칸 수(화살표는 이것보다 하나 많다). */
export function sampleCount(c: GravitationalAccelerationConstants): number {
  return Math.round(flightTime(c) / SAMPLE_DT);
}

/** k 번째 칸(시각 k·Δt)의 속도. 꼭대기 칸이 정확히 0 이 되게 비율로 계산한다. */
export function sampleVelocity(c: GravitationalAccelerationConstants, k: number): number {
  const n = sampleCount(c);
  return (c.v0 * (n - 2 * k)) / n;
}

/** 시각 s 까지 찍힌 마지막 칸 번호. */
export function shownSamples(c: GravitationalAccelerationConstants, s: number): number {
  return Math.min(sampleCount(c), Math.floor(s / SAMPLE_DT + SAMPLE_EPS));
}

/** 이번 주기에 던진 뒤 흐른 시간 — 비행 세 단계의 진행을 이어 붙인다. 착지 뒤에는 멈춘다. */
export function flightElapsed(tl: TimelineFrame): number {
  return (['rise', 'top', 'fall'] as const).reduce((acc, id) => acc + tl.at(id) * tl.duration(id), 0);
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: GravitationalAccelerationState }): GravitationalAccelerationState {
  return params.state;
}
