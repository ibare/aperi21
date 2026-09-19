// ========================================================================
// multiple-mirror-images — 순수 물리
// ========================================================================
// 거울 각은 시간표의 `narrowB` · `narrowC` · `openA` 진행도로 세 선언값 사이를 잇는다.
//
// 상의 자리는 **거울 반사를 거듭한 결과**다. 꼭짓점을 지나는 두 직선에 대한 반사를 얼마든지
// 이어 붙이면 꼭짓점 둘레 회전(2θ 씩)과, 회전 뒤 한 번 더 반사한 것만 남는다. 360 을 θ 가
// 나누면 이것들이 360/θ 가지로 닫히고, 그중 하나(아무것도 안 한 것)가 물체 자신이다.
// 그래서 상은 모두 꼭짓점에서 물체까지와 같은 거리의 원 위에 선다.
//
// 화면의 개수 글자는 여기서 세지 않는다 — 스테이지 상수(`countA` …)를 그대로 쓴다.
// 여기서 만든 상의 수와 그 글자가 같다는 관계는 NOTES (c) G143 에 적었다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { ANGLE_A_DEG, ANGLE_B_DEG, ANGLE_C_DEG, COUNT_A, COUNT_B, COUNT_C } from './schema';
import type { MultipleMirrorImagesState } from './state';

export interface MultipleMirrorImagesConstants {
  /** 세 멈춤의 두 거울 사이 각(°). */
  angleA: number;
  angleB: number;
  angleC: number;
  /** 세 멈춤의 상 개수 — 정박값. */
  countA: number;
  countB: number;
  countC: number;
}

export function readConstants(stage: StageDef): MultipleMirrorImagesConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    angleA: c.angleA ?? ANGLE_A_DEG,
    angleB: c.angleB ?? ANGLE_B_DEG,
    angleC: c.angleC ?? ANGLE_C_DEG,
    countA: c.countA ?? COUNT_A,
    countB: c.countB ?? COUNT_B,
    countC: c.countC ?? COUNT_C,
  };
}

/**
 * 지금 두 거울 사이 각(°). 단계 경계를 상수로 가르지 않는다 — `narrowB` · `narrowC` · `openA`
 * 진행도(`at`)를 가중합한다. 그 단계 전에는 0, 뒤에는 1 이라 분기 없이 한 주기가 이어진다.
 */
export function mirrorDeg(tl: TimelineFrame, c: MultipleMirrorImagesConstants): number {
  return (
    c.angleA +
    (c.angleB - c.angleA) * tl.at('narrowB') +
    (c.angleC - c.angleB) * tl.at('narrowC') +
    (c.angleA - c.angleC) * tl.at('openA')
  );
}

/** 멈춘 각 하나와 그 각에서 선언한 개수. */
export interface HeldSet {
  deg: number;
  count: number;
  /** 상 · 각도 · 개수 글자의 불투명도 — 나타나는 중이면 오르고, 사라지는 중이면 내린다. */
  opacity: number;
}

/**
 * 지금 상이 서 있는 멈춤. 거울이 움직이는 단계(`narrow*` · `openA`)에서는 `null` — 그 사이 각에서
 * 서는 상은 이 조각이 할 말이 아니다. 불투명도는 그 단계 진행도 그대로다(단계 안을 가르지 않는다).
 */
export function heldSet(tl: TimelineFrame, c: MultipleMirrorImagesConstants): HeldSet | null {
  const a = { deg: c.angleA, count: c.countA };
  const b = { deg: c.angleB, count: c.countB };
  const cc = { deg: c.angleC, count: c.countC };
  const hold = 1;
  const rise = tl.progress;
  const fall = 1 - tl.progress;
  const table: Record<string, HeldSet> = {
    showA: { ...a, opacity: hold },
    traceA: { ...a, opacity: hold },
    pathA: { ...a, opacity: hold },
    hideA: { ...a, opacity: fall },
    appearB: { ...b, opacity: rise },
    showB: { ...b, opacity: hold },
    hideB: { ...b, opacity: fall },
    appearC: { ...cc, opacity: rise },
    showC: { ...cc, opacity: hold },
    hideC: { ...cc, opacity: fall },
    appearA: { ...a, opacity: rise },
  };
  return table[tl.phase] ?? null;
}

/** 2×2 선형 변환(꼭짓점이 원점). `[a, b, c, d]` 는 x' = a·x + b·y, y' = c·x + d·y. */
export type Linear = readonly [number, number, number, number];

export const apply = (m: Linear, p: Vec2): Vec2 => [m[0] * p[0] + m[1] * p[1], m[2] * p[0] + m[3] * p[1]];

const rotation = (a: number): Linear => [Math.cos(a), -Math.sin(a), Math.sin(a), Math.cos(a)];
/** 원점을 지나고 x 축과 각 `a` 를 이루는 직선에 대한 반사. */
export const reflection = (a: number): Linear => [Math.cos(2 * a), Math.sin(2 * a), Math.sin(2 * a), -Math.cos(2 * a)];
const compose = (m: Linear, n: Linear): Linear => [
  m[0] * n[0] + m[1] * n[2],
  m[0] * n[1] + m[1] * n[3],
  m[2] * n[0] + m[3] * n[2],
  m[2] * n[1] + m[3] * n[3],
];

/** 두 거울의 방향(라디안, x 축에서 반시계). 두 거울 사이를 가르는 선이 +y 축이다. */
export function mirrorDirections(deg: number): { right: number; left: number } {
  const half = (deg * Math.PI) / 360;
  return { right: Math.PI / 2 - half, left: Math.PI / 2 + half };
}

/** 상 하나 — 물체를 옮기는 변환과, 그 변환이 거울 반사를 홀수 번 거친 것인지(좌우가 바뀐다). */
export interface ImageMap {
  map: Linear;
  /** 꼭짓점 둘레 회전 몇 번째(2θ 씩)인가. */
  turn: number;
  flipped: boolean;
}

/**
 * 멈춘 각 `deg` 에서 두 거울이 만드는 상들 — 회전(2θ · k)과 회전 뒤 오른쪽 거울 반사. 물체 자신
 * (k = 0 회전)은 뺀다. 360 을 `deg` 가 나누지 않으면 닫히지 않으므로, 선언된 세 각은 그런 각이어야
 * 한다(NOTES (b)). 회전 횟수는 개수 글자가 아니라 그리는 도형의 수다.
 */
export function imageMaps(deg: number): ImageMap[] {
  const theta = (deg * Math.PI) / 180;
  const turns = Math.round(Math.PI / theta);
  const { right } = mirrorDirections(deg);
  const flip = reflection(right);
  const out: ImageMap[] = [];
  for (let k = 0; k < turns; k++) {
    const rot = rotation(2 * theta * k);
    if (k > 0) out.push({ map: rot, turn: k, flipped: false });
    out.push({ map: compose(rot, flip), turn: k, flipped: true });
  }
  return out;
}

/** 두 직선의 교점 — 점 `p` 에서 방향 `u`, 점 `q` 에서 방향 `v`. 나란하면 `null`. */
export function meet(p: Vec2, u: Vec2, q: Vec2, v: Vec2): Vec2 | null {
  const det = u[0] * v[1] - u[1] * v[0];
  if (Math.abs(det) < 1e-12) return null;
  const s = ((q[0] - p[0]) * v[1] - (q[1] - p[1]) * v[0]) / det;
  return [p[0] + u[0] * s, p[1] + u[1] * s];
}

/** 캡션 글자를 state 에 옮길 뿐이다 — 쌓는 상태가 없다. 모든 것이 시각의 함수다. */
export function step(params: { state: MultipleMirrorImagesState }): MultipleMirrorImagesState {
  return params.state;
}
