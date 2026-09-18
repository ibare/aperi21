// ========================================================================
// conservation-of-momentum — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 주기 안 시각 u 의 함수이고, `step` 은 항등이다.
//
// 두 번의 밀기가 있다. 둘 다 선형 용수철 범퍼라 닿아 있는 동안은 반주기 단진동이다.
//
//   수레끼리  상대 운동이 반주기 도는 동안(길이 T)
//             v_i(s) = v_cm + (v_i0 − v_cm)·cos(πs),   s = τ/T
//             x_i(s) = x_i0 + v_cm·τ + (v_i0 − v_cm)·(T/π)·sin(πs)
//             → m_A·v_A + m_B·v_B 는 s 와 무관하게 (m_A+m_B)·v_cm  (계 안의 힘)
//   벽과 A    v_A(s) = v_A1·cos(πs)  — 벽은 계 밖이라 합이 2·m_A·|v_A1| 늘어난다
//
// 용수철 굳기는 단계 길이에서 나온다 — k = μ·(π/T)². 저작자가 `contact` 를 늘이면
// 범퍼가 물러질 뿐 주고받는 운동량은 같다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  CART_A_W,
  CART_B_W,
  BUMPER_B,
  BUMPER_WALL,
  CONTACT_A_X,
  MASS_A,
  MASS_B,
  VEL_A,
  VEL_B,
} from './schema';
import type { ConservationOfMomentumState } from './state';

export interface MomentumConstants {
  massA: number;
  massB: number;
  velA: number;
  velB: number;
}

export function readConstants(stage: StageDef): MomentumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    massA: c.massA ?? MASS_A,
    massB: c.massB ?? MASS_B,
    velA: c.velA ?? VEL_A,
    velB: c.velB ?? VEL_B,
  };
}

export interface Reading {
  /** 수레 중심 x(월드). */
  xA: number;
  xB: number;
  /** 운동량(kg·m/s, 오른쪽이 +). */
  pA: number;
  pB: number;
  /** 처음 합 — 벽이 밀기 전까지 그대로인 값. */
  total0: number;
  /** 두 수레 사이 · 벽과 A 사이에서 미는 힘의 크기(N). */
  pairForce: number;
  wallForce: number;
  /** 벽 범퍼가 붙은 벽면 x. */
  wallX: number;
  /** 두 범퍼의 지금 길이(m). */
  bumperB: number;
  bumperWall: number;
  /** 나타남 · 물러남(1 이면 또렷하다). */
  opacity: number;
}

/**
 * 시간표 → 화면에 놓을 값. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두지 않는다 — 두 밀기의 시작 시각과 길이를 `start` · `duration`
 * 으로 받아 물리 시간으로 쓴다. 벽의 자리도 거기서 나온다(A 가 `wall` 단계 시작에
 * 벽 범퍼에 막 닿도록).
 */
export function derive(tl: TimelineFrame, c: MomentumConstants): Reading {
  const mA = c.massA;
  const mB = c.massB;
  const vA0 = c.velA;
  const vB0 = c.velB;
  const vcm = (mA * vA0 + mB * vB0) / (mA + mB);
  const vA1 = 2 * vcm - vA0;
  const vB1 = 2 * vcm - vB0;

  const t0 = tl.start('contact');
  const T = tl.duration('contact');
  const tw = tl.start('wall');
  const Tw = tl.duration('wall');

  // 두 수레가 닿는 순간의 자리 — A 의 앞면이 B 범퍼 끝에 닿는다.
  const xA0 = CONTACT_A_X;
  const xB0 = xA0 + CART_A_W / 2 + BUMPER_B + CART_B_W / 2;

  /** 수레끼리의 밀기만 따진 자리 · 속도. τ 는 닿기 시작한 뒤 흐른 시간. */
  const pairMotion = (tau: number, x0: number, v0: number, v1: number) => {
    if (tau <= 0) return { x: x0 + v0 * tau, v: v0, sin: 0 };
    if (tau >= T) return { x: x0 + vcm * T + v1 * (tau - T), v: v1, sin: 0 };
    const s = tau / T;
    return {
      x: x0 + vcm * tau + (v0 - vcm) * (T / Math.PI) * Math.sin(Math.PI * s),
      v: vcm + (v0 - vcm) * Math.cos(Math.PI * s),
      sin: Math.sin(Math.PI * s),
    };
  };

  const tau = tl.u - t0;
  const a = pairMotion(tau, xA0, vA0, vA1);
  const b = pairMotion(tau, xB0, vB0, vB1);

  // 벽 — A 가 벽 범퍼에 닿는 자리에서 벽의 자리를 거꾸로 정한다.
  const xAw = xA0 + vcm * T + vA1 * (tw - t0 - T);
  const wallX = xAw - CART_A_W / 2 - BUMPER_WALL;
  const sw = tl.u - tw;

  let xA = a.x;
  let vA = a.v;
  let wallSin = 0;
  if (sw > 0 && sw < Tw) {
    const s = sw / Tw;
    wallSin = Math.sin(Math.PI * s);
    xA = xAw + vA1 * (Tw / Math.PI) * wallSin;
    vA = vA1 * Math.cos(Math.PI * s);
  } else if (sw >= Tw) {
    xA = xAw - vA1 * (sw - Tw);
    vA = -vA1;
  }

  // 범퍼의 눌림과 힘. 굳기는 반주기 = 단계 길이가 되도록 정해진다.
  const mu = (mA * mB) / (mA + mB);
  const pairComp = (vA0 - vB0) * (T / Math.PI) * a.sin;
  const wallComp = -vA1 * (Tw / Math.PI) * wallSin;
  const kPair = mu * (Math.PI / T) ** 2;
  const kWall = mA * (Math.PI / Tw) ** 2;

  return {
    xA,
    xB: b.x,
    pA: mA * vA,
    pB: mB * b.v,
    total0: mA * vA0 + mB * vB0,
    pairForce: kPair * pairComp,
    wallForce: kWall * wallComp,
    wallX,
    bumperB: BUMPER_B - pairComp,
    bumperWall: BUMPER_WALL - wallComp,
    opacity: tl.at('enter') * (1 - tl.at('fade')),
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: ConservationOfMomentumState }): ConservationOfMomentumState {
  return params.state;
}
