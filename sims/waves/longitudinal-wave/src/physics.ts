// ========================================================================
// longitudinal-wave — 순수 물리
// ========================================================================
// 변위 s(x0, t) = A cos(k x0 − ω t) → 오른쪽으로 진행하는 종파.
// 밀도 띠는 공식으로 칠하지 않고 **지금 자리의 점을 세어** 만든다 — 위의 점과 어긋날 수 없다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import {
  DENSITY_BIN,
  DENSITY_BLUR_RADIUS,
  DENSITY_BLUR_SIGMA,
  FIELD_W,
  KA,
  PARTICLE_H,
  PARTICLE_INSET,
  PARTICLE_TOP,
  PARTICLES_PER_WIDTH,
  PERIOD,
  TAGGED_FX,
  TAGGED_GAP_Y,
  WAVELENGTH,
} from './schema';
import type { LongitudinalWaveState } from './state';

export const K = (2 * Math.PI) / WAVELENGTH;
export const AMPLITUDE = KA / K;
export const OMEGA = (2 * Math.PI) / PERIOD;

export function readSeed(stage: StageDef): number {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return c.seed ?? 1;
}

/** 시드 난수 (mulberry32) — 원본 하니스와 같은 흐름. 시드를 인자로 받는다 (S-sim). */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 평형 위치들. 강조 입자는 배경 무리와 따로 둔다 — 밀도는 배경 무리만 센다(원본과 같음). */
export interface Medium {
  /** 배경 입자 평형 x(월드). */
  x0: Float64Array;
  /** 배경 입자 y(월드, 위가 +). */
  y: Float64Array;
  /** 강조 입자 평형 자리. */
  tagged: readonly { x0: number; y: number }[];
}

/**
 * 원본 `build()` 그대로 — 화면 밖 A + 4 만큼 여유를 두고 x0 · y 순으로 난수를 뽑는다.
 * 원본의 화면 y(아래가 +)를 월드 y 로 뒤집는다.
 */
export function buildMedium(seed: number): Medium {
  const random = mulberry32(seed);
  const xmin = -AMPLITUDE - 4;
  const xmax = FIELD_W + AMPLITUDE + 4;
  const n = Math.round((PARTICLES_PER_WIDTH * (xmax - xmin)) / FIELD_W);
  const x0 = new Float64Array(n);
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    x0[i] = xmin + (xmax - xmin) * random();
    y[i] = PARTICLE_TOP - PARTICLE_INSET - (PARTICLE_H - 2 * PARTICLE_INSET) * random();
  }
  const yMid = PARTICLE_TOP - PARTICLE_H / 2;
  const tagged = TAGGED_FX.map((fx, j) => ({ x0: FIELD_W * fx, y: yMid - (j - 1) * TAGGED_GAP_Y }));
  return { x0, y, tagged };
}

/** 시각 t 에 평형 x0 인 입자의 자리. */
export function xAt(x0: number, t: number): number {
  return x0 + AMPLITUDE * Math.cos(K * x0 - OMEGA * t);
}

/**
 * 지금 자리에서 칸마다 입자를 세고 가우스로 번진 뒤 평균 대비 빽빽함을 돌려준다(원본 `drawDensity`).
 */
export function densityProfile(xs: ArrayLike<number>): number[] {
  const nb = Math.ceil(FIELD_W / DENSITY_BIN);
  const counts = new Float64Array(nb);
  for (let i = 0; i < xs.length; i++) {
    const b = Math.floor(xs[i]! / DENSITY_BIN);
    if (b >= 0 && b < nb) counts[b]! += 1;
  }
  const R = DENSITY_BLUR_RADIUS;
  const ker: number[] = [];
  for (let r = -R; r <= R; r++) ker.push(Math.exp((-r * r) / (2 * DENSITY_BLUR_SIGMA * DENSITY_BLUR_SIGMA)));
  const sm = new Array<number>(nb);
  let mean = 0;
  for (let b = 0; b < nb; b++) {
    let acc = 0;
    let ww = 0;
    for (let r = -R; r <= R; r++) {
      const q = b + r;
      if (q < 0 || q >= nb) continue;
      acc += counts[q]! * ker[r + R]!;
      ww += ker[r + R]!;
    }
    sm[b] = acc / ww;
    mean += sm[b]!;
  }
  mean /= nb;
  return sm.map((v) => v / mean);
}

/** 쌓는 상태가 없다 — 모든 자리가 시각의 함수다. */
export function step(params: { state: LongitudinalWaveState }): LongitudinalWaveState {
  return params.state;
}
