import { PUSH_DEFAULT } from './schema';

/**
 * 쌓는 상태가 없다. 두 덩어리 · 질량 중심 · 자취가 모두 시간표 시각의 함수다
 * (`physics.ts` 가 매 프레임 0 초부터 다시 적분한다 — 같은 시각은 언제나 같은 화면).
 *
 * 남는 것은 독자가 고른 「떼어 미는 세기」 하나뿐이다 — 칩이 쓰고 `scene` 이 읽는다.
 */
export interface CenterOfMassMotionState {
  /** 갈라지는 순간 상대 속도에 더하는 값(m/s). 칩 줄이 쓴다. */
  push: number;
}

export function initialState(): CenterOfMassMotionState {
  return { push: PUSH_DEFAULT };
}
