// ========================================================================
// statistical-fluctuation — 순수 물리
// ========================================================================
// DOM · 캔버스 · 실시간을 모른다. 난수는 스테이지 상수의 시드에서만 나온다.
//
// 입자는 벽에서만 튄다(서로 부딪히지 않는 이상 기체). 그래서 어느 시각의 자리든
// 처음 자리 · 속도와 시각의 **닫힌 식**이다 — `step` 에 쌓지 않고, 같은 시각은
// 언제나 같은 화면이다 (S-sim).
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import type { StatisticalFluctuationState } from './state';

/**
 * 벽에서 입자 중심까지 띄우는 거리(월드). 점이 벽선 위에 반쯤 걸쳐 보이지 않게 한다.
 * 물리량이 아니라 그림의 여백이다.
 */
export const WALL_MARGIN = 0.025;

export interface GasConstants {
  /** 상자마다의 입자 수 N — 위 · 가운데 · 아래 순. */
  counts: readonly number[];
  /** 처음 자리 · 속도를 뽑는 시드. 상자 i 는 `seed + i` 를 쓴다. */
  seed: number;
  /** 상자 하나의 가로 · 세로(월드). 가운데 점선은 가로 한가운데다. */
  boxWidth: number;
  boxHeight: number;
  /** 속도 성분(vx · vy) 정규분포의 표준편차(월드/초). */
  speedScale: number;
}

export function readConstants(stage: StageDef): GasConstants {
  const c = stage.constants ?? {};
  const n = (v: number | undefined, d: number): number => Math.max(1, Math.round(v ?? d));
  return {
    counts: [n(c.count1, 10), n(c.count2, 100), n(c.count3, 1000)],
    seed: c.seed ?? 2,
    boxWidth: c.boxWidth ?? 1.2,
    boxHeight: c.boxHeight ?? 0.62,
    speedScale: c.speedScale ?? 0.5,
  };
}

/** 입자 하나의 처음 자리 · 속도(상자 왼쪽 아래 모서리 기준). */
export interface Particle {
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
 * 상자 하나의 입자 N 개. 자리는 상자 전체에서 고르게(이미 퍼진 기체), 속도는 성분마다
 * 정규분포(Box–Muller)라 2차원 맥스웰 분포다. 뽑는 순서까지 고정이라 같은 시드면 같은 기체다.
 */
export function sampleParticles(count: number, seed: number, c: GasConstants): Particle[] {
  const random = mulberry32(seed);
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const x = WALL_MARGIN + random() * (c.boxWidth - 2 * WALL_MARGIN);
    const y = WALL_MARGIN + random() * (c.boxHeight - 2 * WALL_MARGIN);
    const r = Math.sqrt(-2 * Math.log(Math.max(MIN_UNIFORM, random())));
    const a = 2 * Math.PI * random();
    out.push({ x, y, vx: c.speedScale * r * Math.cos(a), vy: c.speedScale * r * Math.sin(a) });
  }
  return out;
}

/**
 * 두 벽 [lo, hi] 사이를 튀는 1차원 운동의 닫힌 식 — 자리만 준다.
 * 펼친 좌표를 폭의 두 배로 접는다 — 반사가 몇 번이든 한 번에 계산된다.
 */
function bounce(x0: number, v: number, lo: number, hi: number, t: number): number {
  const span = hi - lo;
  const period = 2 * span;
  let s = (x0 - lo + v * t) % period;
  if (s < 0) s += period;
  return s <= span ? lo + s : lo + period - s;
}

/** 시각 `t`(주기 안 초)의 입자 자리(상자 왼쪽 아래 모서리 기준). */
export function particleAt(p: Particle, t: number, c: GasConstants): readonly [number, number] {
  return [
    bounce(p.x, p.vx, WALL_MARGIN, c.boxWidth - WALL_MARGIN, t),
    bounce(p.y, p.vy, WALL_MARGIN, c.boxHeight - WALL_MARGIN, t),
  ];
}

/** 시각 `t` 에 가운데 점선 왼쪽에 든 입자의 몫(0~1). */
export function leftShare(particles: readonly Particle[], t: number, c: GasConstants): number {
  if (particles.length === 0) return 0;
  const middle = c.boxWidth / 2;
  let n = 0;
  for (const p of particles) {
    if (bounce(p.x, p.vx, WALL_MARGIN, c.boxWidth - WALL_MARGIN, t) < middle) n++;
  }
  return n / particles.length;
}

/**
 * 상태가 쌓는 것이 없다 — 입자 자리는 시각의 닫힌 식이고, 시각은 엔진이 scene 에
 * `params.timeline` 으로 준다. 빈 걸음을 둔다 (S-sim 「상태가 시계뿐인 조각」).
 */
export function step(params: { state: StatisticalFluctuationState }): StatisticalFluctuationState {
  return params.state;
}
