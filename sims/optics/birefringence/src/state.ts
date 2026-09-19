// ========================================================================
// birefringence — 상태
// ========================================================================
// 결정 각 · 편광판 · 두 상의 밝기는 모두 시간표 시각의 함수라 쌓는 것이 없다. state 에 두는 것은
// 굴절률 글자와 캡션 `vars` 가 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만
// 가리키므로(장부 G133) 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface BirefringenceState {
  /** 굴절률 글자. */
  nO: string;
  nE: string;
  /** 편광판 결 각(°) 글자 — 얹을 때 · 돌린 뒤. */
  polDegA: string;
  polDegB: string;
}

export function initialState(params: { stage: StageDef }): BirefringenceState {
  const c = readConstants(params.stage);
  return {
    nO: String(c.nO),
    nE: String(c.nE),
    polDegA: String(c.polDegA),
    polDegB: String(c.polDegB),
  };
}
