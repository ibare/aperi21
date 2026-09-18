import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 길 모양을 끌게 하면 「어떤 길이든 같다」 를 독자가 시험해 볼 수는 있지만, 자동 진행의
 * 두 길이 이미 가장 먼 두 경우 — A 보다 높이 넘는 길과 B 보다 낮게 도는 길 — 다.
 * 끄는 동안 상자 · 막대가 어디 있어야 하는지(처음부터 다시? 지금 가로 자리 그대로?)도
 * 새로 정해야 해서 주장이 흐려진다. 이 조각의 답은 아무것도 누르지 않아도 한 주기
 * 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
