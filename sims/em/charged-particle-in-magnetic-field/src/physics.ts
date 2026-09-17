// ========================================================================
// charged-particle-in-magnetic-field — 순수 물리
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import { START } from './schema';
import type { ChargedParticleInMagneticFieldState } from './state';

/**
 * 반지름 r 인 전하가 출발 뒤 시각 t 에 있는 자리. 각속도 ω = 2π / period 는 속력과 무관하다.
 *
 * 출발점에서 +x 로 떠나고 중심은 출발점 바로 위(반시계로 돈다).
 * x = r sin ωt, y = START.y + r (1 − cos ωt).
 */
export function chargePosition(r: number, t: number, period: number): Vec2 {
  const a = (2 * Math.PI * t) / period;
  return [START[0] + r * Math.sin(a), START[1] + r * (1 - Math.cos(a))];
}

/** 궤도 원의 중심. 모든 원이 출발점에서 서로 접한다. */
export function orbitCenter(r: number): Vec2 {
  return [START[0], START[1] + r];
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ChargedParticleInMagneticFieldState }): ChargedParticleInMagneticFieldState {
  return params.state;
}
