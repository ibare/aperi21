// ========================================================================
// amperes-law — 순수 물리 · 배치
// ========================================================================
// 곧은 전선이 원점에서 화면 밖으로(⊙) 전류 I 를 흘린다. 자리 r 의 장은
//   B = μ₀I / (2π|r|²) · (−y, x)        (μ₀ = 1, 반시계로 돈다)
// 이다. 이 장의 길 방향 몫을 짧은 토막에서 더하면 B·dl = (μ₀I / 2π) dφ — φ 는 전선에서 본
// 걷는 점의 방위각이다. 그래서 걸어온 길의 합은 **방위각이 돈 양**에 비례하고, 한 바퀴를
// 돌면 전선을 감쌌을 때 2π(합 μ₀I), 감싸지 않았을 때 0 이 된다. 길의 모양은 들어가지
// 않는다 — 이것이 이 조각의 주장이고, 합을 수치 적분이 아니라 이 식으로 세므로 화면의
// 막대가 기준선에 정확히 닿는다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  CIRCLE_RADIUS,
  CURRENT,
  FIELD_TO_LENGTH,
  OUTSIDE_RX,
  OUTSIDE_RY,
  OUTSIDE_X,
  OUTSIDE_Y,
  SEGMENTS,
  SQUASH_DENT,
  SQUASH_LOBES,
  SQUASH_RX,
  SQUASH_RY,
  SQUASH_X,
  SQUASH_Y,
  START_ANGLE_DEG,
  SUM_TO_LENGTH,
} from './schema';
import type { AmperesLawState } from './state';

/** 고리 하나를 표본하는 점 수. 이 정도면 굽이진 고리도 매끈하고, 토막 경계가 표본 사이에 떨어져도 오차가 보이지 않는다. */
const LOOP_SAMPLES = 480;

const DEG = Math.PI / 180;

/** 고리 모양 — 자리 = 중심 + (rx cos s, ry sin s)·(1 + dent · cos(lobes · s)). */
export interface LoopShape {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  dent: number;
  lobes: number;
}

export interface AmperesLawConstants {
  current: number;
  fieldToLength: number;
  sumToLength: number;
  /** 토막 수(정수로 내린다, 최소 1). */
  segments: number;
  /** 걷기를 시작하는 매개 각(라디안). */
  startAngle: number;
  circle: LoopShape;
  squash: LoopShape;
  outside: LoopShape;
}

export function readConstants(stage: StageDef): AmperesLawConstants {
  const c = stage.constants ?? {};
  const r = c.circleRadius ?? CIRCLE_RADIUS;
  return {
    current: c.current ?? CURRENT,
    fieldToLength: c.fieldToLength ?? FIELD_TO_LENGTH,
    sumToLength: c.sumToLength ?? SUM_TO_LENGTH,
    segments: Math.max(1, Math.floor(c.segments ?? SEGMENTS)),
    startAngle: (c.startAngleDeg ?? START_ANGLE_DEG) * DEG,
    circle: { cx: 0, cy: 0, rx: r, ry: r, dent: 0, lobes: 0 },
    squash: {
      cx: c.squashX ?? SQUASH_X,
      cy: c.squashY ?? SQUASH_Y,
      rx: c.squashRx ?? SQUASH_RX,
      ry: c.squashRy ?? SQUASH_RY,
      dent: c.squashDent ?? SQUASH_DENT,
      lobes: c.squashLobes ?? SQUASH_LOBES,
    },
    outside: {
      cx: c.outsideX ?? OUTSIDE_X,
      cy: c.outsideY ?? OUTSIDE_Y,
      rx: c.outsideRx ?? OUTSIDE_RX,
      ry: c.outsideRy ?? OUTSIDE_RY,
      dent: 0,
      lobes: 0,
    },
  };
}

/** 고리 셋의 이름. 시간표 단계 id 가 `walk-<이름>` · `close-<이름>` 이다. */
export const LOOP_IDS = ['circle', 'squash', 'outside'] as const;
export type LoopId = (typeof LOOP_IDS)[number];

export function loopShape(id: LoopId, c: AmperesLawConstants): LoopShape {
  return c[id];
}

/** 표본한 닫힌 길 — 점 · 누적 길이 · 누적 방위각(풀어 놓은 값). 첫 점과 끝 점이 같다. */
export interface SampledPath {
  points: Vec2[];
  /** 첫 점부터의 길이. */
  lengths: number[];
  /** 첫 점부터 방위각이 돈 양(라디안). 합의 원천이다. */
  turned: number[];
  total: number;
}

function wrapPi(a: number): number {
  let d = a % (2 * Math.PI);
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

export function samplePath(shape: LoopShape, c: AmperesLawConstants): SampledPath {
  const points: Vec2[] = [];
  for (let i = 0; i <= LOOP_SAMPLES; i++) {
    const s = c.startAngle + (2 * Math.PI * i) / LOOP_SAMPLES;
    const f = 1 + shape.dent * Math.cos(shape.lobes * s);
    points.push([shape.cx + shape.rx * Math.cos(s) * f, shape.cy + shape.ry * Math.sin(s) * f]);
  }
  const lengths = [0];
  const turned = [0];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    lengths.push(lengths[i - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
    turned.push(turned[i - 1]! + wrapPi(Math.atan2(b[1], b[0]) - Math.atan2(a[1], a[0])));
  }
  return { points, lengths, turned, total: lengths[lengths.length - 1]! };
}

/** 길이 비율 f(0~1) 자리의 점 · 단위 접선 · 방위각이 돈 양. 걷는 빠르기가 고르다. */
export function walkAt(
  path: SampledPath,
  f: number,
): { pos: Vec2; tangent: Vec2; turned: number; index: number } {
  const target = Math.min(1, Math.max(0, f)) * path.total;
  let i = 1;
  while (i < path.lengths.length - 1 && path.lengths[i]! < target) i++;
  const a = path.points[i - 1]!;
  const b = path.points[i]!;
  const l0 = path.lengths[i - 1]!;
  const seg = path.lengths[i]! - l0;
  const u = seg > 0 ? (target - l0) / seg : 0;
  const pos: Vec2 = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  const tangent: Vec2 = seg > 0 ? [(b[0] - a[0]) / seg, (b[1] - a[1]) / seg] : [1, 0];
  const turned =
    path.turned[i - 1]! + wrapPi(Math.atan2(pos[1], pos[0]) - Math.atan2(a[1], a[0]));
  return { pos, tangent, turned, index: i };
}

/** 길의 첫 점부터 f 까지 걸으며 더한 B·dl (μ₀ = 1). */
export function sumAt(path: SampledPath, f: number, c: AmperesLawConstants): number {
  return (c.current / (2 * Math.PI)) * walkAt(path, f).turned;
}

/** 첫 점부터 f 까지 걷는 동안 합이 올랐던 가장 높은 값. 덜어진 몫을 보이는 데 쓴다. */
export function peakSumAt(path: SampledPath, f: number, c: AmperesLawConstants): number {
  const w = walkAt(path, f);
  let peak = w.turned;
  for (let i = 0; i < w.index; i++) peak = Math.max(peak, path.turned[i]!);
  return (c.current / (2 * Math.PI)) * peak;
}

/** 자리 p 의 장 B. 전선이 원점, 전류가 화면 밖으로 흐른다. */
export function fieldAt(p: Vec2, c: AmperesLawConstants): Vec2 {
  const r2 = p[0] * p[0] + p[1] * p[1];
  const k = c.current / (2 * Math.PI * r2);
  return [-p[1] * k, p[0] * k];
}

/** 첫 점부터 f 까지의 점들. 걸어온 길을 굵게 긋는 데 쓴다. */
export function walkedPoints(path: SampledPath, f: number): Vec2[] {
  const w = walkAt(path, f);
  return [...path.points.slice(0, w.index), w.pos];
}

/** 쌓는 상태가 없다 — 모든 것이 시각과 스테이지 상수의 함수다. */
export function step(params: { state: AmperesLawState }): AmperesLawState {
  return params.state;
}
