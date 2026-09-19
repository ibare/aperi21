// ========================================================================
// myopia-hyperopia — 순수 물리
// ========================================================================
// 안경알 · 수정체를 지난 줄기의 방향은 여기서 계산하지 않는다 — scene 이 plugin-optics
// `traceRay` 로 얇은 렌즈 두 장(안경알 · 수정체)에 쏘아 얻는다. 모이는 점도 추적한 줄기가
// 축과 만나는 자리에서 읽는다.
//
// 여기 있는 것은 스테이지 상수 읽기, 눈알(타원) 모양과 줄기의 교점, 그리고 시간표 진행도를
// 짙기 · 줄기 앞머리 · 꼬리 · 안경 굴절력 몫으로 옮기는 것이다. 단계 경계를 코드 상수로
// 가르지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  CONCAVE_FOCAL,
  CONVEX_FOCAL,
  EYE_FOCAL,
  EYE_FRONT,
  EYE_HALF_HEIGHT,
  GLASSES_GAP,
  HYPEROPIC_RETINA,
  MYOPIC_RETINA,
  NEAR_DISTANCE_CM,
  RAY_COUNT,
  RAY_SPACING,
  RAY_START_X,
  VERGENCE_SCALE,
} from './schema';
import type { MyopiaHyperopiaState } from './state';

/** cm → mm. 단위 환산이라 물리량이 아니다. */
const MM_PER_CM = 10;

export interface MyopiaHyperopiaConstants {
  /** 수정체 초점 거리(mm). */
  eyeFocal: number;
  /** 근시 눈의 수정체–망막 거리(mm). */
  myopicRetina: number;
  /** 원시 눈의 수정체–망막 거리(mm). */
  hyperopicRetina: number;
  /** 안경알이 수정체 앞에 서는 거리(mm). */
  glassesGap: number;
  /** 오목 안경알의 초점 거리 크기(mm). */
  concaveFocal: number;
  /** 볼록 안경알의 초점 거리(mm). */
  convexFocal: number;
  /** 원시 눈이 보는 책까지의 거리(cm). */
  nearDistanceCm: number;
  /** 책 줄기의 벌어짐 과장 배율. */
  vergenceScale: number;
  /** 줄기 수. */
  rayCount: number;
  /** 수정체에 닿는 이웃 줄기 사이 간격(mm). */
  raySpacing: number;
}

export function readConstants(stage: StageDef): MyopiaHyperopiaConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    eyeFocal: c.eyeFocal ?? EYE_FOCAL,
    myopicRetina: c.myopicRetina ?? MYOPIC_RETINA,
    hyperopicRetina: c.hyperopicRetina ?? HYPEROPIC_RETINA,
    glassesGap: c.glassesGap ?? GLASSES_GAP,
    concaveFocal: c.concaveFocal ?? CONCAVE_FOCAL,
    convexFocal: c.convexFocal ?? CONVEX_FOCAL,
    nearDistanceCm: c.nearDistanceCm ?? NEAR_DISTANCE_CM,
    vergenceScale: c.vergenceScale ?? VERGENCE_SCALE,
    rayCount: c.rayCount ?? RAY_COUNT,
    raySpacing: c.raySpacing ?? RAY_SPACING,
  };
}

// ------------------------------------------------------------------------
// 두 눈 — 시간표 단계 id 와 눈마다 다른 것
// ------------------------------------------------------------------------

/** 한 눈의 시간표 단계 id. 선언(`schema.timeline`)의 id 와 같다. */
export interface EyePhases {
  in: string;
  enter: string;
  mark: string;
  wear: string;
  drain: string;
  out: string;
}

export const MYOPIC_PHASES: EyePhases = {
  in: 'm-in',
  enter: 'm-enter',
  mark: 'm-mark',
  wear: 'm-wear',
  drain: 'm-drain',
  out: 'm-out',
};

export const HYPEROPIC_PHASES: EyePhases = {
  in: 'h-in',
  enter: 'h-enter',
  mark: 'h-mark',
  wear: 'h-wear',
  drain: 'h-drain',
  out: 'h-out',
};

/** 줄기들이 (안경이 없을 때) 수정체에 닿는 높이(광축에서 잰 mm). 가운데가 0 이고 위아래로 대칭이다. */
export function rayHeights(c: MyopiaHyperopiaConstants): number[] {
  const n = Math.max(1, Math.round(c.rayCount));
  return Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * c.raySpacing);
}

/**
 * 책 줄기가 나오는 점의 x(mm). 실제 책 거리를 `vergenceScale` 로 줄여 벌어짐을 키운다.
 * 화면 밖(왼쪽) 먼 곳이다.
 */
export function nearSourceX(c: MyopiaHyperopiaConstants): number {
  return -(c.nearDistanceCm * MM_PER_CM) / c.vergenceScale;
}

// ------------------------------------------------------------------------
// 눈알 — 타원. 앞 끝은 수정체 앞 `EYE_FRONT`, 뒤 끝은 망막 거리.
// ------------------------------------------------------------------------

export interface Ellipse {
  center: Vec2;
  /** 가로 반지름(mm). */
  a: number;
  /** 세로 반지름(mm). */
  b: number;
}

/** 망막 거리가 `retina` 인 눈의 눈알. 길이만 다르고 높이는 같다. */
export function eyeball(retina: number): Ellipse {
  return { center: [(retina - EYE_FRONT) / 2, 0], a: (retina + EYE_FRONT) / 2, b: EYE_HALF_HEIGHT };
}

/** 타원 위 매개변수 θ 의 점. */
export function onEllipse(e: Ellipse, theta: number): Vec2 {
  return [e.center[0] + e.a * Math.cos(theta), e.center[1] + e.b * Math.sin(theta)];
}

/** 타원 위 점의 매개변수 θ. */
export function ellipseAngle(e: Ellipse, p: Vec2): number {
  return Math.atan2((p[1] - e.center[1]) / e.b, (p[0] - e.center[0]) / e.a);
}

/**
 * 반직선 `from` + s·`dir`(s > 0)이 타원과 만나는 가장 가까운 앞쪽 점. 안에서 쏘면 나가는 점이다.
 * 만나지 않으면 null.
 */
export function hitEllipse(from: Vec2, dir: Vec2, e: Ellipse): Vec2 | null {
  // 타원을 단위 원으로 늘여 원과의 교점으로 푼다.
  const ox = (from[0] - e.center[0]) / e.a;
  const oy = (from[1] - e.center[1]) / e.b;
  const dx = dir[0] / e.a;
  const dy = dir[1] / e.b;
  const qa = dx * dx + dy * dy;
  const qb = 2 * (ox * dx + oy * dy);
  const qc = ox * ox + oy * oy - 1;
  const disc = qb * qb - 4 * qa * qc;
  if (disc < 0) return null;
  const r = Math.sqrt(disc);
  const s1 = (-qb - r) / (2 * qa);
  const s2 = (-qb + r) / (2 * qa);
  const s = s1 > 1e-9 ? s1 : s2 > 1e-9 ? s2 : null;
  if (s === null) return null;
  return [from[0] + dir[0] * s, from[1] + dir[1] * s];
}

/** `from` → `to` 로 가는 직선이 y = 0(광축)과 만나는 점. 수평이면 null. */
export function meetAxis(from: Vec2, to: Vec2): Vec2 | null {
  const dy = to[1] - from[1];
  if (Math.abs(dy) < 1e-9) return null;
  const u = -from[1] / dy;
  return [from[0] + (to[0] - from[0]) * u, 0];
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

// ------------------------------------------------------------------------
// 시간표 진행도 → 짙기 · 앞머리 · 꼬리 · 안경 몫
// ------------------------------------------------------------------------

/** 눈(눈알 · 수정체 · 망막 · 이름표)의 짙기 — `*-in` 에서 나타나 `*-out` 에서 사라진다. */
export function eyeOpacity(tl: TimelineFrame, p: EyePhases): number {
  return tl.at(p.in) - tl.at(p.out);
}

/**
 * 안경 몫 0~1 — `*-wear` 동안 0 → 1. 안경알의 짙기와 굴절력이 함께 이 몫을 따른다
 * (나타나는 동안 굴절력이 0 에서 선언값까지 오른다).
 */
export function wear(tl: TimelineFrame, p: EyePhases): number {
  return tl.at(p.wear);
}

/** 안경알의 짙기 — `*-wear` 에서 나타나 `*-out` 에서 눈과 함께 사라진다. */
export function glassesOpacity(tl: TimelineFrame, p: EyePhases): number {
  return tl.at(p.wear) - tl.at(p.out);
}

/** 줄기 앞머리 x. `*-enter` 동안 출발점에서 눈알 뒤 끝까지 간다. */
export function frontX(tl: TimelineFrame, p: EyePhases, endX: number): number {
  return RAY_START_X + (endX - RAY_START_X) * tl.at(p.enter);
}

/** 줄기 꼬리 x. `*-drain` 동안 출발점에서 눈알 뒤 끝까지 따라가 빛이 망막으로 빠져든다. */
export function tailX(tl: TimelineFrame, p: EyePhases, endX: number): number {
  return RAY_START_X + (endX - RAY_START_X) * tl.at(p.drain);
}

/** 모이는 점 · 번진 얼룩 · 망막 뒤 점선의 짙기 — `*-mark` 에서 나타나 `*-drain` 에서 옅어진다. */
export function markOpacity(tl: TimelineFrame, p: EyePhases): number {
  return tl.at(p.mark) * (1 - tl.at(p.drain));
}

/** 보는 대상 이름표의 짙기 — 줄기와 함께 들어와 함께 빠진다. */
export function objectLabelOpacity(tl: TimelineFrame, p: EyePhases): number {
  return tl.at(p.enter) * (1 - tl.at(p.drain));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: MyopiaHyperopiaState }): MyopiaHyperopiaState {
  return params.state;
}
