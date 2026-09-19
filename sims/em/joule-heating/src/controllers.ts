import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 **직렬로 이은 두 저항 중 큰 쪽이 먼저 뜨거워진다** 하나이고, 그 답은
 * 스위치를 닫고 여는 시간표만으로 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 * 저항을 끌게 하면 두 덩어리의 견줌이 한 덩어리의 빠르기 움직임으로 바뀐다.
 */
export const controllers: readonly ControllerSpec[] = [];
