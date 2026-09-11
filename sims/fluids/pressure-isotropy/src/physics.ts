import type { Vec2 } from '@aperi21/schema';
import {
  SWEEP_END_DEG,
  SWEEP_RATE_DEG_PER_S,
  type PlateSetup,
  type PressureIsotropyState,
} from './state';

// ========================================================================
// 순수 함수만 둔다. DOM · 캔버스 · 시간 · 문안을 모른다 (S-sim · 원칙 1).
// ========================================================================

export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** 계기압 P = ρgh. 방향이 끼어들 자리가 없는 스칼라다. */
export function gaugePressure(setup: PlateSetup): number {
  return setup.rho * setup.g * setup.depth;
}

/**
 * 판의 방향 벡터. θ = 0 이면 판은 수평이다.
 * 판은 이 방향으로 누워 있고, 면적 A 가 이 선 위에 얹혀 있다.
 */
export function plateTangent(thetaRad: number): Vec2 {
  return [Math.cos(thetaRad), Math.sin(thetaRad)];
}

/** 판의 법선. 유체가 판을 미는 방향은 언제나 이 축이다. */
export function plateNormal(thetaRad: number): Vec2 {
  return [-Math.sin(thetaRad), Math.cos(thetaRad)];
}

/**
 * 판의 한쪽 면이 받는 힘 벡터. `side = +1` 은 법선 쪽 면이고, 그 면의 유체는
 * 판을 -n̂ 방향으로 민다.
 *
 * 힘은 **방향을 가진다** — θ 를 그대로 타고 돈다. 압력이 방향을 잃는 것은
 * 이 벡터의 크기가 θ 를 타지 않기 때문이다. 아래 `deriveForce` 가 그 둘을
 * 나란히 내놓는다.
 */
export function faceForce(setup: PlateSetup, thetaRad: number, side: 1 | -1): Vec2 {
  const magnitude = gaugePressure(setup) * setup.area;
  const n = plateNormal(thetaRad);
  return [-side * magnitude * n[0], -side * magnitude * n[1]];
}

export interface ForceDerivation {
  /** 계기압 [Pa]. θ 와 무관. */
  pressure: number;
  /** 힘의 x 성분 [N]. θ 를 탄다. */
  fx: number;
  /** 힘의 y 성분 [N]. θ 를 탄다. */
  fy: number;
  /** 힘의 크기 [N]. **θ 를 타지 않는다** — 이 조각의 주장. */
  magnitude: number;
}

/**
 * 성분은 θ 를 타고 크기는 타지 않는다는 것을 한 자리에서 보인다.
 *
 * F = -P·A·n̂ 이므로 |F| = P·A·|n̂| = P·A 다. n̂ 은 단위 벡터라 θ 가 어떻든
 * 길이가 1 이고, 그래서 θ 가 크기에서 통째로 소거된다.
 */
export function deriveForce(setup: PlateSetup, thetaRad: number): ForceDerivation {
  const [fx, fy] = faceForce(setup, thetaRad, 1);
  return {
    pressure: gaugePressure(setup),
    fx,
    fy,
    magnitude: Math.hypot(fx, fy),
  };
}

/** 자동 회전이 180° 를 다 지났는가. */
export function isSweepComplete(state: PressureIsotropyState): boolean {
  return state.sweptDeg >= SWEEP_END_DEG;
}

/**
 * 한 스텝 전진. 자동 회전 구간에서는 판이 저절로 돌고, 다 돌고 나면 상태를
 * 그대로 돌려준다 — 그 뒤로는 독자의 다이얼이 `plate.thetaDeg` 의 단일
 * 소스가 된다.
 */
export function step(params: { state: PressureIsotropyState; dt: number }): PressureIsotropyState {
  const { state, dt } = params;
  if (isSweepComplete(state)) return state;

  const remaining = SWEEP_END_DEG - state.sweptDeg;
  const sweptDeg = state.sweptDeg + Math.min(SWEEP_RATE_DEG_PER_S * dt, remaining);
  return {
    ...state,
    sweptDeg,
    sweepComplete: sweptDeg >= SWEEP_END_DEG,
    plate: { thetaDeg: sweptDeg },
  };
}
