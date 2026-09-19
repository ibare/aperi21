import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 **데우면 금속의 저항은 오르고 반도체의 저항은 내린다** 하나이고, 그 답은
 * 두 막대를 함께 데우고 식히는 시간표로 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 * 온도를 끌게 하면 반도체 쌍이 생기고 사라지는 자리가 시간표의 선형 데움에 묶여 있어(physics
 * `pairsNow`) 끄는 동안의 나이를 셀 수 없고, 두 막대가 같은 온도라는 견줌은 자동 진행으로 충분하다.
 */
export const controllers: readonly ControllerSpec[] = [];
