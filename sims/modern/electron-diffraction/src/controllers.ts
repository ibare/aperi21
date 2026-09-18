import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 전압 손잡이를 주면 고리가 움직이는 것은 보이지만, 시간표가 오르내리는 전압과 손이 다투고
 * (장부 G99) 「처음 자리보다 안쪽」 을 견줄 정박값이 흐려진다. 이 조각이 답하는 것은
 * **전자가 고리를 그리고, 빨라지면 고리가 좁아진다** 하나이고, 그 답은 아무것도 누르지 않아도
 * 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
