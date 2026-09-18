// ========================================================================
// wave-function — 순수 물리
// ========================================================================
// ψ(x) = (c₀ φ₀ + c₁ φ₁) / √(c₀² + c₁²),  φ₀ = π^(−1/4) e^(−x²/2),  φ₁ = √2 x φ₀.
// φ₀ · φ₁ 가 정규 직교라 |ψ|² 의 넓이는 1 이다. 마디는 x = −c₀ / (√2 c₁) 하나다.
//
// 측정 결과는 (시드, 주기 번호)의 함수다 — |ψ|² 의 누적 분포를 거꾸로 읽어 점 자리를
// 뽑는다. 느린 단계 몫에는 ψ 가 음수인 쪽 점이 언제나 하나 이상 들도록 순서만 바꾼다. 같은 시각은 언제나 같은 화면이고, 주기마다 새 측정이다. 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  BIN_COUNT,
  COEFF_EXCITED,
  COEFF_GROUND,
  DOT_COUNT,
  SEED,
  SLOW_COUNT,
  X_HALF,
} from './schema';
import type { WaveFunctionState } from './state';

/** 누적 분포 표의 표본 수 — 거꾸로 읽을 때 칸 하나가 길이 단위 0.01 이다. */
const CDF_SAMPLES = 800;
/** 주기 번호를 시드에 섞는 곱수(황금비 해시). 난수 수학 상수다. */
const CYCLE_MIX = 0x9e3779b1;

export interface WaveFunctionConstants {
  /** φ₀ 계수. */
  coeffGround: number;
  /** φ₁ 계수. */
  coeffExcited: number;
  /** 측정 시드. */
  seed: number;
  /** 한 주기의 측정 수. */
  dotCount: number;
  /** 하나씩 천천히 찍는 측정 수. */
  slowCount: number;
  /** 점 더미 칸 수. */
  binCount: number;
}

export function readConstants(stage: StageDef): WaveFunctionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    coeffGround: c.coeffGround ?? COEFF_GROUND,
    coeffExcited: c.coeffExcited ?? COEFF_EXCITED,
    seed: c.seed ?? SEED,
    dotCount: c.dotCount ?? DOT_COUNT,
    slowCount: c.slowCount ?? SLOW_COUNT,
    binCount: c.binCount ?? BIN_COUNT,
  };
}

/** 파동 함수 ψ(x). 부호가 있다. */
export function psi(x: number, c: WaveFunctionConstants): number {
  const norm = Math.hypot(c.coeffGround, c.coeffExcited) || 1;
  const phi0 = Math.pow(Math.PI, -0.25) * Math.exp(-(x * x) / 2);
  return ((c.coeffGround + c.coeffExcited * Math.SQRT2 * x) * phi0) / norm;
}

/** 확률 밀도 |ψ(x)|². */
export function density(x: number, c: WaveFunctionConstants): number {
  const v = psi(x, c);
  return v * v;
}

/** 보이는 범위 [−X_HALF, X_HALF] 에서 |ψ| · |ψ|² 의 최댓값 — 판 배율을 정한다. */
export function peaks(c: WaveFunctionConstants): { psiMax: number; densityMax: number } {
  let psiMax = 0;
  for (let i = 0; i <= CDF_SAMPLES; i++) {
    const x = -X_HALF + (2 * X_HALF * i) / CDF_SAMPLES;
    psiMax = Math.max(psiMax, Math.abs(psi(x, c)));
  }
  return { psiMax, densityMax: psiMax * psiMax };
}

/** mulberry32 — 시드를 닫아 둔 생성기. 난수 수학 상수만 쓴다. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Measurement {
  /** 측정된 자리(길이 단위). */
  x: number;
  /** 측정 띠 안 세로 자리 0~1 — 뜻이 없고, 점이 겹치지 않게 흩는 몫이다. */
  lane: number;
}

/**
 * 한 주기의 측정 결과 전부. (시드, 주기 번호)의 함수다 — `radioactive-decay` 의
 * `drawCycle` 과 같은 자리다. |ψ|² 누적 분포를 거꾸로 읽는다(보이는 범위 밖 꼬리는
 * 넓이가 10⁻⁶ 아래라 버린다).
 */
export function drawCycle(c: WaveFunctionConstants, cycle: number): Measurement[] {
  const xs: number[] = [];
  const cdf: number[] = [];
  let acc = 0;
  let prev = 0;
  for (let i = 0; i <= CDF_SAMPLES; i++) {
    const x = -X_HALF + (2 * X_HALF * i) / CDF_SAMPLES;
    const d = density(x, c);
    if (i > 0) acc += ((prev + d) / 2) * ((2 * X_HALF) / CDF_SAMPLES);
    xs.push(x);
    cdf.push(acc);
    prev = d;
  }
  const total = acc || 1;
  const rand = mulberry32((c.seed ^ Math.imul(cycle + 1, CYCLE_MIX)) >>> 0);
  const out: Measurement[] = [];
  for (let k = 0; k < c.dotCount; k++) {
    const r = rand() * total;
    let lo = 0;
    let hi = CDF_SAMPLES;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid]! < r) lo = mid;
      else hi = mid;
    }
    const span = cdf[hi]! - cdf[lo]!;
    const f = span > 0 ? (r - cdf[lo]!) / span : 0;
    out.push({ x: xs[lo]! + f * (xs[hi]! - xs[lo]!), lane: rand() });
  }
  ensureNegativeEarly(out, c);
  return out;
}

/** 음수 쪽 점을 옮겨 넣을 느린 단계의 칸 — 도착 직후(점 둘이 끝난 뒤) 곧 찍히는 자리. */
const NEGATIVE_SLOT = 1;

/**
 * 느린 단계(앞 `slowCount` 점)에 ψ 가 음수인 쪽 점이 하나도 없으면, 뒤에서 처음 나오는
 * 음수 쪽 점과 앞쪽 칸을 맞바꾼다. `caption.slow`(음수인 곳에도 찍힌다)가 어느 주기에도
 * 서게 하려는 것이다 — 점 집합은 그대로라 더미 분포가 바뀌지 않고, 여전히 (시드, 주기)의
 * 함수다. 음수 쪽 점이 아예 없으면(ψ 가 음수인 곳이 없는 계수) 건드리지 않는다.
 */
function ensureNegativeEarly(ms: Measurement[], c: WaveFunctionConstants): void {
  const nSlow = Math.min(c.slowCount, ms.length);
  if (nSlow <= 0) return;
  const negative = (m: Measurement): boolean => psi(m.x, c) < 0;
  for (let k = 0; k < nSlow; k++) if (negative(ms[k]!)) return;
  for (let k = nSlow; k < ms.length; k++) {
    if (!negative(ms[k]!)) continue;
    const slot = Math.min(NEGATIVE_SLOT, nSlow - 1);
    const tmp = ms[slot]!;
    ms[slot] = ms[k]!;
    ms[k] = tmp;
    return;
  }
}

/** 칸마다 쌓인 점 수. 칸은 [−X_HALF, X_HALF] 를 `binCount` 로 나눈다. */
export function binCounts(ms: readonly Measurement[], count: number, c: WaveFunctionConstants): number[] {
  const bins = new Array<number>(c.binCount).fill(0);
  const w = (2 * X_HALF) / c.binCount;
  for (let k = 0; k < count && k < ms.length; k++) {
    const i = Math.floor((ms[k]!.x + X_HALF) / w);
    if (i >= 0 && i < c.binCount) bins[i]! += 1;
  }
  return bins;
}

export interface MeasureReading {
  /** 지금까지 찍힌 점 수. */
  count: number;
  /** 하나씩 찍는 동안이면 방금 찍힌 점의 번호, 아니면 없다. */
  newest?: number;
  /** 점 · 더미의 불투명도 0~1. 주기 끝에서 걷힌다. */
  opacity: number;
}

/**
 * 지금 찍힌 점 수. `slow` 동안 `slowCount` 개가 고른 간격으로, `fast` 동안 나머지가
 * 찍힌다 — 점마다의 시각은 단계로 풀 수 없어 몇 개를 찍는지만 스테이지 상수로 둔다
 * (NOTES 「어휘 부족」 G161).
 */
export function readMeasure(tl: TimelineFrame, c: WaveFunctionConstants): MeasureReading {
  const slow = tl.at('slow');
  const fast = tl.at('fast');
  const nSlow = Math.min(c.slowCount, c.dotCount);
  const count = Math.min(
    c.dotCount,
    Math.floor(nSlow * slow) + Math.floor((c.dotCount - nSlow) * fast),
  );
  const newest = fast <= 0 && count > 0 ? count - 1 : undefined;
  return { count, newest, opacity: 1 - tl.at('clear') };
}

/** 상태가 시계뿐인 조각 — 항등 step (S-sim). */
export function step(params: { state: WaveFunctionState }): WaveFunctionState {
  return params.state;
}
