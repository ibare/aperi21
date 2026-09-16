// ========================================================================
// angular-acceleration — 런타임 상태
// ========================================================================
// **흔적을 쌓지 않는다.** 눈금 목록도 각도도 상태에 없다 — θ(τ) = ω₀τ + ½ατ² 를
// 매 프레임 다시 푼다. 그래서 슬라이더를 움직이면 이미 찍힌 과거 눈금까지 새 값으로
// 그 자리에서 다시 잡히고, α 를 0 으로 내리는 순간 부채 전체가 고른 간격으로 접힌다
// (원본 NOTES (d) 「고르게 두어야 한다」).
//
// 그래서 상태에 남는 것은 조작기가 잡는 두 값뿐이다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';

import { ALPHA_DEFAULT, OMEGA0_DEFAULT } from './schema';

export interface AngularAccelerationState {
  /** 시작 각속도 ω₀ (rad/s). 슬라이더가 쥔다. */
  readonly omega0: number;
  /** 각가속도 α (rad/s²). 0 으로 내리면 눈금 간격이 고르게 된다. */
  readonly alpha: number;
}

export function initialState(_params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): AngularAccelerationState {
  return { omega0: OMEGA0_DEFAULT, alpha: ALPHA_DEFAULT };
}
