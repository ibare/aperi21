// ========================================================================
// impulse-momentum-theorem — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 시각의 닫힌 식이고, `step` 은 항등이다.
//
// 벽이 공을 미는 힘은 반사인 모양이다.
//
//   F(τ) = Fmax · sin(πτ/T)                     0 ≤ τ ≤ T (닿아 있는 동안)
//   J(τ) = ∫F dτ = J · (1 − cos(πτ/T)) / 2      쌓인 넓이
//   p(τ) = p₀ + J(τ)                            이 조각의 전부
//
// 전체 넓이 J = (1 + e)·|p₀| 이 되도록 Fmax 를 정한다. 넓이가 |p₀| 가 되는 순간
// p = 0 — 공이 멈춘다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { CONTACT_TIME, P_INITIAL, RESTITUTION, SPEED_PER_P } from './schema';
import type { ImpulseMomentumTheoremState } from './state';

export interface ImpulseMomentumTheoremConstants {
  pInitial: number;
  restitution: number;
  contactTime: number;
  speedPerP: number;
}

export function readConstants(stage: StageDef): ImpulseMomentumTheoremConstants {
  const c = stage.constants ?? {};
  return {
    pInitial: c.pInitial ?? P_INITIAL,
    restitution: c.restitution ?? RESTITUTION,
    contactTime: c.contactTime ?? CONTACT_TIME,
    speedPerP: c.speedPerP ?? SPEED_PER_P,
  };
}

export interface Reading {
  /** 닿은 뒤 흐른 조각 시계 시간(초). 닿기 전에는 음수. */
  tau: number;
  /** 닿아 있는 시간(초). */
  contactTime: number;
  /** 처음 운동량 · 지금 운동량 · 쌓인 넓이(충격량) · 전체 넓이. */
  p0: number;
  p: number;
  impulse: number;
  impulseTotal: number;
  /** 지금 힘 · 최대 힘. */
  force: number;
  forceMax: number;
  /** 넓이가 |p₀| 가 되는(공이 멈추는) 접촉 시각. */
  stopTau: number;
  /** 벽에 닿기 시작했는가 · 멈춘 순간을 지났는가. */
  touched: boolean;
  stopped: boolean;
  /** 공 중심 x 에서 벽 면까지 거리(월드) — 눌린 동안은 반가로 폭과 같다. */
  ballCenterX: number;
  /** 공의 반가로 · 반세로(월드). 눌림은 힘에 비례한다. */
  ballHalfW: number;
  ballHalfH: number;
  /** 물러나며 옅어지는 정도(1 이면 또렷하다). */
  opacity: number;
}

/** 쌓인 넓이의 비율 0~1. */
function areaFraction(tau: number, T: number): number {
  if (tau <= 0) return 0;
  if (tau >= T) return 1;
  return (1 - Math.cos((Math.PI * tau) / T)) / 2;
}

/**
 * 시간표 → 화면에 놓을 값들. 같은 시각은 언제나 같은 값이다.
 *
 * 시간표에서 묻는 것은 **닿기 시작하는 시각**(`start('stop')`)과 흐려지는 정도뿐이다.
 * 멈추는 순간 · 떨어지는 순간은 접촉 시간과 힘의 모양이 정한다 — 저작자가 `stop`
 * 단계를 늘여도 캡션이 늦게 바뀔 뿐 물리는 그대로다.
 */
export function derive(
  tl: TimelineFrame,
  c: ImpulseMomentumTheoremConstants,
  ballR: number,
  squashMax: number,
): Reading {
  const T = c.contactTime;
  const p0 = c.pInitial;
  const pf = -c.restitution * p0;
  const impulseTotal = pf - p0;
  const forceMax = (impulseTotal * Math.PI) / (2 * T);

  const tau = tl.u - tl.start('stop');
  const frac = areaFraction(tau, T);
  const impulse = impulseTotal * frac;
  const p = p0 + impulse;
  const inContact = tau > 0 && tau < T;
  const force = inContact ? forceMax * Math.sin((Math.PI * tau) / T) : 0;

  const stopTau = (T / Math.PI) * Math.acos(1 - (2 * Math.abs(p0)) / impulseTotal);

  // 공 — 닿기 전에는 벽 쪽으로, 떨어진 뒤에는 되돌아 달린다. 닿아 있는 동안 왼쪽
  // 가장자리는 벽 면에 붙어 있고, 받는 힘에 비례해 가로로 눌린다(넓이는 그대로).
  const squash = (force / forceMax) * squashMax * ballR;
  const halfW = ballR - squash;
  const halfH = (ballR * ballR) / halfW;
  const v = c.speedPerP;
  let centerX: number;
  if (tau <= 0) centerX = ballR + v * p0 * tau;
  else if (tau >= T) centerX = ballR + v * pf * (tau - T);
  else centerX = halfW;

  return {
    tau,
    contactTime: T,
    p0,
    p,
    impulse,
    impulseTotal,
    force,
    forceMax,
    stopTau,
    touched: tau > 0,
    stopped: tau >= stopTau,
    ballCenterX: centerX,
    ballHalfW: halfW,
    ballHalfH: halfH,
    opacity: 1 - tl.at('fade'),
  };
}

/** 그래프의 힘 곡선 한 점 — 접촉 밖은 0. */
export function forceAt(tau: number, c: ImpulseMomentumTheoremConstants, forceMax: number): number {
  const T = c.contactTime;
  if (tau <= 0 || tau >= T) return 0;
  return forceMax * Math.sin((Math.PI * tau) / T);
}

/** 쌓는 상태가 없다. */
export function step(params: { state: ImpulseMomentumTheoremState }): ImpulseMomentumTheoremState {
  return params.state;
}
