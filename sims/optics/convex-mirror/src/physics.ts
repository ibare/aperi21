// ========================================================================
// convex-mirror — 순수 물리
// ========================================================================
// plugin-optics `findImage` 는 렌즈 전용(거울이면 null)이고 `traceRay` 의 볼록거울은 근축
// 근사라, 상은 여기서 거울 식으로 계산한다. 주광선 두 줄기도 **같은 상 점** 에서 멀어지게
// 긋는다 — 상 점과 거꾸로 이은 점선의 교점이 한 계산이다.
//
// (A) 거울은 꼭짓점 (0, 0) 에서 물체 반대쪽으로 얕게 휜 곡선 x = a·y² 로 그린다(그림의 휨,
// schema `MIRROR_SAG`). 반사점은 물체 높이 · 상 높이의 곡선 위 점이다.
//
// (B) 시야 견줌의 두 거울은 참 모양이다 — 평면거울은 곧은 선, 볼록거울은 반지름 2f 의 원호.
// 거울 끝에서 눈으로 가는 줄기를 그 자리의 법선으로 거꾸로 비춰, 그 끝으로 들어오는 줄기를 얻는다.
//
// 단계 경계를 코드 상수로 가르지 않는다 — 시간표 진행도(`at`)의 합 · 곱만 쓴다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  CONVEX_PANEL_X,
  DIVERGE_REACH,
  EYE_DISTANCE,
  FAR_FACTOR,
  FOCAL_LENGTH,
  FOV_MIRROR_HALF,
  FOV_MIRROR_Y,
  MIRROR_HALF,
  MIRROR_SAG,
  NEAR_FACTOR,
  OBJECT_HEIGHT,
  FOV_REACH,
  PLANE_PANEL_X,
} from './schema';
import type { ConvexMirrorState } from './state';

export interface ConvexMirrorConstants {
  /** 볼록거울 초점 거리의 크기(월드). */
  focalLength: number;
  /** 물체 높이(월드). */
  objectHeight: number;
  /** 물체가 출발하는 먼 자리 · 멈추는 가까운 자리 — 초점 거리의 배수. */
  farFactor: number;
  nearFactor: number;
  /** 시야 견줌의 두 거울 반폭(월드). */
  fovMirrorHalf: number;
  /** 시야 견줌에서 눈이 거울 꼭짓점에서 떨어진 거리(월드). */
  eyeDistance: number;
}

export function readConstants(stage: StageDef): ConvexMirrorConstants {
  const c = stage.constants ?? {};
  return {
    focalLength: c.focalLength ?? FOCAL_LENGTH,
    objectHeight: c.objectHeight ?? OBJECT_HEIGHT,
    farFactor: c.farFactor ?? FAR_FACTOR,
    nearFactor: c.nearFactor ?? NEAR_FACTOR,
    fovMirrorHalf: c.fovMirrorHalf ?? FOV_MIRROR_HALF,
    eyeDistance: c.eyeDistance ?? EYE_DISTANCE,
  };
}

// ------------------------------------------------------------------------
// (A) 상
// ------------------------------------------------------------------------

/** 물체가 거울에서 떨어진 거리(월드). 먼 자리에서 출발해 `approach` 동안 가까운 자리로 간다. */
export function objectDistance(tl: TimelineFrame, c: ConvexMirrorConstants): number {
  const far = c.farFactor * c.focalLength;
  const near = c.nearFactor * c.focalLength;
  return far + (near - far) * tl.at('approach');
}

/**
 * 거울 식 1/f = 1/do + 1/di 에 볼록거울의 f = −|f| 를 넣는다. di 는 늘 음수(거울 뒤)이고
 * 상 높이 −h·di/do 는 늘 양수(바로 선)이며 h 보다 작다. 상 끝은 (−di, −h·di/do).
 */
export function mirrorImageTip(objectDist: number, height: number, focalLength: number): Vec2 {
  const f = -focalLength;
  const di = (objectDist * f) / (objectDist - f);
  return [-di, (-height * di) / objectDist];
}

/** 그림 곡선의 휨 계수 a — 거울 가장자리(y = ±MIRROR_HALF)에서 x = MIRROR_SAG. */
const SAG_COEF = MIRROR_SAG / (MIRROR_HALF * MIRROR_HALF);

/** 높이 y 에서 거울 곡선의 x. 꼭짓점이 0 이고 가장자리로 갈수록 물체 반대쪽(+x)으로 휜다. */
export function mirrorX(y: number): number {
  return SAG_COEF * y * y;
}

function unit(v: Vec2): Vec2 {
  const L = Math.hypot(v[0], v[1]);
  return [v[0] / L, v[1] / L];
}

/** 주광선 하나 — 실제 줄기 꺾은선과, 거울 뒤로 거꾸로 이은 점선의 두 끝(반사점 → 상 끝). */
export interface PrincipalRay {
  path: Vec2[];
  extension: [Vec2, Vec2];
}

/**
 * 주광선 둘 — (1) 축에 나란히 들어와 비친 뒤 F 에서 나온 듯 벌어진다, (2) 거울 뒤 F 를 향해
 * 들어와 비친 뒤 나란히 돌아간다. 두 줄기가 거울에 닿는 높이는 물체 높이와 상 높이다(근축 작도).
 * 비친 줄기는 둘 다 **거울 식이 준 상 끝에서 멀어지는** 쪽으로 가고, 거꾸로 이으면 상 끝에 닿는다.
 */
export function principalRays(objectDist: number, height: number, imageTip: Vec2): PrincipalRay[] {
  const tip: Vec2 = [-objectDist, height];
  const hits: Vec2[] = [
    [mirrorX(height), height],
    [mirrorX(imageTip[1]), imageTip[1]],
  ];
  return hits.map((hit) => {
    const u = unit([hit[0] - imageTip[0], hit[1] - imageTip[1]]);
    return {
      path: [tip, hit, [hit[0] + u[0] * DIVERGE_REACH, hit[1] + u[1] * DIVERGE_REACH]],
      extension: [hit, imageTip],
    };
  });
}

/** 꺾은선을 경로 길이의 몫 [s0, s1] (0~1) 로 자른다. 남는 것이 없으면 빈 배열. */
export function clipByLength(points: readonly Vec2[], s0: number, s1: number): Vec2[] {
  if (s1 <= s0 || points.length < 2) return [];
  const lens: number[] = [];
  let total = 0;
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    lens.push(L);
    total += L;
  }
  const lo = s0 * total;
  const hi = s1 * total;
  const lerp = (a: Vec2, b: Vec2, u: number): Vec2 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  const out: Vec2[] = [];
  let acc = 0;
  for (let i = 0; i < lens.length; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    const L = lens[i]!;
    const segLo = Math.max(lo, acc);
    const segHi = Math.min(hi, acc + L);
    if (segHi > segLo && L > 0) {
      const p = lerp(a, b, (segLo - acc) / L);
      const q = lerp(a, b, (segHi - acc) / L);
      const last = out[out.length - 1];
      if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
      out.push(q);
    }
    acc += L;
  }
  return out;
}

// ------------------------------------------------------------------------
// (B) 시야
// ------------------------------------------------------------------------

/** 판 하나 — 거울 모양, 눈, 양 끝으로 들어와 눈에 드는 두 줄기, 눈이 거울로 보는 부채꼴. */
export interface FovPanel {
  /** 거울 반사면 — 왼쪽 끝에서 오른쪽 끝까지. */
  mirror: Vec2[];
  /** 거울 뒷면 띠 다각형. */
  back: Vec2[];
  eye: Vec2;
  /** 들어오는 쪽 끝 → 거울 끝 → 눈. 왼쪽 끝 · 오른쪽 끝. */
  rays: [Vec2[], Vec2[]];
  /**
   * 부채꼴 다각형 — 두 줄기의 들어오는 다리와 거울 사이. 먼 변은 두 다리 끝을 잇는 곡선이다
   * (거울 위 출발점과 방향 각을 함께 보간한다).
   */
  fan: Vec2[];
}

/**
 * 한 판. `convex` 면 반지름 2f 의 원호(중심이 거울 위, 아래로 볼록), 아니면 곧은 거울.
 * 거울은 아래(눈)를 향한다. 두 거울은 꼭짓점 높이와 양 끝의 가로 폭이 같다.
 */
export function fovPanel(
  cx: number,
  convex: boolean,
  c: ConvexMirrorConstants,
  samples: number,
  backThickness: number,
): FovPanel {
  const w = c.fovMirrorHalf;
  const y0 = FOV_MIRROR_Y;
  const R = 2 * c.focalLength;
  const center: Vec2 = [cx, y0 + R];
  const surfaceY = (x: number): number => (convex ? center[1] - Math.sqrt(R * R - (x - cx) * (x - cx)) : y0);
  /** 반사면의 법선(눈 쪽을 향한다). */
  const normal = (p: Vec2): Vec2 => (convex ? unit([p[0] - center[0], p[1] - center[1]]) : [0, -1]);

  const mirror: Vec2[] = Array.from({ length: samples + 1 }, (_, i) => {
    const x = cx - w + (2 * w * i) / samples;
    return [x, surfaceY(x)] as Vec2;
  });
  const back: Vec2[] = [...mirror, ...[...mirror].reverse().map(([x, y]) => [x, y + backThickness] as Vec2)];

  const eye: Vec2 = [cx, y0 - c.eyeDistance];
  const ends: [Vec2, Vec2] = [mirror[0]!, mirror[mirror.length - 1]!];
  // 거울 끝 → 눈 방향을 그 자리의 법선으로 거꾸로 비추면 그 끝으로 들어오는 줄기의 방향이다.
  // `from` 은 들어오는 줄기를 거슬러 가는 방향(거울 끝에서 바깥으로).
  const from = ends.map((edge) => {
    const out = unit([eye[0] - edge[0], eye[1] - edge[1]]);
    const n = normal(edge);
    const dot = out[0] * n[0] + out[1] * n[1];
    return [-(out[0] - 2 * dot * n[0]), -(out[1] - 2 * dot * n[1])] as Vec2;
  }) as [Vec2, Vec2];

  const rays = ends.map((edge, i) => {
    const d = from[i]!;
    return [[edge[0] + d[0] * FOV_REACH, edge[1] + d[1] * FOV_REACH], edge, eye] as Vec2[];
  }) as [Vec2[], Vec2[]];

  // 먼 변 — 왼쪽 다리 끝에서 오른쪽 다리 끝까지. 각을 보간하므로 가운데가 아래로 둥글다.
  const aL = Math.atan2(from[0][1], from[0][0]);
  let aR = Math.atan2(from[1][1], from[1][0]);
  if (aR < aL) aR += 2 * Math.PI;
  const far: Vec2[] = Array.from({ length: samples + 1 }, (_, i) => {
    const t = i / samples;
    const a = aL + (aR - aL) * t;
    const ox = ends[0][0] + (ends[1][0] - ends[0][0]) * t;
    const oy = ends[0][1] + (ends[1][1] - ends[0][1]) * t;
    return [ox + Math.cos(a) * FOV_REACH, oy + Math.sin(a) * FOV_REACH] as Vec2;
  });
  const fan: Vec2[] = [...far, ...[...mirror].reverse()];

  return { mirror, back, eye, rays, fan };
}

/** 두 판의 가운데 x — 평면거울 · 볼록거울. */
export const PANEL_XS = { plane: PLANE_PANEL_X, convex: CONVEX_PANEL_X } as const;

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ConvexMirrorState }): ConvexMirrorState {
  return params.state;
}
