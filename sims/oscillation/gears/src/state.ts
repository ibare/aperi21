import { BIG_TEETH } from './schema';

/**
 * 쌓는 상태가 없다. 기어의 각 · 지난 톱니 수 · 표지가 모두 시간표 시각의 함수다.
 *
 * 남는 것은 독자가 고른 큰 기어 톱니 수 하나뿐이다 — 칩이 쓰고 `scene` 이 읽는다.
 */
export interface GearsState {
  /** 고른 큰 기어 톱니 수. 칩 줄이 쓴다. */
  bigTeeth: number;
}

export function initialState(): GearsState {
  return { bigTeeth: BIG_TEETH };
}
