import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 구껍질의 반지름 · 알갱이 자리 · 캡션이 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다.
 *
 * 들고 있는 것은 캡션에 끼울 **거리 배수의 글자** 둘뿐이다. 캡션 `vars` 가 state 경로만
 * 가리킬 수 있어서(장부 G133) 스테이지 상수를 여기로 옮겨 둔다. 값은 선언값 그대로다 —
 * `String(2)` 는 `"2"` 이고 자릿수를 줄이지 않는다 (S-piece 유효숫자).
 */
export interface InverseSquareLawState {
  /** 둘째 거리 배수(`multiple2`) 그대로의 글자. */
  multiple2: string;
  /** 셋째 거리 배수(`multiple3`) 그대로의 글자. */
  multiple3: string;
}

export function initialState(params: { stage: StageDef }): InverseSquareLawState {
  const c = readConstants(params.stage);
  return { multiple2: String(c.multiple2), multiple3: String(c.multiple3) };
}
