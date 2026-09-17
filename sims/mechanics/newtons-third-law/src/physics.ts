// ========================================================================
// newtons-third-law — 순수 물리
// ========================================================================
// 같은 질량 두 사람이 sin² 모양의 힘으로 서로 민다. 힘을 두 번 적분한 닫힌 식이라
// 쌓이는 상태가 없다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { ACCEL } from './schema';
import type { NewtonsThirdLawState } from './state';

export function readAccel(stage: StageDef): number {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return c.a ?? ACCEL;
}

/** 항등 — 모든 것이 시각의 함수다 (S-sim 「상태가 시계뿐인 조각」). */
export function step(params: { state: NewtonsThirdLawState; dt: number }): NewtonsThirdLawState {
  return params.state;
}

/** 힘의 크기 0~1. u 는 미는 단계의 진행도. */
export function forceShape(u: number): number {
  return Math.sin(Math.PI * u) ** 2;
}

/**
 * 한 사람이 처음 자리에서 밀려난 거리(월드).
 *
 * @param a 가속도 크기
 * @param pushDur 미는 단계 길이(초)
 * @param tau 밀기 시작 뒤 흐른 시간(초). 음수면 아직 밀지 않았다.
 */
export function displacement(a: number, pushDur: number, tau: number): number {
  if (tau <= 0) return 0;
  if (tau < pushDur) {
    const u = tau / pushDur;
    return (
      a * pushDur * pushDur *
      (u * u / 4 + (Math.cos(2 * Math.PI * u) - 1) / (8 * Math.PI * Math.PI))
    );
  }
  const s1 = (a * pushDur * pushDur) / 4;
  const v1 = (a * pushDur) / 2;
  return s1 + v1 * (tau - pushDur);
}

/** 밀기가 끝났을 때 밀려난 거리(월드). 손끝이 거둬지기 시작하는 자리의 기준. */
export function pushEndDisplacement(a: number, pushDur: number): number {
  return (a * pushDur * pushDur) / 4;
}
