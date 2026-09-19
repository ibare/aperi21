// ========================================================================
// electric-charge — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 공의 자리는 `release` 단계에 흐른 물리 시간의 함수이고,
// `step` 은 항등이다.
//
// 한 쌍은 좌우 대칭이라 한쪽 공만 풀면 된다. 실이 연직에서 바깥쪽으로 벌어진
// 각을 θ 라 하면(안쪽이면 음수)
//
//   두 공 사이 거리   d = d₀ + 2L·sin θ
//   전기력(바깥 +)    F = s·k·q²/d²     s = +1 같은 종류, −1 다른 종류
//   흔들림            L·θ'' = −g·sin θ + (F/m)·cos θ − 2ζω·L·θ'     ω = √(g/L)
//
// 다른 종류 쌍은 이 조건(0.3 μC · 30 cm)에서 멈춰 설 자리가 없어 끝까지 당겨져
// 공끼리 닿는다(d = 2r). 공은 부도체라 닿아도 전하가 옮겨 가지 않는다고 보고,
// 닿은 자리에 붙여 둔다 — 닿은 뒤의 일은 charging-methods 몫이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  BALL_MASS,
  BALL_RADIUS,
  CHARGE_MICRO_C,
  COULOMB_K,
  DAMPING_RATIO,
  G,
  PIVOT_GAP,
  STRING_LENGTH,
} from './schema';
import type { ElectricChargeState } from './state';

/** 적분 걸음(물리 초). 같은 시각은 언제나 같은 걸음 수로 풀린다. */
const INTEGRATION_DT = 1 / 2000;
/** μC → C. 단위 환산이다. */
const MICRO = 1e-6;

export interface ElectricChargeConstants {
  k: number;
  chargeMicroC: number;
  ballMass: number;
  ballRadius: number;
  stringLength: number;
  pivotGap: number;
  g: number;
  dampingRatio: number;
}

export function readConstants(stage: StageDef): ElectricChargeConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    k: c.k ?? COULOMB_K,
    chargeMicroC: c.chargeMicroC ?? CHARGE_MICRO_C,
    ballMass: c.ballMass ?? BALL_MASS,
    ballRadius: c.ballRadius ?? BALL_RADIUS,
    stringLength: c.stringLength ?? STRING_LENGTH,
    pivotGap: c.pivotGap ?? PIVOT_GAP,
    g: c.g ?? G,
    dampingRatio: c.dampingRatio ?? DAMPING_RATIO,
  };
}

/** 부호 곱. 같은 종류면 +1(바깥으로 민다), 다른 종류면 −1(안으로 당긴다). */
export type PairSign = 1 | -1;

/**
 * 놓은 뒤 `tau` 초가 흐른 때의 실 각(rad, 바깥쪽 +).
 *
 * 매 프레임 0 에서부터 같은 걸음으로 다시 푼다 — 시각의 순수 함수라 같은 시각은
 * 언제나 같은 자리다. 한 주기 물리 시간이 1.3 초라 걸음은 2600 번을 넘지 않는다.
 */
export function swingAngle(sign: PairSign, c: ElectricChargeConstants, tau: number): number {
  const q = c.chargeMicroC * MICRO;
  const L = c.stringLength;
  const omega = Math.sqrt(c.g / L);
  const damp = 2 * c.dampingRatio * omega;
  // 두 공이 닿는 각. 이보다 안으로는 가지 않는다.
  const contact = Math.asin(Math.max(-1, (2 * c.ballRadius - c.pivotGap) / (2 * L)));

  let theta = 0;
  let omegaT = 0;
  const steps = Math.floor(Math.max(0, tau) / INTEGRATION_DT);
  for (let i = 0; i < steps; i++) {
    const d = c.pivotGap + 2 * L * Math.sin(theta);
    const force = (sign * c.k * q * q) / (d * d);
    const acc = (-c.g * Math.sin(theta) + (force / c.ballMass) * Math.cos(theta)) / L - damp * omegaT;
    omegaT += acc * INTEGRATION_DT;
    theta += omegaT * INTEGRATION_DT;
    if (theta <= contact) {
      // 닿았다 — 붙은 채로 머문다.
      return contact;
    }
  }
  return theta;
}

export interface BallPlace {
  /** 쌍 가운데에서 공 중심까지의 가로 거리(m). */
  halfSpan: number;
  /** 천장에서 공 중심까지의 세로 거리(m, 아래가 −). */
  y: number;
}

/** 실 각 → 공 자리. */
export function ballPlace(theta: number, c: ElectricChargeConstants): BallPlace {
  return {
    halfSpan: c.pivotGap / 2 + c.stringLength * Math.sin(theta),
    y: -c.stringLength * Math.cos(theta),
  };
}

export interface Reading {
  like: BallPlace;
  unlike: BallPlace;
  /** 나타나고 물러나는 정도(1 이면 또렷하다). */
  opacity: number;
}

/**
 * 시간표 → 화면에 놓을 값. 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` 가
 * 그 단계의 진행도를 준다(앞에서는 0, 지난 뒤에는 1).
 */
export function derive(tl: TimelineFrame, c: ElectricChargeConstants): Reading {
  const tau = tl.at('release') * tl.duration('release');
  return {
    like: ballPlace(swingAngle(1, c, tau), c),
    unlike: ballPlace(swingAngle(-1, c, tau), c),
    opacity: tl.at('appear') * (1 - tl.at('fade')),
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: ElectricChargeState }): ElectricChargeState {
  return params.state;
}
