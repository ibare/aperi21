import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 「적외선을 되돌리는 층을 넣으면 같은 햇빛에서 지표가 더 높은 온도에 선다」 이고,
 * 층이 없을 때 → 층을 넣음 → 새 평형이 아무것도 누르지 않아도 한 주기 안에 일어난다 (S-piece).
 * ε 를 끌게 하면 새 온도 글자를 계산해 띄워야 해서 선언한 정박값을 배신한다 (S-piece 유효숫자).
 */
export const controllers: readonly ControllerSpec[] = [];
