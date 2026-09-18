import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 누르는 깊이를 끌게 하면 세 배(9h) · 네 배(16h)에서 공이 화면 위로 나가 프레이밍이
 * 무너지고, 캡션의 「네 배」 도 값에 따라 흔들린다. 이 조각이 답하는 것은 **두 배
 * 누르면 왜 네 배 오르는가** 하나이고, 그 답은 아무것도 누르지 않아도 한 주기 안에
 * 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
