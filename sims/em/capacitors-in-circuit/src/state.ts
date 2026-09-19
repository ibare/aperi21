// ========================================================================
// capacitors-in-circuit — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 전압(스테이지 상수)과 축전기 수(구조 상수)를 여기서 한 번 글자로 옮긴다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';
import { CAPACITOR_COUNT } from './schema';

export interface CapacitorsInCircuitState {
  /** 축전기 수 — 캡션의 `{n}` 자리. */
  count: string;
  /** 전지 전압 — 캡션의 `{v}` 자리. */
  voltage: string;
}

export function initialState(params: { stage: StageDef }): CapacitorsInCircuitState {
  const c = readConstants(params.stage);
  return {
    count: String(CAPACITOR_COUNT),
    voltage: String(c.voltage),
  };
}
