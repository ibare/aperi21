import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다. 거리를 바꾸는 조작은 자동 낙하가 이미 모든 거리를 훑으므로
 * 새로 알게 되는 것이 없다 (원본 NOTES 「두지 않은 것」).
 */
export const controllers: readonly ControllerSpec[] = [];
