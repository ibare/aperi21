// ========================================================================
// lens-combination — 순수 물리
// ========================================================================
// 렌즈를 지난 줄기의 방향은 여기서 계산하지 않는다 — scene 이 plugin-optics `traceRay`
// 로 맞닿은 두 렌즈를 대신하는 얇은 렌즈 하나(합성 초점 거리)에 쏘아 얻는다.
// 여기 있는 것은 스테이지 상수 읽기, 합성 초점 거리 · 굴절력 계산, 시간표 진행도를
// 붙음 · 줄기 길이로 옮기는 것뿐이다. 단계 경계를 코드 상수로 가르지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  CM_PER_UNIT,
  FOCAL_CONCAVE_CM,
  FOCAL_ONE_CM,
  FOCAL_SAME_CM,
  RAY_COUNT,
  RAY_SPACING,
  SHOWN_FOCUS_MIX_CM,
  SHOWN_FOCUS_ONE_CM,
  SHOWN_FOCUS_TWO_CM,
  SHOWN_POWER_MIX_D,
  SHOWN_POWER_ONE_D,
  SHOWN_POWER_TWO_D,
  UNIT_PER_DIOPTRE,
} from './schema';
import type { LensCombinationState } from './state';

export interface LensCombinationConstants {
  /** L₁ 의 초점 거리(cm). */
  focalOneCm: number;
  /** 붙이는 볼록 L₂ 의 초점 거리(cm). */
  focalSameCm: number;
  /** 붙이는 오목 L₂ 의 초점 거리(cm, 음수). */
  focalConcaveCm: number;
  /** 화면에 띄우는 정박값. */
  shownFocusOneCm: number;
  shownFocusTwoCm: number;
  shownFocusMixCm: number;
  shownPowerOneD: number;
  shownPowerTwoD: number;
  shownPowerMixD: number;
  /** 월드 1 단위가 나타내는 cm. */
  cmPerUnit: number;
  /** 1 D 가 막대에서 차지하는 높이(월드). */
  unitPerDioptre: number;
  /** 평행 줄기 수. */
  rayCount: number;
  /** 이웃 줄기 사이 간격(월드). */
  raySpacing: number;
}

export function readConstants(stage: StageDef): LensCombinationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    focalOneCm: c.focalOneCm ?? FOCAL_ONE_CM,
    focalSameCm: c.focalSameCm ?? FOCAL_SAME_CM,
    focalConcaveCm: c.focalConcaveCm ?? FOCAL_CONCAVE_CM,
    shownFocusOneCm: c.shownFocusOneCm ?? SHOWN_FOCUS_ONE_CM,
    shownFocusTwoCm: c.shownFocusTwoCm ?? SHOWN_FOCUS_TWO_CM,
    shownFocusMixCm: c.shownFocusMixCm ?? SHOWN_FOCUS_MIX_CM,
    shownPowerOneD: c.shownPowerOneD ?? SHOWN_POWER_ONE_D,
    shownPowerTwoD: c.shownPowerTwoD ?? SHOWN_POWER_TWO_D,
    shownPowerMixD: c.shownPowerMixD ?? SHOWN_POWER_MIX_D,
    cmPerUnit: c.cmPerUnit ?? CM_PER_UNIT,
    unitPerDioptre: c.unitPerDioptre ?? UNIT_PER_DIOPTRE,
    rayCount: c.rayCount ?? RAY_COUNT,
    raySpacing: c.raySpacing ?? RAY_SPACING,
  };
}

/** 줄기들의 높이(광축에서 잰 월드 거리). 가운데가 0 이고 위아래로 대칭이다. */
export function rayOffsets(c: LensCombinationConstants): number[] {
  const n = Math.max(1, Math.round(c.rayCount));
  return Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * c.raySpacing);
}

/** 초점 거리(cm) → 굴절력(D). 1 m = 100 cm. */
export function powerOf(focalCm: number): number {
  return 100 / focalCm;
}

/** 줄기를 추적하는 렌즈 조합. */
export type Combo = 'one' | 'two' | 'mix';

/** 조합의 합성 초점 거리(cm) — 맞닿은 얇은 렌즈의 굴절력을 더한 뒤 뒤집는다. */
export function comboFocalCm(c: LensCombinationConstants, combo: Combo): number {
  const p1 = powerOf(c.focalOneCm);
  if (combo === 'one') return c.focalOneCm;
  const p2 = powerOf(combo === 'two' ? c.focalSameCm : c.focalConcaveCm);
  return 100 / (p1 + p2);
}

/** 조합마다 화면에 띄우는 초점 거리 정박값(cm). */
export function shownFocusCm(c: LensCombinationConstants, combo: Combo): number {
  if (combo === 'one') return c.shownFocusOneCm;
  return combo === 'two' ? c.shownFocusTwoCm : c.shownFocusMixCm;
}

/** 조합마다 막대 꼭대기에 띄우는 굴절력 정박값(D). */
export function shownPowerD(c: LensCombinationConstants, combo: Combo): number {
  if (combo === 'one') return c.shownPowerOneD;
  return combo === 'two' ? c.shownPowerTwoD : c.shownPowerMixD;
}

/** 그 단계가 이번 주기에 시작됐는가 — 0 또는 1. */
function begun(tl: TimelineFrame, id: string): number {
  return tl.at(id) > 0 ? 1 : 0;
}

/**
 * 지금 줄기를 추적할 조합. 조합은 `bend-*` 단계가 시작될 때 바뀐다 — 그때는 렌즈 뒤
 * 줄기가 다 거둬져 있어(`postReach` = 0) 바뀌는 순간이 보이지 않는다.
 */
export function rayCombo(tl: TimelineFrame): Combo {
  if (begun(tl, 'bend-concave') - begun(tl, 'bend-one') > 0) return 'mix';
  if (begun(tl, 'bend-two') - begun(tl, 'bend-concave') > 0) return 'two';
  return 'one';
}

/** 볼록 L₂ 가 붙은 몫 0~1 — `bring-two` 에서 내려와 붙고 `lift-two` 에서 떨어져 나간다. */
export function attachTwo(tl: TimelineFrame): number {
  return tl.at('bring-two') * (1 - tl.at('lift-two'));
}

/** 오목 L₂ 가 붙은 몫 0~1. */
export function attachConcave(tl: TimelineFrame): number {
  return tl.at('bring-concave') * (1 - tl.at('lift-concave'));
}

/**
 * 렌즈 뒤 줄기가 뻗은 몫 0~1. 렌즈를 붙이거나 떼는 동안 렌즈로 거둬지고, `bend-*` 동안
 * 새 조합으로 다시 뻗는다. 진행도의 합이라 분기가 없다.
 */
export function postReach(tl: TimelineFrame): number {
  return (
    1 -
    tl.at('bring-two') +
    tl.at('bend-two') -
    tl.at('lift-two') +
    tl.at('bend-concave') -
    tl.at('lift-concave') +
    tl.at('bend-one')
  );
}

/**
 * x 가 늘어나는 꺾은선을 [x0, x1] 로 자른다. 줄기는 모두 왼쪽에서 오른쪽으로 가므로
 * x 로 자르면 앞머리가 된다. 남는 것이 없으면 빈 배열.
 */
export function clipByX(points: readonly Vec2[], x0: number, x1: number): Vec2[] {
  if (x1 <= x0) return [];
  const at = (a: Vec2, b: Vec2, x: number): Vec2 => {
    const u = (x - a[0]) / (b[0] - a[0]);
    return [x, a[1] + (b[1] - a[1]) * u];
  };
  const out: Vec2[] = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    if (b[0] <= a[0]) continue;
    const lo = Math.max(a[0], x0);
    const hi = Math.min(b[0], x1);
    if (hi <= lo) continue;
    const p = lo === a[0] ? a : at(a, b, lo);
    const q = hi === b[0] ? b : at(a, b, hi);
    const last = out[out.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
    out.push(q);
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: LensCombinationState }): LensCombinationState {
  return params.state;
}
