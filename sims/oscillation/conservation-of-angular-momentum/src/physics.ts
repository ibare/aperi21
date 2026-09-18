// ========================================================================
// conservation-of-angular-momentum — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 조각 시계의 함수이고, `step` 은 항등이다.
//
//   I(r) = I₀ + 2·m·r²          몸통 + 양손의 추
//   L    = I(r_out)·ω_out        돌림을 주는 것이 없으니 끝까지 이 값이다
//   ω(t) = L / I(r(t))
//   θ(t) = θ₀ + ∫₀ᵗ ω dt        돈 각은 지나온 시각 전부에 걸친 적분
//
// θ 가 적분이라 「지금」 의 진행도만으로는 모자라다 — 지나온 시각마다 손이 어디에
// 있었는지를 다시 물어야 한다. `TimelineFrame` 은 지금의 진행도만 주므로(G59)
// 단계의 시작 · 길이는 시간표에서 읽고, 모으는 모양은 여기서 건다.
// ========================================================================

import type { StageDef, TimelineEase, TimelineFrame } from '@aperi21/schema';
import {
  CORE_INERTIA,
  HAND_MASS,
  OMEGA_OUT,
  REACH_IN,
  REACH_OUT,
  START_ANGLE,
  SWEEP_WINDOW,
  conservationOfAngularMomentumSchema,
} from './schema';
import type { ConservationOfAngularMomentumState } from './state';

export interface ConservationOfAngularMomentumConstants {
  coreInertia: number;
  handMass: number;
  reachOut: number;
  reachIn: number;
  omegaOut: number;
  sweepWindow: number;
}

export function readConstants(stage: StageDef): ConservationOfAngularMomentumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    coreInertia: c.coreInertia ?? CORE_INERTIA,
    handMass: c.handMass ?? HAND_MASS,
    reachOut: c.reachOut ?? REACH_OUT,
    reachIn: c.reachIn ?? REACH_IN,
    omegaOut: c.omegaOut ?? OMEGA_OUT,
    sweepWindow: c.sweepWindow ?? SWEEP_WINDOW,
  };
}

/** 관성 모멘트 — 몸통 + 반지름 r 에 든 추 둘. */
export function inertia(r: number, c: ConservationOfAngularMomentumConstants): number {
  return c.coreInertia + 2 * c.handMass * r * r;
}

/** 각운동량. 벌린 팔로 돌 때 정해지고 그 뒤 바뀌지 않는다. */
export function angularMomentum(c: ConservationOfAngularMomentumConstants): number {
  return inertia(c.reachOut, c) * c.omegaOut;
}

/**
 * 모으고 벌리는 모양 — 선언된 단계의 `ease` 를 따른다 (S-piece 「시간표는 선언이다」).
 *
 * 각은 지나온 시각 전부에 걸친 적분이라 `tl.at` (지금 시각만)을 쓸 수 없다 (G59). 그래서
 * 선언에서 이징 이름을 읽어 엔진과 같은 식을 여기서 다시 건다.
 */
const EASES: Record<TimelineEase, (x: number) => number> = {
  linear: (x) => x,
  smooth: (x) => x * x * (3 - 2 * x),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};

function shape(phaseId: string, p: number): number {
  const q = Math.min(1, Math.max(0, p));
  const phase = conservationOfAngularMomentumSchema.timeline?.phases.find((ph) => ph.id === phaseId);
  return EASES[phase?.ease ?? 'linear'](q);
}

/** 주기 안 시각 u 에서 손이 축에서 떨어진 거리. 단계의 시작 · 길이는 시간표에서 읽는다. */
export function reachAt(
  u: number,
  tl: TimelineFrame,
  c: ConservationOfAngularMomentumConstants,
): number {
  const pullFrom = tl.start('pull');
  const pullP = shape('pull', (u - pullFrom) / tl.duration('pull'));
  const spreadFrom = tl.start('spread');
  const spreadP = shape('spread', (u - spreadFrom) / tl.duration('spread'));
  // 모으는 몫에서 다시 벌린 몫을 뺀다. 단계 밖에서는 둘 다 0 또는 1 로 붙어 있다.
  const inward = pullP - spreadP;
  return c.reachOut + (c.reachIn - c.reachOut) * inward;
}

/** 주기 안 시각 u 의 각속도. */
export function omegaAt(
  u: number,
  tl: TimelineFrame,
  c: ConservationOfAngularMomentumConstants,
): number {
  return angularMomentum(c) / inertia(reachAt(u, tl, c), c);
}

/** 적분 칸 수. 손이 움직이는 단계 하나를 이만큼으로 나눈다 (심프슨, 짝수). */
const SIMPSON_STEPS = 64;

/** 주기 첫머리부터 u 까지 돈 각. 손이 움직이지 않는 구간은 곱으로, 움직이는 구간은 심프슨으로. */
function turnedWithinCycle(
  u: number,
  tl: TimelineFrame,
  c: ConservationOfAngularMomentumConstants,
): number {
  // 단계 경계로 구간을 나눈다 — 각 구간 안에서 ω 가 매끄럽다.
  const cuts = [0, tl.start('pull'), tl.end('pull'), tl.start('spread'), tl.end('spread'), tl.period];
  let total = 0;
  for (let i = 0; i + 1 < cuts.length; i++) {
    const a = cuts[i]!;
    const b = Math.min(cuts[i + 1]!, u);
    if (b <= a) break;
    const n = SIMPSON_STEPS;
    const h = (b - a) / n;
    let s = omegaAt(a, tl, c) + omegaAt(b, tl, c);
    for (let k = 1; k < n; k++) s += (k % 2 === 1 ? 4 : 2) * omegaAt(a + k * h, tl, c);
    total += (s * h) / 3;
  }
  return total;
}

/** 조각 시계 t 에서의 팔 방향(rad). 주기를 넘어 이어진다 — 한 주기에 도는 각을 곱해 더한다. */
export function angleAt(
  t: number,
  tl: TimelineFrame,
  c: ConservationOfAngularMomentumConstants,
): number {
  const cycle = Math.floor(t / tl.period);
  const u = t - cycle * tl.period;
  return START_ANGLE + cycle * turnedWithinCycle(tl.period, tl, c) + turnedWithinCycle(u, tl, c);
}

export interface Reading {
  /** 손이 축에서 떨어진 거리(m). */
  reach: number;
  /** 지금 팔 방향과 `sweepWindow` 초 전 팔 방향(rad). */
  angle: number;
  angleBefore: number;
  /** 관성 모멘트 · 각속도 · 각운동량. */
  inertia: number;
  omega: number;
  momentum: number;
}

/** 시간표 프레임 → 화면에 놓을 값들. 같은 시각은 언제나 같은 값이다. */
export function derive(
  tl: TimelineFrame,
  c: ConservationOfAngularMomentumConstants,
): Reading {
  const reach = reachAt(tl.u, tl, c);
  const I = inertia(reach, c);
  const L = angularMomentum(c);
  return {
    reach,
    angle: angleAt(tl.t, tl, c),
    angleBefore: angleAt(tl.t - c.sweepWindow, tl, c),
    inertia: I,
    omega: L / I,
    momentum: L,
  };
}

/** 쌓는 상태가 없다. */
export function step(params: {
  state: ConservationOfAngularMomentumState;
}): ConservationOfAngularMomentumState {
  return params.state;
}
