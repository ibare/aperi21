import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 시험 전하를 독자가 끌어 놓게 하는 `point-drag` 를 생각했지만, 네 전하가 놓이고 옮겨
 * 가고 하나가 판 밖으로 나가는 자동 진행이 「어디에 놓든 같은 힘, 가장자리 밖에서만
 * 달라진다」 를 이미 보이고, 손잡이 고리를 숨길 수 없다(장부 G21). 이 조각이 답하는
 * 것은 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
