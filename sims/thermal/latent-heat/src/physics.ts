// ========================================================================
// latent-heat — 순수 물리
// ========================================================================
// 가열 세기 P 가 일정하므로 가열이 시작한 뒤 s 초 동안 넣은 열은 Q = P · s 다.
// 넣은 열은 차례로 네 몫을 채운다.
//   얼음 데우기  m · c얼음 · (T녹 − T처음)   온도가 오른다
//   녹음        m · L녹음                    온도가 T녹 에 멈추고 얼음 → 물
//   물 데우기    m · c물 · (T끓 − T녹)       온도가 오른다
//   끓음        m · L끓음                    온도가 T끓 에 멈추고 물 → 김
// 시간-온도 곡선은 꺾임점 다섯 개를 잇는 꺾은선이고, 평평한 두 구간의 길이는
// 잠열 ÷ 세기다.
//
// 모든 것이 시각의 닫힌 식이라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  AXIS_MAX,
  AXIS_MIN,
  C_ICE,
  C_WATER,
  ICE_CUBES,
  L_FUSION,
  L_VAPOR,
  MASS_KG,
  POWER,
  SEED,
  STEAM_DOTS,
  STEAM_RISE_S,
  T_BOIL,
  T_MELT,
  T_START,
} from './schema';
import type { LatentHeatState } from './state';

export interface LatentHeatConstants {
  /** 질량(kg). */
  massKg: number;
  /** 처음 온도 · 녹는점 · 끓는점(℃). */
  tStart: number;
  tMelt: number;
  tBoil: number;
  /** 얼음 · 물의 비열(kJ/(kg·K)). */
  cIce: number;
  cWater: number;
  /** 녹음 · 끓음의 잠열(kJ/kg). */
  lFusion: number;
  lVapor: number;
  /** 가열 세기(kJ 를 조각 시계 1 초에). */
  power: number;
  /** 곡선 온도축의 아래 · 위 끝(℃). */
  axisMin: number;
  axisMax: number;
  /** 김 알갱이 수 · 한 번 오르는 시간(초) · 자리 시드 · 얼음 조각 수. */
  steamDots: number;
  steamRiseS: number;
  seed: number;
  iceCubes: number;
}

export function readConstants(stage: StageDef): LatentHeatConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    massKg: c.massKg ?? MASS_KG,
    tStart: c.tStart ?? T_START,
    tMelt: c.tMelt ?? T_MELT,
    tBoil: c.tBoil ?? T_BOIL,
    cIce: c.cIce ?? C_ICE,
    cWater: c.cWater ?? C_WATER,
    lFusion: c.lFusion ?? L_FUSION,
    lVapor: c.lVapor ?? L_VAPOR,
    power: c.power ?? POWER,
    axisMin: c.axisMin ?? AXIS_MIN,
    axisMax: c.axisMax ?? AXIS_MAX,
    steamDots: c.steamDots ?? STEAM_DOTS,
    steamRiseS: c.steamRiseS ?? STEAM_RISE_S,
    seed: c.seed ?? SEED,
    iceCubes: c.iceCubes ?? ICE_CUBES,
  };
}

/** 넣은 열이 합에 닿았다고 보는 상대 오차. */
const FULL_EPS = 1e-9;

/** 네 몫의 열량(kJ)과 합. */
export interface HeatBudget {
  ice: number;
  melt: number;
  water: number;
  boil: number;
  total: number;
}

export function heatBudget(c: LatentHeatConstants): HeatBudget {
  const ice = c.massKg * c.cIce * (c.tMelt - c.tStart);
  const melt = c.massKg * c.lFusion;
  const water = c.massKg * c.cWater * (c.tBoil - c.tMelt);
  const boil = c.massKg * c.lVapor;
  return { ice, melt, water, boil, total: ice + melt + water + boil };
}

/**
 * 지금까지 넣은 열(kJ). 가열기는 `heat-ice` 가 시작할 때 켜지고 `boil` 이 끝날 때
 * 꺼진다 — 켜진 동안의 조각 시계 × 세기다. 단계 사이의 경계는 보지 않는다: 녹음이
 * 언제 끝나는지는 시간표가 아니라 넣은 열이 잠열에 닿았는지가 정한다.
 */
export function heatIn(tl: TimelineFrame, c: LatentHeatConstants, b: HeatBudget): number {
  const on = tl.start('heat-ice');
  const off = tl.end('boil');
  const s = Math.min(Math.max(tl.u - on, 0), off - on);
  const q = c.power * s;
  // 기본 단계 길이의 합(열량 ÷ 세기)을 조각 시계로 되짚으면 부동소수 오차로 합에 조금
  // 못 미친다. 그 틈에 물이 한 방울 남은 것으로 읽히지 않게 합에 닿으면 합으로 둔다.
  return q >= b.total * (1 - FULL_EPS) ? b.total : q;
}

/** 가열기가 켜져 있는가. */
export function heaterOn(tl: TimelineFrame): boolean {
  return tl.u >= tl.start('heat-ice') && tl.u < tl.end('boil');
}

/** 넣은 열 Q 에서 읽은 그릇 속 모습. 세 몫의 합은 1 이다. */
export interface PotReading {
  /** 온도(℃). */
  temp: number;
  /** 얼음 · 물 · 김의 질량 몫 0~1. */
  ice: number;
  water: number;
  steam: number;
}

export function readPot(q: number, c: LatentHeatConstants, b: HeatBudget): PotReading {
  const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
  if (q < b.ice) {
    return { temp: c.tStart + (q / b.ice) * (c.tMelt - c.tStart), ice: 1, water: 0, steam: 0 };
  }
  const q1 = q - b.ice;
  if (q1 < b.melt) {
    const f = clamp01(q1 / b.melt);
    return { temp: c.tMelt, ice: 1 - f, water: f, steam: 0 };
  }
  const q2 = q1 - b.melt;
  if (q2 < b.water) {
    return { temp: c.tMelt + (q2 / b.water) * (c.tBoil - c.tMelt), ice: 0, water: 1, steam: 0 };
  }
  const f = clamp01((q2 - b.water) / b.boil);
  return { temp: c.tBoil, ice: 0, water: 1 - f, steam: f };
}

/**
 * 곡선의 꺾임점 — (넣은 열 kJ, 온도 ℃). 넣은 열이 곧 시간 × 세기라 가로축은 시간과
 * 같은 모양이다. 처음 · 녹음 시작 · 녹음 끝 · 끓음 시작 · 끓음 끝.
 */
export function curveCorners(c: LatentHeatConstants, b: HeatBudget): readonly (readonly [number, number])[] {
  const k1 = b.ice;
  const k2 = k1 + b.melt;
  const k3 = k2 + b.water;
  return [
    [0, c.tStart],
    [k1, c.tMelt],
    [k2, c.tMelt],
    [k3, c.tBoil],
    [b.total, c.tBoil],
  ];
}

/**
 * 시드 결정적 난수 0~1 — (시드, 번호, 갈래)의 함수다. 호출 순서에 상태가 없어서
 * `?t=` 로 연 화면과 실시간 화면이 같다 (S-sim).
 */
export function hash01(seed: number, n: number, lane: number): number {
  let h = Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul(n + 1, 0x85ebca6b) ^ Math.imul(lane + 1, 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 처음으로 돌아간다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: LatentHeatState }): LatentHeatState {
  return params.state;
}
