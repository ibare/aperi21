// ========================================================================
// specific-heat — 순수 물리
// ========================================================================
// 세 덩이가 같은 질량 m, 같은 처음 온도 T₀ 에서 같은 열 Q 를 받는다. 받은 열이 가열
// 단계 동안 고르게 들어가면(진행도 f), 덩이마다
//   T(f) = T₀ + f · Q / (m · c)
// 다. 같은 시각에 오른 온도는 비열 c 에 반비례한다 — 구리(385)는 물(4180)의 약 10.9 배.
//
// 모든 것이 시각의 닫힌 식이라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  AXIS_MAX,
  AXIS_MIN,
  C_ALUMINUM,
  C_COPPER,
  C_WATER,
  GRAINS,
  GRAIN_TRAVEL,
  HEAT_J,
  MASS_G,
  SEED,
  T_START,
} from './schema';
import type { SpecificHeatState } from './state';

/** 질량을 g 로, 비열을 J/(kg·K) 로 선언하므로 둘을 맞추는 단위 환산. */
const G_PER_KG = 1000;

export interface SpecificHeatConstants {
  /** 비열(J/(kg·K)). */
  cWater: number;
  cAluminum: number;
  cCopper: number;
  /** 질량(g) · 처음 온도(℃) · 가열 단계 동안 덩이 하나가 받는 열(J). */
  massG: number;
  tStart: number;
  heatJ: number;
  /** 가열 단계 동안 덩이 하나로 들어가는 열 알갱이 수 · 이동 시간(초) · 자리 시드. */
  grains: number;
  grainTravel: number;
  seed: number;
  /** 온도 막대 눈금의 아래 · 위 끝(℃). */
  axisMin: number;
  axisMax: number;
}

export function readConstants(stage: StageDef): SpecificHeatConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    cWater: c.cWater ?? C_WATER,
    cAluminum: c.cAluminum ?? C_ALUMINUM,
    cCopper: c.cCopper ?? C_COPPER,
    massG: c.massG ?? MASS_G,
    tStart: c.tStart ?? T_START,
    heatJ: c.heatJ ?? HEAT_J,
    grains: c.grains ?? GRAINS,
    grainTravel: c.grainTravel ?? GRAIN_TRAVEL,
    seed: c.seed ?? SEED,
    axisMin: c.axisMin ?? AXIS_MIN,
    axisMax: c.axisMax ?? AXIS_MAX,
  };
}

/** 받은 열의 몫 f(0~1)에서, 비열 c 인 덩이의 온도(℃). */
export function tempAt(f: number, spec: number, c: SpecificHeatConstants): number {
  return c.tStart + (f * c.heatJ) / ((c.massG / G_PER_KG) * spec);
}

/** 이번 주기에서 받은 열의 몫 0~1 — 가열 단계 동안 고르게 들어간다. */
export function heatShare(tl: TimelineFrame): number {
  return tl.at('heat');
}

/** 가열기가 켜진 정도 0~1 — 켜는 단계에서 올라가고 끄는 단계에서 내려간다. */
export function heaterLevel(tl: TimelineFrame): number {
  return tl.at('on') * (1 - tl.at('off'));
}

/** 가열 단계가 시작한 뒤 흐른 시간(초). 시작 전에는 음수다. */
export function heatTime(tl: TimelineFrame): number {
  return tl.u - tl.start('heat');
}

/**
 * 알갱이 n 이 가열기를 떠나는 시각(가열 단계 시작 뒤 초).
 *
 * 같은 간격으로 떠난다 — 가열기의 세기가 일정하다. 마지막 알갱이도 가열 단계 안에서
 * 덩이에 닿도록, 간격은 (단계 길이 − 이동 시간) 을 알갱이 수로 나눈 것이다.
 */
export function departTime(n: number, heatDuration: number, c: SpecificHeatConstants): number {
  const spacing = (heatDuration - c.grainTravel) / c.grains;
  return (n + 0.5) * spacing;
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
export function step(params: { state: SpecificHeatState }): SpecificHeatState {
  return params.state;
}
