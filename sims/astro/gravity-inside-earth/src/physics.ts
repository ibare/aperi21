// ========================================================================
// gravity-inside-earth — 순수 물리 · 배치
// ========================================================================
// 밀도가 고른 구(반지름 R, 지표 중력 g₀)를 둔다.
//
// 밖(r ≥ R): 지구 전체가 중심에 모인 것처럼 당긴다 — g = g₀ (R / r)².
// 안(r < R): 껍질 정리로 내 바깥쪽 껍질들의 당김은 합이 0 이다. 남는 것은 반지름 r 인
//   안쪽 공뿐이고, 그 질량은 (r / R)³ 로 줄고 거리는 r 이라 g = g₀ (r / R)³ / (r / R)² =
//   g₀ r / R — **r 에 비례해 곧게 줄다가 중심에서 0** 이다.
//
// 모든 것이 시각의 함수다 — 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ARROW_AT_SURFACE,
  AXIS_R,
  CURVE_SAMPLES,
  EARTH_RADIUS,
  EARTH_RADIUS_KM,
  GRAPH_HEIGHT,
  MASS_RADIUS,
  START_R,
  SURFACE_G,
} from './schema';
import type { GravityInsideEarthState } from './state';

export interface GravityInsideEarthConstants {
  /** 지표 중력(m/s²) · 지구 반지름(km) — 이름표에 선언값 그대로 뜬다. */
  surfaceG: number;
  earthRadiusKm: number;
  /** 지구 반지름(월드). */
  earthRadius: number;
  /** 그래프에서 지표 중력의 높이(월드). */
  graphHeight: number;
  /** 지표에서 중력 화살표 길이(월드). */
  arrowAtSurface: number;
  /** 출발 거리 · 가로축 끝(월드). */
  startR: number;
  axisR: number;
  /** 시험 질량 반지름(월드). */
  massRadius: number;
}

export function readConstants(stage: StageDef): GravityInsideEarthConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const earthRadius = c.earthRadius ?? EARTH_RADIUS;
  return {
    surfaceG: c.surfaceG ?? SURFACE_G,
    earthRadiusKm: c.earthRadiusKm ?? EARTH_RADIUS_KM,
    earthRadius,
    graphHeight: c.graphHeight ?? GRAPH_HEIGHT,
    arrowAtSurface: c.arrowAtSurface ?? ARROW_AT_SURFACE,
    startR: (c.startR ?? START_R) * earthRadius,
    axisR: (c.axisR ?? AXIS_R) * earthRadius,
    massRadius: c.massRadius ?? MASS_RADIUS,
  };
}

/**
 * 지표 중력에 대한 비 g / g₀. 안은 r / R(곧은 선), 밖은 (R / r)².
 * 안의 식은 「안쪽 공의 질량 (r/R)³ ÷ 거리 (r/R)²」 이다.
 */
export function gravityRatio(r: number, c: GravityInsideEarthConstants): number {
  const R = c.earthRadius;
  if (r <= 0) return 0;
  if (r < R) {
    const s = r / R;
    return (s * s * s) / (s * s);
  }
  return (R / r) * (R / r);
}

/**
 * 시험 질량의 지금 거리(월드). 단계 진행도(`at`)는 앞 단계에서 0, 뒤 단계에서 1 이므로
 * 구간을 차례로 섞으면 단계 분기 없이 한 줄로 이어진다.
 */
export function massR(tl: TimelineFrame, c: GravityInsideEarthConstants): number {
  let r = c.startR + (c.earthRadius - c.startR) * tl.at('approach');
  r = r + (0 - r) * tl.at('descend');
  return r;
}

/** 시험 질량 · 그린 곡선이 보이는 정도 0~1 — 첫 단계에서 나타나고, 마지막 단계에서 사라진다. */
export function massOpacity(tl: TimelineFrame): number {
  return tl.at('appear') * (1 - tl.at('fade'));
}

/** 「g = 0」 표지가 중심 단계 앞머리에서 떠오르는 빠르기 — 단계의 1/4 이 지나면 다 떠 있다. */
const ZERO_FADE_IN_RATE = 4;

/** 중심에 닿았음을 알리는 표지의 정도 0~1 — 중심 단계에서 떠오르고 흐려짐과 함께 사라진다. */
export function zeroOpacity(tl: TimelineFrame): number {
  return Math.min(1, tl.at('center') * ZERO_FADE_IN_RATE) * (1 - tl.at('fade'));
}

/** 그래프 위 점 — 가로는 거리 그대로, 세로는 g / g₀ × 그래프 높이. */
export function graphPoint(r: number, c: GravityInsideEarthConstants): Vec2 {
  return [r, gravityRatio(r, c) * c.graphHeight];
}

/**
 * 거리 구간 [from, to] 의 g–r 곡선 표본. 지표(R)가 구간 안이면 꺾임 자리를 반드시 넣는다 —
 * 표본이 꺾임을 비껴가면 꼭짓점이 뭉개진다.
 */
export function curve(from: number, to: number, c: GravityInsideEarthConstants): Vec2[] {
  const pts: Vec2[] = [];
  const n = Math.max(2, Math.ceil((CURVE_SAMPLES * (to - from)) / c.axisR));
  for (let k = 0; k <= n; k++) {
    const r = from + ((to - from) * k) / n;
    pts.push(graphPoint(r, c));
  }
  const R = c.earthRadius;
  if (R > from && R < to) {
    const i = pts.findIndex((p) => p[0] > R);
    pts.splice(i, 0, graphPoint(R, c));
  }
  return pts;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: GravityInsideEarthState }): GravityInsideEarthState {
  return params.state;
}
