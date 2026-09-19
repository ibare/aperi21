// ========================================================================
// specular-diffuse-reflection — 순수 물리
// ========================================================================
// 두 면을 작은 평면 조각(면 조각)의 이음으로 둔다. 매끈한 면은 조각 하나, 거친 면은
// 시드로 높낮이를 뽑은 톱니다. 빛줄기의 되튐은 여기서 정하지 않는다 — 면 조각마다
// plugin-optics `mirror-flat` 을 (그리지 않고 계산용으로만) 세워 `traceRay` 로 쏜다.
// 그래서 「거친 면에서도 줄기마다 반사 법칙을 지킨다」 는 조각이 정해 넣은 것이 아니라
// 추적 결과다.
// ========================================================================

import type { OpticalElement, StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { traceRay } from '@aperi21/plugin-optics';
import {
  BEAM_SPREAD,
  FACET_WIDTH,
  INCIDENCE_DEG,
  JITTER,
  MIN_TOOTH,
  IN_LENGTH,
  OUT_LENGTH,
  PANEL_HALF,
  RAY_COUNT,
  ROUGHNESS,
  SEED,
} from './schema';
import type { SpecularDiffuseReflectionState } from './state';

export interface SpecularDiffuseReflectionConstants {
  /** 한 판의 평행 빛줄기 수. */
  rayCount: number;
  /** 입사각(°, 연직에서). */
  incidenceDeg: number;
  /** 작은 면 높낮이 폭 / 가로 폭. */
  roughness: number;
  /** 작은 면 하나의 가로 폭(월드). */
  facetWidth: number;
  /** 톱니 꼭짓점 높이의 최소 몫. */
  minTooth: number;
  /** 꼭짓점 가로 흔들기 폭(작은 면 폭에 견준 몫). */
  jitter: number;
  /** 거친 면 모양의 시드. */
  seed: number;
}

export function readConstants(stage: StageDef): SpecularDiffuseReflectionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    rayCount: c.rayCount ?? RAY_COUNT,
    incidenceDeg: c.incidenceDeg ?? INCIDENCE_DEG,
    roughness: c.roughness ?? ROUGHNESS,
    facetWidth: c.facetWidth ?? FACET_WIDTH,
    minTooth: c.minTooth ?? MIN_TOOTH,
    jitter: c.jitter ?? JITTER,
    seed: c.seed ?? SEED,
  };
}

/** 시드를 받는 결정적 난수(mulberry32). 같은 시드는 언제나 같은 수열이다 (S-sim). */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 매끈한 면 — 면 조각 하나. 가운데 `cx`, 기준선 y = 0. */
export function smoothSurface(cx: number): Vec2[] {
  return [
    [cx - PANEL_HALF, 0],
    [cx + PANEL_HALF, 0],
  ];
}

/**
 * 확대한 거친 면 — 꼭짓점이 번갈아 오르내리는 톱니. 높이와 (양 끝을 뺀) 꼭짓점의 가로 자리를
 * 시드로 뽑아 작은 면마다 기울기가 다르다. 면 길이를 조각 폭에 가장 가까운 정수로 나누므로
 * 실제 폭은 `facetWidth` 와 조금 다를 수 있다.
 */
export function roughSurface(cx: number, c: SpecularDiffuseReflectionConstants): Vec2[] {
  const count = Math.max(1, Math.round((PANEL_HALF * 2) / c.facetWidth));
  const step = (PANEL_HALF * 2) / count;
  const amp = (c.roughness * step) / 2;
  const rand = seededRandom(c.seed);
  const pts: Vec2[] = [];
  for (let i = 0; i <= count; i++) {
    const sign = i % 2 === 0 ? -1 : 1;
    const h = sign * amp * (c.minTooth + (1 - c.minTooth) * rand());
    const shift = i > 0 && i < count ? (rand() - 0.5) * c.jitter * step : 0;
    pts.push([cx - PANEL_HALF + i * step + shift, h]);
  }
  return pts;
}

/** 면 조각의 윗쪽(빛이 오는 쪽) 단위 법선. 꼭짓점이 왼쪽에서 오른쪽으로 놓여 있다. */
function facetNormal(a: Vec2, b: Vec2): Vec2 {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [-(b[1] - a[1]) / L, (b[0] - a[0]) / L];
}

/** 면 조각마다 계산용 평면거울. 화면에 선언하지 않는다 — 면은 scene 이 region · trajectory 로 긋는다. */
function facetMirrors(surface: readonly Vec2[]): OpticalElement[] {
  const out: OpticalElement[] = [];
  for (let i = 0; i + 1 < surface.length; i++) {
    const a = surface[i]!;
    const b = surface[i + 1]!;
    const n = facetNormal(a, b);
    out.push({
      type: 'opticalElement',
      subtype: 'mirror-flat',
      pos: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
      orientation: Math.atan2(n[1], n[0]),
      size: Math.hypot(b[0] - a[0], b[1] - a[1]),
    });
  }
  return out;
}

/** 한 빛줄기의 경로와 첫 닿은 자리의 법선. */
export interface BeamPath {
  /** 출발점 → 첫 닿은 자리 → (되튄 뒤 부딪힌 자리들) → 끝. */
  points: Vec2[];
  /** 첫 닿은 자리의 면 법선(단위, 위쪽). */
  normal: Vec2;
}

/**
 * 한 판의 평행 빛줄기들을 면에 쏜다. 줄기는 기준선 위 `BEAM_SPREAD` 폭에 고르게 겨눠
 * 왼쪽 위에서 입사각으로 내려온다. 면 조각 사이를 한 번 더 부딪혀도 따라간다.
 */
export function beamPaths(surface: readonly Vec2[], cx: number, c: SpecularDiffuseReflectionConstants): BeamPath[] {
  const theta = (c.incidenceDeg * Math.PI) / 180;
  const dir: Vec2 = [Math.sin(theta), -Math.cos(theta)];
  const mirrors = facetMirrors(surface);
  const n = Math.max(1, Math.round(c.rayCount));
  const paths: BeamPath[] = [];
  for (let i = 0; i < n; i++) {
    const tx = n === 1 ? cx : cx + (i / (n - 1) - 0.5) * BEAM_SPREAD;
    const start: Vec2 = [tx - dir[0] * IN_LENGTH, -dir[1] * IN_LENGTH];
    const traced = traceRay(start, dir, mirrors, { maxBounces: 4, maxLength: IN_LENGTH + OUT_LENGTH });
    const points = traced.segments;
    const hit = points[1] ?? start;
    paths.push({ points, normal: normalAt(surface, hit[0]) });
  }
  return paths;
}

/** 가로 자리 `x` 가 놓인 면 조각의 법선. */
function normalAt(surface: readonly Vec2[], x: number): Vec2 {
  for (let i = 0; i + 1 < surface.length; i++) {
    const a = surface[i]!;
    const b = surface[i + 1]!;
    if (x >= a[0] && x <= b[0]) return facetNormal(a, b);
  }
  return [0, 1];
}

const dist = (a: Vec2, b: Vec2): number => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** 경로 전체 길이. */
export function pathLength(points: readonly Vec2[]): number {
  let L = 0;
  for (let i = 1; i < points.length; i++) L += dist(points[i - 1]!, points[i]!);
  return L;
}

/**
 * 빛의 앞머리가 경로를 따라 간 거리. 단계 경계를 코드로 가르지 않는다 — `enter` 진행도가
 * 첫 닿은 자리까지를, `bounce` 진행도가 그 뒤를 채운다. 그래서 줄기마다 면에 닿는 순간이
 * `enter` 끝으로 같다.
 */
export function rayReach(tl: TimelineFrame, points: readonly Vec2[]): number {
  if (points.length < 2) return 0;
  const inLen = dist(points[0]!, points[1]!);
  return tl.at('enter') * inLen + tl.at('bounce') * (pathLength(points) - inLen);
}

/** 경로를 앞에서부터 `s` 만큼 자른 점 목록. `s` 가 0 이하면 빈 목록. */
export function prefix(points: readonly Vec2[], s: number): Vec2[] {
  if (s <= 0 || points.length < 2) return [];
  const out: Vec2[] = [points[0]!];
  let left = s;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const d = dist(a, b);
    if (left >= d) {
      out.push(b);
      left -= d;
      continue;
    }
    const k = d > 0 ? left / d : 0;
    out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
    return out;
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: SpecularDiffuseReflectionState }): SpecularDiffuseReflectionState {
  return params.state;
}
