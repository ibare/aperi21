import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * Q 를 끌게 하면 Q = 30 에서는 울림이 기록 판을 넘고, Q = 1 에서는 봉우리가 사라져
 * 「폭」 을 잴 수 없다. 프레이밍과 캡션이 값에 따라 흔들린다. 이 조각이 답하는 것은
 * **좁은 봉우리와 긴 울림이 같은 성질인가** 하나이고, 그 답은 아무것도 누르지 않아도
 * 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
