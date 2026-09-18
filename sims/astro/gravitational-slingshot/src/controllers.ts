import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 **같은 비행이 틀에 따라 다르게 보이는 까닭** 하나이고, 그 답은
 * 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece). 꺾임 각이나 행성 속도를 끌게 하면
 * 「얼마나 빨라지나」 라는 다른 질문이 되고, 나가는 화살표가 판 밖으로 나가 프레이밍이 무너진다.
 */
export const controllers: readonly ControllerSpec[] = [];
