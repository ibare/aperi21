// ========================================================================
// stefan-boltzmann-law — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface StefanBoltzmannLawState {
  /** 세 판의 온도(K) 글자. */
  temp1: string;
  temp2: string;
  temp3: string;
  /** 가장 뜨거운 판의 온도 배수 · 복사 배수 정박값 글자. */
  tempTop: string;
  emitTop: string;
}

export function initialState(params: { stage: StageDef }): StefanBoltzmannLawState {
  const c = readConstants(params.stage);
  const last = c.temps.length - 1;
  return {
    temp1: String(c.temps[0]),
    temp2: String(c.temps[1]),
    temp3: String(c.temps[2]),
    tempTop: String(c.tempMarks[last]),
    emitTop: String(c.emitMarks[last]),
  };
}
