// ========================================================================
// mass-spring-system — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 시각의 함수이고, `step` 은 항등이다.
//
//   x(τ) = A · cos(ω τ),  ω = √(k/m),  T = 2π/ω
//
// 진폭 A 는 x 의 크기만 바꾸고 T 에는 들어가지 않는다. 질량이 네 배면 T 가 두 배다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  AMPLITUDE,
  HEAVY_MASS,
  LIGHT_MASS,
  LIGHT_SIDE,
  SPRING_K,
  WIDE_AMPLITUDE,
  type LaneDef,
} from './schema';
import type { MassSpringSystemState } from './state';

export interface MassSpringSystemConstants {
  springK: number;
  lightMass: number;
  heavyMass: number;
  amplitude: number;
  wideAmplitude: number;
}

export function readConstants(stage: StageDef): MassSpringSystemConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    springK: c.springK ?? SPRING_K,
    lightMass: c.lightMass ?? LIGHT_MASS,
    heavyMass: c.heavyMass ?? HEAVY_MASS,
    amplitude: c.amplitude ?? AMPLITUDE,
    wideAmplitude: c.wideAmplitude ?? WIDE_AMPLITUDE,
  };
}

/** 주기 끝과 흔들림 단계 끝이 부동소수로 어긋나도 「돌아왔다」 로 세는 허용(s). */
const RETURN_TOLERANCE = 0.02;

/** 흔들림 시계 — 셋을 놓은 순간부터 흐른 물리 시간(s). */
export interface SwingClock {
  /** 놓은 뒤 흐른 시간. 붙잡혀 있는 동안은 음수이거나 흔들림 길이를 넘는다. */
  since: number;
  /** 흔들림 단계 전체 길이. 이 안에서만 추가 움직인다. */
  total: number;
}

export function swingClock(tl: TimelineFrame): SwingClock {
  const start = tl.start('swingA');
  return { since: tl.u - start, total: tl.end('swingB') - start };
}

export interface LaneReading {
  /** 추 중심 x(월드). 쉬는 자리가 0. */
  x: number;
  /** 출발 자리(= 진폭). */
  release: number;
  /** 추 한 변(m). 넓이가 질량에 비례한다. */
  side: number;
  /** 지금까지 출발 자리로 돌아온 횟수. */
  returns: number;
  /** 가장 최근에 돌아온 뒤 흐른 시간(s). 돌아온 적이 없으면 없다. */
  sinceReturn?: number;
}

/**
 * 한 레인의 지금 값. 같은 시각은 언제나 같은 값이다.
 *
 * 추의 자리는 단계 진행도가 아니라 **물리 시계**로 계산한다 — 진행도로 늘이면
 * 가벼운 추 · 무거운 추의 주기 비가 단계 길이에 묻혀 주장이 선언값에 기대게 된다.
 */
export function readLane(
  lane: LaneDef,
  c: MassSpringSystemConstants,
  clock: SwingClock,
): LaneReading {
  const m = c[lane.mass];
  const A = c[lane.amplitude];
  const omega = Math.sqrt(c.springK / m);
  const period = (2 * Math.PI) / omega;
  const tau = Math.min(Math.max(clock.since, 0), clock.total);
  const moving = clock.since > 0 && clock.since < clock.total;

  const returns = Math.floor((tau + RETURN_TOLERANCE) / period);
  const lastReturn = Math.min(returns * period, clock.total);
  const sinceReturn = returns > 0 ? clock.since - lastReturn : undefined;

  return {
    x: moving ? A * Math.cos(omega * tau) : A,
    release: A,
    side: LIGHT_SIDE * Math.sqrt(m / c.lightMass),
    returns,
    sinceReturn,
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시계의 함수다. */
export function step(params: { state: MassSpringSystemState }): MassSpringSystemState {
  return params.state;
}
