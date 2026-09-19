// ========================================================================
// kirchhoffs-voltage-law — 순수 물리
// ========================================================================
// 전지 둘 · 저항 셋이 한 줄로 이어진 고리. 마디 전위는 plugin-circuit 의 `solveMna` 가
// 푼다 — 출발점이 기준(0 V)이다. 도선 위에서는 전위가 그대로이고, 전지의 두 판 사이에서
// 전지 전압만큼, 저항의 지그재그를 지나며 (전류 × 저항)만큼 고르게 바뀐다.
//
// 점이 고리를 따라 간 거리 d 의 함수로 전위를 적으면 계단이 된다. 시계 방향과 반시계 방향은
// 같은 전위를 반대 순서로 지난다. 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import { solveMna, type MnaElement } from '@aperi21/plugin-circuit';
import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BATTERY_PLATE_GAP,
  E1,
  E1_POS,
  E2,
  E2_POS,
  LOOP_BOTTOM,
  LOOP_LEFT,
  LOOP_RIGHT,
  LOOP_TOP,
  R1,
  R1_POS,
  R2,
  R2_POS,
  R3,
  R3_POS,
  RESISTOR_BODY_HALF,
  START,
  VOLT_HEIGHT,
  type KirchhoffsVoltageLawMessageKey,
} from './schema';
import type { KirchhoffsVoltageLawState } from './state';

export interface KirchhoffsVoltageLawConstants {
  e1: number;
  e2: number;
  r1: number;
  r2: number;
  r3: number;
  voltHeight: number;
}

export function readConstants(stage: StageDef): KirchhoffsVoltageLawConstants {
  const c = stage.constants ?? {};
  return {
    e1: c.e1 ?? E1,
    e2: c.e2 ?? E2,
    r1: c.r1 ?? R1,
    r2: c.r2 ?? R2,
    r3: c.r3 ?? R3,
    voltHeight: c.voltHeight ?? VOLT_HEIGHT,
  };
}

// ------------------------------------------------------------------------
// 고리 — 출발점에서 시계 방향으로 한 바퀴 도는 닫힌 폴리라인
// ------------------------------------------------------------------------

/** 출발점 → 왼쪽 위 → 오른쪽 위 → 오른쪽 아래 → 왼쪽 아래 → 출발점. 시계 방향이다. */
export const LOOP_PATH: readonly Vec2[] = [
  START,
  [LOOP_LEFT, LOOP_TOP],
  [LOOP_RIGHT, LOOP_TOP],
  [LOOP_RIGHT, LOOP_BOTTOM],
  [LOOP_LEFT, LOOP_BOTTOM],
  START,
];

/** 열린 폴리라인의 누적 호길이. */
export function cumulativeLengths(path: readonly Vec2[]): number[] {
  const out = [0];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    out.push(out[i - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  return out;
}

export const LOOP_LENGTHS: readonly number[] = cumulativeLengths(LOOP_PATH);
/** 고리 한 바퀴의 길이(월드). */
export const LOOP_PERIMETER = LOOP_LENGTHS[LOOP_LENGTHS.length - 1]!;

/** 폴리라인 위 한 자리 — 점과 그 자리의 시계 방향 진행 방향(단위 벡터). */
export interface PathPoint {
  pos: Vec2;
  dir: Vec2;
}

/** 고리에서 호길이 s 의 자리(0 ≤ s ≤ 둘레로 자른다). */
export function pointAt(s: number): PathPoint {
  const path = LOOP_PATH;
  const lengths = LOOP_LENGTHS;
  const t = Math.min(Math.max(s, 0), LOOP_PERIMETER);
  let i = 0;
  while (i < path.length - 2 && lengths[i + 1]! < t) i++;
  const a = path[i]!;
  const b = path[i + 1]!;
  const seg = lengths[i + 1]! - lengths[i]!;
  const f = seg > 0 ? (t - lengths[i]!) / seg : 0;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return { pos: [a[0] + dx * f, a[1] + dy * f], dir: [dx / len, dy / len] };
}

/** 고리에서 호길이 구간 [a, b] 의 조각. 사이의 꺾인 점을 지난다. */
export function subPath(a: number, b: number): Vec2[] {
  const pts: Vec2[] = [pointAt(a).pos];
  for (let i = 1; i < LOOP_LENGTHS.length - 1; i++) {
    const s = LOOP_LENGTHS[i]!;
    if (s > a && s < b) pts.push(LOOP_PATH[i]!);
  }
  pts.push(pointAt(b).pos);
  return pts;
}

/** 구간 [from, to] 에서 빼낼 구간들 `holes` 를 뺀 나머지. */
export function spanWithout(
  from: number,
  to: number,
  holes: readonly (readonly [number, number])[],
): [number, number][] {
  let spans: [number, number][] = [[from, to]];
  for (const [h0, h1] of holes) {
    const next: [number, number][] = [];
    for (const [s0, s1] of spans) {
      if (s1 <= h0 || s0 >= h1) {
        next.push([s0, s1]);
        continue;
      }
      if (s0 < h0) next.push([s0, h0]);
      if (s1 > h1) next.push([h1, s1]);
    }
    spans = next;
  }
  return spans.filter(([s0, s1]) => s1 - s0 > 1e-6);
}

/** 고리 위에 놓인 점 p 의 호길이. 변 위에 있지 않으면 던진다 — 배치가 조용히 틀리지 않게. */
export function arcOf(p: Vec2): number {
  for (let i = 0; i < LOOP_PATH.length - 1; i++) {
    const a = LOOP_PATH[i]!;
    const b = LOOP_PATH[i + 1]!;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) continue;
    const f = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
    if (f < 0 || f > 1) continue;
    const off = Math.hypot(a[0] + dx * f - p[0], a[1] + dy * f - p[1]);
    if (off < 1e-9) return LOOP_LENGTHS[i]! + f * Math.sqrt(len2);
  }
  throw new Error('kirchhoffs-voltage-law: 소자 자리가 고리 위에 있지 않다');
}

// ------------------------------------------------------------------------
// 소자 — 시계 방향 순서. 전지는 둘 다 + 극이 시계 방향 앞쪽이다(같은 방향으로 민다)
// ------------------------------------------------------------------------

export type ElementKind = 'battery' | 'resistor';

export interface LoopElement {
  id: 'e1' | 'e2' | 'r1' | 'r2' | 'r3';
  kind: ElementKind;
  pos: Vec2;
  /** 소자 이름 표식의 문안 키. */
  tag: KirchhoffsVoltageLawMessageKey;
  /** 호길이 — 소자 가운데. */
  arc: number;
  /** 전위가 바뀌는 호길이 구간 — 전지는 두 판 사이, 저항은 지그재그. */
  span: readonly [number, number];
}

function element(id: LoopElement['id'], kind: ElementKind, pos: Vec2, tag: KirchhoffsVoltageLawMessageKey): LoopElement {
  const arc = arcOf(pos);
  const half = kind === 'battery' ? BATTERY_PLATE_GAP / 2 : RESISTOR_BODY_HALF;
  return { id, kind, pos, tag, arc, span: [arc - half, arc + half] };
}

/** 출발점에서 시계 방향으로 만나는 순서. 고리가 한 줄이라 소자 사이 마디가 다섯이다. */
export const ELEMENTS: readonly LoopElement[] = [
  element('e1', 'battery', E1_POS, 'label.e1'),
  element('r1', 'resistor', R1_POS, 'label.r1'),
  element('r2', 'resistor', R2_POS, 'label.r2'),
  element('e2', 'battery', E2_POS, 'label.e2'),
  element('r3', 'resistor', R3_POS, 'label.r3'),
];

function valueOf(c: KirchhoffsVoltageLawConstants, id: LoopElement['id']): number {
  return c[id];
}

/** 마디 k = 소자 k 바로 앞(시계 방향). 마디 0 이 출발점이다. */
function nodeName(k: number): string {
  return `n${k % ELEMENTS.length}`;
}

export interface LoopSolution {
  /** 마디 k 의 전위(V) — 소자 k 로 들어가기 직전. 마디 0(출발점) = 0. */
  nodeVoltages: readonly number[];
  /** 고리 전류(A). 양수면 시계 방향. */
  current: number;
}

/** 고리를 푼다. 전지는 + 극이 시계 방향 앞 마디다. */
export function solveLoop(c: KirchhoffsVoltageLawConstants): LoopSolution {
  const mna: MnaElement[] = [{ id: 'ground', kind: 'ground', a: nodeName(0) }];
  ELEMENTS.forEach((el, k) => {
    const before = nodeName(k);
    const after = nodeName(k + 1);
    mna.push(
      el.kind === 'battery'
        ? { id: el.id, kind: 'voltageSource', a: after, b: before, value: valueOf(c, el.id) }
        : { id: el.id, kind: 'resistor', a: before, b: after, value: valueOf(c, el.id) },
    );
  });
  const sol = solveMna(mna);
  if (!sol) throw new Error('kirchhoffs-voltage-law: 고리를 풀 수 없다(저항이 0 이하)');
  const first = ELEMENTS.find((el) => el.kind === 'resistor')!;
  return {
    nodeVoltages: ELEMENTS.map((_, k) => sol.nodeVoltages[nodeName(k)] ?? 0),
    current: sol.branchCurrents[first.id] ?? 0,
  };
}

// ------------------------------------------------------------------------
// 걷기 — 방향별로 간 거리 d 에 따른 전위 계단
// ------------------------------------------------------------------------

export type Direction = 'cw' | 'ccw';

/** 간 거리 d 에서의 고리 호길이. */
export function arcAtDistance(dir: Direction, d: number): number {
  return dir === 'cw' ? d : LOOP_PERIMETER - d;
}

/** 한 방향으로 걸을 때 만나는 소자 하나 — 간 거리 구간과 그 앞 · 뒤 전위. */
export interface Crossing {
  element: LoopElement;
  /** 간 거리 구간 [들어감, 나옴]. */
  d0: number;
  d1: number;
  /** 들어가기 전 · 나온 뒤 전위(V). */
  vBefore: number;
  vAfter: number;
}

/** 그 방향으로 걸을 때 소자를 만나는 순서대로. 반시계 방향이면 순서도 앞뒤 전위도 뒤바뀐다. */
export function crossings(dir: Direction, sol: LoopSolution): Crossing[] {
  const n = ELEMENTS.length;
  const cw = ELEMENTS.map((element, k) => ({
    element,
    d0: element.span[0],
    d1: element.span[1],
    vBefore: sol.nodeVoltages[k]!,
    vAfter: sol.nodeVoltages[(k + 1) % n]!,
  }));
  if (dir === 'cw') return cw;
  return cw
    .map((x) => ({
      element: x.element,
      d0: LOOP_PERIMETER - x.d1,
      d1: LOOP_PERIMETER - x.d0,
      vBefore: x.vAfter,
      vAfter: x.vBefore,
    }))
    .reverse();
}

/** 소자를 지나는 도중의 전위 — 구간 안에서 고르게 바뀐다. */
export function potentialIn(x: Crossing, d: number): number {
  if (d <= x.d0) return x.vBefore;
  if (d >= x.d1) return x.vAfter;
  return x.vBefore + ((x.vAfter - x.vBefore) * (d - x.d0)) / (x.d1 - x.d0);
}

/** 간 거리 d 까지 그은 전위 계단(간 거리, 전위) 매듭. 첫 매듭은 (0, 출발점 전위). */
export function staircase(xs: readonly Crossing[], start: number, d: number): [number, number][] {
  const pts: [number, number][] = [[0, start]];
  for (const x of xs) {
    if (d <= x.d0) break;
    pts.push([x.d0, x.vBefore]);
    if (d < x.d1) {
      pts.push([d, potentialIn(x, d)]);
      return pts;
    }
    pts.push([x.d1, x.vAfter]);
  }
  const last = pts[pts.length - 1]!;
  if (d > last[0]) pts.push([d, last[1]]);
  return pts;
}

/** 간 거리 d 에서의 전위. */
export function potentialAt(xs: readonly Crossing[], start: number, d: number): number {
  const pts = staircase(xs, start, d);
  return pts[pts.length - 1]![1];
}

/** 지금 걸음 — 방향, 간 거리, 단계. */
export interface Walk {
  dir: Direction;
  /** 간 거리(월드) 0 ~ 둘레. */
  distance: number;
  /** 방향을 바꾸는 중 — 판이 비어 있다. */
  turning: boolean;
  /** 한 바퀴를 마치고 출발점에서 견주는 중. */
  home: boolean;
}

/**
 * 시간표에서 지금 걸음을 읽는다. 반시계 방향 구간은 `turn-ccw` 부터 `home-ccw` 까지 붙어 있어
 * 단계 목록 없이 그 구간의 시작 · 끝만 읽는다(G193).
 */
export function walkNow(tl: TimelineFrame): Walk {
  const ccw = tl.u >= tl.start('turn-ccw') && tl.u < tl.end('home-ccw');
  const dir: Direction = ccw ? 'ccw' : 'cw';
  const turning = tl.phase === 'turn-ccw' || tl.phase === 'turn-cw';
  const home = tl.phase === 'home-cw' || tl.phase === 'home-ccw';
  const progress = turning ? 0 : tl.at(ccw ? 'walk-ccw' : 'walk-cw');
  return { dir, distance: progress * LOOP_PERIMETER, turning, home };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: KirchhoffsVoltageLawState }): KirchhoffsVoltageLawState {
  return params.state;
}
