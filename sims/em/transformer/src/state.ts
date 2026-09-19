// ========================================================================
// transformer — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 스테이지 상수(감은 수)를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface TransformerState {
  /** 1차 감은 수. */
  n1: string;
  /** 앞 기록의 2차 감은 수. */
  n2Up: string;
  /** 뒤 기록의 2차 감은 수. */
  n2Down: string;
}

export function initialState(params: { stage: StageDef }): TransformerState {
  const c = readConstants(params.stage);
  return {
    n1: String(c.primaryTurns),
    n2Up: String(c.secondaryTurnsUp),
    n2Down: String(c.secondaryTurnsDown),
  };
}
