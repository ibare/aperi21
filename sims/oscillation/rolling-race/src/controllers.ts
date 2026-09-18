import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 **크기 · 질량이 아니라 모양이 순서를 정한다** 하나이고, 그 답은
 * 크기가 다른 원판 둘이 나란히 닿는 것으로 아무것도 누르지 않아도 한 주기 안에 끝난다.
 * 반지름 슬라이더를 두면 독자가 바꿔도 아무 일도 일어나지 않는 조작기가 된다 — 그것이
 * 요점이긴 하지만, 그 요점은 이미 두 원판이 화면에서 말한다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
