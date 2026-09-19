// ========================================================================
// motor — 순수 물리
// ========================================================================
// 굴대 방향에서 본 고리. 변 A 가 각 θ(오른쪽에서 반시계), 변 B 는 맞은편(θ + π)에 있다.
// 자기장 B 는 오른쪽(+x), 변은 화면 안팎으로 뻗는다. 변 A 의 전류 부호 s(+1 이면 ⊙ 화면 밖,
// −1 이면 ⊗ 안쪽)일 때 변마다 힘은 세로다 — ⊙ 는 위, ⊗ 는 아래 (F = I L × B).
//
//   F = B I L                      변 하나가 받는 힘의 크기. 고리가 어디 있든 같다.
//   τ = 2 r F s cos θ              두 변의 힘이 만드는 돌림힘(반시계 +). 수직 자리(cos θ = 0)에서 0.
//   J θ'' = τ − b θ'               굴대 마찰 b 가 끝없이 빨라지는 것을 막는다.
//
// 정류자: 오른쪽 브러시가 +, 왼쪽이 −. 오른쪽에 있는 변이 늘 ⊗ 이 되도록 s = −sign(cos θ) —
// 수직 자리를 지날 때마다 s 가 뒤집혀 τ = −2 r F |cos θ| 가 늘 시계 방향이다.
// 끊김 없는 고리(슬립 링): s 가 출발 때 값에 묶인다. 수직 자리를 넘으면 τ 가 도로 당기는 쪽이 된다.
//
// 각은 전류가 흐르기 시작한 단계(`push` · `ringsPush`)의 시작부터 고정 걸음으로 적분한다.
// 앞 프레임을 이어받지 않으므로 같은 시각은 언제나 같은 화면이고 `step` 은 항등이다.
// 단계 경계는 `tl.start(id)` 가 준다 — 모듈 상수로 두지 않는다 (S-piece).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ARM_RADIUS,
  CURRENT,
  FIELD,
  FORCE_SCALE,
  FRICTION,
  INERTIA,
  SIDE_LENGTH,
  START_ANGLE_DEG,
  TRAIL_SECONDS,
} from './schema';
import type { MotorState } from './state';

/** 적분 걸음(조각 시계 초). 수치 방법의 몫이라 스테이지 상수가 아니다. */
const INTEGRATE_DT = 1 / 500;
/** 꼬리 표본을 이 걸음마다 하나 남긴다. */
const TRAIL_EVERY = 4;

export interface MotorConstants {
  field: number;
  current: number;
  sideLength: number;
  armRadius: number;
  inertia: number;
  friction: number;
  forceScale: number;
  startAngleDeg: number;
  trailSeconds: number;
}

export function readConstants(stage: StageDef): MotorConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    field: c.field ?? FIELD,
    current: c.current ?? CURRENT,
    sideLength: c.sideLength ?? SIDE_LENGTH,
    armRadius: c.armRadius ?? ARM_RADIUS,
    inertia: c.inertia ?? INERTIA,
    friction: c.friction ?? FRICTION,
    forceScale: c.forceScale ?? FORCE_SCALE,
    startAngleDeg: c.startAngleDeg ?? START_ANGLE_DEG,
    trailSeconds: c.trailSeconds ?? TRAIL_SECONDS,
  };
}

/** 이어 붙이는 방식 — 쪼갠 고리(정류자) 또는 끊김 없는 고리. */
export type Connection = 'commutator' | 'rings';

/** 변 하나가 받는 힘의 크기(N). */
export function sideForce(c: MotorConstants): number {
  return c.field * c.current * c.sideLength;
}

/** 출발 자세(rad). */
function startAngle(c: MotorConstants): number {
  return (c.startAngleDeg * Math.PI) / 180;
}

/** 출발 자세에서 변 A 의 전류 부호 — 오른쪽 브러시(+)에 닿은 쪽이 ⊗. 끊김 없는 고리는 이 값에 묶인다. */
function startSign(c: MotorConstants): number {
  return Math.cos(startAngle(c)) > 0 ? -1 : 1;
}

/** 변 A 의 전류 부호(+1 ⊙ · −1 ⊗). */
export function signOf(theta: number, conn: Connection, c: MotorConstants): number {
  if (conn === 'rings') return startSign(c);
  const cs = Math.cos(theta);
  if (cs > 0) return -1;
  if (cs < 0) return 1;
  return startSign(c);
}

function accel(theta: number, omega: number, conn: Connection, c: MotorConstants): number {
  const torque = 2 * c.armRadius * sideForce(c) * signOf(theta, conn, c) * Math.cos(theta);
  return (torque - c.friction * omega) / c.inertia;
}

/** RK4 한 걸음. */
function rk4(theta: number, omega: number, h: number, conn: Connection, c: MotorConstants): [number, number] {
  const k1t = omega;
  const k1w = accel(theta, omega, conn, c);
  const k2t = omega + (h / 2) * k1w;
  const k2w = accel(theta + (h / 2) * k1t, omega + (h / 2) * k1w, conn, c);
  const k3t = omega + (h / 2) * k2w;
  const k3w = accel(theta + (h / 2) * k2t, omega + (h / 2) * k2w, conn, c);
  const k4t = omega + h * k3w;
  const k4w = accel(theta + h * k3t, omega + h * k3w, conn, c);
  return [
    theta + (h / 6) * (k1t + 2 * k2t + 2 * k3t + k4t),
    omega + (h / 6) * (k1w + 2 * k2w + 2 * k3w + k4w),
  ];
}

/** 전류가 흐른 지 `elapsed` 초 뒤의 각 · 각속도, 그리고 꼬리(지나온 각들, 오래된 것부터). */
export function integrate(
  elapsed: number,
  conn: Connection,
  c: MotorConstants,
): { theta: number; omega: number; trail: number[] } {
  let theta = startAngle(c);
  let omega = 0;
  const n = Math.max(0, Math.floor(elapsed / INTEGRATE_DT));
  const rest = elapsed - n * INTEGRATE_DT;
  const trailFrom = elapsed - c.trailSeconds;
  const trail: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i % TRAIL_EVERY === 0 && i * INTEGRATE_DT >= trailFrom) trail.push(theta);
    [theta, omega] = rk4(theta, omega, INTEGRATE_DT, conn, c);
  }
  if (rest > 0) [theta, omega] = rk4(theta, omega, rest, conn, c);
  trail.push(theta);
  return { theta, omega, trail };
}

export interface Reading {
  /** 이어 붙이는 방식. `ringsIn` 부터 끊김 없는 고리다. */
  connection: Connection;
  /** 전류가 흐르는가. */
  on: boolean;
  /** 변 A 의 각(rad, 오른쪽에서 반시계). */
  theta: number;
  /** 변 A 의 전류 부호(+1 ⊙ · −1 ⊗). 전류가 없으면 0. */
  signA: number;
  /** 꼬리 — 변 A 가 지나온 각(오래된 것부터). 전류가 없으면 비었다. */
  trail: number[];
  /** 떠오르고 물러나는 정도(1 이면 또렷하다). */
  opacity: number;
}

/**
 * 시간표 → 화면에 놓을 값. 같은 시각은 언제나 같은 값이다.
 */
export function derive(tl: TimelineFrame, c: MotorConstants): Reading {
  const connection: Connection = tl.u >= tl.start('ringsIn') ? 'rings' : 'commutator';
  const t0 = connection === 'rings' ? tl.start('ringsPush') : tl.start('push');
  const on = tl.u >= t0;
  const r = integrate(on ? tl.u - t0 : 0, connection, c);
  const opacity = tl.at('appear') - tl.at('runOut') + tl.at('ringsIn') - tl.at('fade');
  return {
    connection,
    on,
    theta: r.theta,
    signA: on ? signOf(r.theta, connection, c) : 0,
    trail: on ? r.trail : [],
    opacity: Math.min(1, Math.max(0, opacity)),
  };
}

export function step(params: { state: MotorState }): MotorState {
  return params.state;
}
