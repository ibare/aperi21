// ========================================================================
// time-dilation — 순수 물리
// ========================================================================
// 정지한 틀에서 잰다. t 는 지나가는 시계가 첫 정지 시계(x = 0) 옆에 선 순간부터
// 흐른 시각이고, 그 순간 두 시계가 모두 0 을 가리킨다.
//
//   지나가는 시계의 자리   x(t) = v · t          v = 간격 / 째깍 주기
//   정지 시계의 판독       t
//   지나가는 시계의 판독   τ = t / γ             γ = 1 / √(1 − β²)
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { BETA, CLOCK_SPACING, REST_CLOCKS, TICK_PERIOD, GAMMA_NUM, GAMMA_DEN } from './schema';
import type { TimeDilationState } from './state';

export interface TimeDilationConstants {
  /** v/c. */
  beta: number;
  /** 화면에 띄울 γ 의 분자 · 분모(선언값). */
  gammaNum: number;
  gammaDen: number;
  /** 한 째깍(바늘 한 바퀴)의 제 시간(초). */
  tickPeriod: number;
  /** 정지 시계 사이 간격(월드). */
  spacing: number;
  /** 정지 시계 개수. */
  restClocks: number;
}

export function readConstants(stage: StageDef): TimeDilationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    beta: c.beta ?? BETA,
    gammaNum: c.gammaNum ?? GAMMA_NUM,
    gammaDen: c.gammaDen ?? GAMMA_DEN,
    tickPeriod: c.tickPeriod ?? TICK_PERIOD,
    spacing: c.spacing ?? CLOCK_SPACING,
    restClocks: Math.max(2, Math.round(c.restClocks ?? REST_CLOCKS)),
  };
}

/** 로런츠 인자. 화면에 띄우지 않는다 — 띄우는 γ 는 문안의 선언값이다. */
export function lorentzGamma(beta: number): number {
  return 1 / Math.sqrt(1 - beta * beta);
}

/** 째깍을 세는 경계의 허용치(초). 3γ = 5 같은 경계가 부동소수로 조금 넘쳐도 센다. */
const COUNT_EPS = 1e-6;

/** 한 시각의 두 시계 판독과 쌓인 째깍 기록. */
export interface ClockFrame {
  /** 첫 정지 시계 옆에 선 순간부터 흐른 정지 틀 시각(초). 그 전은 음수. */
  t: number;
  /** 지나가는 시계의 자리(월드 x). */
  movingX: number;
  /** 정지 시계 바늘이 돈 바퀴 수 = t / 째깍 주기. */
  restTurns: number;
  /** 지나가는 시계 바늘이 돈 바퀴 수 = τ / 째깍 주기. */
  movingTurns: number;
  /** 정지 시계가 마지막으로 째깍인 뒤 흐른 시간(초). */
  restTickAge: number;
  /** 지나가는 시계가 마지막으로 째깍인 뒤 흐른 정지 틀 시간(초). */
  movingTickAge: number;
  /** 줄 옆을 지나는 동안 쌓인 정지 시계 째깍 수 (0 부터, 시작 전은 −1). */
  restCount: number;
  /** 줄 옆을 지나는 동안 쌓인 지나가는 시계 째깍 수 (0 부터, 시작 전은 −1). */
  movingCount: number;
  /** 지나가는 시계의 n 번째 째깍이 일어난 자리(월드 x) = n · γ · 간격. */
  movingTickX: (n: number) => number;
  gamma: number;
}

/** 음수에도 0 이상을 돌려주는 나머지. */
function mod(a: number, m: number): number {
  return ((a % m) + m) % m;
}

export function clockFrame(tl: TimelineFrame, c: TimeDilationConstants): ClockFrame {
  const gamma = lorentzGamma(c.beta);
  const t = tl.u - tl.start('pass');
  const speed = c.spacing / c.tickPeriod;
  const movingPeriod = gamma * c.tickPeriod;
  const lastClock = c.restClocks - 1;

  // 기록은 줄 옆을 지나는 동안(첫 시계 → 마지막 시계)만 쌓인다. 줄이 끝나면 견줄 시계가 없다.
  const restCount = t < -COUNT_EPS ? -1 : Math.min(lastClock, Math.floor(t / c.tickPeriod + COUNT_EPS));
  const movingLimit = Math.floor((lastClock * c.tickPeriod) / movingPeriod + COUNT_EPS);
  const movingCount = t < -COUNT_EPS ? -1 : Math.min(movingLimit, Math.floor(t / movingPeriod + COUNT_EPS));

  return {
    t,
    movingX: speed * t,
    restTurns: t / c.tickPeriod,
    movingTurns: t / movingPeriod,
    restTickAge: mod(t, c.tickPeriod),
    movingTickAge: mod(t, movingPeriod),
    restCount,
    movingCount,
    movingTickX: (n) => n * speed * movingPeriod,
    gamma,
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: TimeDilationState }): TimeDilationState {
  return params.state;
}
