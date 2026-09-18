import { BLOCK_MASS } from './schema';

/**
 * 쌓는 상태가 없다. 탄알 · 토막 · 막대가 모두 시간표 진행도의 함수다.
 *
 * 남는 것은 독자가 고른 나무토막 질량 하나뿐이다 — 칩이 쓰고 `scene` 이 읽는다.
 */
export interface BallisticPendulumState {
  /** 고른 나무토막 질량(kg). 칩 줄이 쓴다. */
  blockMass: number;
}

export function initialState(): BallisticPendulumState {
  return { blockMass: BLOCK_MASS };
}
