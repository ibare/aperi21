// ========================================================================
// spherical-aberration — 순수 물리
// ========================================================================
// 두꺼운 양볼록 렌즈의 두 구면에서 줄기를 plugin-optics `refract` 로 한 면씩 꺾는다.
// `traceRay` 의 얇은 렌즈는 근축 근사라 모든 평행 줄기를 한 초점으로 보낸다 — 이 조각의
// 주장(바깥 줄기가 다른 곳에 모인다)이 사라진다. 그래서 면과 만나는 점 · 법선 · 굴절을
// 여기서 직접 계산한다.
//
// 나머지는 스테이지 상수 읽기와, 시간표 진행도를 줄기 앞머리 · 꼬리 · 조리개 자리 · 짙기로
// 옮기는 것뿐이다. 단계 경계를 코드 상수로 가르지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { refract } from '@aperi21/plugin-optics';
import {
  LENS_THICKNESS,
  RAY_END_X,
  RAY_PAIRS,
  RAY_SPACING,
  RAY_START_X,
  REFRACTIVE_INDEX,
  STOP_HALF,
  STOP_OPEN_EDGE,
  SURFACE_RADIUS,
} from './schema';
import type { SphericalAberrationState } from './state';

export interface SphericalAberrationConstants {
  /** 두 면의 곡률 반지름(월드). */
  surfaceRadius: number;
  /** 렌즈 가운데 두께(월드). */
  thickness: number;
  /** 렌즈 유리의 굴절률. */
  refractiveIndex: number;
  /** 축 한쪽의 줄기 수. */
  rayPairs: number;
  /** 이웃 줄기 높이 사이 간격(월드). */
  raySpacing: number;
  /** 조리개를 닫았을 때 구멍의 반높이(월드). */
  stopHalf: number;
}

export function readConstants(stage: StageDef): SphericalAberrationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    surfaceRadius: c.surfaceRadius ?? SURFACE_RADIUS,
    thickness: c.thickness ?? LENS_THICKNESS,
    refractiveIndex: c.refractiveIndex ?? REFRACTIVE_INDEX,
    rayPairs: c.rayPairs ?? RAY_PAIRS,
    raySpacing: c.raySpacing ?? RAY_SPACING,
    stopHalf: c.stopHalf ?? STOP_HALF,
  };
}

/** 줄기 높이(광축에서 잰 월드 거리, 양수). 안쪽부터 간격만큼씩 올라간다. 축 아래는 부호만 바꾼다. */
export function rayHeights(c: SphericalAberrationConstants): number[] {
  const n = Math.max(1, Math.round(c.rayPairs));
  return Array.from({ length: n }, (_, i) => (i + 1) * c.raySpacing);
}

/** 앞면 곡률 중심의 x. 앞면 꼭짓점이 −두께/2 에 있다. */
function frontCenterX(c: SphericalAberrationConstants): number {
  return -c.thickness / 2 + c.surfaceRadius;
}

/** 뒷면 곡률 중심의 x. 뒷면 꼭짓점이 +두께/2 에 있다. */
function backCenterX(c: SphericalAberrationConstants): number {
  return c.thickness / 2 - c.surfaceRadius;
}

/** 높이 y 에서 앞면 · 뒷면의 x. 렌즈 윤곽과 줄기 추적이 같은 곡면을 쓴다. */
export function frontSurfaceX(c: SphericalAberrationConstants, y: number): number {
  return frontCenterX(c) - Math.sqrt(c.surfaceRadius ** 2 - y * y);
}
export function backSurfaceX(c: SphericalAberrationConstants, y: number): number {
  return backCenterX(c) + Math.sqrt(c.surfaceRadius ** 2 - y * y);
}

/**
 * 한 면에서 꺾는다. `normal` 은 입사 쪽을 향한 단위 법선, `eta` = n1/n2.
 * plugin `refract` 는 전반사 때 말없이 반사 벡터를 돌려주므로, 굴절각의 사인이 1 을
 * 넘는지 여기서 먼저 비교해 넘으면 null 을 돌려준다.
 */
function bend(dir: Vec2, normal: Vec2, eta: number): Vec2 | null {
  const cosI = -(dir[0] * normal[0] + dir[1] * normal[1]);
  if (eta * eta * (1 - cosI * cosI) > 1) return null;
  return refract(dir, normal, eta);
}

export interface TracedRay {
  /** 출발점 → 앞면 → 뒷면 → 끝(x = `RAY_END_X`). 면에서 전반사되면 거기서 끝난다. */
  points: Vec2[];
  /** 렌즈를 나온 줄기가 광축(y = 0)을 건너는 x. 건너지 않으면 null. */
  crossX: number | null;
}

/**
 * 높이 `h` 로 왼쪽에서 나란히 들어온 줄기를 두 구면에서 꺾어 추적한다.
 * 앞면: 공기 → 유리(eta = 1/n), 뒷면: 유리 → 공기(eta = n).
 */
export function traceThickLens(c: SphericalAberrationConstants, h: number): TracedRay {
  const R = c.surfaceRadius;
  const start: Vec2 = [RAY_START_X, h];

  // 앞면 — 수평 줄기가 만나는 점은 그 높이의 곡면 x 다. 법선은 곡률 중심에서 바깥(왼쪽)으로.
  const cf = frontCenterX(c);
  const p1: Vec2 = [frontSurfaceX(c, h), h];
  const n1: Vec2 = [(p1[0] - cf) / R, p1[1] / R];
  const d1 = bend([1, 0], n1, 1 / c.refractiveIndex);
  if (!d1) return { points: [start, p1], crossX: null };

  // 뒷면 — 유리 안 줄기와 뒷면 원의 오른쪽 교점. 법선은 입사 쪽(유리 안, 곡률 중심 쪽)으로.
  const cb = backCenterX(c);
  const fx = p1[0] - cb;
  const fy = p1[1];
  const b = fx * d1[0] + fy * d1[1];
  const disc = b * b - (fx * fx + fy * fy - R * R);
  if (disc < 0) return { points: [start, p1], crossX: null };
  const s = -b + Math.sqrt(disc);
  const p2: Vec2 = [p1[0] + s * d1[0], p1[1] + s * d1[1]];
  const n2: Vec2 = [-(p2[0] - cb) / R, -p2[1] / R];
  const d2 = bend(d1, n2, c.refractiveIndex);
  if (!d2) return { points: [start, p1, p2], crossX: null };

  // 끝 — 나온 방향으로 줄 끝 x 까지.
  const end: Vec2 = d2[0] > 0 ? [RAY_END_X, p2[1] + ((RAY_END_X - p2[0]) * d2[1]) / d2[0]] : p2;
  const crossX = Math.abs(d2[1]) > 1e-9 && p2[1] * d2[1] < 0 ? p2[0] - (p2[1] * d2[0]) / d2[1] : null;
  return { points: [start, p1, p2, end], crossX };
}

/**
 * 줄기 앞머리의 x. `enter` 동안 출발점에서 렌즈 가운데(x = 0)까지, `pass` 동안 줄 끝까지
 * 간다. 두 단계 진행도의 합이라 분기가 없다.
 */
export function frontX(tl: TimelineFrame): number {
  return RAY_START_X + (0 - RAY_START_X) * tl.at('enter') + RAY_END_X * tl.at('pass');
}

/** 줄기 꼬리의 x. `drain` 동안 출발점에서 끝까지 따라가 빛이 오른쪽으로 빠져나간다. */
export function tailX(tl: TimelineFrame): number {
  return RAY_START_X + (RAY_END_X - RAY_START_X) * tl.at('drain');
}

/** 조리개 판 안쪽 끝의 높이. `stop-in` 동안 열린 자리에서 닫힌 구멍까지 내려온다. */
export function stopEdge(tl: TimelineFrame, c: SphericalAberrationConstants): number {
  return STOP_OPEN_EDGE + (c.stopHalf - STOP_OPEN_EDGE) * tl.at('stop-in');
}

/** 조리개 판의 짙기 — `stop-in` 에서 나타나 `drain` 에서 옅어진다. */
export function stopOpacity(tl: TimelineFrame): number {
  return tl.at('stop-in') * (1 - tl.at('drain'));
}

/** 교차점 · 치수선의 짙기 — `mark` 에서 나타나 `drain` 에서 옅어진다. */
export function markOpacity(tl: TimelineFrame): number {
  return tl.at('mark') * (1 - tl.at('drain'));
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
export function step(params: { state: SphericalAberrationState }): SphericalAberrationState {
  return params.state;
}
