import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 누르는 힘을 끌게 하면 독자는 곧추서는 끝(2γ)을 넘기거나 그 앞에서 멈춰, 「T 의 크기는
 * 그대로이고 방향만 돈다 → 곧추서면 뚫린다」 를 한 번에 보지 못한다. 이 조각이 답하는
 * 것은 **무엇이 바늘을 받치는가** 하나이고, 그 답은 아무것도 누르지 않아도 한 주기
 * 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
