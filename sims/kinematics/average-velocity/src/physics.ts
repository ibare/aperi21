// ========================================================================
// average-velocity — 순수 물리
// ========================================================================
// 운동은 고정이다: 8 m/s 로 4 초 → 2 초 정지 → −5 m/s 로 되돌아옴. 움직이는 것은
// 구간 [a, b] 뿐이다.
// ========================================================================

import type { TimelineEase } from '@aperi21/schema';

import {
  averageVelocitySchema,
  BACK_SPEED,
  END_FROM,
  RUN_END,
  RUN_SPEED,
  SMOOTH_SAMPLES,
  SMOOTH_WIDTH,
  START_TO,
  STOP_END,
  T_MAX,
} from './schema';
import type { AverageVelocityState, IntervalReadout } from './state';

// ------------------------------------------------------------------------
// 운동
// ------------------------------------------------------------------------

/** 꺾인 위치 (모서리가 날카로운 원본). 기준: x(0) = 0. */
function positionSharp(tau: number): number {
  if (tau <= RUN_END) return RUN_SPEED * tau;
  if (tau <= STOP_END) return RUN_SPEED * RUN_END;
  return RUN_SPEED * RUN_END - BACK_SPEED * (tau - STOP_END);
}

/**
 * 위치 x(τ). 속도가 순간에 바뀌지 않도록 폭 1 초 상자 평균으로 모서리만 둥글린다.
 * 직선 구간에서는 상자 평균이 원래 값과 정확히 같으므로 8.0 · 32 · 12 같은 수가 남는다.
 */
export function position(tau: number): number {
  let sum = 0;
  for (let i = 0; i < SMOOTH_SAMPLES; i++) {
    sum += positionSharp(tau - SMOOTH_WIDTH / 2 + ((i + 0.5) * SMOOTH_WIDTH) / SMOOTH_SAMPLES);
  }
  return sum / SMOOTH_SAMPLES;
}

// ------------------------------------------------------------------------
// 구간 — 시간표 단계의 진행도에서
// ------------------------------------------------------------------------

export interface Interval {
  /** 시작 시각(초). */
  a: number;
  /** 끝 시각(초). */
  b: number;
}

/**
 * 단계 진행도(이징 적용, 전 0 · 뒤 1)에서 구간을 만든다. scene 은 엔진의
 * `timeline.at` 을, `step` 은 아래 `phaseProgress` 를 넘긴다 — 식은 여기 하나다.
 */
export function intervalFrom(at: (phase: string) => number): Interval {
  const back = at('back');
  return {
    a: START_TO * at('start') * (1 - back),
    b: END_FROM + (T_MAX - END_FROM) * (at('end') - back),
  };
}

const EASES: Record<TimelineEase, (x: number) => number> = {
  linear: (x) => x,
  smooth: (x) => x * x * (3 - 2 * x),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};

/**
 * 시계 `t` 에서 단계 진행도 읽개. **엔진의 `TimelineFrame.at` 을 다시 센 것이다** —
 * `step` 은 시간표 값을 받지 못하는데 캡션의 수는 state 에 있어야 해서다 (NOTES
 * 「어휘 부족」). 단계 길이·이징은 선언(`schema.timeline`)에서 읽어 상수를 두지 않는다.
 */
export function phaseProgress(t: number): (phase: string) => number {
  const phases = averageVelocitySchema.timeline?.phases ?? [];
  const period = phases.reduce((sum, p) => sum + p.duration, 0);
  const u = period > 0 ? t - Math.floor(t / period) * period : 0;
  return (id) => {
    let start = 0;
    for (const p of phases) {
      if (p.id === id) {
        const x = Math.min(1, Math.max(0, (u - start) / p.duration));
        return EASES[p.ease ?? 'linear'](x);
      }
      start += p.duration;
    }
    throw new Error(`average-velocity: 없는 단계 '${id}'`);
  };
}

// ------------------------------------------------------------------------
// 수 표기 — 화면에 쓴 수끼리 산수가 맞도록
// ------------------------------------------------------------------------

/** 정수로 반올림한다. 음수도 절댓값으로 반올림해 −79.5 가 −79 가 되지 않게. */
function roundHalfAway(v: number): number {
  const r = Math.sign(v) * Math.round(Math.abs(v));
  return r === 0 ? 0 : r;
}

/** 10분의 1 단위 정수로 반올림한다. */
function tenths(v: number): number {
  return roundHalfAway(v * 10);
}

/** 10분의 1 정수를 소수 한 자리 문자열로. 음수 부호는 수식 빼기표(−)다. */
function format(n: number): string {
  return (n / 10).toFixed(1).replace('-', '−');
}

/**
 * 구간의 캡션 수. **화면에 쓸 자릿수에서 역산한다** — 구간 시각을 먼저 소수 한 자리로
 * 정하고, 위치 변화도 그 시각에서 재고, 나눗셈은 10분의 1 정수끼리 한다. 원본은 부동
 * 소수 값을 반올림해 나눠 화면의 산수가 어긋나는 경우(7.9 ≠ 8)가 있었다.
 */
export function readoutOf(interval: Interval): IntervalReadout {
  const from = tenths(interval.a);
  const to = tenths(interval.b);
  const dt = to - from;
  const dx = tenths(position(to / 10) - position(from / 10));
  // 10분의 1 정수끼리 나누면 몫에 10 을 곱해도 정확하다 — 318 × 10 ÷ 40 = 79.5 → 8.0.
  const v = dt > 0 ? roundHalfAway((dx * 10) / dt) : 0;
  return { from: format(from), to: format(to), dx: format(dx), dt: format(dt), v: format(v) };
}

export function readoutAt(t: number): IntervalReadout {
  return readoutOf(intervalFrom(phaseProgress(t)));
}

// ------------------------------------------------------------------------
// step
// ------------------------------------------------------------------------

/** 시계를 쌓고 캡션 수를 그 시각으로 다시 쓴다. 그림은 state 를 읽지 않는다. */
export function step(params: { state: AverageVelocityState; dt: number }): AverageVelocityState {
  const t = params.state.t + params.dt;
  return { t, readout: readoutAt(t) };
}
