import { SPEED_DEFAULT } from './schema';

/**
 * 쌓는 것은 `lapT` 하나뿐이다.
 *
 * 자국 개수 · 각 자국의 자리 · 막대의 이동 진행도가 모두 `lapT` 와 빠르기에서
 * 나온다. 원본도 그렇게 줄여 두었다 — 그래야 같은 시각이 언제나 같은 화면이다.
 */
export interface UniformMotionState {
  /** 랩 경과 시간(초). 0 ≤ lapT < LAP. */
  lapT: number;
  /** 빠르기(무차원). 슬라이더가 쓴다. */
  speed: number;
  /**
   * 빠르기를 잡고 있는 동안 true. 러너가 적는다 (`ControllerInstance.heldPath`).
   * 무엇을 되돌릴지는 조각이 정한다 — 여기서는 랩 전체다.
   */
  held: boolean;
}

export function initialState(): UniformMotionState {
  return { lapT: 0, speed: SPEED_DEFAULT, held: false };
}
