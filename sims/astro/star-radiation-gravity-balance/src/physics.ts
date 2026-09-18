// ========================================================================
// star-radiation-gravity-balance — 순수 계산
// ========================================================================
// 닮은꼴로 커지고 주는 별의 장난감 모형. 모든 것이 시각의 함수다.
//
//   중력  F_g = G · M / R²  (질량은 두 힘에 함께 걸려 비에서 빠진다 — 선언하지 않는다)
//   압력  F_p = C · E / Rⁿ      (n = pressureExponent, C 는 처음 에너지에서 R = calmRadius 가 균형이 되게)
//
// 균형은 F_p = F_g 인 R = R₀ · (E / E₀)^(1/(n−2)). n > 2 라 압력이 R 에 대해 중력보다 가파르게 변하므로
// 부풀면 압력이 더 빨리 줄고(식음), 오그라들면 더 빨리 는다(데워짐) — 어느 쪽으로
// 밀려도 균형으로 되돌아온다. 별은 통째로 닮은꼴이라 안쪽 층(반지름의 f 배)의 두 힘도
// 표면과 같은 비로 f 배가 된다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ARROW_PER_FORCE,
  CALM_RADIUS,
  CORE_RADIUS,
  ENERGY_CALM,
  ENERGY_HIGH,
  ENERGY_LOW,
  INNER_LAYER,
  PRESSURE_EXPONENT,
  SETTLE_SHARPNESS,
} from './schema';
import type { StarRadiationGravityBalanceState } from './state';

export interface StarRadiationGravityBalanceConstants {
  energyCalm: number;
  energyHigh: number;
  energyLow: number;
  calmRadius: number;
  pressureExponent: number;
  arrowPerForce: number;
  innerLayer: number;
  settleSharpness: number;
  coreRadius: number;
}

export function readConstants(stage: StageDef): StarRadiationGravityBalanceConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    energyCalm: c.energyCalm ?? ENERGY_CALM,
    energyHigh: c.energyHigh ?? ENERGY_HIGH,
    energyLow: c.energyLow ?? ENERGY_LOW,
    calmRadius: c.calmRadius ?? CALM_RADIUS,
    pressureExponent: c.pressureExponent ?? PRESSURE_EXPONENT,
    arrowPerForce: c.arrowPerForce ?? ARROW_PER_FORCE,
    innerLayer: c.innerLayer ?? INNER_LAYER,
    settleSharpness: c.settleSharpness ?? SETTLE_SHARPNESS,
    coreRadius: c.coreRadius ?? CORE_RADIUS,
  };
}

/** 에너지 E 일 때의 균형 반지름(월드). */
export function balanceRadius(E: number, c: StarRadiationGravityBalanceConstants): number {
  return c.calmRadius * Math.pow(E / c.energyCalm, 1 / (c.pressureExponent - 2));
}

/**
 * 지금 중심 에너지. **단계 경계는 선언이 정한다** — 단계 id 로 가르지 않고 바꾸는 단계들의
 * 진행도(`at`)를 쌓는다. 머무는 단계에서는 앞 단계 `at` 이 1, 뒤 단계가 0 이라 분기가 없다.
 */
export function energyAt(tl: TimelineFrame, c: StarRadiationGravityBalanceConstants): number {
  return (
    c.energyCalm +
    (c.energyHigh - c.energyCalm) * tl.at('boost') +
    (c.energyLow - c.energyHigh) * tl.at('cut') +
    (c.energyCalm - c.energyLow) * tl.at('restore')
  );
}

/**
 * 가라앉음 0 → 1. 처음이 빠르고 끝이 느리다 — 두 힘의 차가 클 때 빨리 움직이고 같아질수록 멈춘다.
 * 단계 끝에서 정확히 1 이라 다음 머무는 단계와 이어진다.
 */
function settle(p: number, k: number): number {
  return (1 - Math.exp(-k * p)) / (1 - Math.exp(-k));
}

/**
 * 지금 반지름(월드). 가라앉는 단계(`swell` · `shrink` · `return`)의 진행도로 균형 반지름 사이를 옮긴다.
 * 바꾸는 단계 동안에는 움직이지 않는다 — 에너지가 먼저 바뀌어 한쪽이 이기는 것이 보인다.
 */
export function radiusAt(tl: TimelineFrame, c: StarRadiationGravityBalanceConstants): number {
  const r0 = balanceRadius(c.energyCalm, c);
  const rHi = balanceRadius(c.energyHigh, c);
  const rLo = balanceRadius(c.energyLow, c);
  const k = c.settleSharpness;
  return (
    r0 +
    (rHi - r0) * settle(tl.at('swell'), k) +
    (rLo - rHi) * settle(tl.at('shrink'), k) +
    (r0 - rLo) * settle(tl.at('return'), k)
  );
}

/**
 * 표면 한 층에 걸린 두 힘 — 처음 별 표면의 중력을 1 로 잰 값. 
 * 처음 별(E₀, R₀)에서 둘 다 1 이다.
 */
export function surfaceForces(
  E: number,
  R: number,
  c: StarRadiationGravityBalanceConstants,
): { gravity: number; pressure: number } {
  const s = c.calmRadius / R;
  return {
    gravity: s * s,
    pressure: (E / c.energyCalm) * Math.pow(s, c.pressureExponent),
  };
}

/** 별 속의 온도 — 처음 별을 1 로 잰 값. 닮은꼴 별에서 T ∝ M / R. */
export function relativeTemperature(R: number, c: StarRadiationGravityBalanceConstants): number {
  return c.calmRadius / R;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: StarRadiationGravityBalanceState }): StarRadiationGravityBalanceState {
  return params.state;
}
