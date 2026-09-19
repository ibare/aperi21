// ========================================================================
// rayleigh-scattering — 순수 물리
// ========================================================================
// 공기가 파장 λ 의 빛을 흩뜨리는 몫은 (1/λ)⁴ 을 따른다. 공기를 ℓ 만큼 지난 햇빛에
// 남은 몫은 exp(−τ(λ)·ℓ), τ(λ) = τ₄₅₀ · (450/λ)⁴ (ℓ 은 공기층 두께 단위).
// 그 자리에서 옆으로 흩어지는 빛은 (450/λ)⁴ × 남은 몫이다.
//
// 색은 `@aperi21/plugin-optics` 의 순수 함수로 합성한다 — 온도 · 파장 → RGB 표를
// 손으로 만들지 않는다 (C2).
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import { spectrumToLinearRgb, wavelengthToLinearRgb, VISIBLE_NM, type LinearRgb } from '@aperi21/plugin-optics';
import {
  AIR_WORLD,
  BLUE_RATIO,
  EARTH_RADIUS,
  LAMBDA_BLUE,
  LAMBDA_RED,
  OBSERVER_X,
  OBSERVER_Y,
  SEED,
  SKY_GLOW,
  SUNSET_DEG,
  TAU_BLUE,
} from './schema';
import type { RayleighScatteringState } from './state';

/** 흩어진 빛의 세기를 셀 때 쓰는 파장 간격(nm). */
const POWER_STEP_NM = 5;

export interface RayleighScatteringConstants {
  lambdaBlue: number;
  lambdaRed: number;
  /** 화면에 띄우는 배수 정박값. 계산값이 아니다. */
  blueRatio: number;
  tauBlue: number;
  earthRadius: number;
  /** 공기층 두께 하나의 월드 길이(표시 배율). */
  airWorld: number;
  sunsetDeg: number;
  skyGlow: number;
  seed: number;
}

export function readConstants(stage: StageDef): RayleighScatteringConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    lambdaBlue: c.lambdaBlue ?? LAMBDA_BLUE,
    lambdaRed: c.lambdaRed ?? LAMBDA_RED,
    blueRatio: c.blueRatio ?? BLUE_RATIO,
    tauBlue: c.tauBlue ?? TAU_BLUE,
    earthRadius: c.earthRadius ?? EARTH_RADIUS,
    airWorld: c.airWorld ?? AIR_WORLD,
    sunsetDeg: c.sunsetDeg ?? SUNSET_DEG,
    skyGlow: c.skyGlow ?? SKY_GLOW,
    seed: c.seed ?? SEED,
  };
}

// ---- 흩어지는 몫 ----

/** 빨강 파장을 1 로 둔 흩어지는 몫 — 막대 높이 · 곡선이 쓴다. */
export function scatterRatio(nm: number, c: RayleighScatteringConstants): number {
  return Math.pow(c.lambdaRed / nm, 4);
}

/** 공기층 두께 하나를 지날 때의 광학 깊이. */
function tau(nm: number, c: RayleighScatteringConstants): number {
  return c.tauBlue * Math.pow(c.lambdaBlue / nm, 4);
}

/** 공기를 ℓ 만큼 지난 햇빛에 남은 몫(파장별). */
function remaining(nm: number, l: number, c: RayleighScatteringConstants): number {
  return Math.exp(-tau(nm, c) * l);
}

/** ℓ 자리에서 옆으로 흩어지는 빛의 스펙트럼(파장별). */
function scattered(nm: number, l: number, c: RayleighScatteringConstants): number {
  return Math.pow(c.lambdaBlue / nm, 4) * remaining(nm, l, c);
}

/**
 * 스펙트럼의 **색만** 남긴다 — 가장 큰 성분을 1 로 맞춘다. 밝기를 버리는 것은 이 조각의
 * 표현 결정이다(해 질 녘 빛은 실제로 더 어둡다, NOTES (b)). 음수 성분은 0 으로 자른다.
 */
function hueOf(rgb: LinearRgb): LinearRgb {
  const r = Math.max(0, rgb[0]);
  const g = Math.max(0, rgb[1]);
  const b = Math.max(0, rgb[2]);
  const m = Math.max(r, g, b);
  return m > 0 ? [r / m, g / m, b / m] : [0, 0, 0];
}

/** 공기를 ℓ 만큼 지난 햇빛의 색(밝기를 맞춘 선형광). */
export function transmittedHue(l: number, c: RayleighScatteringConstants): LinearRgb {
  return hueOf(spectrumToLinearRgb((nm) => remaining(nm, l, c)));
}

/** ℓ 자리에서 옆으로 흩어진 빛의 색. */
export function scatteredHue(l: number, c: RayleighScatteringConstants): LinearRgb {
  return hueOf(spectrumToLinearRgb((nm) => scattered(nm, l, c)));
}

/** ℓ 자리에서 흩어지는 빛의 세기를 들어온 자리(ℓ = 0) 대비로. 긴 길 끝에서는 흩어질 빛이 적다. */
export function scatteredPower(l: number, c: RayleighScatteringConstants): number {
  let now = 0;
  let first = 0;
  for (let nm = VISIBLE_NM.min; nm <= VISIBLE_NM.max; nm += POWER_STEP_NM) {
    now += scattered(nm, l, c);
    first += scattered(nm, 0, c);
  }
  return first > 0 ? now / first : 0;
}

/** 하늘(공기층) 바탕 빛 — 흰 햇빛이 흩어진 색에 바탕 밝기를 곱한다. */
export function skyLight(c: RayleighScatteringConstants): LinearRgb {
  const h = scatteredHue(0, c);
  return [h[0] * c.skyGlow, h[1] * c.skyGlow, h[2] * c.skyGlow];
}

/** 막대 · 점을 칠하는 단색광의 색. */
export function monoLight(nm: number): LinearRgb {
  return wavelengthToLinearRgb(nm);
}

// ---- 대기 단면 기하 ----

/** 관찰자 자리(지면 위). */
export const OBSERVER: Vec2 = [OBSERVER_X, OBSERVER_Y];

/** 해 쪽 단위 방향. 천정각 θ(라디안) — 0 이면 머리 위, 오른쪽으로 기운다. */
export function sunDirection(theta: number): Vec2 {
  return [Math.sin(theta), Math.cos(theta)];
}

/**
 * 관찰자에서 해 쪽으로 공기층 꼭대기까지의 길이(공기층 두께 단위).
 * 지구 중심에서 반지름 R+1 인 원과 만나는 거리 — 머리 위 1, 지평선 √(2R+1).
 */
export function pathLength(theta: number, c: RayleighScatteringConstants): number {
  const R = c.earthRadius;
  const cos = Math.cos(theta);
  return -R * cos + Math.sqrt(R * R * cos * cos + 2 * R + 1);
}

/**
 * 지면 · 공기층 꼭대기의 높이(월드 y). `radius` 는 공기층 두께 단위이고 지구 중심은
 * 관찰자 바로 아래 R 이다. 월드로는 `airWorld` 를 곱한다.
 */
export function shellY(x: number, radius: number, c: RayleighScatteringConstants): number {
  const dx = x - OBSERVER_X;
  const r = radius * c.airWorld;
  return OBSERVER_Y - c.earthRadius * c.airWorld + Math.sqrt(Math.max(0, r * r - dx * dx));
}

// ---- 시드 난수 ----

/** (시드, 번호) → 0~1. 흩어지는 획의 방향이 프레임마다 떨지 않게 번호로 뽑는다. */
export function hash01(seed: number, i: number): number {
  let h = (Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul(i + 1, 0x85ebca6b)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: RayleighScatteringState }): RayleighScatteringState {
  return params.state;
}
