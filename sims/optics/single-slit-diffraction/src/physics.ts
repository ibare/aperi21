// ========================================================================
// single-slit-diffraction — 물리 (순수 함수)
// ========================================================================
// 길이 단위는 파장 λ 다(월드 1 = λ). 틈 가운데가 원점, 스크린은 x = L 에 선다.
//
// 스크린 한 점의 세기와 줄기 작도를 **한 계산**으로 묶는다 — 점 (L, y) 에서 틈 아래 끝까지와
// 위 끝까지의 거리 차 Δ(y) 를 쓴다. 틈을 고르게 나눈 점광원의 위상이 Δ 에 걸쳐 고르게 퍼지므로
// 세기는 sinc²(πΔ/λ) 이고, 첫 어두운 점은 Δ = λ 인 자리다. 그래서 그림 속 호가 아래 끝에서
// 꼭 λ 를 남기는 점과 곡선이 0 에 닿는 점이 같다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  SCREEN_DISTANCE,
  SLIT_NARROW,
  SLIT_WIDE,
  SOURCES,
  WAVE_SPEED,
  WAVELENGTH_NM,
} from './schema';
import type { SingleSlitDiffractionState } from './state';

export interface SingleSlitConstants {
  slitWide: number;
  slitNarrow: number;
  screenDistance: number;
  /** 짝수로 맞춘 점광원 수. */
  sources: number;
  wavelengthNm: number;
  waveSpeed: number;
}

/** 스테이지 상수를 기본값과 함께 읽는다 (원칙 2). */
export function readConstants(stage: StageDef): SingleSlitConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const n = Math.round(c.sources ?? SOURCES);
  return {
    slitWide: c.slitWide ?? SLIT_WIDE,
    slitNarrow: c.slitNarrow ?? SLIT_NARROW,
    screenDistance: c.screenDistance ?? SCREEN_DISTANCE,
    sources: Math.max(2, n - (n % 2)),
    wavelengthNm: c.wavelengthNm ?? WAVELENGTH_NM,
    waveSpeed: c.waveSpeed ?? WAVE_SPEED,
  };
}

/** 두 점 사이 거리. */
export function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/** 스크린 점 (L, y) 에서 틈 아래 끝까지와 위 끝까지의 거리 차(λ). y > 0 이면 양수. */
export function edgeDifference(a: number, L: number, y: number): number {
  const p: Vec2 = [L, y];
  return dist(p, [0, -a / 2]) - dist(p, [0, a / 2]);
}

/** 세기 0~1 — sinc²(πΔ). 가운데가 1. */
export function intensity(a: number, L: number, y: number): number {
  const x = Math.PI * edgeDifference(a, L, y);
  if (Math.abs(x) < 1e-9) return 1;
  const s = Math.sin(x) / x;
  return s * s;
}

/** 이분법 걸음 수 — 스크린 높이를 2⁻⁴⁰ 까지 가른다. */
const BISECT_STEPS = 40;

/**
 * 첫 어두운 점의 높이 — 가장자리 거리 차가 꼭 λ 인 y(> 0). Δ(y) 는 y 에 대해 늘어나고
 * y → ∞ 에서 a 에 다가가므로 a > 1 이면 해가 하나 있다.
 */
export function firstDarkY(a: number, L: number): number {
  let lo = 0;
  let hi = L;
  while (edgeDifference(a, L, hi) < 1 && hi < L * 1e3) hi *= 2;
  for (let i = 0; i < BISECT_STEPS; i++) {
    const mid = (lo + hi) / 2;
    if (edgeDifference(a, L, mid) < 1) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** 점광원 자리 — 틈을 n 칸으로 고르게 나눈 칸 가운데. 위에서부터. */
export function sourcePoints(a: number, n: number): Vec2[] {
  const out: Vec2[] = [];
  for (let k = 0; k < n; k++) out.push([0, a / 2 - ((k + 0.5) * a) / n]);
  return out;
}

/** 상태가 비어 있다 — 모든 것이 시각의 함수다. */
export function step(params: { state: SingleSlitDiffractionState }): SingleSlitDiffractionState {
  return params.state;
}
