import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 속력을 끌게 하면 두 고리가 같이 빨라지고 같이 느려질 뿐 비(두 배)는 그대로라, 독자가
 * 해 봐서 새로 알게 되는 것이 없다. 관성 계수(고리 · 원판 · 공)를 고르게 하면 「두 배」
 * 가 1.5 배 · 1.4 배로 흔들려 캡션이 값을 따라가야 하고, 그것은 `rolling-race` 가 하는
 * 말이다. 이 조각이 답하는 것은 **같은 속력인데 왜 구르는 쪽이 더 오르나** 하나이고,
 * 그 답은 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
