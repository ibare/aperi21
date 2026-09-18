// ========================================================================
// twin-paradox — 순수 물리
// ========================================================================
// 지구 틀에서 잰다. 가로 x(광년), 세로 ct(년), c = 1.
//
//   돌아서는 시각         Th = 거리 / β
//   여행자의 자리         X(T) = β T              (T ≤ Th)
//                         X(T) = β (2Th − T)      (T > Th)
//   두 쌍둥이의 제 시간   지구 T,  여행자 T √(1 − β²)
//
// 여행자의 「지금」 선(그 틀의 동시선)은 기울기 ±β 로 여행자 자리에서 지구 세계선(x = 0)
// 까지 긋는다. 닿는 높이는
//
//   가는 길   ct = T − β X = T (1 − β²)
//   오는 길   ct = T + β X = T + β² (2Th − T)
//
// 돌아서는 순간(T = Th) 두 식이 Th(1 − β²) 와 Th(1 + β²) 로 갈린다 — 그 사이가 여행자의
// 「지금」 이 건너뛰는 지구 세계선의 토막이다. 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { BETA, DISTANCE, TICK_YEARS } from './schema';
import type { TwinParadoxState } from './state';

export interface TwinParadoxConstants {
  /** v/c. */
  beta: number;
  /** 돌아서는 곳까지의 거리(광년). */
  distance: number;
  /** 세계선 위 점 하나가 뜻하는 제 시간(년). */
  tickYears: number;
}

export function readConstants(stage: StageDef): TwinParadoxConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    beta: c.beta ?? BETA,
    distance: c.distance ?? DISTANCE,
    tickYears: c.tickYears ?? TICK_YEARS,
  };
}

/** 부동소수 끝자리 때문에 정수 햇수를 하나 덜 세지 않도록 더하는 여유. 수 표시가 아니라 셈의 문턱이다. */
const COUNT_EPS = 1e-9;

/** 여행의 뼈대 — 시각과 무관한 세 사건과 비율. */
export interface Trip {
  /** 돌아서는 지구 틀 시각(년). */
  turnT: number;
  /** 다시 만나는 지구 틀 시각(년). */
  meetT: number;
  /** 여행자의 제 시간 / 지구 틀 시간 = √(1 − β²). */
  rate: number;
  depart: Vec2;
  turn: Vec2;
  meet: Vec2;
  /** 돌아서기 직전 · 직후 「지금」 선이 지구 세계선에 닿는 높이. 그 사이가 건너뛰는 토막이다. */
  skipFrom: number;
  skipTo: number;
}

export function trip(c: TwinParadoxConstants): Trip {
  const turnT = c.distance / c.beta;
  const b2 = c.beta * c.beta;
  return {
    turnT,
    meetT: 2 * turnT,
    rate: Math.sqrt(1 - b2),
    depart: [0, 0],
    turn: [c.distance, turnT],
    meet: [0, 2 * turnT],
    skipFrom: turnT * (1 - b2),
    skipTo: turnT * (1 + b2),
  };
}

/** 지구 틀 시각 T 에서 여행자의 자리. */
export function travelerAt(T: number, c: TwinParadoxConstants, tr: Trip): Vec2 {
  const x = T <= tr.turnT ? c.beta * T : c.beta * (tr.meetT - T);
  return [x, T];
}

/**
 * 여행자의 「지금」 선이 지구 세계선에 닿는 높이. `leg` 는 여행자가 어느 틀에 있는지다 —
 * 돌아서는 자리(T = Th)에서는 두 틀의 답이 다르므로 시각만으로 정하지 않는다.
 */
export function nowHit(T: number, leg: 'out' | 'back', c: TwinParadoxConstants, tr: Trip): number {
  const b2 = c.beta * c.beta;
  return leg === 'out' ? T * (1 - b2) : T + b2 * (tr.meetT - T);
}

/** 제 시간 τ(년)까지 지나온 해마다의 점 개수(0 해 포함하지 않음). */
export function yearsCounted(tau: number, tickYears: number): number {
  return Math.floor(tau / tickYears + COUNT_EPS);
}

/** 한 시각의 두 쌍둥이 · 「지금」 선 · 건너뛴 토막. */
export interface TwinFrame {
  /** 지구 틀 시각(년). */
  T: number;
  /** 여행자가 지금 있는 틀. `turn` 동안은 돌아서기 전 틀로 둔다(`swing` 이 돈 정도). */
  leg: 'out' | 'back';
  earthHead: Vec2;
  travelerHead: Vec2;
  /** 두 쌍둥이의 제 시간(년). */
  earthTau: number;
  travelerTau: number;
  /** 여행자의 「지금」 선이 지구 세계선에 닿는 높이. `turn` 동안은 건너뛰는 토막 위를 오른다. */
  hit: number;
  /** 돌아서는 동안 「지금」 선이 돈 정도 0~1. 돌아서기 전 0, 뒤 1. */
  swing: number;
}

export function twinFrame(tl: TimelineFrame, c: TwinParadoxConstants, tr: Trip): TwinFrame {
  const swing = tl.at('turn');
  const T = tr.turnT * (tl.at('out') + tl.at('back'));
  const leg: 'out' | 'back' = tl.at('back') > 0 ? 'back' : 'out';
  const turning = tl.at('out') >= 1 && tl.at('back') <= 0;
  const hit = turning ? tr.skipFrom + (tr.skipTo - tr.skipFrom) * swing : nowHit(T, leg, c, tr);
  return {
    T,
    leg,
    earthHead: [0, T],
    travelerHead: travelerAt(T, c, tr),
    earthTau: T,
    travelerTau: T * tr.rate,
    hit,
    swing,
  };
}

/** 여행자의 생일마다 남는 「지금」 선 하나 — 여행자 자리에서 지구 세계선의 닿는 자리까지. */
export interface NowLine {
  from: Vec2;
  to: Vec2;
}

/**
 * 제 시간 τ 까지 지나온 여행자의 생일마다의 「지금」 선. 돌아서는 생일(τ 가 돌아서는
 * 순간과 겹치는 해)은 가는 길의 선만 남긴다 — 오는 길의 선은 `turn` 이 쓸고 간 쐐기의
 * 위 변이 된다.
 */
export function birthdayLines(tau: number, c: TwinParadoxConstants, tr: Trip): NowLine[] {
  const out: NowLine[] = [];
  const n = yearsCounted(tau, c.tickYears);
  const turnTau = tr.turnT * tr.rate;
  for (let k = 1; k <= n; k++) {
    const tk = k * c.tickYears;
    const T = tk / tr.rate;
    const leg: 'out' | 'back' = tk <= turnTau + COUNT_EPS ? 'out' : 'back';
    const from = travelerAt(T, c, tr);
    out.push({ from, to: [0, nowHit(T, leg, c, tr)] });
  }
  return out;
}

/** 세계선 위 해마다의 점. 제 시간 τ 까지 지나온 것만. */
export function earthTicks(tau: number, c: TwinParadoxConstants): Vec2[] {
  const n = yearsCounted(tau, c.tickYears);
  return Array.from({ length: n + 1 }, (_, k) => [0, k * c.tickYears] as Vec2);
}

export function travelerTicks(tau: number, c: TwinParadoxConstants, tr: Trip): Vec2[] {
  const n = yearsCounted(tau, c.tickYears);
  return Array.from({ length: n + 1 }, (_, k) => travelerAt((k * c.tickYears) / tr.rate, c, tr));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: TwinParadoxState }): TwinParadoxState {
  return params.state;
}
