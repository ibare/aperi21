// ========================================================================
// focal-length — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가 가리킬
// **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133) 스테이지
// 상수를 여기서 한 번 글자로 옮긴다. 계산하거나 자릿수를 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface FocalLengthState {
  /** 긴 · 짧은 초점 거리 정박값의 글자. 캡션이 `{fLong}` · `{fShort}` 로 부른다. */
  fLong: string;
  fShort: string;
}

export function initialState(params: { stage: StageDef }): FocalLengthState {
  const c = readConstants(params.stage);
  return {
    fLong: String(c.focalLong),
    fShort: String(c.focalShort),
  };
}
