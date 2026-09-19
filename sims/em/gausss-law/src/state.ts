// ========================================================================
// gausss-law — 상태
// ========================================================================
// 모든 움직임은 시각과 스테이지 상수의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션
// `vars` 가 가리킬 **가닥 수의 글자** 하나뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로
// (장부 G133) 스테이지 상수를 여기서 한 번 글자로 옮긴다. 정수라 줄일 자릿수가 없다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface GausssLawState {
  /** 전하에서 나가는 전기력선 가닥 수 = 전하량 × 단위 전하당 가닥 수. */
  lineCount: string;
}

export function initialState(params: { stage: StageDef }): GausssLawState {
  return { lineCount: String(readConstants(params.stage).lines) };
}
