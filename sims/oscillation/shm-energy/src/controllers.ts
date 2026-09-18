import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 진폭 · 용수철 상수를 끌게 하면 합 E 가 바뀐다. 막대 높이를 E 에 맞추면 끄는 동안
 * 막대가 늘었다 줄었다 해 「합은 그대로다」 가 화면에서 무너지고, 맞추지 않으면 끈 것이
 * 막대에 드러나지 않는다. 이 조각이 보이려는 것은 **한 진동 안에서 높이가 변하지
 * 않는다** 하나이고, 그 말은 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
