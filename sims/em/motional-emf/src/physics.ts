// ========================================================================
// motional-emf — 순수 물리
// ========================================================================
// 막대가 속력 v 로 오른쪽으로, 자기장 B 는 종이 안(⊗)으로. 막대 속 전하 q 가 받는
// 힘은 q v × B 다. 전자(q < 0)는 막대를 따라 **아래로** 밀린다. 전자가 아래 끝에
// 쌓이면 위 끝에는 짝을 잃은 이온(+)이 남고, 그 둘이 만드는 전기장이 밀림과 맞서는
// 곳에서 몰림이 멈춘다. 그때 막대 속 전기장이 vB 이므로 양 끝 전압은 BLv — 몰린
// 전하의 양도 v 에 비례한다. 속이 고른 채로 전하는 양 끝에만 모인다.
//
// 모든 것이 시각의 함수라 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ARROW_SCALE,
  FORCE_SCALE,
  ION_ROWS,
  PILE_SLOW,
  SPEED_RATIO,
  TRAVEL,
  V_SLOW,
} from './schema';
import type { MotionalEmfState } from './state';

export interface MotionalEmfConstants {
  vSlow: number;
  speedRatio: number;
  travel: number;
  pileSlow: number;
  ionRows: number;
  arrowScale: number;
  forceScale: number;
}

export function readConstants(stage: StageDef): MotionalEmfConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    vSlow: c.vSlow ?? V_SLOW,
    speedRatio: c.speedRatio ?? SPEED_RATIO,
    travel: c.travel ?? TRAVEL,
    pileSlow: c.pileSlow ?? PILE_SLOW,
    ionRows: c.ionRows ?? ION_ROWS,
    arrowScale: c.arrowScale ?? ARROW_SCALE,
    forceScale: c.forceScale ?? FORCE_SCALE,
  };
}

/** 한 판 — 시간표 단계 이름의 머리와 그 판의 속력. */
export interface Round {
  /** 시간표 단계 id 의 머리(`slow` → `slow-in` · `slow-build` · …). */
  id: 'slow' | 'fast';
  /** 막대 속력(월드/초). */
  speed: number;
  /** 느린 판 대비 배수. 느린 판은 1 이고 이름표에 배수를 달지 않는다. */
  times: number;
}

/**
 * 두 판. 판의 수와 순서는 시간표 단계 id 와 짝을 이루어 코드에 있다 (장부 G105).
 * 판마다의 값은 스테이지 상수에서 온다.
 */
export function rounds(c: MotionalEmfConstants): Round[] {
  return [
    { id: 'slow', speed: c.vSlow, times: 1 },
    { id: 'fast', speed: c.vSlow * c.speedRatio, times: c.speedRatio },
  ];
}

/**
 * 아래 끝에 몰리는 전자 수. 몰린 전하는 막대 속 전기장 vB 에 비례한다 — 느린 판의
 * 선언값에 속력 비를 곱한다. 이온 줄 수를 넘을 수 없다.
 */
export function pileOf(round: Round, c: MotionalEmfConstants): number {
  return Math.min(c.ionRows, Math.round(c.pileSlow * (round.speed / c.vSlow)));
}

/** 이번 주기에 이 판의 막대가 움직이기 시작한 뒤 흐른 시간(초). 시작 전이면 음수. */
export function sinceStart(tl: TimelineFrame, round: Round): number {
  return tl.u - tl.start(`${round.id}-build`);
}

/**
 * 막대가 출발 자리에서 간 거리(월드)와 지금 속력. 거리 `travel` 에서 멈춘다.
 */
export function rodAfter(tau: number, round: Round, c: MotionalEmfConstants): { s: number; speed: number } {
  const stopAt = c.travel / round.speed;
  const t = Math.min(Math.max(0, tau), stopAt);
  return { s: round.speed * t, speed: tau > 0 && tau < stopAt ? round.speed : 0 };
}

/**
 * 전자가 몰린 정도 0~1. 달리기 시작하며 몰리고(`*-build`), 멈추면 풀린다(`*-relax`).
 * 사이 단계에서는 1 로 머문다.
 */
export function separation(tl: TimelineFrame, round: Round): number {
  return tl.at(`${round.id}-build`) * (1 - tl.at(`${round.id}-relax`));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: MotionalEmfState }): MotionalEmfState {
  return params.state;
}
