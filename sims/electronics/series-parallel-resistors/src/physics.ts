// ========================================================================
// series-parallel-resistors — 순수 물리
// ========================================================================
// 같은 전지 하나에 같은 저항 둘을 세 가지로 잇는다. 전지가 내주는 전류는
// 하나만(V/R) · 직렬(V/2R) · 병렬(2V/R) 이고, 그 값은 선언한 스테이지 상수다 —
// 여기서 V/R 을 다시 계산하지 않는다 (S-piece 유효숫자 · 원칙 2).
//
// 모든 도선의 전자 간격이 같으므로(같은 재료) 빠르기가 곧 전류다. 알갱이 자리는
// 조각 시계의 닫힌 식이라 같은 시각은 언제나 같은 화면이고, 주기 경계에서도 튀지
// 않는다. 기둥 높이도 시각의 함수다 — 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BATTERY_GAP,
  BRANCH_RISE,
  CARRIER_SPACING,
  CELL_BOTTOM_Y,
  CELL_TOP_Y,
  CELL_W,
  CELL_X,
  COLUMN_UNIT,
  CURRENT_BRANCH,
  CURRENT_PARALLEL,
  CURRENT_SERIES,
  CURRENT_SINGLE,
  GATE_OFFSET,
  LEAD,
  RESISTANCE,
  RESISTOR_BODY_HALF,
  RESISTOR_HALF,
  SERIES_GAP,
  SERIES_LEAD,
  SPEED_PER_AMP,
  TRAIL_SECONDS,
  UNIT_CURRENT,
  VOLTAGE,
} from './schema';
import type { SeriesParallelResistorsState } from './state';

// ------------------------------------------------------------------------
// 스테이지 상수
// ------------------------------------------------------------------------

export interface SeriesParallelResistorsConstants {
  voltage: number;
  resistance: number;
  currentSingle: number;
  currentSeries: number;
  currentParallel: number;
  currentBranch: number;
  unitCurrent: number;
  columnUnit: number;
  carrierSpacing: number;
  speedPerAmp: number;
  trailSeconds: number;
}

/** 주장이 기대는 물리량은 `stages[].constants` 에 선언하고 여기서 기본값과 함께 읽는다 (원칙 2). */
export function readConstants(stage: StageDef): SeriesParallelResistorsConstants {
  const c = stage.constants ?? {};
  return {
    voltage: c.voltage ?? VOLTAGE,
    resistance: c.resistance ?? RESISTANCE,
    currentSingle: c.currentSingle ?? CURRENT_SINGLE,
    currentSeries: c.currentSeries ?? CURRENT_SERIES,
    currentParallel: c.currentParallel ?? CURRENT_PARALLEL,
    currentBranch: c.currentBranch ?? CURRENT_BRANCH,
    unitCurrent: c.unitCurrent ?? UNIT_CURRENT,
    columnUnit: c.columnUnit ?? COLUMN_UNIT,
    carrierSpacing: c.carrierSpacing ?? CARRIER_SPACING,
    speedPerAmp: c.speedPerAmp ?? SPEED_PER_AMP,
    trailSeconds: c.trailSeconds ?? TRAIL_SECONDS,
  };
}

// ------------------------------------------------------------------------
// 폴리라인 — 호길이와 자리
// ------------------------------------------------------------------------

/** 열린 폴리라인의 누적 호길이. 마지막 값이 전체 길이다. */
export function cumulativeLengths(path: readonly Vec2[]): number[] {
  const out = [0];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    out.push(out[i - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  return out;
}

/** 폴리라인 위 한 자리 — 점과 그 자리의 진행 방향(단위 벡터). */
export interface PathPoint {
  pos: Vec2;
  dir: Vec2;
}

/** 호길이 s 의 자리(0 ≤ s ≤ 길이로 자른다). */
export function pointAt(path: readonly Vec2[], lengths: readonly number[], s: number): PathPoint {
  const total = lengths[lengths.length - 1]!;
  const t = Math.min(Math.max(s, 0), total);
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

/** 폴리라인 위에 있는 점의 호길이. 길 위에 없으면 던진다 — 조용히 틀리지 않게. */
export function arcOfPoint(path: readonly Vec2[], p: Vec2): number {
  let acc = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]!;
    const b = path[i + 1]!;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len2 = dx * dx + dy * dy;
    if (len2 > 0) {
      const f = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
      if (f >= -1e-9 && f <= 1 + 1e-9) {
        const qx = a[0] + dx * f;
        const qy = a[1] + dy * f;
        if (Math.hypot(p[0] - qx, p[1] - qy) < 1e-9) return acc + f * Math.sqrt(len2);
      }
    }
    acc += Math.sqrt(len2);
  }
  throw new Error('series-parallel-resistors: 점이 그 도선 위에 없다');
}

// ------------------------------------------------------------------------
// 배치 셋 — 회로 모양
// ------------------------------------------------------------------------

export type Arrangement = 'single' | 'series' | 'parallel';

/** 왼쪽부터의 순서. 하나만 → 직렬 → 병렬. */
export const ARRANGEMENTS: readonly Arrangement[] = ['single', 'series', 'parallel'];

/** 전자가 흐르는 길 한 가닥. 전지 − 판에서 나와 + 판으로 돌아가는 길을 나눠 담는다. */
export interface Strand {
  id: string;
  path: readonly Vec2[];
  lengths: readonly number[];
  /** 이 가닥에 흐르는 전류(A). 빠르기를 정한다. */
  current: number;
  /** 이 가닥 위 저항 기호 중심의 호길이. 도선과 알갱이가 여기서 비켜난다. */
  resistorArcs: readonly number[];
}

/** 호길이 구간 [a, b] 의 폴리라인 조각. 사이의 꺾인 점을 지난다. */
export function subPath(
  path: readonly Vec2[],
  lengths: readonly number[],
  a: number,
  b: number,
): Vec2[] {
  const pts: Vec2[] = [pointAt(path, lengths, a).pos];
  for (let i = 1; i < lengths.length - 1; i++) {
    const s = lengths[i]!;
    if (s > a && s < b) pts.push(path[i]!);
  }
  pts.push(pointAt(path, lengths, b).pos);
  return pts;
}

/** 구간 [from, to] 에서 `holes` 를 뺀 나머지 구간들. */
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

/** 도선이 실제로 그려지는 구간 — 저항 기호(소자 로컬 ±1)가 차지한 자리를 뺀 나머지. */
export function wirePieces(s: Strand): Vec2[][] {
  const total = s.lengths[s.lengths.length - 1]!;
  const holes = s.resistorArcs.map((a) => [a - RESISTOR_HALF, a + RESISTOR_HALF] as const);
  return spanWithout(0, total, holes).map(([a, b]) => subPath(s.path, s.lengths, a, b));
}

export interface Cell {
  arrangement: Arrangement;
  /** 왼쪽 기둥 x · 가로 폭 · 가로 가운데. */
  x0: number;
  w: number;
  centerX: number;
  /** 전지가 내주는 전류(A) — 기둥이 자라는 빠르기다. */
  current: number;
  /** 저항 기호 중심. */
  resistors: readonly Vec2[];
  /** 병렬의 두 마디. 없으면 빈 배열. */
  junctions: readonly Vec2[];
  strands: readonly Strand[];
}

function strand(
  id: string,
  path: readonly Vec2[],
  current: number,
  resistorsOnPath: readonly Vec2[],
): Strand {
  return {
    id,
    path,
    lengths: cumulativeLengths(path),
    current,
    resistorArcs: resistorsOnPath.map((p) => arcOfPoint(path, p)),
  };
}

/** 전지 두 판 사이 − 판(위) · + 판(아래)의 높이. 전자는 − 에서 나와 + 로 돌아간다. */
export const MINUS_Y = BATTERY_GAP / 2;
export const PLUS_Y = -BATTERY_GAP / 2;

function loopCell(
  arrangement: Arrangement,
  index: number,
  current: number,
  resistorXs: readonly number[],
): Cell {
  const x0 = CELL_X[index]!;
  const w = CELL_W[index]!;
  const resistors: Vec2[] = resistorXs.map((x) => [x, CELL_TOP_Y]);
  const path: Vec2[] = [
    [x0, MINUS_Y],
    [x0, CELL_TOP_Y],
    [x0 + w, CELL_TOP_Y],
    [x0 + w, CELL_BOTTOM_Y],
    [x0, CELL_BOTTOM_Y],
    [x0, PLUS_Y],
  ];
  return {
    arrangement,
    x0,
    w,
    centerX: x0 + w / 2,
    current,
    resistors,
    junctions: [],
    strands: [strand(`${arrangement}-loop`, path, current, resistors)],
  };
}

function parallelCell(index: number, current: number, branchCurrent: number): Cell {
  const x0 = CELL_X[index]!;
  const w = CELL_W[index]!;
  const nodeAx = x0 + LEAD;
  const nodeBx = x0 + LEAD + 2 * RESISTOR_HALF;
  const nodeA: Vec2 = [nodeAx, CELL_TOP_Y];
  const nodeB: Vec2 = [nodeBx, CELL_TOP_Y];
  const resistors: Vec2[] = [
    [(nodeAx + nodeBx) / 2, CELL_TOP_Y + BRANCH_RISE],
    [(nodeAx + nodeBx) / 2, CELL_TOP_Y - BRANCH_RISE],
  ];

  const out: Vec2[] = [[x0, MINUS_Y], [x0, CELL_TOP_Y], nodeA];
  const back: Vec2[] = [
    nodeB,
    [x0 + w, CELL_TOP_Y],
    [x0 + w, CELL_BOTTOM_Y],
    [x0, CELL_BOTTOM_Y],
    [x0, PLUS_Y],
  ];
  const branch = (r: Vec2): Vec2[] => [nodeA, [nodeAx, r[1]], [nodeBx, r[1]], nodeB];

  return {
    arrangement: 'parallel',
    x0,
    w,
    centerX: x0 + w / 2,
    current,
    resistors,
    junctions: [nodeA, nodeB],
    strands: [
      strand('parallel-out', out, current, []),
      ...resistors.map((r, i) => strand(`parallel-branch-${i}`, branch(r), branchCurrent, [r])),
      strand('parallel-back', back, current, []),
    ],
  };
}

/** 세 배치. 저항 기호 · 도선 · 알갱이 길이 여기서 한 번에 나온다. */
export function buildCells(c: SeriesParallelResistorsConstants): readonly Cell[] {
  const singleX0 = CELL_X[0]!;
  const seriesX0 = CELL_X[1]!;
  return [
    loopCell('single', 0, c.currentSingle, [singleX0 + LEAD + RESISTOR_HALF]),
    loopCell('series', 1, c.currentSeries, [
      seriesX0 + SERIES_LEAD + RESISTOR_HALF,
      seriesX0 + SERIES_LEAD + 3 * RESISTOR_HALF + SERIES_GAP,
    ]),
    parallelCell(2, c.currentParallel, c.currentBranch),
  ];
}

/** 세는 문이 서는 자리 — 아래 도선에서 전지 쪽으로 붙은 곳. 전지를 지난 전하가 여기를 지난다. */
export function gateOf(cell: Cell): Vec2 {
  return [cell.x0 + GATE_OFFSET, CELL_BOTTOM_Y];
}

/** 전지 가운데. */
export function batteryOf(cell: Cell): Vec2 {
  return [cell.x0, 0];
}

// ------------------------------------------------------------------------
// 전자 — 간격이 같으므로 빠르기가 곧 전류다
// ------------------------------------------------------------------------

export interface Carriers {
  positions: Vec2[];
  velocities: Vec2[];
}

/** 가닥 위 알갱이의 자리와 속도. 조각 시계의 닫힌 식이다 — 쌓지 않는다. */
export function carriersOn(s: Strand, c: SeriesParallelResistorsConstants, t: number): Carriers {
  const speed = s.current * c.speedPerAmp;
  const sp = c.carrierSpacing;
  const total = s.lengths[s.lengths.length - 1]!;
  const off = speed * t;
  const base = ((off % sp) + sp) % sp;
  const positions: Vec2[] = [];
  const velocities: Vec2[] = [];
  for (let arc = base; arc <= total; arc += sp) {
    if (s.resistorArcs.some((a) => Math.abs(arc - a) <= RESISTOR_BODY_HALF)) continue;
    const p = pointAt(s.path, s.lengths, arc);
    positions.push(p.pos);
    velocities.push([p.dir[0] * speed, p.dir[1] * speed]);
  }
  return { positions, velocities };
}

/**
 * 알갱이 뒤로 **길을 따라** 잘린 꼬리. `particleSystem` 의 속도 꼬리는 곧은 선이라
 * 모서리에서 회로 밖으로 삐진다(G181) — 호길이 구간을 잘라 길 위에 얹는다.
 */
export function trailsOn(s: Strand, c: SeriesParallelResistorsConstants, t: number): Vec2[][] {
  const speed = s.current * c.speedPerAmp;
  const trail = speed * c.trailSeconds;
  if (trail <= 0) return [];
  const sp = c.carrierSpacing;
  const total = s.lengths[s.lengths.length - 1]!;
  const off = speed * t;
  const base = ((off % sp) + sp) % sp;
  const out: Vec2[][] = [];
  for (let arc = base; arc <= total; arc += sp) {
    if (s.resistorArcs.some((a) => Math.abs(arc - a) <= RESISTOR_BODY_HALF)) continue;
    let from = Math.max(arc - trail, 0);
    // 저항 몸통을 지나 온 꼬리는 몸통 앞에서 끊는다 — 기호 위로 획이 지나가지 않게.
    for (const a of s.resistorArcs) {
      const exit = a + RESISTOR_BODY_HALF;
      if (from < exit && arc > exit) from = exit;
    }
    if (arc - from < 1e-6) continue;
    out.push(subPath(s.path, s.lengths, from, arc));
  }
  return out;
}

// ------------------------------------------------------------------------
// 기둥 — 같은 동안 전지에서 나온 전하
// ------------------------------------------------------------------------

/**
 * 세는 동안 자란 기둥의 높이(월드). 한 칸의 잣대는 선언에서 읽는다 —
 * `unitCurrent` 가 `count` 단계 내내 흐르면 딱 `columnUnit` 한 칸이다.
 * 단계 경계를 모듈 상수로 두고 가르지 않는다 (S-piece · 원칙 2).
 */
export function columnHeight(
  tl: TimelineFrame,
  c: SeriesParallelResistorsConstants,
  current: number,
): number {
  const span = tl.duration('count');
  const counted = Math.min(Math.max(tl.u - tl.start('count'), 0), span);
  return (current / c.unitCurrent) * (counted / span) * c.columnUnit;
}

/** 기둥 · 기준선 · 값 칩이 흐려지는 정도. `fade` 단계 동안 1 → 0. */
export function columnAlpha(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 다 센 기둥을 견주는 동안인가 — 기준선과 값 칩이 붙는다. */
export function comparing(tl: TimelineFrame): boolean {
  return tl.phase === 'hold' || tl.phase === 'fade';
}

/** 세는 중인가 — 문이 짙어진다. */
export function counting(tl: TimelineFrame): boolean {
  return tl.phase === 'count';
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: SeriesParallelResistorsState }): SeriesParallelResistorsState {
  return params.state;
}
