// ========================================================================
// semiconductor-doping — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 모든 자리가 시간표 진행도의 함수이고, `step` 은 항등이다.
//
// 이 조각의 물리는 셋이다.
//
//   결합   실리콘 원자는 이웃 넷과 전자 둘씩 나눠 가진다 — 결합마다 전자 둘
//   도너   원자가 전자가 하나 많은 원자(인)는 결합을 채우고 하나가 남는다. 그 전자는
//          도너 준위(위 띠 바로 밑)에 있어 아주 작은 에너지로 위 띠에 올라 흐른다
//   억셉터 하나 적은 원자(붕소)는 결합 하나가 전자 하나 모자라다. 이웃 결합의 전자가
//          건너와 채우면 빈자리가 옮겨 간다 — 양공이 흐른다(아래 띠 전자가 억셉터 준위로 오른다)
//
// 나머지는 배치 계산이다 — 격자 원자 · 결합 · 결합 전자의 자리, 띠 그림의 높이.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ACCEPTOR_COL,
  ACCEPTOR_EV,
  ACCEPTOR_VALENCE,
  BAND_HALF_H,
  BAND_HALF_W,
  BAND_SLOTS,
  BAND_THICK,
  COLS,
  DONOR_COL,
  DONOR_EV,
  DONOR_VALENCE,
  DRIFT_SPEED,
  GAP_EV,
  HOP_COUNT,
  HOST_VALENCE,
  LEVEL_DEPTH_SCALE,
  ROWS,
} from './schema';
import type { SemiconductorDopingState } from './state';

export function step(params: { state: SemiconductorDopingState }): SemiconductorDopingState {
  return params.state;
}

export interface SemiconductorDopingConstants {
  gapEv: number;
  donorEv: number;
  acceptorEv: number;
  levelDepthScale: number;
  hostValence: number;
  donorValence: number;
  acceptorValence: number;
  driftSpeed: number;
  hopCount: number;
  donorCol: number;
  acceptorCol: number;
}

export function readConstants(stage: StageDef): SemiconductorDopingConstants {
  const c = stage.constants ?? {};
  return {
    gapEv: c.gapEv ?? GAP_EV,
    donorEv: c.donorEv ?? DONOR_EV,
    acceptorEv: c.acceptorEv ?? ACCEPTOR_EV,
    levelDepthScale: c.levelDepthScale ?? LEVEL_DEPTH_SCALE,
    hostValence: Math.round(c.hostValence ?? HOST_VALENCE),
    donorValence: Math.round(c.donorValence ?? DONOR_VALENCE),
    acceptorValence: Math.round(c.acceptorValence ?? ACCEPTOR_VALENCE),
    driftSpeed: c.driftSpeed ?? DRIFT_SPEED,
    hopCount: Math.round(c.hopCount ?? HOP_COUNT),
    donorCol: Math.round(c.donorCol ?? DONOR_COL),
    acceptorCol: Math.round(c.acceptorCol ?? ACCEPTOR_COL),
  };
}

// ------------------------------------------------------------------------
// 격자 배치 — 월드 1 단위 = 원자 간격
// ------------------------------------------------------------------------

/** 결합 가운데에서 결합 전자 둘까지의 거리(월드). 원자 고리와 겹치지 않고, 둘이 따로 읽히게. */
export const BOND_DOT_HALF = 0.15;
/** 격자 가장자리 원자가 바깥(그림 밖 원자)으로 내미는 결합의 길이(월드). 전자 둘을 다 담는다. */
export const STUB_LEN = 0.72;
/** 원자 하나의 결합 수 — 평면 정사각 격자에서 이웃 넷(실리콘의 사면체 결합 넷을 펼친 그림). */
export const BONDS_PER_ATOM = 4;
/** 불순물이 들어가는 행 — 가운데 줄. */
export const DOPANT_ROW = Math.floor(ROWS / 2);

/** 판 가운데가 `ox` 인 격자의 원자 (열 c, 행 r) 자리. r = 0 이 아래 줄. 격자 밖 번호도 받는다. */
export function atomPos(ox: number, c: number, r: number): Vec2 {
  return [ox + c - (COLS - 1) / 2, r - (ROWS - 1) / 2];
}

export interface Bond {
  /** 결합선의 두 끝(격자 밖 원자 쪽은 `STUB_LEN` 에서 끊는다). */
  from: Vec2;
  to: Vec2;
  /** 결합 전자 둘 — [0] 이 왼쪽(가로 결합) · 아래쪽(세로 결합) 원자 곁. */
  dots: readonly [Vec2, Vec2];
}

const inside = (c: number, r: number): boolean => c >= 0 && c < COLS && r >= 0 && r < ROWS;

/** 원자 a · b 사이 결합. 둘 중 하나는 격자 안이다. */
function bondBetween(a: Vec2, aIn: boolean, b: Vec2, bIn: boolean): Bond {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const mid: Vec2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return {
    from: aIn ? a : [b[0] - ux * STUB_LEN, b[1] - uy * STUB_LEN],
    to: bIn ? b : [a[0] + ux * STUB_LEN, a[1] + uy * STUB_LEN],
    dots: [
      [mid[0] - ux * BOND_DOT_HALF, mid[1] - uy * BOND_DOT_HALF],
      [mid[0] + ux * BOND_DOT_HALF, mid[1] + uy * BOND_DOT_HALF],
    ],
  };
}

/** 가로 결합 — 행 r 에서 열 c 와 c+1 사이. c 는 −1 부터 COLS−1 까지(양 끝은 바깥으로 내민 결합). */
export function hBond(ox: number, c: number, r: number): Bond {
  return bondBetween(atomPos(ox, c, r), inside(c, r), atomPos(ox, c + 1, r), inside(c + 1, r));
}

/** 세로 결합 — 열 c 에서 행 r 와 r+1 사이. r 는 −1 부터 ROWS−1 까지. */
export function vBond(ox: number, c: number, r: number): Bond {
  return bondBetween(atomPos(ox, c, r), inside(c, r), atomPos(ox, c, r + 1), inside(c, r + 1));
}

/** 격자의 모든 결합 — 이름(`h:c:r` · `v:c:r`)으로 찾을 수 있게. */
export function allBonds(ox: number): Map<string, Bond> {
  const out = new Map<string, Bond>();
  for (let r = 0; r < ROWS; r++) for (let c = -1; c < COLS; c++) out.set(`h:${c}:${r}`, hBond(ox, c, r));
  for (let c = 0; c < COLS; c++) for (let r = -1; r < ROWS; r++) out.set(`v:${c}:${r}`, vBond(ox, c, r));
  return out;
}

/**
 * 원자 (c, r) 의 결합 넷에서 그 원자 곁의 전자 자리 — 오른쪽 · 위 · 왼쪽 · 아래 순.
 * 붕소가 모자란 전자를 이 순서로 비운다.
 */
export function ownDots(c: number, r: number): readonly { bond: string; side: 0 | 1 }[] {
  return [
    { bond: `h:${c}:${r}`, side: 0 },
    { bond: `v:${c}:${r}`, side: 0 },
    { bond: `h:${c - 1}:${r}`, side: 1 },
    { bond: `v:${c}:${r - 1}`, side: 1 },
  ];
}

/** 인에 남는 전자들이 앉는 자리 — 원자에서 대각선으로 조금 떨어진 결합 사이. */
export const SPARE_OFFSETS: readonly Vec2[] = [
  [-0.3, 0.3],
  [0.3, 0.3],
  [0.3, -0.3],
  [-0.3, -0.3],
];

/** 풀려난 전자가 흐르는 길 — 인에서 반 칸 왼쪽 · 반 칸 위, 위 줄과의 틈(결합 사이 빈 곳). */
export const LANE_OFFSET: Vec2 = [-0.5, 0.5];

/** 남는 전자 수(인) · 모자란 전자 수(붕소). 앉을 자리 · 결합 수를 넘지 않는다. */
export function spareCount(c: SemiconductorDopingConstants): number {
  return Math.max(0, Math.min(SPARE_OFFSETS.length, c.donorValence - c.hostValence));
}
export function missingCount(c: SemiconductorDopingConstants): number {
  return Math.max(0, Math.min(BONDS_PER_ATOM, c.hostValence - c.acceptorValence));
}

// ------------------------------------------------------------------------
// 시간표 → 움직임
// ------------------------------------------------------------------------

/**
 * 인을 떠난 전자의 자리. `free` 동안 인 곁에서 위 줄과의 틈(결합 사이 빈 곳)으로 옮겨 가고,
 * 그 뒤로는 그 틈을 따라 전기장(오른쪽) 반대로 흐른다 — 전자는 음전하다.
 */
export function freeElectronPos(
  tl: TimelineFrame,
  c: SemiconductorDopingConstants,
  ox: number,
): { pos: Vec2; moving: boolean } {
  const p = atomPos(ox, c.donorCol, DOPANT_ROW);
  const off = SPARE_OFFSETS[0]!;
  const bound: Vec2 = [p[0] + off[0], p[1] + off[1]];
  const lane: Vec2 = [p[0] + LANE_OFFSET[0], p[1] + LANE_OFFSET[1]];
  const f = tl.at('free');
  const drift = c.driftSpeed * Math.max(0, tl.u - tl.end('free'));
  if (drift <= 0) {
    return { pos: [bound[0] + (lane[0] - bound[0]) * f, bound[1] + (lane[1] - bound[1]) * f], moving: false };
  }
  return { pos: [lane[0] - drift, lane[1]], moving: true };
}

/**
 * 양공 옮겨 감 — 다 옮긴 횟수와 지금 옮기는 중인 진행도(0~1). 첫 옮김은 `free`(붕소 결합을
 * 떠난다), 그 뒤는 `hop-k`(이징은 선언). 옮김마다 오른쪽 결합의 전자 하나가 왼쪽으로 건너온다.
 */
export function holeMoves(tl: TimelineFrame, c: SemiconductorDopingConstants): { done: number; move: number } {
  const ids = ['free', ...Array.from({ length: c.hopCount }, (_, k) => `hop-${k}`)];
  let done = 0;
  for (const id of ids) {
    const m = tl.at(id);
    if (m >= 1) {
      done++;
      continue;
    }
    return { done, move: m };
  }
  return { done, move: 0 };
}

/** 양공이 i 번 옮긴 뒤 머무는 결합 — 붕소 오른쪽 결합에서 한 칸씩 오른쪽으로. */
export function holeBond(c: SemiconductorDopingConstants, i: number): string {
  return `h:${c.acceptorCol + i}:${DOPANT_ROW}`;
}

// ------------------------------------------------------------------------
// 띠 그림 배치 — 가운데 x 가 `bx`. 세로는 에너지, 가로는 결정 속 자리(격자 열과 한 칸씩 맞선다).
// ------------------------------------------------------------------------

export interface BandLayout {
  valence: { bottom: number; top: number };
  conduction: { bottom: number; top: number };
  /** 1 eV 의 월드 높이 — 띠틈이 두 띠 사이를 채운다. */
  evToWorld: number;
  /** 도너 · 억셉터 준위 높이(깊이는 `levelDepthScale` 배로 키운다). */
  donorY: number;
  acceptorY: number;
}

export function bandLayout(c: SemiconductorDopingConstants): BandLayout {
  const valence = { bottom: -BAND_HALF_H, top: -BAND_HALF_H + BAND_THICK };
  const conduction = { bottom: BAND_HALF_H - BAND_THICK, top: BAND_HALF_H };
  const evToWorld = (conduction.bottom - valence.top) / c.gapEv;
  return {
    valence,
    conduction,
    evToWorld,
    donorY: conduction.bottom - c.donorEv * evToWorld * c.levelDepthScale,
    acceptorY: valence.top + c.acceptorEv * evToWorld * c.levelDepthScale,
  };
}

/** 띠 그림 칸 j 의 가로 자리. */
export function bandSlotX(bx: number, j: number): number {
  return bx - BAND_HALF_W + ((j + 0.5) * 2 * BAND_HALF_W) / BAND_SLOTS;
}

/** 물러나며 옅어지는 정도(1 이면 또렷하다). */
export function fadeOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}
