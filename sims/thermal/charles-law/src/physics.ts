// ========================================================================
// charles-law — 순수 물리
// ========================================================================
// 온도를 얼마나 올렸는지는 시간표가 정한다(데운 만큼). 부피는 여기서 **법칙으로
// 계산한다** — 압력을 무게추로 묶어 둔 채 V = nR(t + 273.15)/P. 피스톤이 오르는 높이,
// 그림에 찍히는 점은 그 계산의 결과다.
//
// 세 선이 한 점에 모이는 것도 코드가 적어 둔 자리가 아니다. 선마다 **찍은 두 끝점만으로**
// 직선을 거꾸로 이어 부피가 0 이 되는 온도를 구한다 — 그것이 −273.15 ℃ 에 닿는 것은
// 기체의 부피가 절대온도를 따르기 때문이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  GAS_R,
  GRAPH_T_MAX,
  GRAPH_T_MIN,
  GRAPH_V_MAX,
  KELVIN_OFFSET,
  N_A,
  N_B,
  N_C,
  PRESSURE,
  T_END,
  T_START,
  T_STEP,
  WORLD_PER_DEGREE,
  WORLD_PER_LITER,
} from './schema';
import type { CharlesLawState } from './state';

/** 세제곱미터 → 리터. 단위 환산이지 조각의 선택이 아니다. */
const LITER_PER_M3 = 1000;
/** 점 찍는 온도 목록을 셀 때 끝 온도를 넘었는지 볼 여유(℃). 부동소수 오차만 흡수한다. */
const STEP_EPS = 1e-9;

export interface CharlesLawConstants {
  /** 기체 A · B · C 의 양(mol). */
  nA: number;
  nB: number;
  nC: number;
  /** 무게추가 정하는 압력(Pa) · 기체 상수. */
  pressure: number;
  R: number;
  /** 섭씨 → 절대온도 간격(정박값). */
  kelvinOffset: number;
  /** 데우기 시작 · 끝 온도와 점 찍는 간격(℃). */
  tStart: number;
  tEnd: number;
  tStep: number;
  /** 표시 배율 — 1 L 의 높이 · 1 ℃ 의 가로(월드). */
  worldPerLiter: number;
  worldPerDegree: number;
  /** 그림의 범위 — t 축(℃) · V 축(L). */
  graphTMin: number;
  graphTMax: number;
  graphVMax: number;
}

export function readConstants(stage: StageDef): CharlesLawConstants {
  const c = stage.constants ?? {};
  return {
    nA: c.nA ?? N_A,
    nB: c.nB ?? N_B,
    nC: c.nC ?? N_C,
    pressure: c.pressure ?? PRESSURE,
    R: c.R ?? GAS_R,
    kelvinOffset: c.kelvinOffset ?? KELVIN_OFFSET,
    tStart: c.tStart ?? T_START,
    tEnd: c.tEnd ?? T_END,
    tStep: c.tStep ?? T_STEP,
    worldPerLiter: c.worldPerLiter ?? WORLD_PER_LITER,
    worldPerDegree: c.worldPerDegree ?? WORLD_PER_DEGREE,
    graphTMin: c.graphTMin ?? GRAPH_T_MIN,
    graphTMax: c.graphTMax ?? GRAPH_T_MAX,
    graphVMax: c.graphVMax ?? GRAPH_V_MAX,
  };
}

// ------------------------------------------------------------------------
// 기체
// ------------------------------------------------------------------------

/** 기체 하나 — 알리는 표식 모양과 양. 목록 길이(셋)는 여기 남는다 (NOTES G105). */
export interface Gas {
  id: 'a' | 'b' | 'c';
  n: number;
}

export function gasesOf(c: CharlesLawConstants): Gas[] {
  return [
    { id: 'a', n: c.nA },
    { id: 'b', n: c.nB },
    { id: 'c', n: c.nC },
  ];
}

/** 압력을 묶어 둔 기체의 부피(L) — 섭씨 온도 `tC` 에서. */
export function volumeAt(n: number, tC: number, c: CharlesLawConstants): number {
  return ((n * c.R * (tC + c.kelvinOffset)) / c.pressure) * LITER_PER_M3;
}

/**
 * 지금 온도(℃). 데우는 단계의 진행도에서 식히는 단계의 진행도를 뺀 만큼 올라가 있다 —
 * 전에는 0 − 0, 데우는 동안 s − 0, 그 뒤 1 − 0, 식히는 동안 1 − s. 경계 숫자는 여기 없다.
 */
export function temperatureNow(tl: TimelineFrame, c: CharlesLawConstants): number {
  return c.tStart + (c.tEnd - c.tStart) * (tl.at('heat') - tl.at('cool'));
}

/** 점을 찍는 온도 목록(℃) — 시작 온도부터 간격마다, 끝 온도까지. */
export function checkpoints(c: CharlesLawConstants): number[] {
  const out: number[] = [];
  if (c.tStep <= 0) return [c.tStart, c.tEnd];
  for (let t = c.tStart; t <= c.tEnd + STEP_EPS; t += c.tStep) out.push(t);
  return out;
}

/**
 * 찍힌 점 — 이번 주기에 데우며 지나간 온도의 점만 있다. 식히는 동안에는 모두 남아
 * 함께 옅어진다(`fade`). 점이 찍히는 것은 온도가 그 값을 지났다는 물리의 결과다.
 */
export interface Recorded {
  temps: number[];
  fade: number;
}

export function recorded(tl: TimelineFrame, c: CharlesLawConstants): Recorded {
  const reached = c.tStart + (c.tEnd - c.tStart) * tl.at('heat');
  return {
    temps: checkpoints(c).filter((t) => t <= reached + STEP_EPS),
    fade: 1 - tl.at('cool'),
  };
}

/**
 * 찍은 두 끝점(시작 · 끝 온도)으로 그은 직선을 거꾸로 이어 부피가 0 이 되는 온도(℃).
 * 절대온도 간격을 쓰지 않고 **점에서만** 구한다 — 세 선이 같은 값을 내는 것이 주장이다.
 */
export function zeroVolumeTemperature(n: number, c: CharlesLawConstants): number {
  const v0 = volumeAt(n, c.tStart, c);
  const v1 = volumeAt(n, c.tEnd, c);
  return c.tStart - (v0 * (c.tEnd - c.tStart)) / (v1 - v0);
}

/** 데우는 판이 켜져 있는가. */
export function heating(tl: TimelineFrame): boolean {
  return tl.phase === 'heat';
}

/** 온도가 움직이는 중인가 — 그림의 지금 온도 선이 이때만 있다. */
export function temperatureMoving(tl: TimelineFrame): boolean {
  return tl.phase === 'heat' || tl.phase === 'cool';
}

/** 쌓는 상태가 없다 — 모든 움직임이 시각의 함수다. */
export function step(params: { state: CharlesLawState }): CharlesLawState {
  return params.state;
}
