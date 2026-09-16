// ========================================================================
// angular-acceleration — 순수 물리
// ========================================================================
// 등각가속 회전의 해석해 하나뿐이다. 적분하지 않는다 — 적분하면 슬라이더를 움직여도
// 이미 지나간 각이 고쳐지지 않아 과거 눈금이 옛 α 로 남는다 (state.ts 참조).
// ========================================================================

import type { AngularAccelerationState } from './state';

/**
 * 주기 안 시각 `tau` 에서의 바퀴 각 θ(τ) = ω₀τ + ½ατ².
 *
 * **12시에서 시계방향으로** 잰 각이다. 월드 좌표로 옮기는 것은
 * `plugin-mechanics` 의 `pointAtClockAngle` 이 한다.
 */
export function angleAt(tau: number, omega0: number, alpha: number): number {
  return omega0 * tau + 0.5 * alpha * tau * tau;
}

/**
 * 상태는 시각의 함수가 아니다 — 조작기가 쥔 두 값뿐이라 굴릴 것이 없다.
 * 시각과 단계는 엔진이 시간표 선언(`schema.timeline`)에서 준다.
 */
export function step(params: { state: AngularAccelerationState }): AngularAccelerationState {
  return params.state;
}
