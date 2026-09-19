// ========================================================================
// multiple-mirror-images — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface MultipleMirrorImagesState {
  /** 세 멈춤의 거울 사이 각(°) 글자 — 스테이지 상수 그대로. */
  degA: string;
  degB: string;
  degC: string;
  /** 세 멈춤의 상 개수 글자 — 스테이지 상수 그대로. */
  countA: string;
  countB: string;
  countC: string;
}

export function initialState(params: { stage: StageDef }): MultipleMirrorImagesState {
  const c = readConstants(params.stage);
  return {
    degA: String(c.angleA),
    degB: String(c.angleB),
    degC: String(c.angleC),
    countA: String(c.countA),
    countB: String(c.countB),
    countC: String(c.countC),
  };
}
