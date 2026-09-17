import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다 (원본 `controls: []`).
 *
 * 열면 이미 달리고 있고, 제곱 몫이 앞지르면 붙잡았다가 처음부터 다시 달린다.
 * 계수를 만지게 하면 주장이 「계수에 따라 달라진다」 로 옮겨 간다.
 */
export const controllers: readonly ControllerSpec[] = [];
