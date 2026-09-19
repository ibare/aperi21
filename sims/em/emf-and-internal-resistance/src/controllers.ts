import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 **전류를 많이 끌어 쓸수록 단자 전압이 내려간다** 하나이고, 그 답은
 * 스위치를 닫고 바깥 저항을 한 단계씩 줄이는 시간표로 아무것도 누르지 않아도 한 주기 안에
 * 끝난다 (S-piece). 바깥 저항을 끌게 하면 점이 정박값 사이에 흩어져 「점들이 한 직선에
 * 놓인다」 를 모으는 시간이 독자의 손에 달리고, r 을 끌게 하면 주장이 기울기 비교로 옮겨 간다.
 */
export const controllers: readonly ControllerSpec[] = [];
