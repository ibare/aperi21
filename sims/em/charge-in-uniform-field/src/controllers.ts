import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 질량 배수 · 속력 슬라이더를 생각했지만, 자동 진행이 한 주기 안에 「같은 걸음 · 점점 큰
 * 내려옴」 과 「질량이 배수면 내려온 거리가 그 역수」 를 이미 보인다. 슬라이더는 값을
 * 숫자로 늘 찍어 「얼마인가」 를 끌어오고, 주기 중간에 바꾸면 이미 찍힌 자국이 있던 적
 * 없는 과거를 말하게 된다. 이 조각이 답하는 것은 아무것도 누르지 않아도 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
