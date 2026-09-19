// ========================================================================
// joule-heating — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다 — 온도는 전류가 흐른 시간에 곧게 비례하고
// (physics `temperatureRise`), 알갱이 자리는 흐른 시간 × 속력이다. state 에 두는 것은
// 캡션 `vars` 가 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로
// (장부 G133) 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface JouleHeatingState {
  /** 큰 저항 · 작은 저항(선언값 그대로). */
  resistanceLarge: string;
  resistanceSmall: string;
}

export function initialState(params: { stage: StageDef }): JouleHeatingState {
  const c = readConstants(params.stage);
  return {
    resistanceLarge: String(c.resistanceLarge),
    resistanceSmall: String(c.resistanceSmall),
  };
}
