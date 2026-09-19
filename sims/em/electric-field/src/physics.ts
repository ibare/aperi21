// ========================================================================
// electric-field — 순수 물리
// ========================================================================
// 양전하 하나가 만드는 장:  E(r) = kQ / r²,  방향은 원천에서 바깥쪽.
// 시험 전하 q 가 받는 힘은 F = qE — 단위 전하(q = 1)이면 장 화살표 그 자체다.
// 놓아준 시험 전하는 정지 상태에서 바깥으로 곧게 밀려 간다 (m r'' = q kQ / r²).
// 적분은 놓인 시각부터 지금까지를 매번 처음부터 고정 걸음으로 다시 한다 — 같은 시각은
// 언제나 같은 자리다 (상태를 쌓지 않는다).
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ARROW_MAX,
  ARROW_SCALE,
  CHARGE_FACTOR,
  GRID_CLEARANCE,
  GRID_HALF_COLS,
  GRID_HALF_ROWS,
  GRID_STEP,
  KQ,
  PROBE_A,
  PROBE_B,
  PROBE_C,
  PROBE_MASS,
  PROBE_RADIUS,
  SOURCE_RADIUS,
} from './schema';
import type { ElectricFieldState } from './state';

/** 밀려 가는 운동의 적분 걸음(초). 표현의 정밀도라 스테이지 상수에 두지 않는다. */
const PUSH_DT = 1 / 240;

export interface ElectricFieldConstants {
  /** 원천 전하의 kQ. */
  kQ: number;
  /** 원천 전하 그림 반지름(월드). */
  sourceRadius: number;
  /** 장 → 화살표 길이 배율 · 장 화살표 길이 상한(월드). */
  arrowScale: number;
  arrowMax: number;
  /** 격자 간격(월드) · 반폭 · 반높이(칸 수) · 원천 둘레 비움(월드). */
  gridStep: number;
  gridHalfCols: number;
  gridHalfRows: number;
  gridClearance: number;
  /** 세 시험 전하가 놓이는 자리. 두 번째(B)가 커지는 전하다. */
  probes: readonly Vec2[];
  /** 시험 전하 그림 반지름(월드). */
  probeRadius: number;
  /** B 의 전하를 키우는 배수. */
  chargeFactor: number;
  /** 시험 전하의 질량. */
  probeMass: number;
}

export function readConstants(stage: StageDef): ElectricFieldConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    kQ: c.kQ ?? KQ,
    sourceRadius: c.sourceRadius ?? SOURCE_RADIUS,
    arrowScale: c.arrowScale ?? ARROW_SCALE,
    arrowMax: c.arrowMax ?? ARROW_MAX,
    gridStep: c.gridStep ?? GRID_STEP,
    gridHalfCols: c.gridHalfCols ?? GRID_HALF_COLS,
    gridHalfRows: c.gridHalfRows ?? GRID_HALF_ROWS,
    gridClearance: c.gridClearance ?? GRID_CLEARANCE,
    probes: [
      [c.probeAX ?? PROBE_A[0], c.probeAY ?? PROBE_A[1]],
      [c.probeBX ?? PROBE_B[0], c.probeBY ?? PROBE_B[1]],
      [c.probeCX ?? PROBE_C[0], c.probeCY ?? PROBE_C[1]],
    ],
    probeRadius: c.probeRadius ?? PROBE_RADIUS,
    chargeFactor: c.chargeFactor ?? CHARGE_FACTOR,
    probeMass: c.probeMass ?? PROBE_MASS,
  };
}

/** 커지는 전하의 번호 — `probes` 의 두 번째(B). */
export const GROWING_PROBE = 1;

/**
 * 한 자리의 장 세기 E = kQ / r² 와 바깥 방향 단위 벡터. 원점이면 방향이 없어 0 이다.
 */
function fieldAt(pos: Vec2, c: ElectricFieldConstants): { e: number; ux: number; uy: number } {
  const r = Math.hypot(pos[0], pos[1]);
  if (r === 0) return { e: 0, ux: 0, uy: 0 };
  return { e: c.kQ / (r * r), ux: pos[0] / r, uy: pos[1] / r };
}

/**
 * 한 자리에 적힌 장 화살표(월드 delta) — 단위 전하가 받을 힘. 길이는 배율 × E 이고
 * **상한에서 자른다**(원천 곁의 비례가 끊긴다 — NOTES b).
 */
export function fieldArrow(pos: Vec2, c: ElectricFieldConstants): Vec2 {
  const { e, ux, uy } = fieldAt(pos, c);
  const len = Math.min(c.arrowMax, c.arrowScale * e);
  return [ux * len, uy * len];
}

/**
 * 전하 q 가 그 자리에서 받는 힘 화살표(월드 delta) = q × 장, 같은 배율. 상한을 걸지 않는다 —
 * 상한은 장 격자가 이웃 칸을 덮지 않게 하는 표시 타협이고, 힘은 그 비례가 주장이다.
 * 시험 전하는 상한에 걸리지 않는 자리에만 놓이므로 q = 1 이면 장 화살표와 꼭 같다.
 */
export function forceArrow(pos: Vec2, q: number, c: ElectricFieldConstants): Vec2 {
  const { e, ux, uy } = fieldAt(pos, c);
  const len = q * c.arrowScale * e;
  return [ux * len, uy * len];
}

/**
 * 격자 자리 — 반 칸 어긋난 자리(±½, ±1½ …)들. 원천 전하 곁(`gridClearance` 안)은 비운다.
 * 원천이 격자점 위에 오지 않게 반 칸 어긋나 놓았다 — 원점에 화살표가 놓이면 방향이 없다.
 */
export function gridSpots(c: ElectricFieldConstants): Vec2[] {
  const spots: Vec2[] = [];
  for (let j = c.gridHalfRows - 1; j >= -c.gridHalfRows; j--) {
    for (let i = -c.gridHalfCols; i < c.gridHalfCols; i++) {
      const x = (i + 0.5) * c.gridStep;
      const y = (j + 0.5) * c.gridStep;
      if (Math.hypot(x, y) < c.sourceRadius + c.gridClearance) continue;
      spots.push([x, y]);
    }
  }
  return spots;
}

/**
 * 정지 상태에서 놓인 전하 q 가 `s` 초 뒤 있는 자리. 원천에서 바깥으로 곧게 밀리므로
 * 반지름 r 하나만 적분한다(반암시 오일러, 고정 걸음).
 */
export function pushedAt(start: Vec2, q: number, s: number, c: ElectricFieldConstants): Vec2 {
  const r0 = Math.hypot(start[0], start[1]);
  const ux = start[0] / r0;
  const uy = start[1] / r0;
  let r = r0;
  let v = 0;
  const steps = Math.floor(Math.max(0, s) / PUSH_DT);
  for (let k = 0; k < steps; k++) {
    v += ((q * c.kQ) / (r * r) / c.probeMass) * PUSH_DT;
    r += v * PUSH_DT;
  }
  return [ux * r, uy * r];
}

/** 이번 주기에서 놓아준 뒤 흐른 시간(초). `push` 단계가 시작된 뒤 흐른 주기 안 시각이다. */
export function pushElapsed(tl: TimelineFrame): number {
  return Math.max(0, tl.u - tl.start('push'));
}

/** 시험 전하가 보이는 정도 0~1 — 놓이는 동안 나타나고, 마지막 단계에서 사라진다. */
export function probeOpacity(tl: TimelineFrame): number {
  return tl.at('place') * (1 - tl.at('clear'));
}

/**
 * 시험 전하 i 의 전하량(q 단위). 커지는 전하(B)는 `grow` 동안 1 → 배수로 자라고 그 뒤
 * 배수로 남는다. 나머지는 늘 1 — 단위 시험 전하다.
 */
export function probeCharge(i: number, tl: TimelineFrame, c: ElectricFieldConstants): number {
  if (i !== GROWING_PROBE) return 1;
  return 1 + (c.chargeFactor - 1) * tl.at('grow');
}

/** 커지는 전하의 이름표가 배수로 바뀌었는가 — 자라기 시작한 순간부터다. */
export function isGrown(tl: TimelineFrame): boolean {
  return tl.at('grow') > 0;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ElectricFieldState }): ElectricFieldState {
  return params.state;
}
