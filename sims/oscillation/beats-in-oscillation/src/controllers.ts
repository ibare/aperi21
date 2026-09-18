import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 견주는 것은 **두 진동수 차이** 하나이고, 그 두 값(Δf · Δf/2)이 처음부터
 * 위아래 두 줄로 같은 시간축에 놓여 있다. 차이를 끄는 슬라이더를 두면 비교가 기억의
 * 일이 되고, 그 조작은 이웃 조각 `waves/beats` 가 이미 한다. 아무것도 누르지 않아도
 * 8 초 안에 「위는 두 번, 아래는 한 번」 이 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
