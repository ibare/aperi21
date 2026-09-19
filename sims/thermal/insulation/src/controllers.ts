import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 세 감쌈이 이미 나란히 식고 있어서, 독자가 통과율을 끌어 볼 것이 따로 없다. 끌게 하면
 * 곡선 끝 이름이 겹치고 캡션의 「가장 많이 · 가장 적게」 가 값에 따라 흔들린다. 이 조각이
 * 답하는 것은 **같은 시간 뒤 식은 정도가 감쌈마다 다르다** 하나이고, 그 답은 아무것도
 * 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
