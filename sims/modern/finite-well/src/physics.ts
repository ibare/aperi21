// ========================================================================
// finite-well — 순수 물리
// ========================================================================
// 유한 우물: 폭 L(가운데 x = 0, 벽 x = ±a, a = L/2), 안은 V = 0, 밖은 V = V₀.
// 에너지는 같은 폭 무한 우물의 바닥 준위 E₁ = (π/L)² (단위 ħ²/2m = 1) 을 한 칸으로 센다.
//
// 묶인 상태 n(= 1, 2, …)의 정확한 해 — v = k·a, w = κ·a, u₀ = a√V₀ = (π/2)√(V₀/E₁):
//   n 홀수(짝 함수)   v tan v = w       안 ψ = cos(kx)
//   n 짝수(홀 함수)  −v cot v = w       안 ψ = sin(kx)
//   v² + w² = u₀²,  v ∈ ((n−1)π/2, nπ/2)
//   밖 ψ = ψ(±a) · e^{−κ(|x| − a)}  (벽 속으로 지수적으로 줄어드는 꼬리)
//   E / E₁ = (2v/π)²
// 무한 우물(u₀ → ∞)이면 v = nπ/2 이라 E = n²E₁ 이고 꼬리가 없다. 유한하면 v < nπ/2 라
// 준위가 그보다 낮다. u₀ ≤ (n−1)π/2 이면 n 은 묶이지 못한다 — 묶인 상태 수가 유한하다.
//
// ψ 는 우물 안 최댓값이 1 이 되게 둔다(넓이 정규화가 아니다 — NOTES (b)).
//
// 모든 것이 시각의 함수다 — 상태를 쌓지 않는다. 벽이 내려온 정도는 시간표 선언에게 묻는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { ENERGY_UNIT, PSI_HEIGHT, STATE_COUNT, WALL_HEIGHT, WELL_WIDTH } from './schema';
import type { FiniteWellState } from './state';

export interface FiniteWellConstants {
  /** 우물 폭 L(월드). */
  wellWidth: number;
  /** 벽 높이 V₀ (무한 우물 E₁ 단위). */
  wallHeight: number;
  /** 무한 우물 E₁ 한 칸의 월드 높이. */
  energyUnit: number;
  /** 보일 상태 수. */
  stateCount: number;
  /** 준위 위에 얹는 ψ 의 높이(월드). */
  psiHeight: number;
}

export function readConstants(stage: StageDef): FiniteWellConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    wellWidth: c.wellWidth ?? WELL_WIDTH,
    wallHeight: c.wallHeight ?? WALL_HEIGHT,
    energyUnit: c.energyUnit ?? ENERGY_UNIT,
    stateCount: c.stateCount ?? STATE_COUNT,
    psiHeight: c.psiHeight ?? PSI_HEIGHT,
  };
}

/** 이분법 반복 수 — 구간 폭 π/2 를 2⁻⁴⁸ 배까지 좁힌다. */
const BISECT_STEPS = 48;

/** 한 묶인 상태. `w` 가 무한이면 무한 우물의 상태다(꼬리 없음). */
export interface BoundState {
  n: number;
  /** v = k·a. */
  v: number;
  /** w = κ·a. 무한 우물이면 Infinity. */
  w: number;
  /** 에너지(무한 우물 E₁ 단위). */
  energy: number;
}

/**
 * 벽 높이 V(E₁ 단위, Infinity 가능)에서 상태 n 을 푼다. 묶이지 못하면 null.
 * 짝 · 홀 조건을 탄젠트 없이 쓴 f(v) 의 부호가 바뀌는 자리를 이분법으로 찾는다.
 */
export function solveState(n: number, wallHeight: number): BoundState | null {
  const vMax = (n * Math.PI) / 2;
  if (!Number.isFinite(wallHeight)) {
    return { n, v: vMax, w: Infinity, energy: n * n };
  }
  const u0 = (Math.PI / 2) * Math.sqrt(wallHeight);
  const lo0 = ((n - 1) * Math.PI) / 2;
  if (u0 <= lo0) return null;
  const even = n % 2 === 1;
  const f = (v: number): number => {
    const w = Math.sqrt(Math.max(0, u0 * u0 - v * v));
    return even ? v * Math.sin(v) - w * Math.cos(v) : v * Math.cos(v) + w * Math.sin(v);
  };
  let lo = lo0;
  let hi = Math.min(vMax, u0);
  const fLo = f(lo);
  for (let i = 0; i < BISECT_STEPS; i++) {
    const mid = (lo + hi) / 2;
    if (Math.sign(f(mid)) === Math.sign(fLo)) lo = mid;
    else hi = mid;
  }
  const v = (lo + hi) / 2;
  const w = Math.sqrt(Math.max(0, u0 * u0 - v * v));
  return { n, v, w, energy: ((2 * v) / Math.PI) ** 2 };
}

/**
 * 상태 s 의 ψ(x) — 우물 가운데가 x = 0, 벽이 x = ±L/2. 우물 안 최댓값 1.
 * 벽 속에서는 벽 면의 값에서 지수적으로 줄어든다. 무한 우물이면 벽 밖은 0 이다.
 */
export function psi(x: number, s: BoundState, c: FiniteWellConstants): number {
  const a = c.wellWidth / 2;
  const k = s.v / a;
  const even = s.n % 2 === 1;
  const inside = (t: number): number => (even ? Math.cos(k * t) : Math.sin(k * t));
  if (Math.abs(x) <= a) return inside(x);
  if (!Number.isFinite(s.w)) return 0;
  const kappa = s.w / a;
  const edge = inside(Math.sign(x) * a);
  return edge * Math.exp(-kappa * (Math.abs(x) - a));
}

/**
 * 벽이 내려온 정도 0~1 — `lower` 동안 0 → 1, `raise` 동안 1 → 0.
 * 0 이면 벽이 끝없이 높고(무한 우물), 1 이면 벽 높이가 V₀ 이다.
 */
export function lowered(tl: TimelineFrame): number {
  return tl.at('lower') - tl.at('raise');
}

/**
 * 지금 벽 높이(E₁ 단위). 벽 높이의 **역수** 가 내려온 정도에 비례한다 — V = V₀ / s.
 * 그래서 s = 0 은 끝없이 높은 벽이고, 벽이 내려오기 시작하자마자 꼬리가 자란다.
 */
export function wallHeightNow(s: number, c: FiniteWellConstants): number {
  return s <= 0 ? Infinity : c.wallHeight / s;
}

/** 준위의 월드 높이. */
export function levelY(energy: number, c: FiniteWellConstants): number {
  return energy * c.energyUnit;
}

/** 상태가 시계뿐인 조각 — 항등 step (S-sim). */
export function step(params: { state: FiniteWellState }): FiniteWellState {
  return params.state;
}
