// ========================================================================
// thermal-expansion — 순수 물리
// ========================================================================
// 레일 한 토막이 온도 T 에서 겨울보다 늘어난 길이
//   ΔL(T) = L · α · (T − T겨울)
// 이고, 레일은 가운데를 중심으로 양 끝으로 ΔL/2 씩 늘어난다. 이음매에는 양쪽 레일이
// ΔL/2 씩 밀려 오므로 틈은 한 토막의 ΔL 만큼 좁아진다.
//
// α 를 가수(×10⁻⁶)로, 길이를 m 로 받으면 ΔL(mm) = L · α가수 · ΔT / 1000 — 선언값이
// 정수면 정확한 수가 나와 글자로 옮겨도 반올림할 것이 없다.
//
// 모든 것이 시각의 닫힌 식이라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ALPHA_E6,
  AXIS_MAX,
  AXIS_MIN,
  EXAGGERATION,
  GAP_COLD_MM,
  GAP_HOT_MM,
  GROW_MM,
  LENGTH_M,
  RAIL_WORLD,
  T_COLD,
  T_HOT,
} from './schema';
import type { ThermalExpansionState } from './state';

export interface ThermalExpansionConstants {
  /** 레일 한 토막의 길이(m). */
  lengthM: number;
  /** 선팽창 계수의 가수(×10⁻⁶ /K). */
  alphaE6: number;
  /** 겨울 · 여름 온도(℃). */
  tCold: number;
  tHot: number;
  /** 겨울의 이음매 틈(mm). */
  gapColdMm: number;
  /** 여름 틈 · 늘음(mm) — 화면 글자용 정박값. 모양 계산과 같아야 한다(G143). */
  gapHotMm: number;
  growMm: number;
  /** 틈과 늘어난 길이를 키워 그리는 배율. */
  exaggeration: number;
  /** 온도계 눈금의 아래 · 위 끝(℃). */
  axisMin: number;
  axisMax: number;
}

export function readConstants(stage: StageDef): ThermalExpansionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    lengthM: c.lengthM ?? LENGTH_M,
    alphaE6: c.alphaE6 ?? ALPHA_E6,
    tCold: c.tCold ?? T_COLD,
    tHot: c.tHot ?? T_HOT,
    gapColdMm: c.gapColdMm ?? GAP_COLD_MM,
    gapHotMm: c.gapHotMm ?? GAP_HOT_MM,
    growMm: c.growMm ?? GROW_MM,
    exaggeration: c.exaggeration ?? EXAGGERATION,
    axisMin: c.axisMin ?? AXIS_MIN,
    axisMax: c.axisMax ?? AXIS_MAX,
  };
}

/** 온도 T(℃)의 레일 한 토막이 겨울보다 늘어난 길이(mm). */
export function growMm(temp: number, c: ThermalExpansionConstants): number {
  return (c.lengthM * c.alphaE6 * (temp - c.tCold)) / 1000;
}

/**
 * 온도 T(℃)의 이음매 틈(mm). 양쪽 레일이 ΔL/2 씩 밀려 와 한 토막의 ΔL 만큼 좁아진다.
 * 0 밑으로는 내려가지 않는다 — 맞닿은 뒤로는 레일이 휘는 다른 이야기다.
 */
export function gapMm(temp: number, c: ThermalExpansionConstants): number {
  return Math.max(0, c.gapColdMm - growMm(temp, c));
}

/**
 * mm → 월드 길이. 레일 길이의 축척(`RAIL_WORLD` 가 `lengthM`)에 과장 배율을 곱한다.
 * 틈과 늘어난 길이에만 쓴다 — 레일 자체의 길이는 배율을 따르지 않는다.
 */
export function mmToWorld(c: ThermalExpansionConstants): number {
  return (RAIL_WORLD / (c.lengthM * 1000)) * c.exaggeration;
}

/**
 * 지금 온도(℃). 겨울 온도에서 `warm` 동안 여름 온도로 오르고 `cool` 동안 내려온다.
 * 단계의 길이 · 이징은 선언이 정한다.
 */
export function tempAt(tl: TimelineFrame, c: ThermalExpansionConstants): number {
  const f = tl.at('warm') - tl.at('cool');
  return c.tCold + (c.tHot - c.tCold) * f;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ThermalExpansionState }): ThermalExpansionState {
  return params.state;
}
