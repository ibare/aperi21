// ========================================================================
// coulombs-law — 순수 물리
// ========================================================================
// 점전하 둘 사이의 힘 하나뿐이다.
//
//   F(x) = k·q₁·q₂ / x²
//
// 쌓는 상태가 없다. 두 번째 전하의 자리는 그 줄이 벌어지는 단계의 진행도에서
// 나오고, 힘은 그 자리의 함수라 같은 시각은 언제나 같은 화면이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ARROW_SCALE,
  BASE_DISTANCE,
  COULOMB_K,
  Q1_MICRO_C,
  Q2_MICRO_C,
  RATIO_FAR,
  RATIO_MID,
  RATIO_NEAR,
} from './schema';
import type { CoulombsLawState } from './state';

/** μC → C. 단위 환산이다. */
const MICRO = 1e-6;

export interface CoulombsLawConstants {
  k: number;
  q1MicroC: number;
  q2MicroC: number;
  /** 기준 거리 r(m). */
  r: number;
  /** 세 줄이 멈추는 거리의 배수. */
  ratioNear: number;
  ratioMid: number;
  ratioFar: number;
  /** 힘 → 화살표 길이 배율(m/N). */
  arrowScale: number;
}

export function readConstants(stage: StageDef): CoulombsLawConstants {
  const c = stage.constants ?? {};
  return {
    k: c.k ?? COULOMB_K,
    q1MicroC: c.q1MicroC ?? Q1_MICRO_C,
    q2MicroC: c.q2MicroC ?? Q2_MICRO_C,
    r: c.r ?? BASE_DISTANCE,
    ratioNear: c.ratioNear ?? RATIO_NEAR,
    ratioMid: c.ratioMid ?? RATIO_MID,
    ratioFar: c.ratioFar ?? RATIO_FAR,
    arrowScale: c.arrowScale ?? ARROW_SCALE,
  };
}

/** 거리 x(m) 에서 두 전하가 서로 미는 힘의 크기(N). */
export function coulombForce(x: number, c: CoulombsLawConstants): number {
  return (c.k * c.q1MicroC * MICRO * c.q2MicroC * MICRO) / (x * x);
}

/** 그 힘을 그릴 화살표 길이(m). 모든 줄이 같은 배율이다. */
export function arrowLength(x: number, c: CoulombsLawConstants): number {
  return coulombForce(x, c) * c.arrowScale;
}

export interface PairReading {
  /** 두 번째 전하의 x(m) — 첫 전하가 x = 0 이라 곧 두 전하 사이 거리다. */
  distance: number;
  /** 지금 힘 화살표 길이(m). */
  arrow: number;
  /** 기준 거리 r 에서의 화살표 길이(m) — 점선으로 남기는 처음 길이. */
  reference: number;
  /** 벌어지기 시작했는가 — 점선 기준과 등분 눈금을 깔 조건이다. */
  started: boolean;
  /** 멈출 거리에 닿았는가 — 배수 표식을 붙일 조건이다. */
  arrived: boolean;
}

/**
 * 한 줄을 읽는다. `phase` 는 이 줄이 벌어지는 단계 id 이고, 없으면 처음부터
 * 제자리(`ratio` 배 거리)에 있다. **단계 경계는 선언이 정한다** — 벌어지는 동안의
 * 진행도를 `timeline.at` 에게 묻는다 (S-piece 「시간표는 선언이다」).
 */
export function readPair(
  tl: TimelineFrame,
  ratio: number,
  phase: string | undefined,
  c: CoulombsLawConstants,
): PairReading {
  const s = phase ? tl.at(phase) : 1;
  const distance = c.r + (ratio * c.r - c.r) * s;
  return {
    distance,
    arrow: arrowLength(distance, c),
    reference: arrowLength(c.r, c),
    started: s > 0,
    arrived: s >= 1,
  };
}

/** 이번 주기에서 그림의 짙기 0~1. 떠오르고, 마지막 단계에서 흐려진다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return tl.at('appear') * (1 - tl.at('fade'));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: CoulombsLawState }): CoulombsLawState {
  return params.state;
}
