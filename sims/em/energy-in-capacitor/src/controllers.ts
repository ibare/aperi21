import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 「왜 QV 가 아니라 절반인가」 하나이고, 그 답은 아무것도 누르지
 * 않아도 한 주기 안에 끝난다 (S-piece). 몫 수를 끌게 하면 띠가 가늘어질 뿐 넓이는 그대로
 * 삼각형이라 새로 보이는 것이 없고, 슬라이더 값 글자가 뜬다(장부 G22).
 */
export const controllers: readonly ControllerSpec[] = [];
