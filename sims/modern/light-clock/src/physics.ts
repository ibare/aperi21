// ========================================================================
// light-clock — 순수 물리
// ========================================================================
// 정지한 틀에서 잰다. s 는 두 시계에서 빛이 떠난 순간부터 흐른 시각이다.
//
//   빛의 빠르기            c = 거울 사이 / τ                (두 시계 모두)
//   정지한 시계의 빛       (0, 거울 사이 · 삼각파(s / τ))
//   움직이는 시계          x(s) = 발사 자리 + v · s          v = β c
//   움직이는 시계의 빛     (x(s), 거울 사이 · 삼각파(s / γτ))
//
// 움직이는 시계의 빛은 한 째깍 동안 가로 vγτ, 세로 cτ 를 가서 빗변 cγτ 를 간다 —
// 빠르기가 c 로 같다는 것이 곧 한 째깍이 γτ 라는 것이다. 모든 것이 시각의 함수라
// 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { BETA, GAMMA_DEN, GAMMA_NUM, MIRROR_GAP, START_X, TICK_PERIOD } from './schema';
import type { LightClockState } from './state';

export interface LightClockConstants {
  /** v/c. */
  beta: number;
  /** 화면에 띄울 γ 의 분자 · 분모(선언값). */
  gammaNum: number;
  gammaDen: number;
  /** 거울 사이(월드) = cτ. */
  mirrorGap: number;
  /** 정지한 빛 시계의 한 째깍(초) = τ. */
  tickPeriod: number;
  /** 움직이는 빛 시계가 빛을 쏘는 자리(월드 x). */
  startX: number;
}

export function readConstants(stage: StageDef): LightClockConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    beta: c.beta ?? BETA,
    gammaNum: c.gammaNum ?? GAMMA_NUM,
    gammaDen: c.gammaDen ?? GAMMA_DEN,
    mirrorGap: c.mirrorGap ?? MIRROR_GAP,
    tickPeriod: c.tickPeriod ?? TICK_PERIOD,
    startX: c.startX ?? START_X,
  };
}

/** 로런츠 인자. 화면에 띄우지 않는다 — 띄우는 γ 는 문안의 선언값이다. */
export function lorentzGamma(beta: number): number {
  return 1 / Math.sqrt(1 - beta * beta);
}

/** 0 → 1 → 0 을 되풀이하는 삼각파. 거울 사이를 오가는 빛의 높이 비다. */
function bounce(phase: number): number {
  const f = ((phase % 2) + 2) % 2;
  return f <= 1 ? f : 2 - f;
}

/** 마지막으로 거울에 닿은 뒤 흐른 시간(초). 아직 한 번도 닿지 않았으면 없다. */
function lastHitAge(s: number, period: number): number | undefined {
  if (s < period) return undefined;
  return s - Math.floor(s / period) * period;
}

/** 한 시각의 두 빛 시계와 작도에 쓸 점들. */
export interface ClockFrame {
  /** 빛이 떠난 순간부터 흐른 정지 틀 시각(초). 그 전은 음수. */
  s: number;
  /** 움직이는 빛 시계의 가운데 x. */
  movingX: number;
  /** 정지한 시계의 빛 높이. */
  restPulseY: number;
  /** 움직이는 시계의 빛 자리. */
  movingPulse: Vec2;
  /** 정지한 시계가 마지막으로 째깍인 뒤 흐른 시간. 아직이면 없다. */
  restHitAge: number | undefined;
  /** 정지한 시계의 빛이 마지막으로 닿은 거울 높이. */
  restHitY: number;
  /** 움직이는 시계의 빛이 마지막으로 닿은 자리. */
  movingHitPos: Vec2;
  /** 움직이는 시계가 마지막으로 째깍인 뒤 흐른 시간. 아직이면 없다. */
  movingHitAge: number | undefined;
  /** 움직이는 시계의 한 째깍 = γτ. */
  movingTick: number;
  /** 삼각형의 세 꼭짓점 — 발사 자리 · 위 거울에 닿은 자리 · 그 발(아래 거울 높이). */
  start: Vec2;
  top: Vec2;
  foot: Vec2;
  /** 정지한 시계가 째깍인 순간(s = τ) 움직이는 시계의 빛 자리 — 빗변 위 발사 자리에서 cτ. */
  sameInstant: Vec2;
  /** 움직이는 시계의 빛이 지금까지 간 첫 길(발사 자리 → 지금, 위 거울에 닿으면 멈춤). */
  pathSoFar: Vec2;
  gamma: number;
}

export function clockFrame(tl: TimelineFrame, c: LightClockConstants): ClockFrame {
  const gamma = lorentzGamma(c.beta);
  const s = tl.u - tl.start('rise');
  const light = c.mirrorGap / c.tickPeriod;
  const v = c.beta * light;
  const movingTick = gamma * c.tickPeriod;

  const start: Vec2 = [c.startX, 0];
  const top: Vec2 = [c.startX + v * movingTick, c.mirrorGap];
  const foot: Vec2 = [top[0], 0];
  const sOnSlant = (t: number): Vec2 => [c.startX + v * t, (c.mirrorGap * t) / movingTick];
  const firstLeg = Math.min(Math.max(s, 0), movingTick);

  const restHits = Math.floor(Math.max(s, 0) / c.tickPeriod);
  const movingHits = Math.floor(Math.max(s, 0) / movingTick);
  const movingHitT = movingHits * movingTick;

  return {
    s,
    restHitY: restHits % 2 === 1 ? c.mirrorGap : 0,
    movingHitPos: [c.startX + v * movingHitT, movingHits % 2 === 1 ? c.mirrorGap : 0],
    movingX: c.startX + v * s,
    restPulseY: c.mirrorGap * bounce(Math.max(s, 0) / c.tickPeriod),
    movingPulse: [c.startX + v * s, c.mirrorGap * bounce(Math.max(s, 0) / movingTick)],
    restHitAge: lastHitAge(s, c.tickPeriod),
    movingHitAge: lastHitAge(s, movingTick),
    movingTick,
    start,
    top,
    foot,
    sameInstant: sOnSlant(c.tickPeriod),
    pathSoFar: sOnSlant(firstLeg),
    gamma,
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: LightClockState }): LightClockState {
  return params.state;
}
