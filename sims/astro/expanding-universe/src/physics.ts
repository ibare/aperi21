// ========================================================================
// expanding-universe — 순수 물리 · 배치
// ========================================================================
// 은하는 제자리에 있고 **공간이 늘어난다.** 늘기 전 자리(공변 좌표) q 인 은하는 척도 인자
// a 만큼 늘어난 공간에서, 관찰 은하 o 를 기준으로 o + a·(q − o) 에 있다. 모든 간격이 같은
// 배율로 늘므로 관찰 은하에서 본 거리 d 는 a 배가 되고, 그 빠르기는 ȧ·(q − o) = H·d 다 —
// 허블 법칙이 이 한 줄에서 나온다. o 를 다른 은하로 바꿔도 식이 같다. 그것이 전부다.
//
// H 가 그대로라 a = e^(H·τ) (τ 는 늘이는 단계에서 흐른 시간). 늘기 전(a = 1)에는 어느 은하를
// 기준으로 잡아도 자리가 q 그대로라, 관찰 은하를 바꾸는 순간 그림이 튀지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ARROW_SECONDS,
  GALAXY_COUNT,
  GALAXY_SEED,
  GRID_STEP,
  HUBBLE,
  ROW_X,
  ROW_Y,
  SCENE_BOUNDS,
  SPACING,
} from './schema';
import type { ExpandingUniverseState } from './state';

export interface ExpandingUniverseConstants {
  /** 허블 상수 H(1/초). */
  hubble: number;
  /** 줄 선 은하 간격 d(늘기 전). */
  spacing: number;
  /** 줄 가운데 은하의 자리(늘기 전). */
  rowX: number;
  rowY: number;
  /** 흩뿌린 은하 수 · 난수 씨앗. */
  galaxyCount: number;
  galaxySeed: number;
  /** 속도 화살표 길이 = 속도 × 이 시간. */
  arrowSeconds: number;
  /** 공간 격자 간격(늘기 전). */
  gridStep: number;
}

export function readConstants(stage: StageDef): ExpandingUniverseConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    hubble: c.hubble ?? HUBBLE,
    spacing: c.spacing ?? SPACING,
    rowX: c.rowX ?? ROW_X,
    rowY: c.rowY ?? ROW_Y,
    galaxyCount: c.galaxyCount ?? GALAXY_COUNT,
    galaxySeed: c.galaxySeed ?? GALAXY_SEED,
    arrowSeconds: c.arrowSeconds ?? ARROW_SECONDS,
    gridStep: c.gridStep ?? GRID_STEP,
  };
}

// ------------------------------------------------------------------------
// 은하 배치 (공변 좌표 — 늘기 전 자리)
// ------------------------------------------------------------------------

/** 줄 선 세 은하 — 왼쪽 끝 · 가운데 · 오른쪽 끝. 양 끝이 차례로 관찰 은하가 된다. */
export interface Row {
  left: Vec2;
  middle: Vec2;
  right: Vec2;
}

export function rowGalaxies(c: ExpandingUniverseConstants): Row {
  return {
    left: [c.rowX - c.spacing, c.rowY],
    middle: [c.rowX, c.rowY],
    right: [c.rowX + c.spacing, c.rowY],
  };
}

/** 흩뿌린 은하 하나. */
export interface Galaxy {
  q: Vec2;
  /** 0~1 — 은하마다 다른 크기 · 밝기에 쓴다. */
  size: number;
}

/**
 * 흩뿌리는 사각형의 아래 여백(월드). 캡션 한두 줄이 앉는 자리에는 늘기 전에 은하를 두지
 * 않는다 — 늘면서 들어오는 것은 들어와도 된다.
 */
const CAPTION_ROOM = 0.7;
/**
 * 줄 아래로 치수선 둘이 놓이는 띠(월드, 줄에서 아래 · 위로). 이 띠에는 늘기 전 은하를 두지
 * 않는다. 줄은 관찰 은하를 지나므로 늘어나도 제자리이고, 띠 밖 은하는 줄에서 더 멀어질
 * 뿐이라 띠 안으로 들어오지 않는다.
 */
const ROW_BAND_BELOW = 1.0;
const ROW_BAND_ABOVE = 0.3;
/** 흩뿌린 은하끼리 · 줄 선 은하와의 최소 간격(월드). 한 덩이로 뭉쳐 읽히지 않게. */
const MIN_SEPARATION = 0.55;
/** 자리 하나를 뽑을 때 다시 뽑는 최대 횟수. 결정적 난수라 같은 씨앗은 같은 결과다. */
const MAX_TRIES = 60;

/** 씨앗을 받는 결정적 난수(mulberry32). `Math.random` 을 쓰지 않는다 (S-sim). */
function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 흩뿌린 은하들. 늘기 전 공간이 화면을 고르게 채우도록 경계 사각형 안에 뽑고, 서로 ·
 * 줄 선 은하와 너무 가까우면 다시 뽑는다. 늘어나면 관찰 은하에서 먼 쪽으로만 움직이므로
 * 늘기 전 화면을 채우면 늘어난 뒤에도 화면이 빈 데 없이 성겨지기만 한다.
 */
export function scatteredGalaxies(c: ExpandingUniverseConstants): Galaxy[] {
  const rand = seededRandom(c.galaxySeed);
  const row = rowGalaxies(c);
  const taken: Vec2[] = [row.left, row.middle, row.right];
  const out: Galaxy[] = [];
  const x0 = SCENE_BOUNDS.minX;
  const x1 = SCENE_BOUNDS.maxX;
  const y0 = SCENE_BOUNDS.minY + CAPTION_ROOM;
  const y1 = SCENE_BOUNDS.maxY;
  for (let n = 0; n < c.galaxyCount; n++) {
    for (let tries = 0; tries < MAX_TRIES; tries++) {
      const q: Vec2 = [x0 + (x1 - x0) * rand(), y0 + (y1 - y0) * rand()];
      const size = rand();
      const dy = q[1] - c.rowY;
      if (dy < ROW_BAND_ABOVE && dy > -ROW_BAND_BELOW) continue;
      if (taken.some((p) => Math.hypot(p[0] - q[0], p[1] - q[1]) < MIN_SEPARATION)) continue;
      taken.push(q);
      out.push({ q, size });
      break;
    }
  }
  return out;
}

// ------------------------------------------------------------------------
// 시각 → 척도 인자 · 관찰 은하
// ------------------------------------------------------------------------

export interface Expansion {
  /** 척도 인자 — 늘기 전 1. */
  a: number;
  /** 관찰 은하의 자리(늘어나도 제자리다). 오른쪽으로 옮겨 가는 동안은 그 사이. */
  observer: Vec2;
  /** 지금 서 있는 쪽 — 양 끝 중 어느 은하에 섰는가. */
  side: 'left' | 'right';
  /** 그림 전체의 불투명도 0~1. 흐려졌다가 늘기 전 공간으로 다시 나타난다. */
  alpha: number;
  /** 늘이기가 시작됐는가 — 자취 · 속도 화살표 · 치수선은 이때부터. */
  stretching: boolean;
}

/**
 * 지금 공간이 얼마나 늘었고 누가 보고 있는가. **단계 경계는 선언이 정한다** — 단계 진행도
 * (`at`)와 단계 시작 시각(`start`)만 읽으므로 저작자가 단계를 늘이거나 줄여도 따라간다.
 */
export function readExpansion(tl: TimelineFrame, c: ExpandingUniverseConstants): Expansion {
  const row = rowGalaxies(c);
  const side: Expansion['side'] = tl.u >= tl.start('appearRight') ? 'right' : 'left';
  const stretchPhase = side === 'left' ? 'stretchLeft' : 'stretchRight';
  // 늘이는 단계는 linear 라 진행도 × 길이가 흐른 시간 τ 다.
  const tau = tl.at(stretchPhase) * tl.duration(stretchPhase);
  const a = Math.exp(c.hubble * tau);
  const m = tl.at('move');
  const observer: Vec2 =
    side === 'left'
      ? row.left
      : [row.left[0] + (row.right[0] - row.left[0]) * m, row.left[1] + (row.right[1] - row.left[1]) * m];
  const alpha =
    side === 'left'
      ? tl.at('appearLeft') * (1 - tl.at('fadeLeft'))
      : tl.at('appearRight') * (1 - tl.at('fadeRight'));
  return { a, observer, side, alpha, stretching: tl.at(stretchPhase) > 0 };
}

/** 늘어난 공간에서의 자리 — 관찰 은하는 제자리, 나머지는 그로부터 a 배. */
export function stretched(q: Vec2, e: Expansion): Vec2 {
  return [e.observer[0] + e.a * (q[0] - e.observer[0]), e.observer[1] + e.a * (q[1] - e.observer[1])];
}

/** 관찰 은하에서 본 빠르기 — v = H·(지금 자리 − 관찰 은하). */
export function recession(pos: Vec2, e: Expansion, c: ExpandingUniverseConstants): Vec2 {
  return [c.hubble * (pos[0] - e.observer[0]), c.hubble * (pos[1] - e.observer[1])];
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ExpandingUniverseState }): ExpandingUniverseState {
  return params.state;
}
