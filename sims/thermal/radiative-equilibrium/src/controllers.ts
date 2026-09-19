import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 「출발 온도와 무관하게 한 온도로 모인다」 이고, 두 출발점(찬 · 뜨거운)이
 * 아무것도 누르지 않아도 한 주기 안에 그것을 보인다 (S-piece). 출발 온도를 끌게 해도 보이는 것은
 * 같은 값으로 모이는 곡선 하나가 더해질 뿐이다.
 */
export const controllers: readonly ControllerSpec[] = [];
