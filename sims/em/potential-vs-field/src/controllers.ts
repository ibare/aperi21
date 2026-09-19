import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 **곡선의 가파름과 화살표 길이가 한 짝이다** 하나이고, 그 답은
 * 탐침이 한 번 훑는 동안 아무것도 누르지 않아도 끝난다 (S-piece). 전하 띠를 끄는
 * 조작기는 이웃 `equipotential-surface` 가 이미 하는 일(배치를 바꿔 지형을 보기)이고,
 * 끄는 동안 골짜기가 사라지면 「바닥」 캡션이 틀린다.
 */
export const controllers: readonly ControllerSpec[] = [];
