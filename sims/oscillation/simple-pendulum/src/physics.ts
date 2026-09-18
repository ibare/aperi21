// ========================================================================
// simple-pendulum — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 진행도의 함수이고, `step` 은 항등이다.
//
// 작은 진폭의 단진자는 조화 진동이다.
//
//   θ(t) = θ₀ · cos(2π t / T),   T = 2π √(L / g)
//
// 식에 질량이 없다. 이 조각의 주장이 여기서 나온다 — 줄이 네 배면 T 는 두 배이고,
// 질량을 몇 배로 해도 T 는 그대로다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { AMPLITUDE, G, LENGTH_RATIO, MASS_RATIO, SHORT_LENGTH } from './schema';
import type { SimplePendulumState } from './state';

export interface SimplePendulumConstants {
  g: number;
  shortLength: number;
  lengthRatio: number;
  amplitude: number;
  /** 이름표만 읽는다. 주기 계산에는 들어가지 않는다 — 그것이 주장이다. */
  massRatio: number;
}

export function readConstants(stage: StageDef): SimplePendulumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    g: c.g ?? G,
    shortLength: c.shortLength ?? SHORT_LENGTH,
    lengthRatio: c.lengthRatio ?? LENGTH_RATIO,
    amplitude: c.amplitude ?? AMPLITUDE,
    massRatio: c.massRatio ?? MASS_RATIO,
  };
}

/** 한 주기(초). 질량을 받지 않는다. */
export function period(length: number, g: number): number {
  return 2 * Math.PI * Math.sqrt(length / g);
}

/** 단계 경계에 떨어지는 부동소수 오차 — 네 번째 왕복이 끝나는 순간을 놓치지 않게. */
const COUNT_EPS = 1e-6;

export interface PendulumReading {
  /** 줄이 연직에서 벗어난 각(rad). 놓는 쪽이 양. */
  theta: number;
  /** 매단 자리에 대한 추 중심(월드). */
  bob: Vec2;
  /** 놓은 자리(추 중심, 매단 자리 기준). 섬광이 이 자리에서 터진다. */
  release: Vec2;
  /** 지금까지 마친 왕복 수. */
  returns: number;
  /** 한 번 흔드는 동안(`swing1`+`swing2`) 마치게 될 왕복 수 — 횟수 점 줄의 폭을 정한다. */
  returnsPerCycle: number;
  /** 왕복을 마친 순간들로부터 흐른 시간(초) — 섬광의 나이. 마친 순서대로. */
  returnAges: number[];
}

/**
 * 진자 하나를 읽는다. **단계 경계는 선언이 정한다** — 흔드는 시계는 `swing1` · `swing2`
 * 의 진행도에 각 단계 길이를 곱해 잇는다(`at` 은 그 단계 전 0 · 동안 0~1 · 뒤 1).
 * `meet` 동안은 그 합에 멈춰 있으므로 추는 놓은 자리에 선다 — 흔드는 길이가 긴 주기의
 * 정수배로 선언되어 있어서다.
 *
 * 섬광의 나이는 멈추지 않는 주기 안 시각으로 잰다. 흔드는 시계로 재면 `meet` 동안
 * 나이가 멈춰 마지막 섬광이 사라지지 않는다.
 */
export function readPendulum(
  tl: TimelineFrame,
  length: number,
  c: SimplePendulumConstants,
): PendulumReading {
  const T = period(length, c.g);
  const swingTotal = tl.duration('swing1') + tl.duration('swing2');
  const tau = tl.at('swing1') * tl.duration('swing1') + tl.at('swing2') * tl.duration('swing2');
  const clock = tl.u - tl.start('swing1');

  const theta = c.amplitude * Math.cos((2 * Math.PI * tau) / T);
  const at = (a: number): Vec2 => [length * Math.sin(a), -length * Math.cos(a)];

  const returns = Math.floor(tau / T + COUNT_EPS);
  const returnAges: number[] = [];
  for (let k = 1; k <= returns; k++) returnAges.push(clock - k * T);

  return {
    theta,
    bob: at(theta),
    release: at(c.amplitude),
    returns,
    returnsPerCycle: Math.floor(swingTotal / T + COUNT_EPS),
    returnAges,
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: SimplePendulumState }): SimplePendulumState {
  return params.state;
}
