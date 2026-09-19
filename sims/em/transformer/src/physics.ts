// ========================================================================
// transformer — 순수 물리
// ========================================================================
// 1차 코일에 교류 전압 V₁ = V₀ sin ωt 를 건다. 1차 코일의 N₁ 바퀴가 함께 이 전압을
// 이루므로 한 바퀴가 맡는 몫은 V₁ / N₁ 이고, 철심 속 선속 Φ 는 그 몫을 만드는 만큼
// 흔들린다(한 바퀴 몫 = dΦ/dt, Φ = −V₀/(N₁ω) cos ωt). 같은 Φ 가 2차 코일도 꿰므로
// 2차의 한 바퀴도 같은 몫을 얻고, N₂ 바퀴가 쌓여
//   V₂ = N₂ · (V₁ / N₁)
// 이 된다. 이상 변압기는 들어온 전력을 그대로 내보내므로 전류는 반대로 바뀐다:
//   I₂ = I₁ · N₁ / N₂
// 1차 전류의 봉우리는 스테이지 상수다(부하가 그만큼 당기는 것으로 둔다, NOTES (b)).
//
// 모든 것이 시각의 함수라 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import {
  CURRENT_ARROW_SCALE,
  FLUX_ARROW_SCALE,
  FREQUENCY,
  GRAPH_SECONDS,
  PRIMARY_CURRENT_PEAK,
  PRIMARY_PEAK,
  PRIMARY_TURNS,
  SECONDARY_TURNS_DOWN,
  SECONDARY_TURNS_UP,
  SECONDS_TO_WORLD,
  VOLT_SCALE,
} from './schema';
import type { TransformerState } from './state';

export interface TransformerConstants {
  primaryTurns: number;
  secondaryTurnsUp: number;
  secondaryTurnsDown: number;
  primaryPeak: number;
  primaryCurrentPeak: number;
  frequency: number;
  voltScale: number;
  secondsToWorld: number;
  graphSeconds: number;
  currentArrowScale: number;
  fluxArrowScale: number;
}

export function readConstants(stage: StageDef): TransformerConstants {
  const c = stage.constants ?? {};
  return {
    primaryTurns: c.primaryTurns ?? PRIMARY_TURNS,
    secondaryTurnsUp: c.secondaryTurnsUp ?? SECONDARY_TURNS_UP,
    secondaryTurnsDown: c.secondaryTurnsDown ?? SECONDARY_TURNS_DOWN,
    primaryPeak: c.primaryPeak ?? PRIMARY_PEAK,
    primaryCurrentPeak: c.primaryCurrentPeak ?? PRIMARY_CURRENT_PEAK,
    frequency: c.frequency ?? FREQUENCY,
    voltScale: c.voltScale ?? VOLT_SCALE,
    secondsToWorld: c.secondsToWorld ?? SECONDS_TO_WORLD,
    graphSeconds: c.graphSeconds ?? GRAPH_SECONDS,
    currentArrowScale: c.currentArrowScale ?? CURRENT_ARROW_SCALE,
    fluxArrowScale: c.fluxArrowScale ?? FLUX_ARROW_SCALE,
  };
}

/** 각진동수 ω(rad/s). */
function omega(c: TransformerConstants): number {
  return 2 * Math.PI * c.frequency;
}

/** 한 바퀴가 맡는 전압의 봉우리(V) = V₀ / N₁. 두 코일에서 같다. */
export function perTurnPeak(c: TransformerConstants): number {
  return c.primaryPeak / c.primaryTurns;
}

/** 시각 time 의 1차 전압(V). */
export function primaryVoltageAt(time: number, c: TransformerConstants): number {
  return c.primaryPeak * Math.sin(omega(c) * time);
}

/** 시각 time 의 2차 전압(V) — 한 바퀴 몫 × N₂. */
export function secondaryVoltageAt(time: number, turns: number, c: TransformerConstants): number {
  return turns * (primaryVoltageAt(time, c) / c.primaryTurns);
}

/** 시각 time 의 철심 속 선속(Wb). 한 바퀴 몫 = dΦ/dt 를 적분한 것이라 전압보다 ¼ 주기 늦다. */
export function fluxAt(time: number, c: TransformerConstants): number {
  return -(perTurnPeak(c) / omega(c)) * Math.cos(omega(c) * time);
}

/** 시각 time 의 1차 전류(A). 저항 부하라 전압과 같은 박자다. */
export function primaryCurrentAt(time: number, c: TransformerConstants): number {
  return c.primaryCurrentPeak * Math.sin(omega(c) * time);
}

/** 시각 time 의 2차 전류(A) — 전압과 반대로 N₁ / N₂ 배. */
export function secondaryCurrentAt(time: number, turns: number, c: TransformerConstants): number {
  return primaryCurrentAt(time, c) * (c.primaryTurns / turns);
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: TransformerState }): TransformerState {
  return params.state;
}
