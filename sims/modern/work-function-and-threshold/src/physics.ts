// ========================================================================
// work-function-and-threshold — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 커서 · 직선 · 사본은 모두 스테이지 상수와 시간표 진행도의 함수다.
// `step` 은 항등이다.
//
// 좌표 — 가로는 진동수(10¹⁴ Hz) 그대로, 세로는 튀어나온 전자의 최대 운동 에너지(eV) × `perEv`.
// 문턱 아래에서는 전자가 없으므로 점이 가로축(에너지 0)에 붙는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  PLANCK,
  PLOT,
  PULSE_SECONDS,
  SWEEP_FROM,
  SWEEP_TO,
  THRESHOLD_CU,
  UV_FROM,
  THRESHOLD_NA,
  WORK_FUNCTION_CU,
  WORK_FUNCTION_NA,
} from './schema';
import type { WorkFunctionAndThresholdState } from './state';

/** 빛의 속력(nm × 10¹⁴ Hz) — 진동수를 파장으로 옮기는 단위 환산이다. λ = c / f. */
const LIGHT_SPEED_NM_1E14 = 2997.92;

/** 문턱 정박값이 φ / h 에서 벗어나도 되는 폭(10¹⁴ Hz) — 유효숫자 셋의 반올림 폭. */
const THRESHOLD_TOLERANCE = 0.05;

export interface WorkFunctionConstants {
  workFunctionNa: number;
  workFunctionCu: number;
  planck: number;
  thresholdNa: number;
  thresholdCu: number;
  sweepFrom: number;
  sweepTo: number;
  /** 구리 훑기의 가시광 구간 · 자외선 구간을 가르는 진동수. */
  uvFrom: number;
  pulseSeconds: number;
}

/**
 * 스테이지 상수를 기본값과 함께 읽는다 (원칙 2).
 *
 * 문턱 정박값(화면 글자)이 φ / h 와 어긋나면 던진다 — 저작자가 일함수만 바꾸면 이름표의 수와
 * 직선이 가로축에 닿는 자리가 조용히 갈라진다 (장부 G143).
 */
export function readConstants(stage: StageDef): WorkFunctionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const k: WorkFunctionConstants = {
    workFunctionNa: c.workFunctionNa ?? WORK_FUNCTION_NA,
    workFunctionCu: c.workFunctionCu ?? WORK_FUNCTION_CU,
    planck: c.planck ?? PLANCK,
    thresholdNa: c.thresholdNa ?? THRESHOLD_NA,
    thresholdCu: c.thresholdCu ?? THRESHOLD_CU,
    sweepFrom: c.sweepFrom ?? SWEEP_FROM,
    sweepTo: c.sweepTo ?? SWEEP_TO,
    uvFrom: c.uvFrom ?? UV_FROM,
    pulseSeconds: c.pulseSeconds ?? PULSE_SECONDS,
  };
  for (const m of METALS) {
    const f0 = thresholdOf(m, k);
    if (Math.abs(f0 - anchorOf(m, k)) > THRESHOLD_TOLERANCE) {
      throw new Error(`work-function-and-threshold: ${m} 의 문턱 정박값이 일함수 / h 와 어긋난다`);
    }
    if (f0 <= k.sweepFrom || f0 >= k.sweepTo) {
      throw new Error(`work-function-and-threshold: ${m} 의 문턱이 훑는 범위 안에 있어야 한다`);
    }
  }
  if (k.uvFrom <= k.sweepFrom || k.uvFrom >= thresholdOf('cu', k)) {
    throw new Error('work-function-and-threshold: uvFrom 은 훑는 시작과 구리의 문턱 사이에 있어야 한다');
  }
  return k;
}

export type Metal = 'na' | 'cu';
export const METALS: readonly Metal[] = ['na', 'cu'];

export function workFunctionOf(m: Metal, k: WorkFunctionConstants): number {
  return m === 'na' ? k.workFunctionNa : k.workFunctionCu;
}

/** 문턱 진동수 f₀ = φ / h — 직선이 가로축에서 떠나는 자리(계산값). */
export function thresholdOf(m: Metal, k: WorkFunctionConstants): number {
  return workFunctionOf(m, k) / k.planck;
}

/** 화면에 띄우는 문턱 정박값. */
export function anchorOf(m: Metal, k: WorkFunctionConstants): number {
  return m === 'na' ? k.thresholdNa : k.thresholdCu;
}

/** 튀어나온 전자의 최대 운동 에너지(eV). 문턱 아래는 전자가 없어 0. */
export function kmax(f: number, workFunction: number, k: WorkFunctionConstants): number {
  return Math.max(0, k.planck * f - workFunction);
}

/** (진동수, 에너지) → 월드. */
export function plotPoint(f: number, ev: number): Vec2 {
  return [f, ev * PLOT.perEv];
}

/** 진동수 → 파장(nm). */
export function wavelengthNm(f: number): number {
  return LIGHT_SPEED_NM_1E14 / f;
}

/** 파장(nm) → 진동수(10¹⁴ Hz). */
export function frequencyOf(nm: number): number {
  return LIGHT_SPEED_NM_1E14 / nm;
}

/**
 * 단계 id — 금속마다 문턱 전 · 뒤. 구리의 문턱 전은 두 단계(가시광 `cu-below` → 자외선 `cu-uv`)라
 * `uv` 가 있고, 그 경계 진동수는 `uvFrom` 이다.
 */
const PHASES: Record<Metal, { below: string; uv?: string; above: string }> = {
  na: { below: 'na-below', above: 'na-above' },
  cu: { below: 'cu-below', uv: 'cu-uv', above: 'cu-above' },
};

/**
 * 그 금속을 훑는 커서의 진동수. 문턱 전 단계는 훑는 시작 → 문턱(구리는 `uvFrom` 에서 두 단계로 나뉜다),
 * 문턱 뒤 단계는 문턱 → 끝.
 * 아직 시작하지 않았으면 `null`.
 */
export function sweepOf(m: Metal, tl: TimelineFrame, k: WorkFunctionConstants): number | null {
  const p = PHASES[m];
  if (tl.u < tl.start(p.below)) return null;
  const f0 = thresholdOf(m, k);
  const above = tl.at(p.above);
  if (above > 0) return f0 + (k.sweepTo - f0) * above;
  if (!p.uv) return k.sweepFrom + (f0 - k.sweepFrom) * tl.at(p.below);
  const uv = tl.at(p.uv);
  if (uv > 0) return k.uvFrom + (f0 - k.uvFrom) * uv;
  return k.sweepFrom + (k.uvFrom - k.sweepFrom) * tl.at(p.below);
}

/** 문턱을 넘은 뒤 흐른 시간(초). 아직 넘지 않았으면 `null`. */
export function sinceCrossing(m: Metal, tl: TimelineFrame): number | null {
  const s = tl.start(PHASES[m].above);
  return tl.u >= s ? tl.u - s : null;
}

/** 지금 훑고 있는 금속 — 사본 옮기기부터는 없다. */
export function activeMetal(tl: TimelineFrame): Metal | null {
  if (tl.u < tl.start('cu-below')) return 'na';
  if (tl.u < tl.start('slide')) return 'cu';
  return null;
}

export function step(params: { state: WorkFunctionAndThresholdState }): WorkFunctionAndThresholdState {
  return params.state;
}
