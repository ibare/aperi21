// ========================================================================
// kirchhoffs-current-law — 순수 물리
// ========================================================================
// 전지(내부 저항 없음)에 세 저항이 나란히 걸린다. 가지 전류 = 전압 / 저항, 본선 전류 =
// 세 가지의 합이다. 모든 도선의 알갱이 간격이 같으므로(밀도가 같다) 알갱이 빠르기는
// 전류에 비례한다 — 1 초에 문을 지나는 알갱이 수 = 전류 × 표시 배율.
//
// 알갱이가 흐른 거리는 단계마다 (그 단계 저항 배치의 빠르기 × 흐른 시간) 을 이어 더한
// 닫힌 식이다. 쌓는 상태가 없고, 같은 시각은 언제나 같은 자리다.
//
// 센 수는 문을 실제로 지난 알갱이의 수다 — 알갱이 줄의 번호에서 곧바로 나온다. 그래서
// 네모의 수와 문을 지난 알갱이의 수가 어긋날 수 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BRANCH_Y,
  CARRIERS_PER_AMP_SECOND,
  CARRIER_SPACING,
  EMF,
  IN_GATE_BEFORE,
  LOOP_BOTTOM,
  LOOP_LEFT,
  LOOP_RIGHT,
  NODE_A,
  NODE_B,
  OUT_GATE_X,
  R1,
  R2,
  R3_A,
  R3_B,
  ROW_END_X,
  ROW_START_X,
  TRAIL_SECONDS,
} from './schema';
import type { KirchhoffsCurrentLawState } from './state';

export interface KirchhoffsCurrentLawConstants {
  emf: number;
  r1: number;
  r2: number;
  r3a: number;
  r3b: number;
  carriersPerAmpSecond: number;
  carrierSpacing: number;
  trailSeconds: number;
}

export function readConstants(stage: StageDef): KirchhoffsCurrentLawConstants {
  const c = stage.constants ?? {};
  return {
    emf: c.emf ?? EMF,
    r1: c.r1 ?? R1,
    r2: c.r2 ?? R2,
    r3a: c.r3a ?? R3_A,
    r3b: c.r3b ?? R3_B,
    carriersPerAmpSecond: c.carriersPerAmpSecond ?? CARRIERS_PER_AMP_SECOND,
    carrierSpacing: c.carrierSpacing ?? CARRIER_SPACING,
    trailSeconds: c.trailSeconds ?? TRAIL_SECONDS,
  };
}

// ------------------------------------------------------------------------
// 저항 배치 — 단계 id 의 끝 글자
// ------------------------------------------------------------------------

/** `a` = 아래 가지가 처음 저항, `b` = 바꾼 저항. */
export type Arrangement = 'a' | 'b';

export function arrangementOf(phaseId: string): Arrangement {
  return phaseId.endsWith('-b') ? 'b' : 'a';
}

/** 세 가지의 저항(Ω) — 위 · 가운데 · 아래. */
export function branchResistances(c: KirchhoffsCurrentLawConstants, arr: Arrangement): readonly number[] {
  return [c.r1, c.r2, arr === 'b' ? c.r3b : c.r3a];
}

/** 세 가지의 전류(A). 전지 전압이 세 가지에 똑같이 걸린다. */
export function branchCurrents(c: KirchhoffsCurrentLawConstants, arr: Arrangement): number[] {
  return branchResistances(c, arr).map((r) => c.emf / r);
}

// ------------------------------------------------------------------------
// 도선 — 0 = 본선(B → 전지 → A), 1 · 2 · 3 = 위 · 가운데 · 아래 가지(A → B)
// ------------------------------------------------------------------------

export interface WirePath {
  /** 전자가 가는 방향의 열린 폴리라인. */
  path: readonly Vec2[];
  /** 누적 호길이. 마지막 값이 전체 길이. */
  lengths: readonly number[];
  /** 세는 문의 호길이. */
  gate: number;
}

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

/** 폴리라인 위 한 자리 — 점과 그 자리의 진행 방향(단위 벡터). */
export interface PathPoint {
  pos: Vec2;
  dir: Vec2;
}

/** 열린 폴리라인에서 호길이 s 의 자리(0 ≤ s ≤ 길이로 자른다). */
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

/** 열린 폴리라인에서 호길이 구간 [a, b] 의 조각. 사이의 꺾인 점을 지난다. */
export function subPath(path: readonly Vec2[], lengths: readonly number[], a: number, b: number): Vec2[] {
  const pts: Vec2[] = [pointAt(path, lengths, a).pos];
  for (let i = 1; i < lengths.length - 1; i++) {
    const s = lengths[i]!;
    if (s > a && s < b) pts.push(path[i]!);
  }
  pts.push(pointAt(path, lengths, b).pos);
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

function makeWire(path: readonly Vec2[], gateOf: (lengths: readonly number[]) => number): WirePath {
  const lengths = cumulativeLengths(path);
  return { path, lengths, gate: gateOf(lengths) };
}

/**
 * 네 도선. 본선은 B 에서 오른쪽으로 나가 아래 변을 왼쪽으로 지나 왼쪽 변을 올라(전지 속을
 * + 에서 − 로) A 로 들어온다. 가지는 A 에서 비스듬히 자기 높이로 갈라져 곧게 뻗고 B 로 모인다.
 * 들어오는 문은 A 바로 앞, 나가는 문은 가지가 곧게 펴진 직후다.
 */
export const WIRES: readonly WirePath[] = [
  makeWire(
    [NODE_B, [LOOP_RIGHT, 0], [LOOP_RIGHT, LOOP_BOTTOM], [LOOP_LEFT, LOOP_BOTTOM], [LOOP_LEFT, 0], NODE_A],
    (l) => l[l.length - 1]! - IN_GATE_BEFORE,
  ),
  ...BRANCH_Y.map((y) =>
    makeWire([NODE_A, [ROW_START_X, y], [ROW_END_X, y], NODE_B], (l) => l[1]! + (OUT_GATE_X - ROW_START_X)),
  ),
];

/** 본선 위 전지 중심의 호길이 — 왼쪽 변을 아래에서 위로 오른다. */
export function mainArcAtLeftY(y: number): number {
  const l = WIRES[0]!.lengths;
  return l[3]! + (y - LOOP_BOTTOM);
}

// ------------------------------------------------------------------------
// 흐름 — 도선마다 빠르기 × 흐른 시간을 단계마다 이어 더한다
// ------------------------------------------------------------------------

/** 도선 w 의 알갱이 수/초. 본선은 세 가지의 합이다. */
export function carrierRate(c: KirchhoffsCurrentLawConstants, arr: Arrangement, w: number): number {
  const branch = branchCurrents(c, arr);
  const current = w === 0 ? branch.reduce((s, i) => s + i, 0) : branch[w - 1]!;
  return current * c.carriersPerAmpSecond;
}

/** 도선 w 의 알갱이 빠르기(월드/초). 간격이 모든 도선에서 같으므로 수/초에 비례한다. */
export function carrierSpeed(c: KirchhoffsCurrentLawConstants, arr: Arrangement, w: number): number {
  return carrierRate(c, arr, w) * c.carrierSpacing;
}

/**
 * 주기 안 시각 u 까지 b 배치(아래 가지 `r3b`)로 흐른 시간(초). b 배치 단계는 `swap-b` 부터
 * `hold-b` 까지 붙어 있으므로 단계 목록 없이 그 구간의 시작 · 끝만 읽는다.
 */
function elapsedInB(tl: TimelineFrame, u: number): number {
  const from = tl.start('swap-b');
  return Math.min(Math.max(u - from, 0), tl.end('hold-b') - from);
}

/** 이번 주기의 처음부터 주기 안 시각 u 까지 도선 w 의 알갱이가 흐른 거리(월드). 나머지 시간은 a 배치다. */
export function flowedInCycle(tl: TimelineFrame, c: KirchhoffsCurrentLawConstants, w: number, u: number): number {
  const b = elapsedInB(tl, u);
  return carrierSpeed(c, 'b', w) * b + carrierSpeed(c, 'a', w) * (u - b);
}

/**
 * 알갱이 줄의 자리 맞춤. 첫 세기(`count-a`)가 시작하는 순간 문 바로 앞 알갱이가 문에서
 * **반 간격** 앞에 오게 한다 — 통과 시각이 세는 창의 경계와 겹치지 않는다.
 */
function latticePhase(tl: TimelineFrame, c: KirchhoffsCurrentLawConstants, w: number): number {
  return WIRES[w]!.gate - c.carrierSpacing / 2 - flowedInCycle(tl, c, w, tl.start('count-a'));
}

/** 주기 번호까지 이어 센, 조각 시계 0 부터 흐른 거리 + 자리 맞춤. */
function latticeOffset(tl: TimelineFrame, c: KirchhoffsCurrentLawConstants, w: number, u: number): number {
  return tl.cycle * flowedInCycle(tl, c, w, tl.period) + flowedInCycle(tl, c, w, u) + latticePhase(tl, c, w);
}

/** 도선 w 위 알갱이의 호길이들(0 ~ 길이). 간격은 모든 도선에서 같다. */
export function carrierArcs(tl: TimelineFrame, c: KirchhoffsCurrentLawConstants, w: number): number[] {
  const sp = c.carrierSpacing;
  const total = WIRES[w]!.lengths[WIRES[w]!.lengths.length - 1]!;
  const off = latticeOffset(tl, c, w, tl.u);
  const base = ((off % sp) + sp) % sp;
  const out: number[] = [];
  for (let s = base; s <= total; s += sp) out.push(s);
  return out;
}

/** 주기 안 시각 u 까지 도선 w 의 문을 지난 알갱이의 번호(이번 주기 안에서 견줄 때만 쓴다). */
function passedIndex(tl: TimelineFrame, c: KirchhoffsCurrentLawConstants, w: number, u: number): number {
  return Math.floor((flowedInCycle(tl, c, w, u) + latticePhase(tl, c, w) - WIRES[w]!.gate) / c.carrierSpacing);
}

/** 지금 보이는 세기 — 어느 배치로 셌고, 도선마다 몇 개가 문을 지났는가. */
export interface Tally {
  round: Arrangement;
  /** [들어온 것, 위 가지, 가운데 가지, 아래 가지]. */
  counts: number[];
  /** 세는 중인가(문이 열려 있다). */
  counting: boolean;
  /** 세 가지 더미를 포갠 정도 0~1 (`stack-*` 진행도, 이징은 선언). */
  stacked: number;
  /** 견주는 단계인가. */
  holding: boolean;
}

/**
 * 지금 단계의 세기. `count-*` 동안 문이 열려 수가 자라고, `stack-*` · `hold-*` 동안은
 * 그 세기의 끝 값이 남는다. `swap-*` 동안에는 판이 비어 있다.
 */
export function tallyNow(tl: TimelineFrame, c: KirchhoffsCurrentLawConstants): Tally | null {
  if (tl.phase.startsWith('swap-')) return null;
  const round = arrangementOf(tl.phase);
  const countId = `count-${round}`;
  const from = tl.start(countId);
  const to = Math.min(tl.u, tl.end(countId));
  const counts = WIRES.map((_, w) => passedIndex(tl, c, w, to) - passedIndex(tl, c, w, from));
  return {
    round,
    counts,
    counting: tl.phase === countId,
    stacked: tl.at(`stack-${round}`),
    holding: tl.phase === `hold-${round}`,
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: KirchhoffsCurrentLawState }): KirchhoffsCurrentLawState {
  return params.state;
}
