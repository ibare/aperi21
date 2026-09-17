import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 자동 진행으로 주장이 끝난다. 자기장 세기를 조작하게 하면 주기가 바뀌어 두 번째
 * 주장이 되고, 속력 조작은 「같은 주기」 를 숫자 비교로 옮겨 놓는다 (원본 NOTES (c)).
 */
export const controllers: readonly ControllerSpec[] = [];
