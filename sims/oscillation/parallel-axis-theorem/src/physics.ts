// ========================================================================
// parallel-axis-theorem — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 각은 시간표 진행도의 함수이고, `step` 은 캡션 판정만 맞춘다.
//
//   질량 중심 축   I_cm = ½MR²              (누운 원판)
//   옮긴 축        I    = I_cm + M·d²       (평행축 정리)
//   같은 돌림힘    θ(t) = τ·t² / (2I)       (멈춘 자리에서 출발)
//
// 두 원판의 각 비는 늘 I_cm / I 이다. 뒤처지는 정도가 곧 얹힌 조각의 크기다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { MASS, OFFSET_DEFAULT, RADIUS, TORQUE } from './schema';
import type { ParallelAxisTheoremState } from './state';

export interface ParallelAxisTheoremConstants {
  mass: number;
  radius: number;
  torque: number;
  /** 도착했을 때 고른 축 거리 d/R. */
  offsetRatioDefault: number;
}

export function readConstants(stage: StageDef): ParallelAxisTheoremConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    mass: c.mass ?? MASS,
    radius: c.radius ?? RADIUS,
    torque: c.torque ?? TORQUE,
    offsetRatioDefault: c.offsetRatioDefault ?? OFFSET_DEFAULT,
  };
}

export interface Reading {
  /** 축 거리(m). */
  d: number;
  /** 질량 중심 축의 관성 모멘트와 옮긴 축의 관성 모멘트(kg·m²). */
  iCenter: number;
  iShifted: number;
  /** 옮긴 축에서 더해진 몫 Md²(kg·m²). */
  added: number;
  /** 가장 큰 막대(d = R)의 관성 모멘트 — 막대 비율의 기준. */
  iMax: number;
  /** 두 원판이 멈춘 자리에서 돈 각(라디안, 반시계). */
  thetaCenter: number;
  thetaShifted: number;
  /** 물러나며 옅어지는 정도(1 이면 또렷하다). */
  opacity: number;
}

/**
 * 시간표 진행도 → 화면에 놓을 값들. 같은 시각은 언제나 같은 값이다.
 *
 * 돌림 단계의 진행도(linear)에 그 단계 길이를 곱한 것이 돌림힘을 건 시간이다.
 * 멈춤 · 물러남 단계에서는 `at('spin')` 이 1 이라 끝난 자리에 그대로 선다.
 */
export function derive(
  tl: TimelineFrame,
  c: ParallelAxisTheoremConstants,
  offsetRatio: number,
): Reading {
  const M = c.mass;
  const R = c.radius;
  const d = offsetRatio * R;
  const iCenter = 0.5 * M * R * R;
  const added = M * d * d;
  const iShifted = iCenter + added;
  const time = tl.at('spin') * tl.duration('spin');
  const swept = (c.torque * time * time) / 2;
  return {
    d,
    iCenter,
    iShifted,
    added,
    iMax: iCenter + M * R * R,
    thetaCenter: swept / iCenter,
    thetaShifted: swept / iShifted,
    opacity: 1 - tl.at('fade'),
  };
}

/** 쌓는 상태가 없다 — 칩이 고른 거리에서 캡션 판정만 따라 맞춘다. */
export function step(params: { state: ParallelAxisTheoremState }): ParallelAxisTheoremState {
  const { state } = params;
  const sameAxis = state.offsetRatio === 0;
  return sameAxis === state.sameAxis ? state : { ...state, sameAxis };
}
