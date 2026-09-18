import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

/**
 * 쌓는 상태가 없다. m 의 자리 · 두 화살표의 길이 · 캡션이 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다.
 *
 * 들고 있는 것은 캡션에 끼울 **거리 배수의 글자** 둘뿐이다. 캡션 `vars` 가 state 경로만
 * 가리킬 수 있어서(장부 G133) 스테이지 상수를 여기로 옮겨 둔다. 값은 선언값 그대로다 —
 * `String(2)` 는 `"2"` 이고 자릿수를 줄이지 않는다 (S-piece 유효숫자).
 */
export interface NewtonsLawOfGravitationState {
  /** 첫째 거리 배수(`farMultiple1`) 그대로의 글자. */
  multiple1: string;
  /** 둘째 거리 배수(`farMultiple2`) 그대로의 글자. */
  multiple2: string;
}

export function initialState(params: { stage: StageDef }): NewtonsLawOfGravitationState {
  const c = readConstants(params.stage);
  return { multiple1: String(c.farMultiple1), multiple2: String(c.farMultiple2) };
}
