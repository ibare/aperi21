import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 공을 끌게 하면 독자가 셋을 **서로 다르게** 옮긴다 — 「똑같이 옮겼는데 셋이 갈린다」
 * 가 이 조각의 전제라, 옮기는 양이 판마다 다르면 가른 것이 바닥 모양인지 손인지 흐려진다.
 * 답은 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
