// ========================================================================
// exoplanet-detection — 순수 물리 · 배치 계산
// ========================================================================
// 행성은 질량 중심 둘레 원 궤도(반지름 a)를 등속으로 돈다. 궤도면 좌표로
//   행성 = a · (cos θ, sin θ),   별 = −w · 행성   (w = 별 궤도 / 행성 궤도)
// 둘째 성분이 **관측자 쪽**이다. 그래서
//   · 옆모습 — 가로 x = 첫째 성분, 세로는 둘째 성분에 기울기(tilt)를 곱해 앞 반이 아래로 온다.
//   · 시선 속도(멀어지는 쪽 +) = −d(별의 관측자 쪽 성분)/dt = w · a · ω · cos θ.
//     θ = 90°(행성이 별 바로 앞)에서 0 이다 — 빛이 파이는 순간 선은 제자리를 지난다.
//   · 밝기 — 행성이 앞(sin θ > 0)일 때 두 원판이 옆모습에서 겹친 면적만큼 준다(고른 밝기의 원판,
//     가장자리 어두워짐은 두지 않는다). 다 들어가면 깊이는 (r / R)².
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { wavelengthToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';
import {
  FLUX_WINDOW,
  MAX_SHIFT_NM,
  ORBIT_RADIUS,
  ORBITS_PER_CYCLE,
  REST_NM,
  SIDE_CENTER,
  STAR_RADIUS,
  STAR_TO_PLANET_RADIUS,
  START_ANGLE_DEG,
  STRIP,
  STRIP_MAX_NM,
  STRIP_MIN_NM,
  VIEW_TILT,
  WOBBLE_RATIO,
} from './schema';
import type { ExoplanetDetectionState } from './state';

export interface ExoplanetDetectionConstants {
  starRadius: number;
  starToPlanetRadius: number;
  orbitRadius: number;
  viewTilt: number;
  wobbleRatio: number;
  orbitsPerCycle: number;
  startAngle: number;
  restNm: number;
  maxShiftNm: number;
  stripMinNm: number;
  stripMaxNm: number;
  fluxWindow: number;
}

export function readConstants(stage: StageDef): ExoplanetDetectionConstants {
  const c = stage.constants ?? {};
  return {
    starRadius: c.starRadius ?? STAR_RADIUS,
    starToPlanetRadius: c.starToPlanetRadius ?? STAR_TO_PLANET_RADIUS,
    orbitRadius: c.orbitRadius ?? ORBIT_RADIUS,
    viewTilt: c.viewTilt ?? VIEW_TILT,
    wobbleRatio: c.wobbleRatio ?? WOBBLE_RATIO,
    orbitsPerCycle: c.orbitsPerCycle ?? ORBITS_PER_CYCLE,
    startAngle: c.startAngle ?? START_ANGLE_DEG,
    restNm: c.restNm ?? REST_NM,
    maxShiftNm: c.maxShiftNm ?? MAX_SHIFT_NM,
    stripMinNm: c.stripMinNm ?? STRIP_MIN_NM,
    stripMaxNm: c.stripMaxNm ?? STRIP_MAX_NM,
    fluxWindow: c.fluxWindow ?? FLUX_WINDOW,
  };
}

/** 행성 반지름(월드). */
export function planetRadius(c: ExoplanetDetectionConstants): number {
  return c.starRadius / c.starToPlanetRadius;
}

/** 주기 안 몫 s(0~1) 에서의 행성 각(rad). 한 주기에 `orbitsPerCycle` 바퀴. */
export function angleAtFraction(s: number, c: ExoplanetDetectionConstants): number {
  return (c.startAngle * Math.PI) / 180 + 2 * Math.PI * c.orbitsPerCycle * s;
}

/** 지금 주기 안 몫(0~1). */
export function cycleFraction(tl: TimelineFrame): number {
  return tl.u / tl.period;
}

/**
 * 행성이 별 바로 앞(θ = 90° + 360°·k)에 오는 주기 안 몫들. 기록의 세로 점선 · 주기 치수선이 선다.
 * 몫이 [0, 1) 안인 것만.
 */
export function transitFractions(c: ExoplanetDetectionConstants): number[] {
  const out: number[] = [];
  const first = (90 - c.startAngle) / 360 / c.orbitsPerCycle;
  const step = 1 / c.orbitsPerCycle;
  for (let s = first - Math.floor(first / step) * step; s < 1; s += step) out.push(s);
  return out;
}

export interface SideView {
  /** 옆모습에서 별 · 행성 자리. */
  star: Vec2;
  planet: Vec2;
  /** 행성이 관측자 쪽(별 앞)에 있는가. */
  planetInFront: boolean;
}

/** 궤도면 한 점(관측자 쪽 성분 depth)을 옆모습으로. 앞(관측자 쪽)이 아래로 온다. */
function project(x: number, depth: number, c: ExoplanetDetectionConstants): Vec2 {
  return [SIDE_CENTER[0] + x, SIDE_CENTER[1] - c.viewTilt * depth];
}

export function sideView(theta: number, c: ExoplanetDetectionConstants): SideView {
  const px = c.orbitRadius * Math.cos(theta);
  const pd = c.orbitRadius * Math.sin(theta);
  return {
    planet: project(px, pd, c),
    star: project(-c.wobbleRatio * px, -c.wobbleRatio * pd, c),
    planetInFront: pd > 0,
  };
}

/** 행성 궤도 타원의 한 반(앞 반 · 뒤 반) 표본. */
export function orbitHalf(front: boolean, samples: number, c: ExoplanetDetectionConstants): Vec2[] {
  const pts: Vec2[] = [];
  const a0 = front ? 0 : Math.PI;
  for (let i = 0; i <= samples; i++) {
    const a = a0 + (Math.PI * i) / samples;
    pts.push(project(c.orbitRadius * Math.cos(a), c.orbitRadius * Math.sin(a), c));
  }
  return pts;
}

/** 반지름 R · r 인 두 원판이 중심 거리 d 로 겹친 면적. */
function overlapArea(R: number, r: number, d: number): number {
  if (d >= R + r) return 0;
  if (d <= R - r) return Math.PI * r * r;
  const a = Math.acos((d * d + R * R - r * r) / (2 * d * R));
  const b = Math.acos((d * d + r * r - R * R) / (2 * d * r));
  return R * R * a + r * r * b - 0.5 * Math.sqrt((-d + R + r) * (d + R - r) * (d - R + r) * (d + R + r));
}

/** 별빛 밝기(가려지지 않았을 때 1). */
export function fluxAt(theta: number, c: ExoplanetDetectionConstants): number {
  const v = sideView(theta, c);
  if (!v.planetInFront) return 1;
  const d = Math.hypot(v.planet[0] - v.star[0], v.planet[1] - v.star[1]);
  return 1 - overlapArea(c.starRadius, planetRadius(c), d) / (Math.PI * c.starRadius * c.starRadius);
}

/** 시선 속도의 몫(−1 ~ 1). 멀어지는 쪽이 + — 선이 붉은 쪽으로 밀린다. */
export function recessionAt(theta: number): number {
  return Math.cos(theta);
}

// ------------------------------------------------------------------------
// 기록 · 스펙트럼 띠의 배치
// ------------------------------------------------------------------------

/** 주기 안 몫 → 기록의 가로 자리. */
export function plotX(s: number, x0: number, x1: number): number {
  return x0 + (x1 - x0) * s;
}

/** 파장 → 스펙트럼 띠의 가로 자리. */
export function stripX(nm: number, c: ExoplanetDetectionConstants): number {
  return STRIP.x0 + ((nm - c.stripMinNm) / (c.stripMaxNm - c.stripMinNm)) * (STRIP.x1 - STRIP.x0);
}

/** 지금 흡수선의 파장(nm). */
export function lineNm(theta: number, c: ExoplanetDetectionConstants): number {
  return c.restNm + c.maxShiftNm * recessionAt(theta);
}

/** 스펙트럼 띠의 칸마다 파장의 색(선형광 세 성분, 칸 순서대로 이어 붙인 것). */
export function stripColors(cols: number, c: ExoplanetDetectionConstants): number[] {
  const out: number[] = [];
  for (let i = 0; i < cols; i++) {
    const nm = c.stripMinNm + ((i + 0.5) / cols) * (c.stripMaxNm - c.stripMinNm);
    const rgb: LinearRgb = wavelengthToLinearRgb(nm);
    out.push(rgb[0], rgb[1], rgb[2]);
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ExoplanetDetectionState }): ExoplanetDetectionState {
  return params.state;
}
