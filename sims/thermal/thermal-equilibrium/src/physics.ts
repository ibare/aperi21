// ========================================================================
// thermal-equilibrium — 순수 물리
// ========================================================================
// 같은 물질 · 같은 질량의 두 덩이. 맞닿은 면을 건너는 흐름이 온도 차에 비례하면
//   Δ(s) = Δ₀ · e^(−rate·s),  T뜨거움 = 가운데 + Δ/2,  T참 = 가운데 − Δ/2
// 이고(s 는 맞붙은 뒤 흐른 시간), 건너간 열의 몫은 1 − e^(−rate·s) 다. 두 덩이의
// 열용량이 같으니 만나는 온도는 두 처음 온도의 가운데다.
//
// 모든 것이 시각의 닫힌 식이라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ARROW_LEN,
  ARROW_MIN_RATIO,
  ARROW_WIDTH,
  AXIS_MAX,
  AXIS_MIN,
  PACKETS,
  PACKET_TRAVEL,
  RATE,
  SEED,
  T_COLD,
  T_HOT,
  T_MEET,
} from './schema';
import type { ThermalEquilibriumState } from './state';

export interface ThermalEquilibriumConstants {
  /** 처음 온도(℃). */
  tHot: number;
  tCold: number;
  /** 만나는 온도(℃) — 화면 글자용 정박값. 가운데 계산과 같아야 한다(G143). */
  tMeet: number;
  /** 온도 차가 줄어드는 빠르기(1/초). */
  rate: number;
  /** 건너가는 열 알갱이 수 · 알갱이 하나의 이동 시간(초) · 자리 시드. */
  packets: number;
  packetTravel: number;
  seed: number;
  /** 온도 눈금의 아래 · 위 끝(℃). */
  axisMin: number;
  axisMax: number;
  /** 열 화살표의 처음 길이(월드) · 굵기(화면 px) · 거두는 문턱(처음 차에 대한 몫). */
  arrowLen: number;
  arrowWidth: number;
  arrowMinRatio: number;
}

export function readConstants(stage: StageDef): ThermalEquilibriumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    tHot: c.tHot ?? T_HOT,
    tCold: c.tCold ?? T_COLD,
    tMeet: c.tMeet ?? T_MEET,
    rate: c.rate ?? RATE,
    packets: c.packets ?? PACKETS,
    packetTravel: c.packetTravel ?? PACKET_TRAVEL,
    seed: c.seed ?? SEED,
    axisMin: c.axisMin ?? AXIS_MIN,
    axisMax: c.axisMax ?? AXIS_MAX,
    arrowLen: c.arrowLen ?? ARROW_LEN,
    arrowWidth: c.arrowWidth ?? ARROW_WIDTH,
    arrowMinRatio: c.arrowMinRatio ?? ARROW_MIN_RATIO,
  };
}

/** 두 덩이가 만나는 온도(℃). 같은 물질 · 같은 질량이라 가운데다. */
export function meetTemp(c: ThermalEquilibriumConstants): number {
  return (c.tHot + c.tCold) / 2;
}

/**
 * 맞붙은 뒤 흐른 시간(초). 맞붙는 순간은 `flow` 단계의 시작이고, 그 시각도 선언이 안다.
 * 맞붙기 전에는 0 이다.
 */
export function contactTime(tl: TimelineFrame): number {
  return Math.max(0, tl.u - tl.start('flow'));
}

/** 맞붙은 뒤 곡선 판이 담는 시간(초) — 흐르는 두 단계와 멈춘 단계의 합. */
export function graphSpan(tl: TimelineFrame): number {
  return tl.duration('flow') + tl.duration('slow') + tl.duration('hold');
}

/** 처음 차에 대한 지금 온도 차의 몫 0~1. */
export function diffRatio(s: number, c: ThermalEquilibriumConstants): number {
  return Math.exp(-c.rate * s);
}

export interface Temps {
  hot: number;
  cold: number;
}

/** 맞붙은 뒤 s 초의 두 온도(℃). */
export function tempsAt(s: number, c: ThermalEquilibriumConstants): Temps {
  const half = ((c.tHot - c.tCold) / 2) * diffRatio(s, c);
  const mid = meetTemp(c);
  return { hot: mid + half, cold: mid - half };
}

/**
 * 알갱이 n 이 떠나는 시각(맞붙은 뒤 초).
 *
 * 건너간 열의 몫 1 − e^(−rate·s) 가 (n + ½)/packets 를 넘는 순간이다. 흐름이 굵을 때는
 * 촘촘하게, 차가 줄면 드물게 떠난다 — 알갱이의 간격이 곧 흐름의 세기다.
 */
export function departTime(n: number, c: ThermalEquilibriumConstants): number {
  const share = (n + 0.5) / c.packets;
  return -Math.log(1 - share) / c.rate;
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

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 다시 떨어뜨린다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ThermalEquilibriumState }): ThermalEquilibriumState {
  return params.state;
}
