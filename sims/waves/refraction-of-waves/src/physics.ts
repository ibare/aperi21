// ========================================================================
// refraction-of-waves — 순수 물리
// ========================================================================
// 빠른 쪽: ψ = k1[(x − XB)cosθ1 + y sinθ1] − ωt
// 느린 쪽: ψ = k2(x − XB)cosθ2 + k1·y·sinθ1 − ωt   (경계에서 이어진다)
//
// 느린 쪽의 y 성분을 k1 sinθ1 로 두어 경계를 따라 잰 마루 간격이 두 쪽에서 같다.
// 무늬가 경계에서 끊기면 주장 전체가 거짓이 된다 (원본 NOTES (d)).
//
// 좌표는 원본 화면 좌표(y 는 아래)로 계산한다. 격자 순서가 `scalarField.values` 와 같다(첫 행이 위).
// ========================================================================

import {
  BOUNDARY_X,
  CELL,
  CREST_SPACING,
  FIELD_H,
  FIELD_W,
  LAMBDA_FAST,
  RATIO,
  STRAIGHT_FROM,
  THETA_FAST,
  WAVE_PERIOD,
} from './schema';
import type { RefractionOfWavesState } from './state';

const K1 = (2 * Math.PI) / LAMBDA_FAST;
const OMEGA = (2 * Math.PI) / WAVE_PERIOD;
const SIN1 = Math.sin(THETA_FAST);
const COS1 = Math.cos(THETA_FAST);

/** 장 격자 가로 · 세로 칸 수. 원본 ceil(860 / 2) × ceil(340 / 2). */
export const COLS = Math.ceil(FIELD_W / CELL);
export const ROWS = Math.ceil(FIELD_H / CELL);

export interface Geometry {
  /** 느린 쪽 파수. */
  k2: number;
  cos2: number;
}

/** 속력 비 r 에서 느린 쪽 파수 · 굴절 방향. */
export function geometry(r: number): Geometry {
  const k2 = K1 / r;
  const sin2 = Math.min(1, r * SIN1);
  return { k2, cos2: Math.sqrt(1 - sin2 * sin2) };
}

/**
 * 물결 장 — 칸마다 `(0.5 + 0.5 cos ψ)²`(0 골 ~ 1 마루)를 `out` 에 행 우선(첫 행이 위)으로 쓴다.
 * 제곱은 원본의 섞기 곡선 그대로다 — 마루 띠를 좁고 또렷하게 한다.
 */
export function waveField(out: number[], t: number, g: Geometry): void {
  const base = K1 * SIN1;
  for (let j = 0; j < ROWS; j++) {
    const py = base * (j + 0.5) * CELL - OMEGA * t;
    for (let i = 0; i < COLS; i++) {
      const x = (i + 0.5) * CELL - BOUNDARY_X;
      const psi = x >= 0 ? g.k2 * g.cos2 * x + py : K1 * COS1 * x + py;
      const s = 0.5 + 0.5 * Math.cos(psi);
      out[j * COLS + i] = s * s;
    }
  }
}

/**
 * 따라가는 마루가 경계와 만나는 화면 y(아래로).
 *
 * @param u 주기 안 시각(초)
 * @param enterAt 만남점이 화면 위 끝(y = 0)에 닿는 주기 안 시각 — 시간표 `start('bend')`
 */
export function meetingY(u: number, enterAt: number): number {
  return ((u - enterAt) / WAVE_PERIOD) * CREST_SPACING;
}

/** 빠른 쪽 마루 방향(화면 좌표, y 아래). */
export const FAST_CREST_DIR = [SIN1, -COS1] as const;

/** 느린 쪽 마루 방향(화면 좌표, y 아래). 위상의 기울기에 수직이다. */
export function slowCrestDir(g: Geometry): readonly [number, number] {
  return [K1 * SIN1, -g.k2 * g.cos2];
}

/** 조작값을 받아 판정을 붙인다. 쌓는 것은 없다. */
export function step(params: { state: RefractionOfWavesState; dt: number }): RefractionOfWavesState {
  const ratio = Math.min(RATIO.max, Math.max(RATIO.min, params.state.ratio));
  const straight = ratio >= STRAIGHT_FROM;
  if (ratio === params.state.ratio && straight === params.state.straight) return params.state;
  return { ratio, straight };
}
