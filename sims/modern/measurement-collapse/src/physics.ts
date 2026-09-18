// ========================================================================
// measurement-collapse — 순수 물리
// ========================================================================
// 재기 전 |ψ|² = wₗ G(x; μₗ, σₗ) + wᵣ G(x; μᵣ, σᵣ)   (wₗ + wᵣ = 1, G 는 넓이 1 인 가우스)
// 측정 직후 |ψ|² = G(x; x₀, σ_c)   — x₀ 는 첫 측정 결과, σ_c 는 측정의 분해능.
//
// 두 모양 모두 넓이가 1 이다. 그 사이를 넓이를 지키며 섞은 것이 화면의 붕괴 움직임이다.
//
// 측정 결과는 (시드, 주기 번호)의 함수다 — `radioactive-decay` 의 `drawCycle` 과 같은
// 자리다. 첫 결과는 재기 전 분포에서 뽑는다. 곧바로 다시 잰 결과는 같은 자리다 — 측정은
// 분해능 `collapseWidth` 의 검출 칸으로 읽고, 직후 상태가 그 칸에 모여 있으니 다시 재도 같은 칸이다.
// 같은 시각은 언제나 같은 화면이고, 주기마다 새 결과다. 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import {
  COLLAPSE_WIDTH,
  LEFT_CENTER,
  LEFT_WEIGHT,
  LEFT_WIDTH,
  RIGHT_CENTER,
  RIGHT_WEIGHT,
  RIGHT_WIDTH,
  SEED,
  X_HALF,
} from './schema';
import type { MeasurementCollapseState } from './state';

/** 주기 번호를 시드에 섞는 곱수(황금비 해시). 난수 수학 상수다. */
const CYCLE_MIX = 0x9e3779b1;
/** 첫 결과가 보이는 범위 밖에 떨어지면 다시 뽑는 횟수의 상한 — 넘으면 가운데를 쓴다. */
const MAX_REDRAW = 64;
const SQRT_2PI = Math.sqrt(2 * Math.PI);

export interface MeasurementCollapseConstants {
  leftCenter: number;
  leftWidth: number;
  leftWeight: number;
  rightCenter: number;
  rightWidth: number;
  rightWeight: number;
  /** 측정 직후 묶음의 폭(표준 편차). */
  collapseWidth: number;
  /** 측정 시드. */
  seed: number;
}

export function readConstants(stage: StageDef): MeasurementCollapseConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    leftCenter: c.leftCenter ?? LEFT_CENTER,
    leftWidth: c.leftWidth ?? LEFT_WIDTH,
    leftWeight: c.leftWeight ?? LEFT_WEIGHT,
    rightCenter: c.rightCenter ?? RIGHT_CENTER,
    rightWidth: c.rightWidth ?? RIGHT_WIDTH,
    rightWeight: c.rightWeight ?? RIGHT_WEIGHT,
    collapseWidth: c.collapseWidth ?? COLLAPSE_WIDTH,
    seed: c.seed ?? SEED,
  };
}

/** 넓이 1 인 가우스. */
function gauss(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * SQRT_2PI);
}

/** 두 봉우리의 몫을 합이 1 이 되게 나눈다. */
function weights(c: MeasurementCollapseConstants): [number, number] {
  const sum = c.leftWeight + c.rightWeight;
  return sum > 0 ? [c.leftWeight / sum, c.rightWeight / sum] : [0.5, 0.5];
}

/** 재기 전 분포 |ψ(x)|². */
export function spreadDensity(x: number, c: MeasurementCollapseConstants): number {
  const [wl, wr] = weights(c);
  return wl * gauss(x, c.leftCenter, c.leftWidth) + wr * gauss(x, c.rightCenter, c.rightWidth);
}

/** 측정 직후 분포 — 결과 자리 `at` 에 선 좁은 묶음. */
export function collapsedDensity(x: number, at: number, c: MeasurementCollapseConstants): number {
  return gauss(x, at, c.collapseWidth);
}

/** 좁은 묶음 꼭대기의 높이(밀도) — 판 배율을 정한다. */
export function collapsedPeak(c: MeasurementCollapseConstants): number {
  return 1 / (c.collapseWidth * SQRT_2PI);
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

/** 표준 정규 난수 하나(Box–Muller). */
function normal(rand: () => number): number {
  const u1 = Math.max(rand(), Number.MIN_VALUE);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export interface CycleResult {
  /** 첫 측정 결과(길이 단위). */
  first: number;
  /** 곧바로 다시 잰 결과(길이 단위) — 같은 검출 칸이라 첫 결과와 같은 자리다. */
  again: number;
}

/**
 * 한 주기의 측정 결과 둘. (시드, 주기 번호)의 함수다.
 *
 * 첫 결과는 재기 전 분포에서 뽑는다 — 몫대로 봉우리를 고르고 그 가우스에서 뽑는다. 좁은
 * 묶음이 판 밖으로 걸치지 않게 보이는 범위에서 묶음 폭 둘만큼 안쪽에 떨어질 때까지 다시
 * 뽑는다. 다시 잰 결과는 첫 결과와 같은 자리다 — 검출기가 분해능 폭의 칸으로 읽고, 직후
 * 상태(그 폭의 묶음)가 그 칸 안에 있으므로 곧바로 다시 재면 같은 칸이 나온다.
 */
export function drawCycle(c: MeasurementCollapseConstants, cycle: number): CycleResult {
  const rand = mulberry32((c.seed ^ Math.imul(cycle + 1, CYCLE_MIX)) >>> 0);
  const [wl] = weights(c);
  const limit = X_HALF - 2 * c.collapseWidth;
  let first = (c.leftCenter + c.rightCenter) / 2;
  for (let k = 0; k < MAX_REDRAW; k++) {
    const left = rand() < wl;
    const x = left
      ? c.leftCenter + c.leftWidth * normal(rand)
      : c.rightCenter + c.rightWidth * normal(rand);
    if (Math.abs(x) <= limit) {
      first = x;
      break;
    }
  }
  return { first, again: first };
}

/** 상태가 시계뿐인 조각 — 항등 step (S-sim). */
export function step(params: { state: MeasurementCollapseState }): MeasurementCollapseState {
  return params.state;
}
