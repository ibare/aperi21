import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 속력을 끌게 하면 물결 간격이 바뀌는 것은 보이지만, 「두 배 → 절반」 이라는 정수 비가
 * 흐려지고 안내선에 마루가 딱 맞게 걸리는 순간도 사라진다. 이 조각이 답하는 것은
 * **빨라지면 파장이 짧아지고, 두 배면 절반** 하나이고, 그 답은 아무것도 누르지 않아도
 * 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
