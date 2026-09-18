// ========================================================================
// relativistic-doppler — 순수 물리
// ========================================================================
// 실험실 틀. 광원은 +x 로 v = βc 로 달린다. γ = 1/√(1 − β²).
//
//   광원 제 틀의 주기            T₀ = λ₀ / c
//   실험실에서 본 방출 간격      γ T₀            ← 시간 지연. 달리는 광원의 시계가 느리다
//   k 번째 파면                  t_k 에 그때의 광원 자리에서 나와 c 로 퍼지는 원
//
// 파면 원 위, 중심에서 본 방향 φ(+x 에서 잰 각)로 간 빛의 파장은
//
//   λ(φ) = λ₀ · γ · (1 − β cos φ)
//
// 이고, 같은 방향의 이웃 파면 간격도 이 값이다(멀리 간 파면에서). φ = 0(앞)이면
// λ₀ √((1−β)/(1+β)), φ = π(뒤)면 λ₀ √((1+β)/(1−β)), φ = π/2(바로 옆)면 λ₀ γ — 다가오지도
// 멀어지지도 않는 방향에서 남는 것이 시간 지연 하나다.
//
// 광원의 자리는 시간표에서 잡는다 — `reach` 가 시작하는 시각에 「바로 위(x = SIDE_X)에서 낸
// 파면」 이 옆 관찰자에게 닿도록, 그 파면을 낸 시각 t_over = start('reach') − SIDE_DIST / c 에
// 광원이 x = SIDE_X 를 지나게 한다. 파면을 내는 시각도 t_over 를 한 칸으로 삼아 맞춘다.
// 광원은 늘 달리고 있었다 — 주기 처음보다 앞선 시각에 낸 파면도 그린다. 모든 것이 시각의 함수다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { wavelengthToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';
import {
  BACK_NM,
  BETA,
  FRONT_NM,
  LANE_Y,
  LIGHT_SPEED,
  SIDE_DIST,
  SIDE_NM,
  SIDE_X,
  SOURCE_NM,
  WORLD_PER_NM,
} from './schema';
import type { RelativisticDopplerState } from './state';

export interface RelativisticDopplerConstants {
  /** v/c. */
  beta: number;
  /** 광원 제 틀의 파장(nm). */
  sourceNm: number;
  /** 앞 · 옆 · 뒤에서 받는 파장(nm) — 화면 글자용 선언값. */
  frontNm: number;
  sideNm: number;
  backNm: number;
  /** 그림 배율 — 파장 1 nm 의 월드 길이. */
  worldPerNm: number;
  /** 그림 빛의 빠르기(월드/초). */
  lightSpeed: number;
}

export function readConstants(stage: StageDef): RelativisticDopplerConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    beta: c.beta ?? BETA,
    sourceNm: c.sourceNm ?? SOURCE_NM,
    frontNm: c.frontNm ?? FRONT_NM,
    sideNm: c.sideNm ?? SIDE_NM,
    backNm: c.backNm ?? BACK_NM,
    worldPerNm: c.worldPerNm ?? WORLD_PER_NM,
    lightSpeed: c.lightSpeed ?? LIGHT_SPEED,
  };
}

export function gammaOf(beta: number): number {
  return 1 / Math.sqrt(1 - beta * beta);
}

/** 달리는 광원 한 벌 — 시간표의 `reach` 시작 시각에 묶인다. */
export interface MovingSource {
  beta: number;
  gamma: number;
  /** 그림 빛의 빠르기(월드/초). */
  c: number;
  /** 광원의 빠르기(월드/초). */
  v: number;
  sourceNm: number;
  /** 실험실에서 본 방출 간격(초) = γ T₀. */
  emitEvery: number;
  /** 바로 위(x = SIDE_X)에서 파면을 낸 시각(주기 안 초). */
  tOver: number;
}

export function movingSource(k: RelativisticDopplerConstants, reachStart: number): MovingSource {
  const gamma = gammaOf(k.beta);
  const c = k.lightSpeed;
  const period0 = (k.sourceNm * k.worldPerNm) / c;
  return {
    beta: k.beta,
    gamma,
    c,
    v: k.beta * c,
    sourceNm: k.sourceNm,
    emitEvery: gamma * period0,
    tOver: reachStart - SIDE_DIST / c,
  };
}

/** 시각 t 의 광원 x. 광원은 늘 달리고 있었다 — t 는 음수여도 된다. */
export function sourceX(s: MovingSource, t: number): number {
  return SIDE_X + s.v * (t - s.tOver);
}

/** 중심에서 방향 φ 로 간 빛의 파장(nm). */
export function wavelengthNmAt(s: MovingSource, phi: number): number {
  return s.sourceNm * s.gamma * (1 - s.beta * Math.cos(phi));
}

export interface Wavefront {
  /** 낸 자리 x(길 위). */
  cx: number;
  /** 지금 반지름(월드). */
  r: number;
}

/**
 * 시각 τ 에 화면에 있는 파면들. 반지름이 `rMax` 를 넘은 것(화면을 다 지나간 것)은 뺀다.
 * 방출 시각은 t_over 를 한 칸으로 삼는 격자 t_k = t_over + k · γT₀ 이다.
 */
export function wavefronts(s: MovingSource, tau: number, rMax: number): Wavefront[] {
  const out: Wavefront[] = [];
  const kLast = Math.floor((tau - s.tOver) / s.emitEvery);
  const kFirst = Math.ceil((tau - rMax / s.c - s.tOver) / s.emitEvery);
  for (let k = kFirst; k <= kLast; k++) {
    const tk = s.tOver + k * s.emitEvery;
    const r = s.c * (tau - tk);
    if (r <= 0) continue;
    out.push({ cx: sourceX(s, tk), r });
  }
  return out;
}

/**
 * 시각 τ 에 (ox, oy) 에 선 관찰자가 받는 빛의 파장(nm). 지금 닿은 파면을 낸 시각을 거슬러
 * 찾는다 — 그 시각의 광원 자리에서 관찰자까지 거리가 c · (τ − t_e) 인 t_e. d = τ − t_e 로 두면
 *
 *   (a + v d)² + b² = c² d²      a = ox − x_s(τ), b = oy − 길 높이
 *
 * 의 양의 근이고, 그 파면 위에서 관찰자가 있는 방향 φ 의 파장이 받는 파장이다.
 */
export function receivedNmAt(s: MovingSource, tau: number, ox: number, oy: number): number {
  const a = ox - sourceX(s, tau);
  const b = oy - LANE_Y;
  const k = s.c * s.c - s.v * s.v;
  const d = (a * s.v + Math.sqrt(a * a * s.v * s.v + k * (a * a + b * b))) / k;
  return wavelengthNmAt(s, Math.atan2(b, a + s.v * d));
}

/** 파장의 빛 색(선형광). 가시광 밖은 검정이다 — 이 조각은 405~720 nm 안에 머문다. */
export function lightOfNm(nm: number): LinearRgb {
  return wavelengthToLinearRgb(nm);
}

/** 모든 것이 시각의 함수다 — 쌓는 상태가 없어 항등이다. */
export function step(params: { state: RelativisticDopplerState }): RelativisticDopplerState {
  return params.state;
}
