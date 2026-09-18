// ========================================================================
// constructive-destructive — 순수 물리
// ========================================================================
// 같은 진폭 A · 같은 파수 k 의 두 파동이 같은 속력 v 로 오른쪽으로 흐른다.
//
//   y₁(x, t) = A·sin(k(x − v·t))
//   y₂(x, t) = A·sin(k(x − v·t) − Δφ)
//   y₁ + y₂  = 2A·cos(Δφ/2) · sin(k(x − v·t) − Δφ/2)
//
// 합도 같은 파장 · 같은 속력의 파동이고, 그 진폭은 위상차 하나가 정한다 —
// Δφ = 0 이면 2A, Δφ = π 이면 0. 이 조각이 보이는 것은 이 한 줄이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { AMPLITUDE, PHASE_MAX, WAVE_SPEED, WAVELENGTH } from './schema';
import type { ConstructiveDestructiveState } from './state';

export interface ConstructiveDestructiveConstants {
  /** 두 파동 각각의 진폭(칸). */
  amplitude: number;
  /** 두 파동의 파장(칸). */
  wavelength: number;
  /** 두 파동이 흐르는 속력(칸/초). */
  speed: number;
  /** 위상차가 도는 끝값(라디안). */
  phaseMax: number;
}

export function readConstants(stage: StageDef): ConstructiveDestructiveConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    amplitude: c.amplitude ?? AMPLITUDE,
    wavelength: c.wavelength ?? WAVELENGTH,
    speed: c.speed ?? WAVE_SPEED,
    phaseMax: c.phaseMax ?? PHASE_MAX,
  };
}

/**
 * 지금 위상차(라디안). **단계 경계는 선언이 정한다** — `slideOut` 동안 0 → 끝값으로
 * 벌어지고 `slideBack` 동안 끝값 → 0 으로 돌아온다. `at` 은 그 단계 전 0 · 동안 0~1 ·
 * 뒤 1 이므로 두 진행도의 차가 곧 벌어진 정도다. 분기가 필요 없다.
 */
export function phaseDifference(tl: TimelineFrame, c: ConstructiveDestructiveConstants): number {
  return c.phaseMax * (tl.at('slideOut') - tl.at('slideBack'));
}

/**
 * 파동이 흐른 거리에 해당하는 위상(라디안). 조각 시계 `t` 를 쓴다 — 주기가 돌아도
 * 끊기지 않고 흐른다. 같은 시각은 언제나 같은 값이다.
 */
export function travelPhase(tl: TimelineFrame, c: ConstructiveDestructiveConstants): number {
  return ((2 * Math.PI) / c.wavelength) * c.speed * tl.t;
}

/** 자리 x 에서 두 파동의 변위. `travel` 은 흐른 위상, `dphi` 는 위상차. */
export function components(
  x: number,
  travel: number,
  dphi: number,
  c: ConstructiveDestructiveConstants,
): { y1: number; y2: number } {
  const k = (2 * Math.PI) / c.wavelength;
  const theta = k * x - travel;
  return { y1: c.amplitude * Math.sin(theta), y2: c.amplitude * Math.sin(theta - dphi) };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ConstructiveDestructiveState }): ConstructiveDestructiveState {
  return params.state;
}
