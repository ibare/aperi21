// ========================================================================
// transistor-principle — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 모든 자리가 시간표 시각의 함수이고, `step` 은 항등이다.
//
// 이 조각의 물리는 둘이다.
//
//   제어     컬렉터 전류 = β × 베이스 전류. 베이스 전류가 0 이면 이미터 → 컬렉터로 아무것도 건너지 않는다
//   흐름     막대 안 전자 밀도는 그대로이고, 흐르는 빠르기가 전류에 비례한다(전류 = 밀도 × 표류 속도).
//            흐른 거리는 빠르기의 시간 적분이다
//
// 베이스 전류는 시간표의 세 오르내림(`onIn` · `upIn` · `offIn`)이 정한다. 흐른 거리를 적분하려면
// 지난 시각의 전류가 필요한데 `TimelineFrame` 은 지금 진행도만 주므로, 세 단계의 시작 · 길이를
// 시간표에서 읽어 선형 진행도를 직접 센다 (선언이 세 단계를 `linear` 로 둔다, NOTES (c)).
//
// 나머지는 배치 계산이다 — 전자 자리, 흔들림.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BASE_CURRENT_HIGH,
  BASE_CURRENT_LOW,
  BASE_X0,
  BASE_X1,
  BETA,
  COLLECTOR_CURRENT_HIGH,
  COLLECTOR_CURRENT_LOW,
  COLLECTOR_X1,
  EMITTER_X0,
  FLOW_SPEED,
  JITTER,
  JITTER_HZ,
  ROW_GAP,
  ROWS,
  SEED,
  SLOT,
} from './schema';
import type { TransistorPrincipleState } from './state';

export function step(params: { state: TransistorPrincipleState }): TransistorPrincipleState {
  return params.state;
}

export interface TransistorPrincipleConstants {
  beta: number;
  baseCurrentLow: number;
  baseCurrentHigh: number;
  collectorCurrentLow: number;
  collectorCurrentHigh: number;
  flowSpeed: number;
  jitter: number;
  jitterHz: number;
  seed: number;
}

export function readConstants(stage: StageDef): TransistorPrincipleConstants {
  const c = stage.constants ?? {};
  return {
    beta: c.beta ?? BETA,
    baseCurrentLow: c.baseCurrentLow ?? BASE_CURRENT_LOW,
    baseCurrentHigh: c.baseCurrentHigh ?? BASE_CURRENT_HIGH,
    collectorCurrentLow: c.collectorCurrentLow ?? COLLECTOR_CURRENT_LOW,
    collectorCurrentHigh: c.collectorCurrentHigh ?? COLLECTOR_CURRENT_HIGH,
    flowSpeed: c.flowSpeed ?? FLOW_SPEED,
    jitter: c.jitter ?? JITTER,
    jitterHz: c.jitterHz ?? JITTER_HZ,
    seed: c.seed ?? SEED,
  };
}

// ------------------------------------------------------------------------
// 베이스 전류 — 시간표의 세 오르내림
// ------------------------------------------------------------------------

/** 베이스 전류를 바꾸는 단계. 선언에서 `linear` 다. */
const RAMPS = ['onIn', 'upIn', 'offIn'] as const;
type Ramp = (typeof RAMPS)[number];

/** 주기 안 시각 `u` 에서 그 오르내림의 선형 진행도 0~1. */
function rampAt(tl: TimelineFrame, id: Ramp, u: number): number {
  const d = tl.duration(id);
  if (d <= 0) return u >= tl.start(id) ? 1 : 0;
  return Math.min(1, Math.max(0, (u - tl.start(id)) / d));
}

/** 주기 안 시각 `u` 의 베이스 전류(mA). 0 → 낮음 → 높음 → 0. */
export function baseCurrentAt(tl: TimelineFrame, c: TransistorPrincipleConstants, u: number): number {
  return (
    c.baseCurrentLow * rampAt(tl, 'onIn', u) +
    (c.baseCurrentHigh - c.baseCurrentLow) * rampAt(tl, 'upIn', u) -
    c.baseCurrentHigh * rampAt(tl, 'offIn', u)
  );
}

/** 지금 베이스 전류(mA). */
export function baseCurrent(tl: TimelineFrame, c: TransistorPrincipleConstants): number {
  return Math.max(0, baseCurrentAt(tl, c, tl.u));
}

/** 지금 컬렉터 전류(mA) = β × 베이스 전류. 막대 높이에만 쓴다 — 화면 글자는 선언값이다. */
export function collectorCurrent(tl: TimelineFrame, c: TransistorPrincipleConstants): number {
  return c.beta * baseCurrent(tl, c);
}

/** 베이스가 얼마나 열렸는지 0~1 — 처음 흘려 넣는 전류에 이르면 1. 베이스 안 전자 · 도선 강조가 따른다. */
export function openness(tl: TimelineFrame, c: TransistorPrincipleConstants): number {
  if (c.baseCurrentLow <= 0) return 0;
  return Math.min(1, baseCurrent(tl, c) / c.baseCurrentLow);
}

/** 전류에 비례하는 흐름 빠르기(월드/초). `baseCurrentHigh` 에서 `flowSpeed`. */
function speedOf(c: TransistorPrincipleConstants, ib: number): number {
  if (c.baseCurrentHigh <= 0) return 0;
  return (c.flowSpeed * Math.max(0, ib)) / c.baseCurrentHigh;
}

export function flowSpeed(tl: TimelineFrame, c: TransistorPrincipleConstants): number {
  return speedOf(c, baseCurrent(tl, c));
}

/**
 * 주기 처음부터 `u` 까지 흐른 거리(월드). 전류가 단계 안에서 선형이므로 꺾이는 시각마다 끊어
 * 사다리꼴로 더하면 정확하다.
 */
function distanceWithin(tl: TimelineFrame, c: TransistorPrincipleConstants, u: number): number {
  const cuts = new Set<number>([0, u]);
  for (const id of RAMPS) {
    for (const s of [tl.start(id), tl.end(id)]) if (s > 0 && s < u) cuts.add(s);
  }
  const pts = [...cuts].sort((a, b) => a - b);
  let d = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    d += ((speedOf(c, baseCurrentAt(tl, c, a)) + speedOf(c, baseCurrentAt(tl, c, b))) / 2) * (b - a);
  }
  return d;
}

/** 조각 시계 처음부터 흐른 거리(월드). 주기를 넘어도 이어져 전자가 주기 경계에서 튀지 않는다. */
export function distance(tl: TimelineFrame, c: TransistorPrincipleConstants): number {
  return tl.cycle * distanceWithin(tl, c, tl.period) + distanceWithin(tl, c, tl.u);
}

// ------------------------------------------------------------------------
// 전자 자리
// ------------------------------------------------------------------------

/** 전자가 도는 길 — 이미터 왼쪽 끝에서 컬렉터 오른쪽 끝까지. 오른쪽으로 나간 전자는 왼쪽 전극에서 다시 들어온다. */
const PATH_LEN = COLLECTOR_X1 - EMITTER_X0;
/** 한 줄의 전자 수 — 길을 대략 `SLOT` 간격으로 나눈다. 간격은 길이에 맞춰 조금 늘거나 준다. */
export const PER_ROW = Math.max(1, Math.round(PATH_LEN / SLOT));
const GAP = PATH_LEN / PER_ROW;
/** 세로 흔들림 진동수를 가로와 어긋나게 하는 비 — 전자가 한 줄로 오르내리지 않게. */
const JITTER_Y_FREQ_RATIO = 1.3;
/** 길 양 끝(전극)에서 옅어지는 거리(월드). 나간 전자가 반대쪽 전극에서 다시 들어오는 이음매를 숨긴다. */
const END_FADE = 0.3;

export interface Electron {
  pos: Vec2;
  /** 0~1 — 베이스 안에 있으면 베이스가 열린 만큼만 보인다. */
  weight: number;
}

/** 0 이상 1 미만의 결정적 난수. 같은 (시드, 번호)는 언제나 같은 값이다 (S-sim). */
function hash01(seed: number, a: number, b: number): number {
  let h = (seed * 374761393 + a * 668265263 + b * 2246822519) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

/** 가운데 줄이 y = 0 인 줄 높이. */
export function rowY(r: number): number {
  return (r - (ROWS - 1) / 2) * ROW_GAP;
}

/**
 * 지금 전자들의 자리. 모두 같은 거리만큼 흘러 밀도는 그대로이고, 흐르는 빠르기만 전류를 따른다.
 * 베이스 안에 든 전자는 베이스가 열린 만큼만 보인다 — 베이스 전류가 없으면 베이스는 비어 있다.
 */
export function electrons(tl: TimelineFrame, c: TransistorPrincipleConstants): Electron[] {
  const s = distance(tl, c);
  const open = openness(tl, c);
  const out: Electron[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let k = 0; k < PER_ROW; k++) {
      const along = (((s + (k + r / ROWS) * GAP) % PATH_LEN) + PATH_LEN) % PATH_LEN;
      const ph = 2 * Math.PI * hash01(c.seed, r, k);
      const ph2 = 2 * Math.PI * hash01(c.seed + 1, r, k);
      const w = 2 * Math.PI * c.jitterHz * tl.t;
      const x = EMITTER_X0 + along + c.jitter * Math.sin(w + ph);
      const y = rowY(r) + c.jitter * Math.sin(w * JITTER_Y_FREQ_RATIO + ph2);
      const inBase = x > BASE_X0 && x < BASE_X1;
      const atEnd = Math.min(1, Math.min(along, PATH_LEN - along) / END_FADE);
      out.push({ pos: [x, y], weight: (inBase ? open : 1) * atEnd });
    }
  }
  return out;
}

/** 전류 막대 높이의 비 0~1 — 두 막대가 같은 눈금(꼭대기 = `collectorCurrentHigh`)을 쓴다. */
export function meterFraction(c: TransistorPrincipleConstants, current: number): number {
  if (c.collectorCurrentHigh <= 0) return 0;
  return Math.min(1, Math.max(0, current / c.collectorCurrentHigh));
}

/**
 * 전류값 글자 셋(0 · 낮음 · 높음)의 짙기. 같은 자리에서 글자를 갈아 끼우는 선언이 없어
 * 인스턴스 셋을 엇갈려 옅게 한다 (NOTES (c) G109).
 */
export function valueWeights(tl: TimelineFrame): { zero: number; low: number; high: number } {
  const low = tl.at('onIn') * (1 - tl.at('upIn'));
  const high = tl.at('upIn') * (1 - tl.at('offIn'));
  return { zero: Math.max(0, 1 - low - high), low, high };
}
