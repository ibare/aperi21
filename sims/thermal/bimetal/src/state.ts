// ========================================================================
// bimetal — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 와 눈금 ·
// 알림 글자가 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로
// (장부 G133) 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface BimetalState {
  /** 선언한 실온 · 데운 온도 · 식힌 온도의 글자. */
  roomText: string;
  hotText: string;
  coldText: string;
  /** 선언한 과장 배율의 글자. */
  exaggerationText: string;
}

export function initialState(params: { stage: StageDef }): BimetalState {
  const c = readConstants(params.stage);
  return {
    roomText: String(c.tRoom),
    hotText: String(c.tHot),
    coldText: String(c.tCold),
    exaggerationText: String(c.exaggeration),
  };
}
