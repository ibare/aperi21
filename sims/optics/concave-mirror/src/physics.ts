// ========================================================================
// concave-mirror — 순수 물리
// ========================================================================
// plugin-optics `findImage` 는 렌즈 전용(거울이면 null)이고 `traceRay` 의 오목거울은 근축
// 근사라, 상은 여기서 거울 식으로 계산한다. 주광선 두 줄기도 **같은 상 점** 을 향해 긋는다 —
// 상 점과 줄기 교점이 한 계산이다.
//
// 거울은 꼭짓점 (0, 0) 에서 물체 쪽으로 얕게 휜 곡선 x = −a·y² 로 그린다(그림의 휨, schema
// `MIRROR_SAG`). 줄기는 이 곡선 위에서 비친다 — 반사점은 물체 높이 · 상 높이의 곡선 위 점이고,
// 비친 줄기는 그 자리에서 상 점을 향해(허상이면 상 점에서 멀어지게) 간다.
//
// 단계 경계를 코드 상수로 가르지 않는다 — 시간표 진행도(`at`)의 합 · 곱만 쓴다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  DIVERGE_REACH,
  FAR_FACTOR,
  FOCAL_LENGTH,
  MID_FACTOR,
  MIRROR_HALF,
  MIRROR_SAG,
  NEAR_FACTOR,
  OBJECT_HEIGHT,
  RAY_TAIL,
} from './schema';
import type { ConcaveMirrorState } from './state';

export interface ConcaveMirrorConstants {
  /** 오목거울의 초점 거리(월드). */
  focalLength: number;
  /** 물체 높이(월드). */
  objectHeight: number;
  /** 세 멈춤 자리의 물체 거리 — 초점 거리의 배수. */
  farFactor: number;
  midFactor: number;
  nearFactor: number;
}

export function readConstants(stage: StageDef): ConcaveMirrorConstants {
  const c = stage.constants ?? {};
  return {
    focalLength: c.focalLength ?? FOCAL_LENGTH,
    objectHeight: c.objectHeight ?? OBJECT_HEIGHT,
    farFactor: c.farFactor ?? FAR_FACTOR,
    midFactor: c.midFactor ?? MID_FACTOR,
    nearFactor: c.nearFactor ?? NEAR_FACTOR,
  };
}

/** 세 멈춤 자리의 물체 거리(월드). 순서는 시간표의 자리 번호(1 · 2 · 3)와 같다. */
export function stopDistances(c: ConcaveMirrorConstants): [number, number, number] {
  return [c.farFactor * c.focalLength, c.midFactor * c.focalLength, c.nearFactor * c.focalLength];
}

/**
 * 물체가 거울에서 떨어진 거리(월드). 첫 자리에서 출발해 `move-12` 동안 둘째 자리로,
 * `move-23` 동안 셋째 자리로, `return` 동안 다시 첫 자리로 간다. 세 진행도의 합이라 분기가 없다.
 */
export function objectDistance(tl: TimelineFrame, c: ConcaveMirrorConstants): number {
  const [d1, d2, d3] = stopDistances(c);
  return d1 + (d2 - d1) * tl.at('move-12') + (d3 - d2) * tl.at('move-23') + (d1 - d3) * tl.at('return');
}

/** 한 자리의 상. `virtual` 이면 거울 뒤(x > 0)에 바로 서고, 아니면 거울 앞에 거꾸로 선다. */
export interface MirrorImage {
  /** 상 끝(월드). 상의 밑동은 (tip[0], 0) 이다. */
  tip: Vec2;
  virtual: boolean;
}

/**
 * 거울 식 1/f = 1/do + 1/di 로 상을 얻는다. di > 0 이면 거울 앞 실상, di < 0 이면 거울 뒤 허상.
 * 상 높이는 −h·di/do. 물체가 초점 위에 있으면 상이 없다.
 */
export function mirrorImage(objectDist: number, height: number, f: number): MirrorImage {
  if (Math.abs(objectDist - f) < 1e-9) {
    throw new Error('concave-mirror: 물체가 초점 위에 있다 — 스테이지 상수를 확인한다');
  }
  const di = (objectDist * f) / (objectDist - f);
  return { tip: [-di, (-height * di) / objectDist], virtual: di < 0 };
}

/** 그림 곡선의 휨 계수 a — 거울 가장자리(y = ±MIRROR_HALF)에서 x = −MIRROR_SAG. */
const SAG_COEF = MIRROR_SAG / (MIRROR_HALF * MIRROR_HALF);

/** 높이 y 에서 거울 곡선의 x. 꼭짓점이 0 이고 가장자리로 갈수록 물체 쪽(−x)으로 휜다. */
export function mirrorX(y: number): number {
  return -SAG_COEF * y * y;
}

function unit(v: Vec2): Vec2 {
  const L = Math.hypot(v[0], v[1]);
  return [v[0] / L, v[1] / L];
}

/** 주광선 하나 — 실제 줄기 꺾은선과, 허상이면 거울 뒤로 거꾸로 이은 점선의 두 끝. */
export interface PrincipalRay {
  /** 물체 끝 → 거울 위 반사점 → (실상) 상 끝을 지나 조금 더 / (허상) 상에서 멀어지는 쪽으로. */
  path: Vec2[];
  /** 허상일 때 반사점에서 상 끝까지 거꾸로 이은 선. 실상이면 null. */
  extension: [Vec2, Vec2] | null;
}

/**
 * 주광선 둘 — (1) 축에 나란히 들어와 비친 뒤 F 쪽으로, (2) F 를 지나(물체가 F 안쪽이면 F 에서
 * 나온 쪽으로) 들어와 비친 뒤 나란히. 비친 줄기는 둘 다 **거울 식이 준 상 끝** 을 향한다.
 */
export function principalRays(objectDist: number, height: number, image: MirrorImage): PrincipalRay[] {
  const tip: Vec2 = [-objectDist, height];
  // 두 줄기가 거울에 닿는 높이는 물체 높이(나란히 들어온 줄기)와 상 높이(F 를 지나 들어와
  // 나란히 돌아가는 줄기)다 — 근축 작도에서 두 높이는 정확히 이것이다. 반사점은 그 높이의
  // 그림 곡선 위 점으로 둔다. 그래서 비친 둘째 줄기는 정확히 나란하고, 들어오는 둘째 줄기는
  // 그림의 휨만큼만 F 를 비킨다 — 곡선과 반직선의 교점으로 풀었더니 비친 다리가 기울어
  // 보였다(NOTES (b)).
  const hits: Vec2[] = [
    [mirrorX(height), height],
    [mirrorX(image.tip[1]), image.tip[1]],
  ];

  return hits.map((hit) => {
    const toImage: Vec2 = [image.tip[0] - hit[0], image.tip[1] - hit[1]];
    if (!image.virtual) {
      const u = unit(toImage);
      return {
        path: [tip, hit, image.tip, [image.tip[0] + u[0] * RAY_TAIL, image.tip[1] + u[1] * RAY_TAIL]],
        extension: null,
      };
    }
    // 허상 — 비친 줄기는 상 끝에서 멀어지는 쪽으로 벌어지고, 거꾸로 이으면 상 끝에 닿는다.
    const u = unit([-toImage[0], -toImage[1]]);
    return {
      path: [tip, hit, [hit[0] + u[0] * DIVERGE_REACH, hit[1] + u[1] * DIVERGE_REACH]],
      extension: [hit, image.tip],
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

/** 한 자리(1 · 2 · 3)의 연출 진행도 — 줄기 앞머리 · 꼬리, 상 짙기, 점선 길이 · 짙기. */
export interface StopProgress {
  /** 줄기 앞머리가 경로를 따라 간 몫. `rays-k` 진행도. */
  front: number;
  /** 줄기 꼬리가 경로를 따라 간 몫. `clear-k` 진행도 — 빛이 경로 끝으로 빠져나간다. */
  tail: number;
  /** 상 화살표 · 이름표의 짙기. `image-k` 에서 나타나 `clear-k` 에서 사라진다. */
  image: number;
  /** 거꾸로 이은 점선이 반사점에서 상 끝까지 자란 몫. `image-k` 진행도. */
  reach: number;
  /** 점선의 짙기. `clear-k` 동안 옅어진다. */
  extension: number;
}

export function stopProgress(tl: TimelineFrame, k: 1 | 2 | 3): StopProgress {
  const clear = tl.at(`clear-${k}`);
  const shown = tl.at(`image-${k}`);
  return {
    front: tl.at(`rays-${k}`),
    tail: clear,
    image: shown * (1 - clear),
    reach: shown,
    extension: 1 - clear,
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ConcaveMirrorState }): ConcaveMirrorState {
  return params.state;
}
