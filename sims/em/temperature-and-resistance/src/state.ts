// ========================================================================
// temperature-and-resistance — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다 — 떨림 · 나르개 자리 · 쌍의 생김은 (시드, 조각
// 시계)에서 곧바로 얻는다(physics). state 에 두는 것은 캡션 `vars` 가 가리킬 **선언값의 글자**
// 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133) 스테이지 상수를 여기서 한 번
// 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface TemperatureAndResistanceState {
  /** 두 막대에 걸린 전압(선언값 그대로). */
  voltage: string;
  /** 차가울 때 · 데운 뒤 온도(선언값 그대로). */
  tempCold: string;
  tempHot: string;
}

export function initialState(params: { stage: StageDef }): TemperatureAndResistanceState {
  const c = readConstants(params.stage);
  return {
    voltage: String(c.voltage),
    tempCold: String(c.tempCold),
    tempHot: String(c.tempHot),
  };
}
