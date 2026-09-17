// ========================================================================
// fictitious-force — 순수 물리
// ========================================================================
// 그네와 함께 도는 틀에서 추 하나가 받는 힘: 관성력 mω²r(바깥), 중력 mg(아래),
// 장력(줄 방향 — 각운동에서 빠진다). 줄에 수직인 성분 / (mL) 이 각가속도다.
// 질량은 힘에 곱해지고 가속도에서 나뉜다 — 두 추가 같은 각도인 것은 식에서 나온다.
// 원본 `step` 그대로 (반암시 오일러, 고정 걸음).
// ========================================================================

import { DAMP, FIXED_DT, G, L, LIGHT_M, OMEGA, R } from './schema';
import type { Bob, FictitiousForceState } from './state';

/** 고정 걸음 적립의 여유 — 부동소수 오차로 한 걸음을 놓치지 않게. */
const ACC_EPS = 1e-6;
/** 한 번의 `step` 이 쪼개 걷는 걸음 수 상한. 폭주 방지일 뿐이다. */
const MAX_FIXED_STEPS = 12;
/** 평형각 반복 풀이의 시작값과 반복 수 — 원본 그대로. */
const EQ_START = 0.3;
const EQ_ITER = 60;

/** 회전 빠르기 (rad/s). 원본 `omegaAt` — 한 주기 동안 최소 → 최대 → 최소. */
export function omegaAt(t: number): number {
  return OMEGA.min + ((OMEGA.max - OMEGA.min) * (1 - Math.cos((2 * Math.PI * t) / OMEGA.period))) / 2;
}

/** 주어진 ω 에서 줄이 멈춰 설 각도 — tanθ = ω²(R + L sinθ)/g 를 반복으로 푼다. */
export function equilibriumAngle(omega: number): number {
  let th = EQ_START;
  for (let i = 0; i < EQ_ITER; i++) th = Math.atan((omega * omega * (R + L * Math.sin(th))) / G);
  return th;
}

/** 추 하나가 받는 두 힘(N)과 도는 반지름(m). 원본 `forces`. */
export function forcesOn(bob: Bob, m: number, omega: number): { r: number; inertial: number; gravity: number } {
  const r = R + L * Math.sin(bob.th);
  return { r, inertial: m * omega * omega * r, gravity: m * G };
}

function advance(bob: Bob, m: number, omega: number, dt: number): Bob {
  const f = forcesOn(bob, m, omega);
  // 줄에 수직인 방향 성분만 추를 돌린다. 장력은 줄 방향이라 빠진다.
  const tangential = f.inertial * Math.cos(bob.th) - f.gravity * Math.sin(bob.th);
  const thdd = tangential / (m * L) - DAMP * bob.thd;
  const thd = bob.thd + thdd * dt;
  return { th: bob.th + thd * dt, thd };
}

/** 고정 걸음 하나. 원본 `step(dt, t)` — ω 는 걸음 **앞** 시각의 값이다. */
function fixedStep(s: FictitiousForceState, dt: number): FictitiousForceState {
  const omega = omegaAt(s.t);
  return {
    ...s,
    left: advance(s.left, LIGHT_M, omega, dt),
    right: advance(s.right, s.heavyMass, omega, dt),
    phi: s.phi + omega * dt,
    t: s.t + dt,
  };
}

/**
 * 한 걸음. 러너의 걸음을 1/60 고정 걸음으로 쪼개 원본 적분을 돌리고, 캡션이 읽는
 * 「질량이 같은가」를 채운다.
 */
export function step(params: { state: FictitiousForceState; dt: number }): FictitiousForceState {
  let s = params.state;
  let acc = s.acc + params.dt;
  for (let i = 0; i < MAX_FIXED_STEPS && acc >= FIXED_DT - ACC_EPS; i++) {
    s = fixedStep(s, FIXED_DT);
    acc -= FIXED_DT;
  }
  // 상한에 걸려 남은 몫은 버린다 — 탭을 오래 떠났다 돌아온 걸음이 한꺼번에 몰리지 않게.
  acc = Math.max(0, Math.min(acc, FIXED_DT));
  return { ...s, acc, equalMass: s.heavyMass === LIGHT_M };
}
