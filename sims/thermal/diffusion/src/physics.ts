// ========================================================================
// diffusion — 순수 물리
// ========================================================================
// DOM · 캔버스 · 색을 모른다. 난수는 시드에서만 뽑는다 (S-sim).
//
// 알갱이마다 걸음을 걷는다. 한 걸음은 길이 `stepLength`, 방향은 제멋대로다. 벽에 닿으면
// 거울처럼 되튄다. 걸음 사이에는 곧게 잇는다.
//
// 모든 걸음은 `initialState` 가 시드로 한 번 미리 걸어 둔다. 화면은 걸음 번호(시간표에서
// 온다)로 그 목록을 읽기만 한다 — `step` 에 쌓지 않으므로 같은 시각은 언제나 같은 화면이다.
// 걸음 번호가 시간표 단계의 진행도 × 걸음 수(스테이지 상수)라 미리 계산에 단계 시각이
// 필요 없다 (G211 을 피한 자리, NOTES (c)).
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import {
  BAR_SCALE,
  BINS,
  BLOB_RADIUS,
  LEAVE_STEPS,
  PARTICLES,
  SEED,
  SETTLE_STEPS,
  SPREAD_STEPS,
  STEP_LENGTH,
  TANK,
  TRAIL_STEPS,
} from './schema';
import type { DiffusionState } from './state';

export interface DiffusionConstants {
  seed: number;
  /** 알갱이 수. */
  particles: number;
  /** 한 걸음의 길이(월드). */
  stepLength: number;
  /** 떨어뜨린 무리의 표준편차(월드). */
  blobRadius: number;
  /** 농도 구간 수. */
  bins: number;
  /** `leave` · `spread` · `even` 단계에서 걷는 걸음 수. */
  leaveSteps: number;
  spreadSteps: number;
  settleSteps: number;
  /** 막대 높이 배율(월드 / 알갱이). */
  barScale: number;
  /** 따라가는 알갱이의 길을 남기는 걸음 수. */
  trailSteps: number;
}

export function readConstants(stage: StageDef): DiffusionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    seed: Math.round(c.seed ?? SEED),
    particles: Math.max(1, Math.round(c.particles ?? PARTICLES)),
    stepLength: c.stepLength ?? STEP_LENGTH,
    blobRadius: c.blobRadius ?? BLOB_RADIUS,
    bins: Math.max(1, Math.round(c.bins ?? BINS)),
    leaveSteps: Math.max(0, Math.round(c.leaveSteps ?? LEAVE_STEPS)),
    spreadSteps: Math.max(1, Math.round(c.spreadSteps ?? SPREAD_STEPS)),
    settleSteps: Math.max(0, Math.round(c.settleSteps ?? SETTLE_STEPS)),
    barScale: c.barScale ?? BAR_SCALE,
    trailSteps: Math.max(1, Math.round(c.trailSteps ?? TRAIL_STEPS)),
  };
}

/** 시드 결정적 난수(mulberry32). 같은 시드는 언제나 같은 수열이다. */
function makeRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 벽에서 거울처럼 되튄다. 한 걸음이 물통 폭보다 짧으므로 한 번 접으면 된다. */
function reflect(v: number, lo: number, hi: number): number {
  if (v < lo) return Math.min(hi, 2 * lo - v);
  if (v > hi) return Math.max(lo, 2 * hi - v);
  return v;
}

/**
 * 시드로 모든 걸음을 걷는다. 결과는 걸음 번호마다 `[x0, y0, x1, y1, …]` 한 줄이다.
 * 0 번이 떨어뜨린 순간의 무리다.
 */
export function walkAll(c: DiffusionConstants): number[][] {
  const rnd = makeRandom(c.seed);
  const cx = (TANK.minX + TANK.maxX) / 2;
  const cy = (TANK.minY + TANK.maxY) / 2;
  const first: number[] = [];
  for (let i = 0; i < c.particles; i++) {
    // 가우스 무리(Box–Muller). 물통 밖으로 나간 것은 벽으로 접는다.
    const r = c.blobRadius * Math.sqrt(-2 * Math.log(1 - rnd()));
    const a = 2 * Math.PI * rnd();
    first.push(reflect(cx + r * Math.cos(a), TANK.minX, TANK.maxX), reflect(cy + r * Math.sin(a), TANK.minY, TANK.maxY));
  }
  const frames: number[][] = [first];
  const total = c.leaveSteps + c.spreadSteps + c.settleSteps;
  let prev = first;
  for (let k = 1; k <= total; k++) {
    const next: number[] = new Array(prev.length);
    for (let i = 0; i < c.particles; i++) {
      const a = 2 * Math.PI * rnd();
      next[2 * i] = reflect(prev[2 * i]! + c.stepLength * Math.cos(a), TANK.minX, TANK.maxX);
      next[2 * i + 1] = reflect(prev[2 * i + 1]! + c.stepLength * Math.sin(a), TANK.minY, TANK.maxY);
    }
    frames.push(next);
    prev = next;
  }
  return frames;
}

/** 떨어뜨린 무리의 가운데에 가장 가까이 있던 알갱이 — 그 하나의 걸음을 따라 보인다. */
export function pickTracked(first: readonly number[]): number {
  const cx = (TANK.minX + TANK.maxX) / 2;
  const cy = (TANK.minY + TANK.maxY) / 2;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < first.length / 2; i++) {
    const d = Math.hypot(first[2 * i]! - cx, first[2 * i + 1]! - cy);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/** 걸음 번호(소수 가능)에서 알갱이 i 의 자리. 걸음 사이는 곧게 잇는다. */
export function positionAt(state: DiffusionState, i: number, k: number): [number, number] {
  const last = state.frames.length - 1;
  const kk = Math.min(Math.max(k, 0), last);
  const k0 = Math.floor(kk);
  const k1 = Math.min(k0 + 1, last);
  const f = kk - k0;
  const a = state.frames[k0]!;
  const b = state.frames[k1]!;
  return [a[2 * i]! + (b[2 * i]! - a[2 * i]!) * f, a[2 * i + 1]! + (b[2 * i + 1]! - a[2 * i + 1]!) * f];
}

/** 물통 가로를 `bins` 구간으로 나눠 각 구간에 든 알갱이 수를 센다. */
export function countBins(xs: readonly number[], bins: number): number[] {
  const counts = new Array<number>(bins).fill(0);
  const w = (TANK.maxX - TANK.minX) / bins;
  for (const x of xs) {
    const b = Math.min(bins - 1, Math.max(0, Math.floor((x - TANK.minX) / w)));
    counts[b]! += 1;
  }
  return counts;
}

/** 쌓는 것이 없다 — 자리는 미리 걸어 둔 목록을 걸음 번호로 읽는다. */
export function step(params: { state: DiffusionState }): DiffusionState {
  return params.state;
}
