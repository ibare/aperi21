import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 깊이를 끌게 하면 독자가 h · 2h 에 정확히 세우기 어렵고, 캡션의 「두 배」 가 손의
 * 위치에 따라 흔들린다. 이 조각이 답하는 것은 **깊이가 두 배면 압력도 두 배인가**
 * 하나이고, 그 답은 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
