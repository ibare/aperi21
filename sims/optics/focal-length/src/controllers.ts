import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 초점 거리를 끌게 하는 슬라이더를 두면 독자가 멈춘 자리의 값이 선언한 정박값이 아니게 되어,
 * 화면의 `{f} cm` 글자와 캡션이 계산한 중간값을 띄워야 한다 (S-piece 유효숫자). 게다가 이
 * 조각이 답하는 것은 **초점 거리가 상의 자리를 정한다** 하나이고, 그 답은 시간표가 초점 거리를
 * 두 정박값 사이로 줄였다 늘리는 동안 아무것도 누르지 않아도 끝난다 — 줄이는 쪽과 늘리는 쪽이
 * 한 주기 안에 모두 일어난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
