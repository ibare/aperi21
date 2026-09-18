import type { StageDef } from '@aperi21/schema';
import { captionOf, readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 읽기 선 · 점 · 화살표는 모두 스테이지 상수와 시간표 진행도의 함수다.
 *
 * 들고 있는 것은 캡션 문자열뿐이다 — 캡션 슬롯의 `vars` 가 state 경로만 가리킬 수 있어서,
 * 스테이지 상수(비율 · 반감기 · 연대)를 여기 문자열로 둔다 (장부 G133). 시각과 무관하므로
 * `step` 이 다시 만들 필요가 없다.
 */
export interface RadiometricDatingState {
  caption: {
    num: string;
    den: string;
    half: string;
    n: string;
    age: string;
  };
}

export function initialState(params: { stage: StageDef }): RadiometricDatingState {
  return { caption: captionOf(readConstants(params.stage)) };
}
