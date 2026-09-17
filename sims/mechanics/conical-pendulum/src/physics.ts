// ========================================================================
// conical-pendulum — 순수 물리
// ========================================================================
// 준정적 가정: 빠르기 변화가 느려 매 순간 정상 상태 h = g / ω² 로 둔다.
// 과도 진동은 주장과 무관해 두지 않는다 (원본 NOTES (d)).
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import {
  CYCLE,
  ELEVATION_DEG,
  G,
  H_FAST,
  H_SLOW,
  LENGTHS,
  PLANE_RADIUS,
} from './schema';
import type { ConicalPendulumState } from './state';

export interface ConicalPendulumConstants {
  g: number;
  wMin: number;
  wMax: number;
  cycle: number;
  /** 내려다보는 각(rad). */
  elevation: number;
  planeRadius: number;
}

export function readConstants(stage: StageDef): ConicalPendulumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const g = c.g ?? G;
  const hSlow = c.hSlow ?? H_SLOW;
  const hFast = c.hFast ?? H_FAST;
  return {
    g,
    wMin: Math.sqrt(g / hSlow),
    wMax: Math.sqrt(g / hFast),
    cycle: c.cycle ?? CYCLE,
    elevation: ((c.elevationDeg ?? ELEVATION_DEG) * Math.PI) / 180,
    planeRadius: c.planeRadius ?? PLANE_RADIUS,
  };
}

/** 자동 진행의 빠르기 — 느림에서 시작해 부드럽게 빨라졌다가 다시 느려진다 (원본 `autoOmega`). */
export function autoOmega(t: number, c: ConicalPendulumConstants): number {
  const u = (1 - Math.cos((2 * Math.PI * t) / c.cycle)) / 2;
  return c.wMin + (c.wMax - c.wMin) * u;
}

/** 매단 점에서 세 추가 도는 평면까지의 깊이(m). 줄 길이와 무관하다. */
export function depthOf(omega: number, g: number): number {
  return g / (omega * omega);
}

/** 줄 길이 L 인 추가 깊이 h 에서 도는 원의 반지름. */
export function radiusOf(L: number, h: number): number {
  return Math.sqrt(Math.max(L * L - h * h, 0));
}

export interface BobReading {
  L: number;
  r: number;
  /** 3 차원 자리 — 수직축 y, 보는 쪽이 +z. */
  x: number;
  y: number;
  z: number;
}

export function bobs(state: ConicalPendulumState, g: number): BobReading[] {
  const h = depthOf(state.omega, g);
  return LENGTHS.map((L) => {
    const r = radiusOf(L, h);
    return { L, r, x: r * Math.cos(state.phi), y: -h, z: r * Math.sin(state.phi) };
  });
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * 한 걸음. 순수 함수.
 *
 * 원본 순서 그대로 — 이번 걸음의 빠르기를 정하고, 그 빠르기로 회전각을 민 뒤 시계를
 * 민다. 조절기를 잡으면 `manual` 이 켜지고 그 뒤로는 조절기 값으로 돈다(원본은 한 번
 * 건드리면 자동 진행을 멈춘다). 잡기 전에는 곡선 값을 `omega` 에 적어 조절기가 따라 움직인다.
 */
export function step(params: {
  state: ConicalPendulumState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): ConicalPendulumState {
  const { state, dt, stage } = params;
  if (!(dt > 0)) return state;
  const c = readConstants(stage);
  const manual = state.manual || state.held;
  const omega = manual ? clamp(state.omega, c.wMin, c.wMax) : autoOmega(state.clock, c);
  return {
    ...state,
    manual,
    omega,
    phi: state.phi + omega * dt,
    clock: state.clock + dt,
  };
}
