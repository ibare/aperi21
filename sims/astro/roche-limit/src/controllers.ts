import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다. 다가오는 한 번이 출발 거리에서 한계 안쪽까지 모든 거리를 훑으므로 거리를
 * 끌어 새로 알게 되는 것이 없다. 밀도 비를 고르는 칩은 「한계가 어디로 옮겨 가나」 라는
 * 다른 질문이라 두지 않았다 (NOTES 「두지 않은 것」).
 */
export const controllers: readonly ControllerSpec[] = [];
