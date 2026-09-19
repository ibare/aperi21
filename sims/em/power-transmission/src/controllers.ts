import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 **같은 전력을 보낼 때 전압을 올리면 선 손실이 제곱으로 준다** 하나이고,
 * 두 전압을 위아래에 나란히 두어 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 * 전압을 끌게 하면 두 줄의 견줌이 한 줄의 움직임으로 바뀌고, 막대 배율 · 경계가 가장 낮은
 * 전압에 묶여 있다(손실이 보낸 전력을 넘으면 그림이 무너진다).
 */
export const controllers: readonly ControllerSpec[] = [];
