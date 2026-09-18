// ========================================================================
// zeeman-effect — 순수 물리 · 배치 계산
// ========================================================================
// 쌓는 상태가 없다. 자기장의 세기, 준위 · 선의 자리가 모두 시간표 시각과 스테이지 상수의
// 함수다. `step` 은 항등이다.
//
//   mₗ 상태의 에너지 어긋남   ΔE = mₗ μ_B B
//   선의 파장 어긋남          Δλ = −λ² ΔE / hc   (에너지가 높으면 파장이 짧다)
//
// 빛의 색은 `@aperi21/plugin-optics` 의 파장 → 선형광 계산에서 얻는다. 세 줄의 파장 차는
// 0.04 nm 도 안 되어 색이 같다 — 한 색을 세 줄이 함께 쓴다.
// ========================================================================

import { wavelengthToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';
import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  BOHR_MAGNETON_EV_PER_T,
  FIELD_HIGH_T,
  FIELD_LOW_T,
  HC_EV_NM,
  LEVELS,
  LEVEL_SPLIT_MAGNIFICATION,
  LINE_EV,
  LINE_NM,
  LOWER_L,
  SCALE_BAR_NM,
  UPPER_L,
  WINDOW,
  WINDOW_NM,
} from './schema';
import type { ZeemanEffectState } from './state';

/**
 * 위 준위의 상태 mₗ = +l … −l — 위에서부터. 낙차 · 선이 이 차례로 왼쪽에서 오른쪽에 놓인다
 * (에너지가 높은 mₗ=+1 의 빛이 파장이 가장 짧아 창의 왼쪽에 선다). 아래 준위(l=0)는 갈라지지 않는다.
 */
export const mlStates = (c: ZeemanConstants): number[] =>
  Array.from({ length: 2 * c.upperL + 1 }, (_, i) => c.upperL - i);

/** i 번째 상태(위에서부터)의 낙차가 서는 가로 자리(월드) — `dropX0`–`dropX1` 을 고르게 나눈다. */
export function dropX(i: number, c: ZeemanConstants): number {
  const n = 2 * c.upperL;
  return n === 0 ? LEVELS.dropX0 : LEVELS.dropX0 + ((LEVELS.dropX1 - LEVELS.dropX0) * i) / n;
}

export interface ZeemanConstants {
  upperL: number;
  lowerL: number;
  lineNm: number;
  lineEv: number;
  hcEvNm: number;
  bohrMagnetonEvPerT: number;
  fieldLowT: number;
  fieldHighT: number;
  levelSplitMagnification: number;
  windowNm: number;
  scaleBarNm: number;
}

export function readConstants(stage: StageDef): ZeemanConstants {
  const c = stage.constants ?? {};
  return {
    upperL: c.upperL ?? UPPER_L,
    lowerL: c.lowerL ?? LOWER_L,
    lineNm: c.lineNm ?? LINE_NM,
    lineEv: c.lineEv ?? LINE_EV,
    hcEvNm: c.hcEvNm ?? HC_EV_NM,
    bohrMagnetonEvPerT: c.bohrMagnetonEvPerT ?? BOHR_MAGNETON_EV_PER_T,
    fieldLowT: c.fieldLowT ?? FIELD_LOW_T,
    fieldHighT: c.fieldHighT ?? FIELD_HIGH_T,
    levelSplitMagnification: c.levelSplitMagnification ?? LEVEL_SPLIT_MAGNIFICATION,
    windowNm: c.windowNm ?? WINDOW_NM,
    scaleBarNm: c.scaleBarNm ?? SCALE_BAR_NM,
  };
}

/**
 * 지금 자기장(T). 세 오르내림 단계의 진행도를 더한 것이다 — 켬(0 → 낮음), 키움(낮음 → 높음),
 * 끔(높음 → 0). 단계 경계는 시간표 선언이 정한다 (S-piece).
 */
export function fieldAt(tl: TimelineFrame, c: ZeemanConstants): number {
  return (
    c.fieldLowT * tl.at('rampLow') +
    (c.fieldHighT - c.fieldLowT) * tl.at('rampHigh') -
    c.fieldHighT * tl.at('rampOff')
  );
}

/** mₗ 상태의 에너지 어긋남(eV) — mₗ μ_B B. */
export const energyShiftEv = (ml: number, b: number, c: ZeemanConstants): number =>
  ml * c.bohrMagnetonEvPerT * b;

/**
 * 준위 그림에서 mₗ 상태가 놓이는 높이(월드). 두 준위 사이 높이가 선의 에너지(`lineEv`)이고,
 * 어긋남은 `levelSplitMagnification` 배로 키워 그린다.
 */
export function sublevelY(ml: number, b: number, c: ZeemanConstants): number {
  const worldPerEv = (LEVELS.yUpper - LEVELS.yLower) / c.lineEv;
  return LEVELS.yUpper + energyShiftEv(ml, b, c) * worldPerEv * c.levelSplitMagnification;
}

/** 분광기 창의 월드 가로 / nm. 창 폭 `windowNm` 이 곧 축척이다 — 따로 키우지 않는다. */
export const windowWorldPerNm = (c: ZeemanConstants): number => (WINDOW.x1 - WINDOW.x0) / c.windowNm;

/** mₗ 상태에서 떨어지는 빛의 파장 어긋남(nm) — Δλ = −λ² ΔE / hc. */
export const wavelengthShiftNm = (ml: number, b: number, c: ZeemanConstants): number =>
  (-(c.lineNm * c.lineNm) * energyShiftEv(ml, b, c)) / c.hcEvNm;

/** 분광기 창 안에서 그 빛의 선이 서는 가로 자리(월드). 갈라지기 전 선이 창 가운데. */
export function lineX(ml: number, b: number, c: ZeemanConstants): number {
  const center = (WINDOW.x0 + WINDOW.x1) / 2;
  return center + wavelengthShiftNm(ml, b, c) * windowWorldPerNm(c);
}

/** 선의 빛 색(선형광). 세 줄이 같은 색이다. */
export const lineLight = (c: ZeemanConstants): LinearRgb => wavelengthToLinearRgb(c.lineNm);

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ZeemanEffectState }): ZeemanEffectState {
  return params.state;
}
