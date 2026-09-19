// ========================================================================
// ohms-law — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다 — 알갱이 자리는 시간표 단계마다 일정한
// 속력을 곧바로 적분해 얻는다(physics `flowDistance`). state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface OhmsLawState {
  /** 단계마다의 전압(선언값 그대로). */
  voltage1: string;
  voltage2: string;
  voltage3: string;
  /** 아래 회로의 큰 저항(선언값 그대로). */
  resistanceLarge: string;
}

export function initialState(params: { stage: StageDef }): OhmsLawState {
  const c = readConstants(params.stage);
  return {
    voltage1: String(c.voltages[0]),
    voltage2: String(c.voltages[1]),
    voltage3: String(c.voltages[2]),
    resistanceLarge: String(c.resistanceLarge),
  };
}
