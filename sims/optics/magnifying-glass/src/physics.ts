// ========================================================================
// magnifying-glass — 순수 물리
// ========================================================================
// 상의 자리는 여기서 계산하지 않는다 — scene 이 plugin-optics `findImage` 로 얻는다.
// 여기 있는 것은 스테이지 상수 읽기와, 시간표 진행도를 개미 자리 · 줄기 앞머리 · 꼬리 ·
// 짙기로 옮기는 것, 그리고 줄기를 x 로 자르는 배치 계산뿐이다. 단계 경계를 코드 상수로
// 가르지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ANT_HEIGHT,
  EYE_GAP,
  FAR_DISTANCE,
  FAR_MAG,
  FOCAL_LENGTH,
  NAKED_DISTANCE,
  NEAR_DISTANCE,
  NEAR_MAG,
  PUPIL_HALF,
  RAY_COUNT,
} from './schema';
import type { MagnifyingGlassState } from './state';

export interface MagnifyingGlassConstants {
  /** 볼록 렌즈의 초점 거리(cm). */
  focalLength: number;
  /** 개미의 키(cm). */
  antHeight: number;
  /** 두 멈춤의 개미 거리(cm). */
  nearDistance: number;
  farDistance: number;
  /** 두 멈춤의 배율 정박값 — 글자로만 쓴다. */
  nearMag: number;
  farMag: number;
  /** 맨눈 거리(cm). */
  nakedDistance: number;
  /** 렌즈 → 동공(cm), 동공 반높이(cm), 줄기 수. */
  eyeGap: number;
  pupilHalf: number;
  rayCount: number;
}

export function readConstants(stage: StageDef): MagnifyingGlassConstants {
  const c = stage.constants ?? {};
  return {
    focalLength: c.focalLength ?? FOCAL_LENGTH,
    antHeight: c.antHeight ?? ANT_HEIGHT,
    nearDistance: c.nearDistance ?? NEAR_DISTANCE,
    farDistance: c.farDistance ?? FAR_DISTANCE,
    nearMag: c.nearMag ?? NEAR_MAG,
    farMag: c.farMag ?? FAR_MAG,
    nakedDistance: c.nakedDistance ?? NAKED_DISTANCE,
    eyeGap: c.eyeGap ?? EYE_GAP,
    pupilHalf: c.pupilHalf ?? PUPIL_HALF,
    rayCount: c.rayCount ?? RAY_COUNT,
  };
}

/** 줄기가 들어가는 동공 위의 높이들(광축 기준, cm). 위에서 아래로 고르게. */
export function pupilHeights(c: MagnifyingGlassConstants): number[] {
  const n = Math.max(1, Math.round(c.rayCount));
  if (n === 1) return [0];
  return Array.from({ length: n }, (_, i) => c.pupilHalf - (2 * c.pupilHalf * i) / (n - 1));
}

/**
 * 개미가 렌즈에서 떨어진 거리(cm). 가까운 자리에서 출발해 `move` 동안 먼 자리(F 쪽)로,
 * `return` 동안 다시 가까운 자리로 간다. 두 진행도의 합이라 분기가 없다.
 */
export function antDistance(tl: TimelineFrame, c: MagnifyingGlassConstants): number {
  const span = c.farDistance - c.nearDistance;
  return c.nearDistance + span * tl.at('move') - span * tl.at('return');
}

/** 한 멈춤의 줄기가 지금 보이는 x 구간. 앞머리는 `emit-*`, 꼬리는 `clear-*` 가 동공까지 민다. */
export function rayWindow(
  tl: TimelineFrame,
  spot: 'near' | 'far',
  antX: number,
  pupilX: number,
): { from: number; to: number } {
  const emit = tl.at(`emit-${spot}`);
  const clear = tl.at(`clear-${spot}`);
  return { from: antX + (pupilX - antX) * clear, to: antX + (pupilX - antX) * emit };
}

/** 거꾸로 이은 점선이 렌즈에서 상 머리까지 자란 몫 0~1. */
export function traceReach(tl: TimelineFrame, spot: 'near' | 'far'): number {
  return tl.at(`trace-${spot}`);
}

/** 점선의 짙기 — 걷히는 동안 옅어진다. */
export function traceShade(tl: TimelineFrame, spot: 'near' | 'far'): number {
  return 1 - tl.at(`clear-${spot}`);
}

/** 허상 · 배율 글자 · 위 줄 시야각의 짙기 — `mark-*` 에서 나타나 `clear-*` 에서 사라진다. */
export function imageShade(tl: TimelineFrame, spot: 'near' | 'far'): number {
  return tl.at(`mark-${spot}`) * (1 - tl.at(`clear-${spot}`));
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
export function step(params: { state: MagnifyingGlassState }): MagnifyingGlassState {
  return params.state;
}
