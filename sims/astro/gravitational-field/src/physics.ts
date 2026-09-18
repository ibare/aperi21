// ========================================================================
// gravitational-field — 순수 물리
// ========================================================================
// 행성 하나가 만드는 장:  g(r) = GM / r²,  방향은 행성 중심 쪽.
// 시험 질량은 정지 상태에서 놓여 그 장을 따라 곧게 떨어진다 (r'' = −GM/r²).
// 낙하는 닫힌 꼴이 번거로워 고정 걸음으로 적분한다 — 놓인 시각부터 지금까지를 매번
// 처음부터 다시 적분하므로 같은 시각은 언제나 같은 자리다 (상태를 쌓지 않는다).
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ARROW_MAX,
  ARROW_SCALE,
  FALL_DT,
  GM,
  GRID_CLEARANCE,
  GRID_HALF_COLS,
  GRID_HALF_ROWS,
  GRID_STEP,
  PLANET_RADIUS,
  PROBE_A,
  PROBE_B,
  PROBE_C,
  PROBE_RADIUS,
} from './schema';
import type { GravitationalFieldState } from './state';

export interface GravitationalFieldConstants {
  /** 행성의 GM(월드³/초²). */
  gm: number;
  /** 행성 반지름(월드). */
  planetRadius: number;
  /** 화살표 길이 배율 · 상한(월드). */
  arrowScale: number;
  arrowMax: number;
  /** 격자 간격(월드) · 반폭 · 반높이(칸 수) · 행성 둘레 비움(월드). */
  gridStep: number;
  gridHalfCols: number;
  gridHalfRows: number;
  gridClearance: number;
  /** 세 시험 질량이 놓이는 자리. */
  probes: readonly Vec2[];
  /** 시험 질량 반지름(월드). */
  probeRadius: number;
}

export function readConstants(stage: StageDef): GravitationalFieldConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    gm: c.gm ?? GM,
    planetRadius: c.planetRadius ?? PLANET_RADIUS,
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
  };
}

/**
 * 한 자리의 장 화살표(월드 delta). 행성 중심(원점)을 향하고 길이는 배율 × GM / r²,
 * 상한에서 자른다. 격자 화살표와 시험 질량이 받는 화살표가 **같은 함수**를 쓴다 —
 * 둘이 같은 것이라는 것이 이 그림의 주장이다.
 */
export function fieldArrow(pos: Vec2, c: GravitationalFieldConstants): Vec2 {
  const r = Math.hypot(pos[0], pos[1]);
  if (r === 0) return [0, 0];
  const len = Math.min(c.arrowMax, (c.arrowScale * c.gm) / (r * r));
  return [(-pos[0] / r) * len, (-pos[1] / r) * len];
}

/**
 * 격자 자리 — 반 칸 어긋난 자리(±½, ±1½ …)들. 행성 표면 곁(`gridClearance` 안)은 비운다.
 * 행성이 격자점 위에 오지 않게 반 칸 어긋나 놓았다 — 원점에 화살표가 놓이면 방향이 없다.
 */
export function gridSpots(c: GravitationalFieldConstants): Vec2[] {
  const spots: Vec2[] = [];
  for (let j = c.gridHalfRows - 1; j >= -c.gridHalfRows; j--) {
    for (let i = -c.gridHalfCols; i < c.gridHalfCols; i++) {
      const x = (i + 0.5) * c.gridStep;
      const y = (j + 0.5) * c.gridStep;
      if (Math.hypot(x, y) < c.planetRadius + c.gridClearance) continue;
      spots.push([x, y]);
    }
  }
  return spots;
}

export interface ProbeReading {
  /** 지금 자리(월드). */
  pos: Vec2;
  /** 행성 표면에 닿았는가. */
  landed: boolean;
}

/**
 * 정지 상태에서 놓인 시험 질량이 `s` 초 뒤 있는 자리. 중심을 향해 곧게 떨어지므로
 * 반지름 r 하나만 적분한다(반암시 오일러, 고정 걸음). 표면에 닿으면 그 자리에 멈춘다 —
 * 닿는 시각은 단계 경계가 아니라 이 적분이 정한다.
 */
export function probeAt(start: Vec2, s: number, c: GravitationalFieldConstants): ProbeReading {
  const r0 = Math.hypot(start[0], start[1]);
  const ux = start[0] / r0;
  const uy = start[1] / r0;
  const surface = c.planetRadius + c.probeRadius;
  let r = r0;
  let v = 0;
  let landed = false;
  const steps = Math.floor(Math.max(0, s) / FALL_DT);
  for (let k = 0; k < steps; k++) {
    v -= (c.gm / (r * r)) * FALL_DT;
    r += v * FALL_DT;
    if (r <= surface) {
      r = surface;
      landed = true;
      break;
    }
  }
  return { pos: [ux * r, uy * r], landed };
}

/** 이번 주기에서 시험 질량이 떨어진 시간(초). `fall` 단계가 시작된 뒤 흐른 주기 안 시각이다. */
export function fallElapsed(tl: TimelineFrame): number {
  return Math.max(0, tl.u - tl.start('fall'));
}

/** 시험 질량이 보이는 정도 0~1 — 놓이는 동안 나타나고, 마지막 단계에서 사라진다. */
export function probeOpacity(tl: TimelineFrame): number {
  return tl.at('place') * (1 - tl.at('fade'));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: GravitationalFieldState }): GravitationalFieldState {
  return params.state;
}
