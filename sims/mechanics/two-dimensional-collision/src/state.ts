import { IMPACT_ANGLE } from './schema';

/**
 * 쌓는 상태가 없다. 두 공 · 화살표 · 장부가 모두 시간표 진행도의 함수다.
 *
 * 남는 것은 독자가 고른 빗맞는 각 하나뿐이다 — 칩이 쓰고 `scene` 이 읽는다.
 */
export interface TwoDimensionalCollisionState {
  /** 고른 빗맞는 각(도). 칩 줄이 쓴다. */
  impactAngle: number;
}

export function initialState(): TwoDimensionalCollisionState {
  return { impactAngle: IMPACT_ANGLE };
}
