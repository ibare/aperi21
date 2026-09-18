// ========================================================================
// relativistic-momentum — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 한결같은 힘이라 운동량은 미기 시작한 뒤 흐른 시간에 비례하고
// (p = F·t), 속도는 그 운동량에서 곧바로 나온다. 모두 스테이지 상수와 시간표 시각의
// 함수라 같은 시각은 언제나 같은 화면이다. `step` 은 항등이다.
//
// 단위 — 속도는 c = 1, 운동량은 (질량 단위 × c) = 1.
//   실제:  p = γ m v  →  v = p / √(m² + p²)     (늘 1 보다 작다)
//   고전:  p = m v    →  v = p / m               (p > m 이면 c 를 넘는다)
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { FORCE, MASS, PLOT, SPEED_TICKS, STAMP_INTERVAL, speedTickKey } from './schema';
import type { RelativisticMomentumState } from './state';

/** 자국 개수를 셀 때 부동소수 오차로 한 칸 늦게 찍히지 않게 더하는 몫. 물리량이 아니다. */
const COUNT_EPS = 1e-9;

export interface RelativisticMomentumConstants {
  mass: number;
  force: number;
  stampInterval: number;
  /** 가로축에 이름을 붙일 속도 눈금(c 단위). */
  speedTicks: readonly number[];
}

/** 스테이지 상수를 기본값과 함께 읽는다 (원칙 2). */
export function readConstants(stage: StageDef): RelativisticMomentumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const k: RelativisticMomentumConstants = {
    mass: c.mass ?? MASS,
    force: c.force ?? FORCE,
    stampInterval: c.stampInterval ?? STAMP_INTERVAL,
    speedTicks: SPEED_TICKS.map((v, i) => c[speedTickKey(i)] ?? v),
  };
  if (k.mass <= 0 || k.force <= 0 || k.stampInterval <= 0) {
    throw new Error('relativistic-momentum: mass · force · stampInterval 은 0 보다 커야 한다');
  }
  return k;
}

/** 미기 시작한 뒤 흐른 시간(초). `slow` 시작부터 `fast` 끝까지 흐르고 그 뒤에는 멈춘다. */
export function pushElapsed(tl: TimelineFrame): number {
  const from = tl.start('slow');
  const to = tl.end('fast');
  return Math.min(Math.max(tl.u - from, 0), to - from);
}

/** 한결같은 힘이 쌓은 운동량. */
export function momentumAfter(elapsed: number, k: RelativisticMomentumConstants): number {
  return k.force * elapsed;
}

/** 실제 속도(c 단위) — 운동량이 아무리 커도 1 에 닿지 않는다. */
export function relativisticSpeed(p: number, k: RelativisticMomentumConstants): number {
  return p / Math.sqrt(k.mass * k.mass + p * p);
}

/** 고전 속도(c 단위) — 운동량에 비례해 c 를 넘어 간다. */
export function classicalSpeed(p: number, k: RelativisticMomentumConstants): number {
  return p / k.mass;
}

/** (속도, 운동량) → 월드. */
export function plotPoint(v: number, p: number): Vec2 {
  return [v * PLOT.perC, p * PLOT.perP];
}

/** 실제 곡선 — 운동량을 0 에서 세로축 끝까지 고르게 나눠 짚는다. c 앞의 치솟는 구간도 촘촘하다. */
export function relativisticCurve(k: RelativisticMomentumConstants, samples: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i <= samples; i++) {
    const p = (PLOT.pTop * i) / samples;
    pts.push(plotPoint(relativisticSpeed(p, k), p));
  }
  return pts;
}

/** 고전 직선 — 원점에서 가로축 끝(또는 세로축 끝)까지. */
export function classicalLine(k: RelativisticMomentumConstants): Vec2[] {
  const pEnd = Math.min(PLOT.vEnd * k.mass, PLOT.pTop);
  return [plotPoint(0, 0), plotPoint(classicalSpeed(pEnd, k), pEnd)];
}

/** 지금까지 찍힌 자국들의 운동량 — 같은 시간 간격마다 하나. */
export function stampMomenta(elapsed: number, k: RelativisticMomentumConstants): number[] {
  const n = Math.floor(elapsed / k.stampInterval + COUNT_EPS);
  const out: number[] = [];
  for (let i = 1; i <= n; i++) out.push(momentumAfter(i * k.stampInterval, k));
  return out;
}

export function step(params: { state: RelativisticMomentumState }): RelativisticMomentumState {
  return params.state;
}
