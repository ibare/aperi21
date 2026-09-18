import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 받는 양 · 내놓는 양을 끌게 하면 「어느 쪽 몫이 큰가」 를 독자가 값으로 맞춰 보게 되는데,
 * 이 조각이 보이려는 것은 값이 아니라 **입구를 맞추는 동작** 하나다. 그 동작은 아무것도
 * 누르지 않아도 한 주기 안에 일어난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
