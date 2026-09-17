import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 아무것도 누르지 않아도 대조가 끝난다. 가속도 방향을 뒤집는 조작기를 두면 같은
 * 대조를 독자에게 한 번 더 시키는 것뿐이다 (원본 NOTES (c)).
 */
export const controllers: readonly ControllerSpec[] = [];
