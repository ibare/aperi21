import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 물결 묶음 · 견줌 물결 · 캡션이 모두 시간표 선언(`schema.timeline`)에서
 * 엔진이 `scene` 에 넘겨 주는 시각의 함수다.
 *
 * 들고 있는 것은 캡션에 끼울 **물결 수의 글자** 하나뿐이다. 캡션 `vars` 가 state 경로만
 * 가리킬 수 있어서(장부 G133) 스테이지 상수 `waveCycles` 를 여기로 옮겨 둔다. 값은 선언값
 * 그대로다 — `String(6)` 은 `"6"` 이고 자릿수를 줄이지 않는다 (S-piece 유효숫자).
 */
export interface GravitationalRedshiftState {
  /** 한 줄기에 담긴 물결 수(`waveCycles`) 그대로의 글자. */
  n: string;
}

export function initialState(params: { stage: StageDef }): GravitationalRedshiftState {
  const c = readConstants(params.stage);
  return { n: String(c.waveCycles) };
}
