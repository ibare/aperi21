// ========================================================================
// triple-point — 상태
// ========================================================================
// 점 · 세 몫 · 김 알갱이가 모두 시간표의 함수라 쌓는 것이 없다. state 에 두는 것은
// 캡션 `vars` 가 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로
// (장부 G133) 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface TriplePointState {
  /** 삼중점 온도(℃) · 압력(Pa) 글자. */
  tTp: string;
  pTp: string;
  /** 벗어나는 폭(℃ · Pa) 글자. */
  dT: string;
  dP: string;
}

export function initialState(params: { stage: StageDef }): TriplePointState {
  const c = readConstants(params.stage);
  return { tTp: String(c.tTp), pTp: String(c.pTp), dT: String(c.dT), dP: String(c.dP) };
}
