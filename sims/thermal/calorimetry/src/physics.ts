// ========================================================================
// calorimetry — 순수 물리
// ========================================================================
// 뜨거운 물(m_h, c_h, T_h0)을 찬 물(m_c, c_c, T_c0)에 부으면 잃은 열 = 얻은 열이라
//   T_f = (m_h c_h T_h0 + m_c c_c T_c0) / (m_h c_h + m_c c_c)
// 에서 멈춘다. 섞이는 동안 진행도 p(시간표 `mix` 단계, 이징은 선언)에 대해
//   T_h(p) = T_h0 − (T_h0 − T_f)·p ,  T_c(p) = T_c0 + (T_f − T_c0)·p
// 로 두면 매 순간 m_h c_h (T_h0 − T_h) = m_c c_c (T_c − T_c0) — 두 직사각형의 넓이가 같다.
//
// 모든 것이 시각의 닫힌 식이라 쌓는 상태가 없다. 화면 글자의 멈춘 온도는 이 계산이 아니라
// 스테이지 상수의 정박값(`tFinalA` · `tFinalB`)이다 (S-piece 유효숫자).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  AXIS_MAX,
  AXIS_MIN,
  CELL_MASS,
  CELL_SPEC,
  CELL_TEMP,
  C_COLD,
  C_HOT,
  DROPS,
  DROP_TRAVEL,
  M_COLD_A,
  M_COLD_B,
  M_HOT_A,
  M_HOT_B,
  T_COLD,
  T_FINAL_A,
  T_FINAL_B,
  T_HOT,
  T_MID,
} from './schema';
import type { CalorimetryState } from './state';

export interface CalorimetryConstants {
  /** 처음 온도(℃) · 그 가운데(℃, 정박값). */
  tHot: number;
  tCold: number;
  tMid: number;
  /** 차례마다 질량(g)과 멈추는 온도(℃, 정박값). */
  mHotA: number;
  mColdA: number;
  tFinalA: number;
  mHotB: number;
  mColdB: number;
  tFinalB: number;
  /** 비열(J/(kg·K)). */
  cHot: number;
  cCold: number;
  /** 칸 하나 — 가로 `cellMass` g × 비열 `cellSpec`, 세로 `cellTemp` ℃. */
  cellMass: number;
  cellTemp: number;
  cellSpec: number;
  /** 붓는 동안의 물방울 수 · 이동 시간(초). */
  drops: number;
  dropTravel: number;
  /** 온도 축의 아래 · 위 끝(℃). */
  axisMin: number;
  axisMax: number;
}

export function readConstants(stage: StageDef): CalorimetryConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    tHot: c.tHot ?? T_HOT,
    tCold: c.tCold ?? T_COLD,
    tMid: c.tMid ?? T_MID,
    mHotA: c.mHotA ?? M_HOT_A,
    mColdA: c.mColdA ?? M_COLD_A,
    tFinalA: c.tFinalA ?? T_FINAL_A,
    mHotB: c.mHotB ?? M_HOT_B,
    mColdB: c.mColdB ?? M_COLD_B,
    tFinalB: c.tFinalB ?? T_FINAL_B,
    cHot: c.cHot ?? C_HOT,
    cCold: c.cCold ?? C_COLD,
    cellMass: c.cellMass ?? CELL_MASS,
    cellTemp: c.cellTemp ?? CELL_TEMP,
    cellSpec: c.cellSpec ?? CELL_SPEC,
    drops: c.drops ?? DROPS,
    dropTravel: c.dropTravel ?? DROP_TRAVEL,
    axisMin: c.axisMin ?? AXIS_MIN,
    axisMax: c.axisMax ?? AXIS_MAX,
  };
}

/** 한 차례 — 시간표 단계 이름의 꼬리와 그 차례의 질량 · 멈춤 정박값. */
export interface Round {
  /** 단계 이름 꼬리 — `pour${suffix}` 처럼 부른다. */
  suffix: 'A' | 'B';
  mHot: number;
  mCold: number;
  /** 멈추는 온도의 정박값(글자). */
  tFinalPinned: number;
}

/**
 * 지금 차례. 차례 수와 순서(첫 차례 → 질량을 맞바꾼 차례)는 코드에 있다(장부 G105).
 * 두 번째 차례가 나타나는 단계(`showB`)부터 B 다.
 */
export function roundAt(tl: TimelineFrame, c: CalorimetryConstants): Round {
  if (tl.u < tl.start('showB')) {
    return { suffix: 'A', mHot: c.mHotA, mCold: c.mColdA, tFinalPinned: c.tFinalA };
  }
  return { suffix: 'B', mHot: c.mHotB, mCold: c.mColdB, tFinalPinned: c.tFinalB };
}

/** 두 물이 멈추는 온도(℃) — 배치 계산용. 글자는 `tFinalPinned` 를 쓴다. */
export function finalTemp(r: Round, c: CalorimetryConstants): number {
  const ch = r.mHot * c.cHot;
  const cc = r.mCold * c.cCold;
  return (ch * c.tHot + cc * c.tCold) / (ch + cc);
}

/** 섞임 진행도 p(0~1)에서 두 물의 온도(℃). */
export function tempsAt(p: number, r: Round, c: CalorimetryConstants): { hot: number; cold: number } {
  const tf = finalTemp(r, c);
  return {
    hot: c.tHot - (c.tHot - tf) * p,
    cold: c.tCold + (tf - c.tCold) * p,
  };
}

/** 직사각형의 가로를 칸 수로 — 열용량(m·c)을 칸 하나의 열용량으로 나눈 것. */
export function widthCells(mass: number, spec: number, c: CalorimetryConstants): number {
  return (mass * spec) / (c.cellMass * c.cellSpec);
}

/** 이번 차례의 그림이 보이는 정도 0~1 — 나타나는 단계에서 오르고 흐려지는 단계에서 내린다. */
export function roundOpacity(tl: TimelineFrame, r: Round): number {
  return tl.at(`show${r.suffix}`) * (1 - tl.at(`fade${r.suffix}`));
}

/**
 * 물방울 n 이 컵을 떠나는 시각(붓기 단계 시작 뒤 초). 같은 간격으로 떠나고, 마지막
 * 물방울도 붓기 단계 안에서 비커에 닿는다.
 */
export function dropDepart(n: number, pourDuration: number, c: CalorimetryConstants): number {
  const spacing = (pourDuration - c.dropTravel) / c.drops;
  return (n + 0.5) * spacing;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: CalorimetryState }): CalorimetryState {
  return params.state;
}
