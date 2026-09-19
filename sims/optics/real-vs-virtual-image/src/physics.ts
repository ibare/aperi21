// ========================================================================
// real-vs-virtual-image — 순수 물리
// ========================================================================
// 상의 자리는 여기서 계산하지 않는다 — scene 이 plugin-optics `findImage` 로 얻는다.
// 여기 있는 것은 스테이지 상수 읽기와, 시간표 진행도를 물체 자리 · 줄기 앞머리 · 꼬리 ·
// 짙기로 옮기는 것, 그리고 줄기를 x 로 자르는 배치 계산뿐이다. 단계 경계를 코드 상수로
// 가르지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  FOCAL_LENGTH,
  IMAGE_LIGHT,
  OBJECT_HEIGHT,
  RAY_COUNT,
  RAY_SPACING,
  REAL_OBJECT_DISTANCE,
  SCREEN_X,
  SMEAR_LIGHT,
  VIRTUAL_OBJECT_DISTANCE,
} from './schema';
import type { RealVsVirtualImageState } from './state';

export interface RealVsVirtualImageConstants {
  /** 볼록 렌즈의 초점 거리(월드). */
  focalLength: number;
  /** 물체 높이(월드). */
  objectHeight: number;
  /** 실상 장면 · 허상 장면의 물체 거리(월드). */
  realObjectDistance: number;
  virtualObjectDistance: number;
  /** 스크린의 x(월드). */
  screenX: number;
  /** 물체 끝에서 나오는 줄기 수와 렌즈에 닿는 높이 간격(월드). */
  rayCount: number;
  raySpacing: number;
  /** 스크린에 맺힌 실상 · 번진 빛의 세기(빛 채널 0~1). */
  imageLight: number;
  smearLight: number;
}

export function readConstants(stage: StageDef): RealVsVirtualImageConstants {
  const c = stage.constants ?? {};
  return {
    focalLength: c.focalLength ?? FOCAL_LENGTH,
    objectHeight: c.objectHeight ?? OBJECT_HEIGHT,
    realObjectDistance: c.realObjectDistance ?? REAL_OBJECT_DISTANCE,
    virtualObjectDistance: c.virtualObjectDistance ?? VIRTUAL_OBJECT_DISTANCE,
    screenX: c.screenX ?? SCREEN_X,
    rayCount: c.rayCount ?? RAY_COUNT,
    raySpacing: c.raySpacing ?? RAY_SPACING,
    imageLight: c.imageLight ?? IMAGE_LIGHT,
    smearLight: c.smearLight ?? SMEAR_LIGHT,
  };
}

/** 줄기가 렌즈에 닿는 높이들(월드). 물체 끝 높이를 가운데로 위아래 대칭이다. */
export function lensHitHeights(c: RealVsVirtualImageConstants): number[] {
  const n = Math.max(1, Math.round(c.rayCount));
  return Array.from({ length: n }, (_, i) => c.objectHeight + (i - (n - 1) / 2) * c.raySpacing);
}

/**
 * 물체가 렌즈에서 떨어진 거리(월드). 실상 자리에서 출발해 `move` 동안 초점 안 자리로,
 * `return` 동안 다시 실상 자리로 간다. 두 진행도의 합이라 분기가 없다.
 */
export function objectDistance(tl: TimelineFrame, c: RealVsVirtualImageConstants): number {
  const span = c.virtualObjectDistance - c.realObjectDistance;
  return c.realObjectDistance + span * tl.at('move') - span * tl.at('return');
}

/** 한 장면(실상 · 허상)의 줄기가 지금 보이는 x 구간. 앞머리는 `emit`, 꼬리는 `drain` 이 스크린까지 민다. */
export function rayWindow(
  tl: TimelineFrame,
  scene: 'real' | 'virtual',
  objectX: number,
  screenX: number,
): { from: number; to: number } {
  const emit = tl.at(scene === 'real' ? 'real-emit' : 'virtual-emit');
  const drain = tl.at(scene === 'real' ? 'real-drain' : 'virtual-drain');
  return { from: objectX + (screenX - objectX) * drain, to: objectX + (screenX - objectX) * emit };
}

/** 스크린에 맺힌 실상의 짙기 — `real-form` 에서 나타나 `real-drain` 에서 사라진다. */
export function realImageShade(tl: TimelineFrame): number {
  return tl.at('real-form') * (1 - tl.at('real-drain'));
}

/** 허상 장면에서 스크린에 번진 빛의 짙기 — `smear` 에서 나타나 `virtual-drain` 에서 사라진다. */
export function smearShade(tl: TimelineFrame): number {
  return tl.at('smear') * (1 - tl.at('virtual-drain'));
}

/** 거꾸로 이은 점선이 렌즈에서 허상 끝까지 자란 몫 0~1. */
export function traceBackReach(tl: TimelineFrame): number {
  return tl.at('trace-back');
}

/** 점선의 짙기 — 빛이 빠져나가는 동안 함께 옅어진다. */
export function extensionShade(tl: TimelineFrame): number {
  return 1 - tl.at('virtual-drain');
}

/** 허상 화살표 · 이름표의 짙기 — `virtual-mark` 에서 나타나 `virtual-drain` 에서 사라진다. */
export function virtualImageShade(tl: TimelineFrame): number {
  return tl.at('virtual-mark') * (1 - tl.at('virtual-drain'));
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
export function step(params: { state: RealVsVirtualImageState }): RealVsVirtualImageState {
  return params.state;
}
