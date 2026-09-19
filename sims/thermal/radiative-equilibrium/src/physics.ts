// ========================================================================
// radiative-equilibrium — 순수 물리
// ========================================================================
// 행성 겉면 1 m² 의 에너지 수지 (0 차원 모형):
//   들어옴  Pin  = S(1−a)/4        — 온도와 무관하다. 4 는 원판이 받은 것을 구 겉면에 편 몫
//   나감    Pout = σT⁴             — 온도가 오르면 는다
//   C dT/dt = Pin − Pout           — 차이만큼 온도가 움직인다
// 두 몫이 같아지는 T* = (Pin/σ)^¼ 에서 멈춘다. 출발 온도와 무관하다.
//
// 닫힌 식 대신 고정 걸음 RK4 로 푼다 — 같은 시각은 언제나 같은 값이다(걸음이 시각에서
// 정해지고 상태를 쌓지 않는다). `step` 은 항등이다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import {
  ALBEDO,
  AXIS_MAX,
  AXIS_MIN,
  BAR_SCALE,
  HEAT_CAPACITY,
  SIGMA,
  SOLAR_CONSTANT,
  TIME_SCALE,
  T_COLD,
  T_EQ,
  T_HOT,
} from './schema';
import type { RadiativeEquilibriumState } from './state';

export interface RadiativeEquilibriumConstants {
  /** 태양 상수 S (W/m²). */
  solarConstant: number;
  /** 반사율 a. */
  albedo: number;
  /** σ (W/m²K⁴). */
  sigma: number;
  /** 면적당 열용량 (J/m²K). */
  heatCapacity: number;
  /** 화면 1 초가 행성의 몇 초인가 (표시 배율). */
  timeScale: number;
  /** 출발 온도(K). */
  tCold: number;
  tHot: number;
  /** 만나는 온도 글자의 정박값(K). */
  tEq: number;
  /** 온도 판 세로축 끝(K). */
  axisMin: number;
  axisMax: number;
  /** 1 W/m² 의 막대 높이(월드). */
  barScale: number;
}

export function readConstants(stage: StageDef): RadiativeEquilibriumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    solarConstant: c.solarConstant ?? SOLAR_CONSTANT,
    albedo: c.albedo ?? ALBEDO,
    sigma: c.sigma ?? SIGMA,
    heatCapacity: c.heatCapacity ?? HEAT_CAPACITY,
    timeScale: c.timeScale ?? TIME_SCALE,
    tCold: c.tCold ?? T_COLD,
    tHot: c.tHot ?? T_HOT,
    tEq: c.tEq ?? T_EQ,
    axisMin: c.axisMin ?? AXIS_MIN,
    axisMax: c.axisMax ?? AXIS_MAX,
    barScale: c.barScale ?? BAR_SCALE,
  };
}

/** 들어오는 몫(W/m²) = S(1−a)/4. 온도와 무관하다. */
export function absorbed(c: RadiativeEquilibriumConstants): number {
  return (c.solarConstant * (1 - c.albedo)) / 4;
}

/** 나가는 몫(W/m²) = σT⁴. */
export function emitted(c: RadiativeEquilibriumConstants, temp: number): number {
  return c.sigma * temp ** 4;
}

/** 두 몫이 같아지는 온도(K) — 곡선 · 점선의 자리. 화면 글자는 정박값 `tEq` 를 쓴다. */
export function equilibriumTemp(c: RadiativeEquilibriumConstants): number {
  return (absorbed(c) / c.sigma) ** 0.25;
}

/** 화면 1 초당 온도 변화(K/s) = (Pin − Pout)/C × 시간 배율. */
function rate(c: RadiativeEquilibriumConstants, pin: number, temp: number): number {
  return ((pin - emitted(c, temp)) / c.heatCapacity) * c.timeScale;
}

function rk4(c: RadiativeEquilibriumConstants, pin: number, temp: number, dt: number): number {
  const k1 = rate(c, pin, temp);
  const k2 = rate(c, pin, temp + (dt / 2) * k1);
  const k3 = rate(c, pin, temp + (dt / 2) * k2);
  const k4 = rate(c, pin, temp + dt * k3);
  return temp + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
}

/**
 * 출발 온도 `t0` 에서 흐른 화면 시간 `upto` 초까지의 온도 표본 `[s, T]`.
 *
 * 걸음은 `span / samples` 로 고정이라 `upto` 가 어디든 앞쪽 표본이 같다 — 곡선이 자라며
 * 떨지 않는다. 마지막 표본은 `upto` 까지의 짧은 한 걸음이다.
 */
export function tempPath(
  c: RadiativeEquilibriumConstants,
  t0: number,
  upto: number,
  span: number,
  samples: number,
): [number, number][] {
  const pin = absorbed(c);
  const dt = span / samples;
  const out: [number, number][] = [[0, t0]];
  let temp = t0;
  const whole = Math.min(samples, Math.floor(upto / dt));
  for (let i = 1; i <= whole; i++) {
    temp = rk4(c, pin, temp, dt);
    out.push([i * dt, temp]);
  }
  const rest = upto - whole * dt;
  if (rest > 0) out.push([upto, rk4(c, pin, temp, rest)]);
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: RadiativeEquilibriumState }): RadiativeEquilibriumState {
  return params.state;
}
