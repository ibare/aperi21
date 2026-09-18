import type { StageDef } from '@aperi21/schema';
import { captionOf, readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 알갱이의 자리 · 멈춤은 모두 스테이지 상수와 시각의 함수다.
 *
 * 들고 있는 것은 캡션 문자열뿐이다 — 캡션 슬롯의 `vars` 가 state 경로만 가리킬 수
 * 있어서, 스테이지 상수의 두께(알루미늄 mm · 납 cm)를 여기 둔다 (장부 G133).
 */
export interface DecayTypesState {
  caption: { al: string; pb: string };
}

export function initialState(params: { stage: StageDef }): DecayTypesState {
  return { caption: captionOf(readConstants(params.stage)) };
}
