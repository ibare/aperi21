// ========================================================================
// bimetal — 순수 물리
// ========================================================================
// 길이 L 인 두 장이 실온에서 붙어 있다. 온도가 ΔT 바뀌면 황동은 L·α황동·ΔT, 강철은
// L·α강철·ΔT 만큼 늘려 한다. 붙어 있어 끝이 함께 가야 하므로 띠는 원호로 휘고, 두 장
// 가운데 사이 거리 d 에서 바깥 호가 안쪽 호보다 늘음 차만큼 길다:
//   휜 각 θ = L · (α황동 − α강철) · ΔT / d
// (두 장의 탄성 버팀을 뺀 기하 근사다 — 같은 두께 · 같은 탄성이면 실제 곡률은 이것의 3/4.
// NOTES (b).) θ > 0 이면 황동 쪽(위)이 바깥이라 띠가 아래로 휜다.
//
// α 를 가수(×10⁻⁶)로 받는다. 모든 것이 시각의 닫힌 식이라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ALPHA_BRASS_E6,
  ALPHA_STEEL_E6,
  AXIS_MAX,
  AXIS_MIN,
  EXAGGERATION,
  LAYER_MM,
  LENGTH_MM,
  T_COLD,
  T_HOT,
  T_ROOM,
} from './schema';
import type { BimetalState } from './state';

export interface BimetalConstants {
  /** 띠 길이(mm). */
  lengthMm: number;
  /** 한 장의 두께(mm) = 두 장 가운데 사이 거리. */
  layerMm: number;
  /** 선팽창 계수의 가수(×10⁻⁶ /K). */
  alphaBrassE6: number;
  alphaSteelE6: number;
  /** 실온 · 데운 온도 · 식힌 온도(℃). */
  tRoom: number;
  tHot: number;
  tCold: number;
  /** 휜 각을 키워 그리는 배율. */
  exaggeration: number;
  /** 온도계 눈금의 아래 · 위 끝(℃). */
  axisMin: number;
  axisMax: number;
}

export function readConstants(stage: StageDef): BimetalConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    lengthMm: c.lengthMm ?? LENGTH_MM,
    layerMm: c.layerMm ?? LAYER_MM,
    alphaBrassE6: c.alphaBrassE6 ?? ALPHA_BRASS_E6,
    alphaSteelE6: c.alphaSteelE6 ?? ALPHA_STEEL_E6,
    tRoom: c.tRoom ?? T_ROOM,
    tHot: c.tHot ?? T_HOT,
    tCold: c.tCold ?? T_COLD,
    exaggeration: c.exaggeration ?? EXAGGERATION,
    axisMin: c.axisMin ?? AXIS_MIN,
    axisMax: c.axisMax ?? AXIS_MAX,
  };
}

/**
 * 지금 온도(℃). 실온에서 `heat` 동안 데운 온도로 오르고 `back` 동안 실온으로, `chill` 동안
 * 식힌 온도로 내려가고 `rewarm` 동안 실온으로 돌아온다. 단계의 길이 · 이징은 선언이 정한다.
 */
export function tempAt(tl: TimelineFrame, c: BimetalConstants): number {
  const up = tl.at('heat') - tl.at('back');
  const down = tl.at('chill') - tl.at('rewarm');
  return c.tRoom + (c.tHot - c.tRoom) * up + (c.tCold - c.tRoom) * down;
}

/** 온도 T 에서 두 장이 실온 길이보다 늘어난 길이의 차(mm) — 황동 − 강철. */
export function growDiffMm(temp: number, c: BimetalConstants): number {
  return (c.lengthMm * (c.alphaBrassE6 - c.alphaSteelE6) * 1e-6 * (temp - c.tRoom));
}

/**
 * 그릴 휜 각(라디안) — 늘음 차를 두 장 가운데 사이 거리로 나눈 실제 휜 각에 과장 배율을 곱한다.
 * 양수면 황동(위)이 바깥이라 아래로 휜다.
 */
export function bendAngle(temp: number, c: BimetalConstants): number {
  return (growDiffMm(temp, c) / c.layerMm) * c.exaggeration;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: BimetalState }): BimetalState {
  return params.state;
}
