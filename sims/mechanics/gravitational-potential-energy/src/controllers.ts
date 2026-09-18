import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 높이를 끌게 하면 세 배 · 네 배에서 추가 들보를 뚫고 말뚝이 땅 밑으로 사라져
 * 프레이밍이 무너지고, 캡션의 「두 배」 도 값에 따라 흔들린다. 이 조각이 답하는 것은
 * **들어 올린 만큼 저장되고 그만큼 돌려받는가** 하나이고, 그 답은 아무것도 누르지
 * 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
