// ========================================================================
// ionizing-radiation — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가 가리킬
// **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133) 스테이지 상수를
// 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface IonizingRadiationState {
  /** X선 광자 하나가 남기는 이온 수(첫 이온 포함) — 화면의 `+` 수와 같은 상수에서 온다. */
  ionCount: string;
}

export function initialState(params: { stage: StageDef }): IonizingRadiationState {
  return { ionCount: String(readConstants(params.stage).ionCount) };
}
