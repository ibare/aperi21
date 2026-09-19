// ========================================================================
// scattering — 순수 물리
// ========================================================================
// 입자 하나가 흩는 빛은 두 가지로 갈린다.
//
// - **색** — 흩는 몫이 파장에 따라 (1/λ)ⁿ 이면, 흰빛에서 흩어진 빛의 스펙트럼은
//   (1/λ)ⁿ 이다. 작은 입자는 n = 4 라 파란 쪽이, 큰 물방울은 n ≈ 0 이라 모든 색이
//   거의 같게 흩어져 흰빛이다. 색은 `@aperi21/plugin-optics` 의 순수 함수로 합성한다 —
//   색 표를 손으로 만들지 않는다 (C2).
// - **방향** — 종이 평면 안의 각 θ(줄기가 가던 쪽이 0)로 본다.
//   작은 입자: p(θ) ∝ 1 + cos²θ — 앞 · 뒤가 같고 옆이 절반.
//   큰 물방울: 평면 Henyey-Greenstein(감긴 코시 분포), 비대칭 인자 g — 앞쪽으로 몰린다.
//
// 획 방향 · 입자 자리는 (시드, 번호)의 함수라 프레임마다 떨지 않는다 (S-sim).
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import { spectrumToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';
import {
  LARGE_ASYMMETRY,
  LARGE_COUNT,
  LARGE_EXPONENT,
  LARGE_RADIUS,
  SEED,
  SMALL_COUNT,
  SMALL_EXPONENT,
  SMALL_RADIUS,
  STROKE_REACH,
  STROKE_SPEED,
  STROKES_PER_PARTICLE,
  WAVE_WORLD,
} from './schema';
import type { ScatteringState } from './state';

/** 1 + cos²θ 의 누적 분포를 거꾸로 풀 때의 이분 횟수. */
const INVERSE_ITERATIONS = 40;

export interface ScatteringConstants {
  smallExponent: number;
  largeExponent: number;
  largeAsymmetry: number;
  waveWorld: number;
  smallRadius: number;
  largeRadius: number;
  smallCount: number;
  largeCount: number;
  strokesPerParticle: number;
  strokeSpeed: number;
  strokeReach: number;
  seed: number;
}

export function readConstants(stage: StageDef): ScatteringConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    smallExponent: c.smallExponent ?? SMALL_EXPONENT,
    largeExponent: c.largeExponent ?? LARGE_EXPONENT,
    largeAsymmetry: c.largeAsymmetry ?? LARGE_ASYMMETRY,
    waveWorld: c.waveWorld ?? WAVE_WORLD,
    smallRadius: c.smallRadius ?? SMALL_RADIUS,
    largeRadius: c.largeRadius ?? LARGE_RADIUS,
    smallCount: c.smallCount ?? SMALL_COUNT,
    largeCount: c.largeCount ?? LARGE_COUNT,
    strokesPerParticle: c.strokesPerParticle ?? STROKES_PER_PARTICLE,
    strokeSpeed: c.strokeSpeed ?? STROKE_SPEED,
    strokeReach: c.strokeReach ?? STROKE_REACH,
    seed: c.seed ?? SEED,
  };
}

// ---- 색 ----

/**
 * 흰빛이 (1/λ)ⁿ 로 흩어진 빛의 **색만** — 가장 큰 성분을 1 로 맞춘다. 흩어진 빛의 양은
 * 이 조각이 보이는 것이 아니다(NOTES (b)). 음수 성분은 0 으로 자른다.
 */
export function scatteredHue(exponent: number): LinearRgb {
  const rgb = spectrumToLinearRgb((nm) => Math.pow(1 / nm, exponent));
  const r = Math.max(0, rgb[0]);
  const g = Math.max(0, rgb[1]);
  const b = Math.max(0, rgb[2]);
  const m = Math.max(r, g, b);
  return m > 0 ? [r / m, g / m, b / m] : [0, 0, 0];
}

// ---- 방향 ----

/** 작은 입자 — p(θ) ∝ 1 + cos²θ 에서 ξ(0~1)에 맞는 θ(0~2π). 누적 분포를 이분으로 푼다. */
export function smallAngle(xi: number): number {
  const cdf = (th: number): number => (1.5 * th + 0.25 * Math.sin(2 * th)) / (3 * Math.PI);
  let lo = 0;
  let hi = 2 * Math.PI;
  for (let k = 0; k < INVERSE_ITERATIONS; k++) {
    const mid = (lo + hi) / 2;
    if (cdf(mid) < xi) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** 큰 물방울 — 평면 Henyey-Greenstein(감긴 코시, 비대칭 g)에서 ξ(0~1)에 맞는 θ(−π~π). */
export function largeAngle(xi: number, g: number): number {
  return 2 * Math.atan(((1 - g) / (1 + g)) * Math.tan(Math.PI * (xi - 0.5)));
}

/** 작은 입자의 방향 밀도(상대값) — 1 + cos²θ. 분포 윤곽이 쓴다. */
export function smallDensity(theta: number): number {
  const c = Math.cos(theta);
  return 1 + c * c;
}

/** 큰 물방울의 방향 밀도(상대값) — 평면 Henyey-Greenstein. 분포 윤곽이 쓴다. */
export function largeDensity(theta: number, g: number): number {
  return (1 - g * g) / (1 + g * g - 2 * g * Math.cos(theta));
}

// ---- 입자 자리 ----

export interface Particle {
  pos: Vec2;
  /** 이 입자의 번호 — 획 방향 · 출발 몫을 뽑는 난수의 바탕. */
  index: number;
}

/**
 * 입자 `count` 개를 사각 구역에 흩는다. 가로는 고르게 나눈 칸 안에서 흔들고 세로는 구역 높이
 * 안에서 뽑는다 — 큰 물방울끼리 겹치지 않게. `salt` 로 레인마다 다른 수열을 쓴다.
 */
export function placeParticles(
  count: number,
  zone: { x0: number; x1: number; y: number; half: number },
  jitter: number,
  seed: number,
  salt: number,
): Particle[] {
  const out: Particle[] = [];
  const cell = (zone.x1 - zone.x0) / count;
  for (let i = 0; i < count; i++) {
    const n = salt + i;
    const x = zone.x0 + (i + 0.5) * cell + (hash01(seed, 3 * n) - 0.5) * cell * jitter;
    const y = zone.y + (hash01(seed, 3 * n + 1) * 2 - 1) * zone.half;
    out.push({ pos: [x, y], index: n });
  }
  return out;
}

// ---- 시드 난수 ----

/** (시드, 번호) → 0~1. 같은 번호는 언제나 같은 값이다. */
export function hash01(seed: number, i: number): number {
  let h = (Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul(i + 1, 0x85ebca6b)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ScatteringState }): ScatteringState {
  return params.state;
}
