import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기 없음.
 *
 * 주장은 세 감쇠의 **비교**이고, 세 줄이 나란히 동시에 놓여 자동 진행만으로 끝난다.
 * 감쇠 슬라이더를 두면 한 줄만 남게 되어 비교가 기억에 맡겨지고, 셋을 그대로 두고
 * 슬라이더를 더하면 「어느 줄을 바꾸는가」 가 새 질문이 된다. 감쇠를 바꿔 보는 일은
 * 같은 배치의 `damped-oscillation` 쪽 몫이다.
 */
export const controllers: readonly ControllerSpec[] = [];
