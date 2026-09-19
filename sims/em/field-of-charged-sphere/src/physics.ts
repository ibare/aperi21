// ========================================================================
// field-of-charged-sphere — 순수 물리
// ========================================================================
// 전하 Q 가 반지름 s 인 얇은 껍질에 고르게 퍼져 있을 때의 장 (껍질 정리):
//   r > s  →  E = kQ / r²   (가운데에 모인 점전하와 같다)
//   r < s  →  E = 0
// 도체 구에 준 전하는 겉면(s = R)에 퍼진다. 전하를 가운데로 모으는 동안은 껍질 반지름 s 가
// R 에서 0 으로 줄어든다 — s = 0 이면 점전하다. 방향은 가운데에서 바깥쪽.
//
// 모든 것이 조각 시계의 함수다 — 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ARROW_MAX,
  ARROW_SCALE,
  GRAPH_BASE_Y,
  GRAPH_END_R,
  GRAPH_SCALE,
  GRAPH_TOP_E,
  GRID_HALF_ROWS,
  GRID_MAX_COL,
  GRID_MIN_COL,
  GRID_STEP,
  KQ,
  POINT_RADIUS,
  PROBE_INSIDE_R,
  PROBE_RADIUS,
  PROBE_START_R,
  SHELL_MARKS,
  SPHERE_RADIUS,
} from './schema';
import type { FieldOfChargedSphereState } from './state';

/** 그래프 곡선 한 벌의 표본 수. 표현의 정밀도라 스테이지 상수에 두지 않는다. */
const CURVE_SAMPLES = 96;

export interface FieldOfChargedSphereConstants {
  kQ: number;
  /** 구의 반지름 R(월드). */
  sphereRadius: number;
  /** 겉면 전하 표식 개수. */
  shellMarks: number;
  /** 장 → 화살표 길이 배율 · 화살표 길이 상한(월드). */
  arrowScale: number;
  arrowMax: number;
  /** 격자 간격(월드) · 열 번호 범위 · 반높이(칸 수). */
  gridStep: number;
  gridMinCol: number;
  gridMaxCol: number;
  gridHalfRows: number;
  /** 시험 전하가 출발하는 거리 · 안에서 멈추는 거리 · 그림 반지름(월드). */
  probeStartR: number;
  probeInsideR: number;
  probeRadius: number;
  /** 한 점으로 모은 전하의 그림 반지름(월드). */
  pointRadius: number;
  /** 그래프 가로축 높이(월드 y) · 세로 배율 · 세로축 끝 세기 · 가로축 끝(월드 x). */
  graphBaseY: number;
  graphScale: number;
  graphTopE: number;
  graphEndR: number;
}

export function readConstants(stage: StageDef): FieldOfChargedSphereConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    kQ: c.kQ ?? KQ,
    sphereRadius: c.sphereRadius ?? SPHERE_RADIUS,
    shellMarks: c.shellMarks ?? SHELL_MARKS,
    arrowScale: c.arrowScale ?? ARROW_SCALE,
    arrowMax: c.arrowMax ?? ARROW_MAX,
    gridStep: c.gridStep ?? GRID_STEP,
    gridMinCol: c.gridMinCol ?? GRID_MIN_COL,
    gridMaxCol: c.gridMaxCol ?? GRID_MAX_COL,
    gridHalfRows: c.gridHalfRows ?? GRID_HALF_ROWS,
    probeStartR: c.probeStartR ?? PROBE_START_R,
    probeInsideR: c.probeInsideR ?? PROBE_INSIDE_R,
    probeRadius: c.probeRadius ?? PROBE_RADIUS,
    pointRadius: c.pointRadius ?? POINT_RADIUS,
    graphBaseY: c.graphBaseY ?? GRAPH_BASE_Y,
    graphScale: c.graphScale ?? GRAPH_SCALE,
    graphTopE: c.graphTopE ?? GRAPH_TOP_E,
    graphEndR: c.graphEndR ?? GRAPH_END_R,
  };
}

// ------------------------------------------------------------------------
// 장
// ------------------------------------------------------------------------

/**
 * 반지름 `shell` 인 껍질에 퍼진 전하의 장 세기. 껍질 안은 0, 밖(겉면 포함)은 kQ / r².
 * `shell` 이 0 이면 점전하다 — 가운데(r = 0)는 방향이 없어 0 으로 둔다.
 */
export function fieldStrength(r: number, shell: number, c: FieldOfChargedSphereConstants): number {
  if (r <= 0 || r < shell) return 0;
  return c.kQ / (r * r);
}

/**
 * 한 자리의 장 화살표(월드 delta) — 단위 전하가 받을 힘. 길이는 배율 × E 이고 **상한에서
 * 자른다**. 구 밖은 상한에 걸리지 않는다 — 걸리는 것은 점전하 곁뿐이다 (NOTES b).
 * 시험 전하가 받는 힘도 이 화살표다(q = 1).
 */
export function fieldArrow(pos: Vec2, shell: number, c: FieldOfChargedSphereConstants): Vec2 {
  const r = Math.hypot(pos[0], pos[1]);
  const e = fieldStrength(r, shell, c);
  if (e === 0) return [0, 0];
  const len = Math.min(c.arrowMax, c.arrowScale * e);
  return [(pos[0] / r) * len, (pos[1] / r) * len];
}

/** 격자 자리 — 반 칸 어긋난 자리(±½, ±1½ …)들. 가운데(원점)에는 자리가 놓이지 않는다. */
export function gridSpots(c: FieldOfChargedSphereConstants): Vec2[] {
  const spots: Vec2[] = [];
  for (let j = c.gridHalfRows - 1; j >= -c.gridHalfRows; j--) {
    for (let i = c.gridMinCol; i <= c.gridMaxCol; i++) {
      spots.push([(i + 0.5) * c.gridStep, (j + 0.5) * c.gridStep]);
    }
  }
  return spots;
}

/** 겉면 전하 표식의 각(라디안). 가로줄(y = 0)은 시험 전하가 지나는 길이라 비켜 놓는다. */
export function shellMarkAngles(c: FieldOfChargedSphereConstants): number[] {
  const n = Math.max(1, Math.round(c.shellMarks));
  return Array.from({ length: n }, (_, i) => ((i + 0.5) / n) * Math.PI * 2);
}

// ------------------------------------------------------------------------
// 시간표 → 지금의 배치
// ------------------------------------------------------------------------

/**
 * 전하가 퍼진 껍질의 지금 반지름. 모으는 동안 R → 0 으로 줄고, 다음 주기까지 0 에 머문다.
 * (돌아오는 `clear` 는 줄어든 껍질을 흐리고 제자리 구를 다시 띄운다 — 크기를 되돌리지 않는다.)
 */
export function shellRadius(tl: TimelineFrame, c: FieldOfChargedSphereConstants): number {
  return c.sphereRadius * (1 - tl.at('gather'));
}

/** 시험 전하가 가운데에서 떨어진 거리. 멀리서 겉면까지, 이어 겉면에서 안쪽 자리까지. */
export function probeR(tl: TimelineFrame, c: FieldOfChargedSphereConstants): number {
  const R = c.sphereRadius;
  return c.probeStartR + (R - c.probeStartR) * tl.at('approach') + (c.probeInsideR - R) * tl.at('enter');
}

/** 시험 전하가 보이는 정도 0~1 — 나타나서, 마지막 단계에서 사라진다. */
export function probeOpacity(tl: TimelineFrame): number {
  return tl.at('appear') * (1 - tl.at('clear'));
}

// ------------------------------------------------------------------------
// 그래프 — 가로는 월드 x = r 그대로(위 그림과 같은 자리), 세로는 배율 × E
// ------------------------------------------------------------------------

/** 장 세기 E 가 그래프에서 놓이는 월드 y. */
export function graphY(e: number, c: FieldOfChargedSphereConstants): number {
  return c.graphBaseY + c.graphScale * e;
}

/**
 * 시험 전하가 지금까지 그은 곡선 — 출발 거리에서 지금 거리까지(구 껍질 반지름 R).
 * 겉면을 넘었으면 겉면에서 **세로로 0 까지 떨어져** 안쪽으로 가로축을 따라간다.
 */
export function probeTrace(r: number, c: FieldOfChargedSphereConstants): Vec2[] {
  const R = c.sphereRadius;
  const outerEnd = Math.max(r, R);
  const pts: Vec2[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const x = c.probeStartR + ((outerEnd - c.probeStartR) * i) / CURVE_SAMPLES;
    pts.push([x, graphY(c.kQ / (x * x), c)]);
  }
  if (r < R) {
    pts.push([R, graphY(0, c)]);
    pts.push([r, graphY(0, c)]);
  }
  return pts;
}

/**
 * 가운데 한 점에 모은 전하의 곡선 — kQ / r² 를 그래프 판 위 끝(`graphTopE`)부터 가로축 끝까지.
 * 판 위 끝보다 가까운 곳은 곡선이 판을 뚫고 나가므로 거기서 시작한다.
 */
export function pointChargeCurve(c: FieldOfChargedSphereConstants): Vec2[] {
  const rTop = Math.sqrt(c.kQ / c.graphTopE);
  const pts: Vec2[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const x = rTop + ((c.graphEndR - rTop) * i) / CURVE_SAMPLES;
    pts.push([x, graphY(c.kQ / (x * x), c)]);
  }
  return pts;
}

/** 원 하나를 표본한 닫힌 점열(월드). 원래 구의 자리를 점선으로 남길 때 쓴다 (장부 G28). */
export function circlePoints(radius: number): Vec2[] {
  return Array.from({ length: CURVE_SAMPLES }, (_, i) => {
    const a = (i / CURVE_SAMPLES) * Math.PI * 2;
    return [radius * Math.cos(a), radius * Math.sin(a)] as Vec2;
  });
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: FieldOfChargedSphereState }): FieldOfChargedSphereState {
  return params.state;
}
