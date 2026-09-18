import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 속력을 끌게 하는 조작기를 두면 세 배(9 칸) · 네 배(16 칸)까지 화면 밖으로 나가
 * 프레이밍이 무너지고, 캡션의 「네 배」 도 값에 따라 흔들린다. 이 조각이 답하는
 * 것은 **두 배일 때 왜 네 배인가** 하나이고, 그 답은 아무것도 누르지 않아도
 * 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
