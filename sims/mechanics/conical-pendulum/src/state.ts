// ========================================================================
// conical-pendulum — 런타임 상태
// ========================================================================
// 상태를 비울 수 없는 조각이다. 회전각은 빠르기를 걸음마다 누적한 것이고,
// 독자가 조절기를 한 번 잡으면 자동 진행 곡선을 떠나 그 빠르기로 계속 돈다 —
// 둘 다 시각만으로는 정해지지 않는다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { W_MIN } from './schema';

export interface ConicalPendulumState {
  /**
   * 자동 진행 시계(초). `step` 이 직접 센다 — `step` 은 엔진의 시간표 프레임을
   * 받지 못해서 12 초 코사인 곡선의 위치를 스스로 알아야 한다 (NOTES 「어휘 부족」).
   */
  readonly clock: number;
  /** 회전각(rad). 세 추 · 손잡이가 함께 쓴다 — 한 바큇살처럼 늘어서 돈다. */
  readonly phi: number;
  /** 지금 각속도(rad/s). 조절기가 이 자리를 민다. 자동 진행 중에는 `step` 이 곡선 값을 적는다. */
  readonly omega: number;
  /** 조절기를 잡고 있는가 (`ControllerInstance.heldPath`, 러너가 적는다). */
  readonly held: boolean;
  /** 한 번이라도 잡았는가. 원본처럼 그 뒤로는 자동 진행으로 돌아가지 않는다. */
  readonly manual: boolean;
}

export function initialState(_params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): ConicalPendulumState {
  return { clock: 0, phi: 0, omega: W_MIN, held: false, manual: false };
}
