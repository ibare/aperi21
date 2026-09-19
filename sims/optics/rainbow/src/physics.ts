// ========================================================================
// rainbow — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 진행도의 함수이고 `step` 은 항등이다.
//
// 물방울 경로는 면마다 계산한다 — 들어가는 면에서 `refract`, 안쪽 벽에서 `reflect`, 나오는 면에서
// 다시 `refract` (plugin-optics `traceRay` 는 물방울을 모른다). 나가는 줄기가 해 쪽으로 되돌아가는
// 방향과 이루는 각 θ = 4r − 2i 는 들어온 높이마다 다르고, 최댓값(데카르트 줄기) 둘레에서 거의 변하지
// 않아 그 각에 줄기가 몰린다. 그 최댓값이 굴절률마다 달라 빨강 42.4° · 보라 40.7° 가 된다.
//
// 굴절률 n(λ) 은 두 정박점(빨강 · 보라)을 x = 1/λ² 에 대해 곧게 잇는다(코시 식 앞 두 항의 꼴).
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { reflect, refract } from '@aperi21/plugin-optics';
import {
  DROP_RADIUS,
  N_RED,
  N_VIOLET,
  NM_RED,
  NM_VIOLET,
  RAY_COUNT,
  RED_DEG,
  SEED,
  SPREAD_GAIN,
  SKY_DISTANCE,
  SKY_DROP_COUNT,
  VIOLET_DEG,
} from './schema';
import type { RainbowState } from './state';

export const DEG = Math.PI / 180;

export interface RainbowConstants {
  nmRed: number;
  nRed: number;
  nmViolet: number;
  nViolet: number;
  redDeg: number;
  violetDeg: number;
  spreadGain: number;
  dropRadius: number;
  rayCount: number;
  skyDropCount: number;
  seed: number;
  skyDistance: number;
}

export function readConstants(stage?: StageDef): RainbowConstants {
  const c = (stage?.constants ?? {}) as Record<string, number | undefined>;
  return {
    nmRed: c.nmRed ?? NM_RED,
    nRed: c.nRed ?? N_RED,
    nmViolet: c.nmViolet ?? NM_VIOLET,
    nViolet: c.nViolet ?? N_VIOLET,
    redDeg: c.redDeg ?? RED_DEG,
    violetDeg: c.violetDeg ?? VIOLET_DEG,
    spreadGain: c.spreadGain ?? SPREAD_GAIN,
    dropRadius: c.dropRadius ?? DROP_RADIUS,
    rayCount: c.rayCount ?? RAY_COUNT,
    skyDropCount: c.skyDropCount ?? SKY_DROP_COUNT,
    seed: c.seed ?? SEED,
    skyDistance: c.skyDistance ?? SKY_DISTANCE,
  };
}

/** 물의 굴절률 n(λ) — 두 정박점을 1/λ² 에 대해 곧게 잇는다. */
export function indexAt(c: RainbowConstants, nm: number): number {
  const xr = 1 / (c.nmRed * c.nmRed);
  const xv = 1 / (c.nmViolet * c.nmViolet);
  const x = 1 / (nm * nm);
  return c.nRed + ((c.nViolet - c.nRed) * (x - xr)) / (xv - xr);
}

/**
 * 화면에 긋는 굴절률 — 빨강 굴절률에서 벗어난 몫만 `spreadGain` 배 키운다. 빨강은 참값 그대로다.
 * 두 판의 모든 경로 · 각이 이 값을 쓴다 (NOTES (b) 과장).
 */
export function shownIndex(c: RainbowConstants, nm: number): number {
  return c.nRed + c.spreadGain * (indexAt(c, nm) - c.nRed);
}

/**
 * 나가는 줄기가 해 쪽으로 되돌아가는 방향과 이루는 각의 최댓값(라디안) — 데카르트 줄기.
 * 들어가는 각 i 가 cos²i = (n² − 1)/3 일 때 θ = 4r − 2i 가 가장 크다.
 */
export function bowAngle(n: number): number {
  const i = Math.acos(Math.sqrt((n * n - 1) / 3));
  const r = Math.asin(Math.sin(i) / n);
  return 4 * r - 2 * i;
}

/** 데카르트 줄기가 들어오는 높이(물방울 중심에서, 월드). */
export function descartesHeight(c: RainbowConstants, n: number): number {
  return c.dropRadius * Math.sqrt(1 - (n * n - 1) / 3);
}

/** 각(라디안)에서 그 각에 몰리는 파장(nm) — 화면 굴절률의 `bowAngle` 이 파장에 대해 줄어드는 것을 거꾸로 푼다. */
export function nmForBowAngle(c: RainbowConstants, angle: number): number {
  let lo = c.nmViolet;
  let hi = c.nmRed;
  for (let k = 0; k < BISECT_STEPS; k++) {
    const mid = (lo + hi) / 2;
    if (bowAngle(shownIndex(c, mid)) < angle) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** 역산의 반복 수 — 파장 범위를 2⁻³⁰ 까지 좁힌다. */
const BISECT_STEPS = 30;

export interface DropPath {
  /** 시작 · 들어간 점 · 되비친 점 · 나온 점. 월드, 물방울 중심이 원점. */
  points: Vec2[];
  /** 나온 점과 나가는 방향. */
  exit: Vec2;
  out: Vec2;
}

const add = (a: Vec2, b: Vec2, k = 1): Vec2 => [a[0] + b[0] * k, a[1] + b[1] * k];
const dot = (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1];
const unit = (a: Vec2): Vec2 => {
  const l = Math.hypot(a[0], a[1]);
  return [a[0] / l, a[1] / l];
};

/**
 * 높이 `b` 로 들어온 +x 방향 햇빛 줄기의 물방울 속 경로. 굴절 → 안쪽 벽 반사 → 굴절.
 * `refract` 의 법선은 입사 쪽을 향한다 — 들어갈 때는 바깥 법선, 나올 때는 안쪽 법선.
 * 나오는 면의 입사각은 들어간 굴절각과 같아 임계각보다 작다(전반사 없음).
 */
export function tracePath(c: RainbowConstants, n: number, b: number, startX: number): DropPath {
  const R = c.dropRadius;
  const d0: Vec2 = [1, 0];
  const p1: Vec2 = [-Math.sqrt(Math.max(0, R * R - b * b)), b];
  const d1 = unit(refract(d0, [p1[0] / R, p1[1] / R], 1 / n));
  const p2 = add(p1, d1, -2 * dot(p1, d1));
  const d2 = unit(reflect(d1, [p2[0] / R, p2[1] / R]));
  const p3 = add(p2, d2, -2 * dot(p2, d2));
  const d3 = unit(refract(d2, [-p3[0] / R, -p3[1] / R], n));
  return { points: [[startX, b], p1, p2, p3], exit: p3, out: d3 };
}

/** 나온 점에서 나가는 방향으로 가서 중심 `center` · 반지름 `radius` 의 원에 닿는 점(바깥쪽 교점). */
export function toCircle(from: Vec2, dir: Vec2, center: Vec2, radius: number): Vec2 {
  const f: Vec2 = [from[0] - center[0], from[1] - center[1]];
  const bq = dot(f, dir);
  const cq = dot(f, f) - radius * radius;
  const t = -bq + Math.sqrt(Math.max(0, bq * bq - cq));
  return add(from, dir, t);
}

/** 줄기가 들어오는 높이들 — 물방울 위쪽 절반을 고르게 나눈다(가운데 · 가장자리 제외). */
export function rayHeights(c: RainbowConstants): number[] {
  const count = Math.max(1, Math.round(c.rayCount));
  const out: number[] = [];
  for (let k = 0; k < count; k++) out.push((c.dropRadius * (k + 0.5)) / count);
  return out;
}

/** 폴리라인을 길이의 `f` 몫까지 자른다. 자라는 경로에 쓴다. */
export function partial(points: readonly Vec2[], f: number): Vec2[] {
  if (f >= 1) return [...points];
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const l = Math.hypot(points[i]![0] - points[i - 1]![0], points[i]![1] - points[i - 1]![1]);
    lens.push(l);
    total += l;
  }
  let left = Math.max(0, f) * total;
  const out: Vec2[] = [points[0]!];
  for (let i = 1; i < points.length; i++) {
    const l = lens[i - 1]!;
    if (left >= l) {
      out.push(points[i]!);
      left -= l;
      continue;
    }
    const k = l > 0 ? left / l : 0;
    const a = points[i - 1]!;
    const b = points[i]!;
    out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
    break;
  }
  return out;
}

/** 시드 결정적 난수(mulberry32). 같은 시드는 언제나 같은 열을 낸다 (S-sim). */
export function seededRandom(seed: number): () => number {
  let a = Math.floor(seed) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 하늘 물방울 자리 — 사각형 안에 시드로 흩뿌린다. */
export function skyDrops(
  c: RainbowConstants,
  box: { minX: number; maxX: number; minY: number; maxY: number },
): Vec2[] {
  const rnd = seededRandom(c.seed);
  const out: Vec2[] = [];
  const count = Math.max(0, Math.round(c.skyDropCount));
  for (let k = 0; k < count; k++) {
    out.push([box.minX + (box.maxX - box.minX) * rnd(), box.minY + (box.maxY - box.minY) * rnd()]);
  }
  return out;
}

export interface Reading {
  /** 햇빛 줄기가 물방울 표면까지 자란 몫 0~1. */
  sunIn: number;
  /** 빨강 · 보라 경로가 자란 몫 0~1(물방울 표면에서부터). */
  redPath: number;
  violetPath: number;
  /** 각 호 · 눈금이 선 몫 0~1. */
  redMark: number;
  violetMark: number;
  /** 하늘 판이 나타난 몫 · 두 짚은 줄기가 눈까지 자란 몫 · 띠가 선 몫. */
  sky: number;
  skyRays: number;
  band: number;
  /** 전체 짙기 0~1 — 주기 끝에 옅어진다. */
  visible: number;
}

/**
 * 시간표 진행도 → 화면에 놓을 값. 같은 시각은 언제나 같은 값이다.
 * 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` 가 그 단계 앞에서 0, 지난 뒤 1 이다.
 */
export function derive(tl: TimelineFrame): Reading {
  return {
    sunIn: tl.at('enter'),
    redPath: tl.at('redPath'),
    violetPath: tl.at('violetPath'),
    redMark: tl.at('redMark'),
    violetMark: tl.at('violetMark'),
    sky: tl.at('sky'),
    skyRays: tl.at('skyRays'),
    band: tl.at('band'),
    visible: 1 - tl.at('fade'),
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: RainbowState }): RainbowState {
  return params.state;
}
