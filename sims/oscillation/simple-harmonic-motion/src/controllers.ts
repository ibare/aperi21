import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 용수철 상수나 질량을 끌게 하면 곡선이 촘촘해지거나 성겨질 뿐 「사인이다」 는 그대로다 —
 * 그 변화가 말하는 것은 주기이고, 주기는 이웃 조각(`mass-spring-system`)의 주장이다.
 * 진폭을 끌게 해도 곡선이 키만 바뀐다. 이 조각이 답하는 것은 **변위에 비례해 되미는
 * 힘이 왜 사인을 그리는가** 하나이고, 그 답은 아무것도 누르지 않아도 한 바퀴 안에
 * 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
