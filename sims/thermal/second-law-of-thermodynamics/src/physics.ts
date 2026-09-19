// ========================================================================
// second-law-of-thermodynamics — 순수 물리
// ========================================================================
// DOM · 캔버스 · 실시간을 모른다. 난수는 스테이지 상수의 시드에서만 나온다.
//
// 분자는 벽에서만 튄다(서로 부딪히지 않는 이상 기체의 자유 팽창). 그래서 어느 시각의
// 자리든 처음 자리 · 속도와 시각의 **닫힌 식**이다 — `step` 에 쌓지 않고, 같은 시각은
// 언제나 같은 화면이다 (S-sim).
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import type { SecondLawOfThermodynamicsState } from './state';

/**
 * 벽에서 분자 중심까지 띄우는 거리(월드). 점이 벽선 위에 반쯤 걸쳐 보이지 않게 한다.
 * 물리량이 아니라 그림의 여백이다.
 */
export const WALL_MARGIN = 0.03;

export interface GasConstants {
  /** 분자 수 N. */
  count: number;
  /** 처음 자리 · 속도를 뽑는 시드. */
  seed: number;
  /** 상자 가로 · 세로(월드). 칸막이는 가로 한가운데다. */
  boxWidth: number;
  boxHeight: number;
  /** 속도 성분(vx · vy) 정규분포의 표준편차(월드/초). */
  speedScale: number;
}

export function readConstants(stage: StageDef): GasConstants {
  const c = stage.constants ?? {};
  return {
    count: Math.max(1, Math.round(c.count ?? 50)),
    seed: c.seed ?? 8,
    boxWidth: c.boxWidth ?? 2,
    boxHeight: c.boxHeight ?? 1.2,
    speedScale: c.speedScale ?? 0.5,
  };
}

/** 분자 하나의 처음 자리 · 속도. 처음 자리는 모두 칸막이 왼쪽이다. */
export interface Molecule {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
}

/** mulberry32 — 시드 결정적 난수. 다른 sim 의 것을 import 하지 않고 여기 둔다 (S-sim). */
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

/** log(0) 을 피하는 가장 작은 균등 난수. */
const MIN_UNIFORM = 1e-9;

/**
 * 분자 N 개. 자리는 왼쪽 칸 안에서 고르게, 속도는 성분마다 정규분포(Box–Muller)라
 * 2차원 맥스웰 분포다. 뽑는 순서까지 고정이라 같은 시드면 같은 기체다.
 */
export function sampleMolecules(c: GasConstants): Molecule[] {
  const random = mulberry32(c.seed);
  const half = c.boxWidth / 2;
  const out: Molecule[] = [];
  for (let i = 0; i < c.count; i++) {
    const x = WALL_MARGIN + random() * (half - 2 * WALL_MARGIN);
    const y = WALL_MARGIN + random() * (c.boxHeight - 2 * WALL_MARGIN);
    const r = Math.sqrt(-2 * Math.log(Math.max(MIN_UNIFORM, random())));
    const a = 2 * Math.PI * random();
    out.push({ x, y, vx: c.speedScale * r * Math.cos(a), vy: c.speedScale * r * Math.sin(a) });
  }
  return out;
}

/**
 * 두 벽 [lo, hi] 사이를 튀는 1차원 운동의 닫힌 식. 자리와 그때의 속도(부호가 뒤집힌 것)를 준다.
 * 펼친 좌표를 폭의 두 배로 접는다 — 반사가 몇 번이든 한 번에 계산된다.
 */
function bounce(x0: number, v: number, lo: number, hi: number, t: number): { x: number; v: number } {
  const span = hi - lo;
  const period = 2 * span;
  let s = (x0 - lo + v * t) % period;
  if (s < 0) s += period;
  return s <= span ? { x: lo + s, v } : { x: lo + period - s, v: -v };
}

/**
 * 시각 `t`(주기 안 초)의 분자 자리와 속도.
 *
 * `tOpen` 전에는 가로가 왼쪽 칸 [여백, 가운데 − 여백] 에서 튀고, `tOpen` 에 그 자리 ·
 * 속도 그대로 상자 전체 [여백, 폭 − 여백] 로 풀려난다. 세로는 칸막이와 무관하다.
 * `tOpen` 은 시간표의 `open` 단계 끝이다 — scene 이 선언에서 읽어 넘긴다.
 */
export function moleculeAt(
  m: Molecule,
  t: number,
  tOpen: number,
  c: GasConstants,
): { pos: readonly [number, number]; vel: readonly [number, number] } {
  const lo = WALL_MARGIN;
  const mid = c.boxWidth / 2 - WALL_MARGIN;
  const hi = c.boxWidth - WALL_MARGIN;
  const yb = bounce(m.y, m.vy, WALL_MARGIN, c.boxHeight - WALL_MARGIN, t);
  let xb: { x: number; v: number };
  if (t <= tOpen) {
    xb = bounce(m.x, m.vx, lo, mid, t);
  } else {
    const atOpen = bounce(m.x, m.vx, lo, mid, tOpen);
    xb = bounce(atOpen.x, atOpen.v, lo, hi, t - tOpen);
  }
  return { pos: [xb.x, yb.x], vel: [xb.v, yb.v] };
}

/** 시각 `t` 에 칸막이 왼쪽(가운데선 왼쪽)에 있는 분자 수. */
export function leftCount(
  molecules: readonly Molecule[],
  t: number,
  tOpen: number,
  c: GasConstants,
): number {
  const middle = c.boxWidth / 2;
  let n = 0;
  for (const m of molecules) {
    if (moleculeAt(m, t, tOpen, c).pos[0] < middle) n++;
  }
  return n;
}

/**
 * 상태가 쌓는 것이 없다 — 분자 자리는 시각의 닫힌 식이고, 시각은 엔진이 scene 에
 * `params.timeline` 으로 준다. 빈 걸음을 둔다 (S-sim 「상태가 시계뿐인 조각」).
 */
export function step(params: { state: SecondLawOfThermodynamicsState }): SecondLawOfThermodynamicsState {
  return params.state;
}
