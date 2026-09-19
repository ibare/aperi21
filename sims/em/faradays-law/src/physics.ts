// ========================================================================
// faradays-law — 순수 물리
// ========================================================================
// 자석 중심과 코일 한가운데 사이의 거리를 d 라 하면 한 고리를 지나는 선속은
//   Φ(d) = Φ₀ / (1 + (d/a)²)^(3/2)
// 이고, 자석을 속력 s 로 밀면 코일 전체의 전압 크기는
//   V = N · |dΦ/dd| · s
// 다. 같은 거리를 밀므로 선속이 바뀌는 양은 같고, 빨리 밀면 같은 변화가 짧은
// 시간에 몰려 봉우리가 높고 좁아진다. 자석이 멈추면(s = 0) V = 0 이다.
//
// 모든 것이 시각의 함수라 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ARROW_SCALE,
  FLUX_PEAK,
  FLUX_WIDTH,
  GRAPH_SECONDS,
  SECONDS_TO_WORLD,
  SPEED_RATIO,
  TRAVEL,
  TURNS,
  TURNS_RATIO,
  V_SLOW,
  VOLT_SCALE,
} from './schema';
import type { FaradaysLawState } from './state';

export interface FaradaysLawConstants {
  vSlow: number;
  speedRatio: number;
  turns: number;
  turnsRatio: number;
  fluxPeak: number;
  fluxWidth: number;
  voltScale: number;
  secondsToWorld: number;
  graphSeconds: number;
  arrowScale: number;
}

export function readConstants(stage: StageDef): FaradaysLawConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    vSlow: c.vSlow ?? V_SLOW,
    speedRatio: c.speedRatio ?? SPEED_RATIO,
    turns: c.turns ?? TURNS,
    turnsRatio: c.turnsRatio ?? TURNS_RATIO,
    fluxPeak: c.fluxPeak ?? FLUX_PEAK,
    fluxWidth: c.fluxWidth ?? FLUX_WIDTH,
    voltScale: c.voltScale ?? VOLT_SCALE,
    secondsToWorld: c.secondsToWorld ?? SECONDS_TO_WORLD,
    graphSeconds: c.graphSeconds ?? GRAPH_SECONDS,
    arrowScale: c.arrowScale ?? ARROW_SCALE,
  };
}

/** 한 판 — 시간표 단계 이름의 머리와, 그 판의 속력 · 감은 수. */
export interface Round {
  /** 시간표 단계 id 의 머리(`slow` → `slow-in` · `slow-push` · `slow-rest` · `slow-out`). */
  id: 'slow' | 'fast' | 'turns';
  /** 미는 속력(월드/초). */
  speed: number;
  /** 감은 수. */
  turns: number;
  /** 마지막 단계 id — 자석이 사라지기 시작하는 단계. 마지막 판은 모두가 흐려지는 `clear`. */
  outPhase: string;
  /**
   * 봉우리 이름표 자리. 빠른 판의 봉우리는 마지막 판 자취가 바로 위로 지나가므로
   * 위에 두면 가려진다 — 오른쪽(이미 0 으로 떨어진 자리)에 둔다.
   */
  labelSide: 'above' | 'right';
}

/**
 * 세 판. 판의 수와 순서는 시간표 단계 id 와 짝을 이루어 코드에 있다 (장부 G105 —
 * 스테이지 상수로 목록을 선언할 수 없다). 판마다의 값은 스테이지 상수에서 온다.
 */
export function rounds(c: FaradaysLawConstants): Round[] {
  const fast = c.vSlow * c.speedRatio;
  return [
    { id: 'slow', speed: c.vSlow, turns: c.turns, outPhase: 'slow-out', labelSide: 'above' },
    { id: 'fast', speed: fast, turns: c.turns, outPhase: 'fast-out', labelSide: 'right' },
    { id: 'turns', speed: fast, turns: c.turns * c.turnsRatio, outPhase: 'clear', labelSide: 'above' },
  ];
}

/** 선속의 거리 도함수 크기 |dΦ/dd|. 자석이 코일 쪽으로 올 때(d < 0) 선속이 커진다. */
export function fluxSlope(d: number, c: FaradaysLawConstants): number {
  const s = d / c.fluxWidth;
  return (c.fluxPeak * 3 * Math.abs(s)) / c.fluxWidth / Math.pow(1 + s * s, 2.5);
}

/** 밀기 시작 뒤 τ 초에 자석이 있는 자리(코일 한가운데 기준 d)와 속력. 한가운데에서 멈춘다. */
export function magnetAfter(tau: number, round: Round): { d: number; speed: number } {
  const stopAt = TRAVEL / round.speed;
  const s = Math.min(Math.max(0, tau), stopAt);
  return { d: -TRAVEL + round.speed * s, speed: tau > 0 && tau < stopAt ? round.speed : 0 };
}

/** 밀기 시작 뒤 τ 초의 전압 크기(임의 단위). 멈춘 뒤에는 0. */
export function voltageAfter(tau: number, round: Round, c: FaradaysLawConstants): number {
  const m = magnetAfter(tau, round);
  return round.turns * fluxSlope(m.d, c) * m.speed;
}

/**
 * 봉우리 — 선속 기울기가 가장 가파른 자리(d = −a/2)를 지나는 순간과 그때의 전압.
 * 봉우리 이름표를 자취 꼭대기에 붙이는 데 쓴다.
 */
export function peakOf(round: Round, c: FaradaysLawConstants): { tau: number; volt: number } {
  const d = -c.fluxWidth / 2;
  return { tau: (d + TRAVEL) / round.speed, volt: round.turns * fluxSlope(d, c) * round.speed };
}

/** 지금 주기 안에서 이 판의 밀기가 시작된 뒤 흐른 시간(초). 시작 전이면 음수. */
export function sincePush(tl: TimelineFrame, round: Round): number {
  return tl.u - tl.start(`${round.id}-push`);
}

/**
 * 이 판의 자취가 기록된 길이(초). 멈춤 단계가 끝나면 더 자라지 않고, 기록지 폭을
 * 넘지 않는다.
 */
export function recordedSeconds(tl: TimelineFrame, round: Round, c: FaradaysLawConstants): number {
  const until = tl.end(`${round.id}-rest`) - tl.start(`${round.id}-push`);
  return Math.min(Math.max(0, sincePush(tl, round)), until, c.graphSeconds);
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: FaradaysLawState }): FaradaysLawState {
  return params.state;
}
