import { SPEED_DEFAULT } from './schema';

/**
 * 쌓는 것이 거의 없다. 공의 자리 · 사다리 · 파문이 모두 시간표 시각의 함수다
 * (`schema.timeline`). 상태에 남는 것은 **독자가 미는 값**과 **지금 밀고 있는가**
 * 둘뿐이다.
 */
export interface ProjectileMotionState {
  /**
   * 앞으로 던지는 빠르기(월드/초). 슬라이더가 이 자리를 단일 소스로 쓴다.
   * 세로 운동에는 관여하지 않는다 — 조작기의 권한 범위 자체가 주장과 같은 모양이다.
   */
  v: number;
  /**
   * 슬라이더를 잡고 있는가. 러너가 `ControllerInstance.heldPath` 로 적는다.
   * 잡고 있는 동안 사다리(지나간 기록)를 비운다 — 아래 `scene` 참조.
   */
  held: boolean;
}

export function initialState(): ProjectileMotionState {
  return { v: SPEED_DEFAULT, held: false };
}
