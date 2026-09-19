// ========================================================================
// self-inductance — 순수 물리
// ========================================================================
// 스위치가 닫혀 있는 동안 전류는 I₀ = 전지 전압 ÷ 저항 으로 일정하고, 바뀌지 않으므로
// 코일 양 끝의 전압은 0 이다.
//
// 스위치를 끊는 순간(`open` 단계가 시작하는 순간)부터 전류는 끊는 시간 τ 로 지수로
// 줄어든다 — 벌어진 틈을 건너는 불꽃이 전류를 잠시 이어 나른다:
//   I(s) = I₀ · e^(−s/τ)
// 코일 전압의 크기는 인덕턴스 × 전류가 줄어드는 빠르기다:
//   |ε|(s) = L · |dI/ds| = (L · I₀ / τ) · e^(−s/τ)
// 끊는 순간 봉우리 L · I₀ / τ 로 뛰어오르고, 전류가 0 에 가까워지면 함께 사라진다.
//
// 모든 것이 시각의 함수라 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ARROW_SCALE,
  BREAK_SECONDS,
  CURRENT_SCALE,
  EMF,
  GRAPH_SECONDS,
  INDUCTANCE,
  RESISTANCE,
  SECONDS_TO_WORLD,
  SPARK_FULL,
  SPARK_REACH,
  VOLT_SCALE,
} from './schema';
import type { SelfInductanceState } from './state';

export interface SelfInductanceConstants {
  emf: number;
  resistance: number;
  inductance: number;
  breakSeconds: number;
  currentScale: number;
  voltScale: number;
  secondsToWorld: number;
  graphSeconds: number;
  arrowScale: number;
  sparkReach: number;
  sparkFull: number;
}

export function readConstants(stage: StageDef): SelfInductanceConstants {
  const c = stage.constants ?? {};
  return {
    emf: c.emf ?? EMF,
    resistance: c.resistance ?? RESISTANCE,
    inductance: c.inductance ?? INDUCTANCE,
    breakSeconds: c.breakSeconds ?? BREAK_SECONDS,
    currentScale: c.currentScale ?? CURRENT_SCALE,
    voltScale: c.voltScale ?? VOLT_SCALE,
    secondsToWorld: c.secondsToWorld ?? SECONDS_TO_WORLD,
    graphSeconds: c.graphSeconds ?? GRAPH_SECONDS,
    arrowScale: c.arrowScale ?? ARROW_SCALE,
    sparkReach: c.sparkReach ?? SPARK_REACH,
    sparkFull: c.sparkFull ?? SPARK_FULL,
  };
}

/** 스위치가 닫혀 있을 때의 일정한 전류(A). */
export function steadyCurrent(c: SelfInductanceConstants): number {
  return c.emf / c.resistance;
}

/** 끊는 순간 코일 전압의 봉우리(V) = L · I₀ / τ. */
export function peakVoltage(c: SelfInductanceConstants): number {
  return (c.inductance * steadyCurrent(c)) / c.breakSeconds;
}

/** 끊는 순간 — 주기 안 시각. `open` 단계가 시작하는 때다. */
export function breakTime(tl: TimelineFrame): number {
  return tl.start('open');
}

/** 기록이 끝나는 시각 — 꺼짐 단계가 끝나는 때. 그 뒤(`close`)는 기록을 지운다. */
export function recordEnd(tl: TimelineFrame): number {
  return tl.end('off');
}

/** 주기 안 시각 u 의 전류(A). 끊기 전에는 일정하고, 끊은 뒤에는 지수로 줄어든다. */
export function currentAt(u: number, tl: TimelineFrame, c: SelfInductanceConstants): number {
  const s = u - breakTime(tl);
  const i0 = steadyCurrent(c);
  return s < 0 ? i0 : i0 * Math.exp(-s / c.breakSeconds);
}

/** 주기 안 시각 u 의 코일 전압 크기(V). 전류가 일정하면 0, 끊은 뒤에는 봉우리에서 지수로 줄어든다. */
export function coilVoltageAt(u: number, tl: TimelineFrame, c: SelfInductanceConstants): number {
  const s = u - breakTime(tl);
  return s < 0 ? 0 : peakVoltage(c) * Math.exp(-s / c.breakSeconds);
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: SelfInductanceState }): SelfInductanceState {
  return params.state;
}
