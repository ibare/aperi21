// ========================================================================
// human-eye-accommodation — 순수 물리
// ========================================================================
// 수정체를 지난 줄기의 방향은 여기서 계산하지 않는다 — scene 이 plugin-optics `traceRay`
// 로 얇은 렌즈(수정체)에 쏘아 얻는다. 망막 뒤에 모이는 점도 추적한 줄기가 축과 만나는
// 자리에서 읽는다.
//
// 여기 있는 것은 스테이지 상수 읽기, 조절 진행도를 초점 거리 · 수정체 두께로 옮기는 것,
// 시간표 진행도를 줄기 앞머리 · 꼬리 · 짙기로 옮기는 것, 그리고 줄기와 눈알(원)의 교점이다.
// 단계 경계를 코드 상수로 가르지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  EYE_RADIUS,
  FOCAL_FAR,
  FOCAL_NEAR,
  LENS_THICKNESS_FAR,
  LENS_THICKNESS_NEAR,
  NEAR_DISTANCE_CM,
  RAY_COUNT,
  RAY_SPACING,
  RAY_START_X,
  RETINA_DISTANCE,
  THICKNESS_SCALE,
  VERGENCE_SCALE,
} from './schema';
import type { HumanEyeAccommodationState } from './state';

/** cm → mm. 단위 환산이라 물리량이 아니다. */
const MM_PER_CM = 10;

export interface HumanEyeAccommodationConstants {
  /** 수정체에서 망막까지 거리(mm). */
  retinaDistance: number;
  /** 먼 곳을 볼 때의 초점 거리(mm). */
  focalFar: number;
  /** 가까운 곳을 볼 때의 초점 거리(mm). */
  focalNear: number;
  /** 가까이 보는 책까지의 거리(cm). */
  nearDistanceCm: number;
  /** 먼 곳을 볼 때 수정체 가운데 두께(mm). */
  lensThicknessFar: number;
  /** 가까이 볼 때 수정체 가운데 두께(mm). */
  lensThicknessNear: number;
  /** 가까운 줄기의 벌어짐 · 굴절력 변화 과장 배율. */
  vergenceScale: number;
  /** 수정체 두께 변화 과장 배율. */
  thicknessScale: number;
  /** 줄기 수. */
  rayCount: number;
  /** 수정체에 닿는 이웃 줄기 사이 간격(mm). */
  raySpacing: number;
}

export function readConstants(stage: StageDef): HumanEyeAccommodationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    retinaDistance: c.retinaDistance ?? RETINA_DISTANCE,
    focalFar: c.focalFar ?? FOCAL_FAR,
    focalNear: c.focalNear ?? FOCAL_NEAR,
    nearDistanceCm: c.nearDistanceCm ?? NEAR_DISTANCE_CM,
    lensThicknessFar: c.lensThicknessFar ?? LENS_THICKNESS_FAR,
    lensThicknessNear: c.lensThicknessNear ?? LENS_THICKNESS_NEAR,
    vergenceScale: c.vergenceScale ?? VERGENCE_SCALE,
    thicknessScale: c.thicknessScale ?? THICKNESS_SCALE,
    rayCount: c.rayCount ?? RAY_COUNT,
    raySpacing: c.raySpacing ?? RAY_SPACING,
  };
}

/** 줄기들이 수정체에 닿는 높이(광축에서 잰 mm). 가운데가 0 이고 위아래로 대칭이다. */
export function rayHeights(c: HumanEyeAccommodationConstants): number[] {
  const n = Math.max(1, Math.round(c.rayCount));
  return Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * c.raySpacing);
}

/**
 * 조절 몫 0~1 — `thicken` 동안 0 → 1 로 오르고 `relax` 동안 1 → 0 으로 내린다.
 * 두 단계 진행도의 차라 분기가 없다.
 */
export function accommodation(tl: TimelineFrame): number {
  return tl.at('thicken') - tl.at('relax');
}

/**
 * 지금 수정체의 초점 거리(mm). 굴절력(1/f)을 먼 곳 → 가까운 곳으로 조절 몫만큼 옮기되,
 * 그 변화를 `vergenceScale` 로 키운다 — 가까운 줄기의 벌어짐도 같은 배율로 키우므로
 * 조절이 끝나면 다시 망막 위에 모인다.
 */
export function focalLengthNow(c: HumanEyeAccommodationConstants, a: number): number {
  const pFar = 1 / c.focalFar;
  const pNear = 1 / c.focalNear;
  return 1 / (pFar + (pNear - pFar) * c.vergenceScale * a);
}

/** 지금 그림 속 수정체 가운데 두께(mm). 두께 변화를 `thicknessScale` 로 키운다. */
export function lensThicknessNow(c: HumanEyeAccommodationConstants, a: number): number {
  return c.lensThicknessFar + (c.lensThicknessNear - c.lensThicknessFar) * c.thicknessScale * a;
}

/**
 * 가까운 줄기가 나오는 점의 x(mm). 실제 책 거리를 `vergenceScale` 로 줄여 벌어짐을 키운다.
 * 화면 밖(왼쪽) 먼 곳이다.
 */
export function nearSourceX(c: HumanEyeAccommodationConstants): number {
  return -(c.nearDistanceCm * MM_PER_CM) / c.vergenceScale;
}

/** 눈알 중심(mm). 눈알 뒤 끝이 x = 망막 거리에 닿는다. */
export function eyeCenter(c: HumanEyeAccommodationConstants): Vec2 {
  return [c.retinaDistance - EYE_RADIUS, 0];
}

/** 줄기 앞머리가 가는 끝 x — 망막 뒤 끝(눈알 뒤 끝)이다. */
export function frontEndX(c: HumanEyeAccommodationConstants): number {
  return c.retinaDistance;
}

/** 먼 산 줄기의 앞머리 x. `far-enter` 동안 출발점에서 망막까지 간다. */
export function farFrontX(tl: TimelineFrame, endX: number): number {
  return RAY_START_X + (endX - RAY_START_X) * tl.at('far-enter');
}

/** 먼 산 줄기의 꼬리 x. `far-drain` 동안 출발점에서 망막까지 따라가 빛이 망막으로 빠져든다. */
export function farTailX(tl: TimelineFrame, endX: number): number {
  return RAY_START_X + (endX - RAY_START_X) * tl.at('far-drain');
}

/** 책 줄기의 앞머리 x. */
export function nearFrontX(tl: TimelineFrame, endX: number): number {
  return RAY_START_X + (endX - RAY_START_X) * tl.at('near-enter');
}

/** 책 줄기의 꼬리 x. */
export function nearTailX(tl: TimelineFrame, endX: number): number {
  return RAY_START_X + (endX - RAY_START_X) * tl.at('near-drain');
}

/** 망막 뒤로 이은 점선 · 번진 얼룩의 짙기 — `near-extend` 에서 나타나 `near-drain` 에서 옅어진다. */
export function blurOpacity(tl: TimelineFrame): number {
  return tl.at('near-extend') * (1 - tl.at('near-drain'));
}

/** 먼 산 초점의 짙기. */
export function farFocusOpacity(tl: TimelineFrame): number {
  return tl.at('far-mark') * (1 - tl.at('far-drain'));
}

/** 책 초점(두꺼워진 뒤)의 짙기. */
export function nearFocusOpacity(tl: TimelineFrame): number {
  return tl.at('near-mark') * (1 - tl.at('near-drain'));
}

/**
 * 먼 산 이름표의 짙기 — 주기 처음에 서 있다가 `far-drain` 에서 옅어지고, `relax` 에서
 * 다음 주기를 위해 다시 선다. 주기 경계에서 끊기지 않는다.
 */
export function farLabelOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('far-drain') + tl.at('relax');
}

/** 책 이름표의 짙기. */
export function nearLabelOpacity(tl: TimelineFrame): number {
  return tl.at('near-enter') * (1 - tl.at('near-drain'));
}

/**
 * 반직선 `from` + s·`dir`(s > 0)이 원과 만나는 가장 가까운 앞쪽 점. 안에서 쏘면 나가는 점이다.
 * 만나지 않으면 null.
 */
export function hitCircle(from: Vec2, dir: Vec2, center: Vec2, radius: number): Vec2 | null {
  const ox = from[0] - center[0];
  const oy = from[1] - center[1];
  const a = dir[0] * dir[0] + dir[1] * dir[1];
  const b = 2 * (ox * dir[0] + oy * dir[1]);
  const cc = ox * ox + oy * oy - radius * radius;
  const disc = b * b - 4 * a * cc;
  if (disc < 0) return null;
  const r = Math.sqrt(disc);
  const s1 = (-b - r) / (2 * a);
  const s2 = (-b + r) / (2 * a);
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

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: HumanEyeAccommodationState }): HumanEyeAccommodationState {
  return params.state;
}
