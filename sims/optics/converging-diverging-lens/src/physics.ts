// ========================================================================
// converging-diverging-lens — 순수 물리
// ========================================================================
// 렌즈를 지난 줄기의 방향은 여기서 계산하지 않는다 — scene 이 plugin-optics `traceRay`
// 로 얇은 렌즈에 쏘아 얻는다. 두 초점도 추적한 줄기가 축과 만나는 자리에서 읽는다.
// 여기 있는 것은 스테이지 상수 읽기와, 시간표 진행도를 줄기 앞머리 · 꼬리 · 짙기로
// 옮기는 것뿐이다. 단계 경계를 코드 상수로 가르지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { FOCAL_LENGTH, RAY_COUNT, RAY_SPACING, RAY_START_X } from './schema';
import type { ConvergingDivergingLensState } from './state';

export interface ConvergingDivergingLensConstants {
  /** 두 렌즈의 초점 거리 크기(월드). */
  focalLength: number;
  /** 평행 줄기 수. */
  rayCount: number;
  /** 이웃 줄기 사이 간격(월드). */
  raySpacing: number;
}

export function readConstants(stage: StageDef): ConvergingDivergingLensConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    focalLength: c.focalLength ?? FOCAL_LENGTH,
    rayCount: c.rayCount ?? RAY_COUNT,
    raySpacing: c.raySpacing ?? RAY_SPACING,
  };
}

/** 줄기들의 높이(광축에서 잰 월드 거리). 가운데가 0 이고 위아래로 대칭이다. */
export function rayOffsets(c: ConvergingDivergingLensConstants): number[] {
  const n = Math.max(1, Math.round(c.rayCount));
  return Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * c.raySpacing);
}

/**
 * 줄기 앞머리의 x. `enter` 동안 출발점에서 렌즈(x = 0)까지, `bend` 동안 렌즈에서 그 줄의
 * 끝(`endX`)까지 간다. 두 단계 진행도의 합이라 분기가 없다.
 */
export function frontX(tl: TimelineFrame, endX: number): number {
  return RAY_START_X + (0 - RAY_START_X) * tl.at('enter') + endX * tl.at('bend');
}

/** 줄기 꼬리의 x. `drain` 동안 출발점에서 끝까지 따라가 빛이 오른쪽으로 빠져나간다. */
export function tailX(tl: TimelineFrame, endX: number): number {
  return RAY_START_X + (endX - RAY_START_X) * tl.at('drain');
}

/** 점선(거꾸로 이은 줄기)이 렌즈에서 허초점까지 자란 몫 0~1. */
export function traceBackReach(tl: TimelineFrame): number {
  return tl.at('trace-back');
}

/** 거꾸로 이은 점선의 짙기. 빛이 빠져나가는 동안 함께 옅어진다. */
export function extensionOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('drain');
}

/** 실초점 표시의 짙기 — `mark-real` 에서 나타나 `drain` 에서 옅어진다. */
export function realFocusOpacity(tl: TimelineFrame): number {
  return tl.at('mark-real') * (1 - tl.at('drain'));
}

/** 허초점 표시의 짙기 — `mark-virtual` 에서 나타나 `drain` 에서 옅어진다. */
export function virtualFocusOpacity(tl: TimelineFrame): number {
  return tl.at('mark-virtual') * (1 - tl.at('drain'));
}

/**
 * x 가 늘어나는 꺾은선을 [x0, x1] 로 자른다. 줄기는 모두 왼쪽에서 오른쪽으로 가므로
 * x 로 자르면 앞머리 · 꼬리가 된다. 남는 것이 없으면 빈 배열.
 */
export function clipByX(points: readonly Vec2[], x0: number, x1: number): Vec2[] {
  if (x1 <= x0) return [];
  const at = (a: Vec2, b: Vec2, x: number): Vec2 => {
    const u = (x - a[0]) / (b[0] - a[0]);
    return [x, a[1] + (b[1] - a[1]) * u];
  };
  const out: Vec2[] = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    if (b[0] <= a[0]) continue;
    const lo = Math.max(a[0], x0);
    const hi = Math.min(b[0], x1);
    if (hi <= lo) continue;
    const p = lo === a[0] ? a : at(a, b, lo);
    const q = hi === b[0] ? b : at(a, b, hi);
    const last = out[out.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
    out.push(q);
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ConvergingDivergingLensState }): ConvergingDivergingLensState {
  return params.state;
}
