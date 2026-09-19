// ========================================================================
// random-walk — 순수 물리
// ========================================================================
// DOM · 캔버스 · 색을 모른다. 난수는 시드에서만 뽑는다 (S-sim).
//
// 걷는 이마다 걸음마다 동전을 던져 왼쪽(−1) 또는 오른쪽(+1)으로 한 칸 간다. 모든 걸음은
// `initialState` 가 시드로 한 번 미리 걸어 둔다. 화면은 걸음 번호(시간표 진행도 × 걸음 수)로
// 그 목록을 읽기만 한다 — `step` 에 쌓지 않으므로 같은 시각은 언제나 같은 화면이다.
// 주기마다 같은 시드라 같은 걸음이다 — 폭 괄호에 맞춘 표본이 모든 주기에서 그대로다 (NOTES (b)).
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import {
  BAR_SCALE,
  SEED,
  SPREAD_FIRST,
  SPREAD_SECOND,
  STEPS_FIRST,
  STEPS_SECOND,
  WALKERS,
} from './schema';
import type { RandomWalkState } from './state';

export interface RandomWalkConstants {
  seed: number;
  /** 걷는 이의 수. */
  walkers: number;
  /** 첫 멈춤 · 두 번째 멈춤까지의 걸음 수(처음부터 센 것). 두 번째가 첫째보다 적지 않다. */
  stepsFirst: number;
  stepsSecond: number;
  /** 두 멈춤에서 긋는 폭 괄호의 반폭(칸). */
  spreadFirst: number;
  spreadSecond: number;
  /** 걸음 막대 배율(월드 / 걸음). */
  barScale: number;
}

export function readConstants(stage: StageDef): RandomWalkConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const stepsFirst = Math.max(1, Math.round(c.stepsFirst ?? STEPS_FIRST));
  return {
    seed: Math.round(c.seed ?? SEED),
    walkers: Math.max(1, Math.round(c.walkers ?? WALKERS)),
    stepsFirst,
    stepsSecond: Math.max(stepsFirst, Math.round(c.stepsSecond ?? STEPS_SECOND)),
    spreadFirst: c.spreadFirst ?? SPREAD_FIRST,
    spreadSecond: c.spreadSecond ?? SPREAD_SECOND,
    barScale: c.barScale ?? BAR_SCALE,
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

/**
 * 시드로 모든 걸음을 걷는다. 결과는 걸음 번호마다 걷는 이들의 자리(칸) 한 줄이다.
 * 0 번은 모두 처음 자리(0)다. 걸음마다 걷는 이 순서대로 동전을 한 번씩 던진다.
 */
export function walkAll(c: RandomWalkConstants): number[][] {
  const rnd = makeRandom(c.seed);
  let prev = new Array<number>(c.walkers).fill(0);
  const frames: number[][] = [prev];
  for (let k = 1; k <= c.stepsSecond; k++) {
    const next = prev.map((x) => x + (rnd() < 0.5 ? -1 : 1));
    frames.push(next);
    prev = next;
  }
  return frames;
}

/** 걸음 번호(소수 가능)에서 걷는 이 i 의 자리(칸). 걸음 사이는 곧게 잇는다. */
export function positionAt(state: RandomWalkState, i: number, k: number): number {
  const last = state.frames.length - 1;
  const kk = Math.min(Math.max(k, 0), last);
  const k0 = Math.floor(kk);
  const k1 = Math.min(k0 + 1, last);
  const f = kk - k0;
  const a = state.frames[k0]![i]!;
  const b = state.frames[k1]![i]!;
  return a + (b - a) * f;
}

/** 쌓는 것이 없다 — 자리는 미리 걸어 둔 목록을 걸음 번호로 읽는다. */
export function step(params: { state: RandomWalkState }): RandomWalkState {
  return params.state;
}
