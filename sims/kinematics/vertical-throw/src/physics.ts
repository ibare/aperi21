// ========================================================================
// vertical-throw — 순수 물리
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { G, STROBE, V0 } from './schema';
import type { VerticalThrowState } from './state';

export interface VerticalThrowConstants {
  g: number;
  v0: number;
}

export function readConstants(stage: StageDef): VerticalThrowConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return { g: c.g ?? G, v0: c.v0 ?? V0 };
}

/** 던진 뒤 s 초의 높이(m). */
export function heightAt(c: VerticalThrowConstants, s: number): number {
  return c.v0 * s - 0.5 * c.g * s * s;
}

/** 던진 뒤 s 초의 속도(m/s). 위가 +. */
export function velocityAt(c: VerticalThrowConstants, s: number): number {
  return c.v0 - c.g * s;
}

/** 섬광 시각 k·STROBE (0 ≤ s ≤ 체공 시간). */
export function stampTimes(flight: number): number[] {
  const out: number[] = [];
  for (let k = 0; k * STROBE <= flight + 1e-9; k++) out.push(k * STROBE);
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: VerticalThrowState }): VerticalThrowState {
  return params.state;
}
