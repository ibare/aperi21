import { RATIO, STRAIGHT_FROM } from './schema';

/**
 * 물결 장 · 따라가는 마루는 모두 조각 시계의 함수라 쌓는 것이 없다. 시계는 엔진이 시간표
 * 선언에서 `scene` 에 `params.timeline` 으로 준다 (S-sim).
 *
 * 상태에 남은 것은 조작값과 그것에서 나온 판정 하나다.
 */
export interface RefractionOfWavesState {
  /** 느린 쪽 속력 / 빠른 쪽 속력. 슬라이더가 이 경로에 쓴다. */
  ratio: number;
  /** 두 쪽 속력이 사실상 같은가 — 캡션 `cases` 가 읽는다. */
  straight: boolean;
}

export function initialState(): RefractionOfWavesState {
  return { ratio: RATIO.default, straight: RATIO.default >= STRAIGHT_FROM };
}
