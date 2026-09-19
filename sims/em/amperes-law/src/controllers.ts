import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 **길의 모양을 바꿔도 한 바퀴의 합이 같은가, 전류를 감싸지 않으면
 * 어떻게 되는가** 하나이고, 자동 진행이 모양이 다른 세 길을 한 주기 안에 모두 걷는다 (S-piece).
 * 고리를 끌게 하면 같은 비교를 손으로 한 번 더 하는 것이 된다.
 */
export const controllers: readonly ControllerSpec[] = [];
