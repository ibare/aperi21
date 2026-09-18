import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 두 전자의 속력 · 지나온 거리 · 물결 간격이 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다 — 등가속이라
 * 지나온 거리도 닫힌 식이다.
 *
 * 들고 있는 것은 캡션에 끼울 **속력 배수의 글자** 하나뿐이다. 캡션 `vars` 가 state 경로만
 * 가리킬 수 있어서(장부 G133) 스테이지 상수를 여기로 옮겨 둔다. 값은 선언값 그대로다 —
 * `String(2)` 는 `"2"` 이고 자릿수를 줄이지 않는다 (S-piece 유효숫자).
 *
 * 누적할 것이 없으므로 `preroll` 도 쓰지 않는다 — 도착한 순간 이미 날고 있는
 * 그림은 `startAt` 이 만든다.
 */
export interface DeBroglieWavelengthState {
  /** 속력 배수(`speedRatio`) 그대로의 글자. */
  k: string;
}

export function initialState(params: { stage: StageDef }): DeBroglieWavelengthState {
  return { k: String(readConstants(params.stage).speedRatio) };
}
