import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 깊이를 끌게 하면 독자가 확인할 수 있는 것은 「어느 깊이에서나 차이가 같다」 인데, 그것은
 * 자동 진행의 `sink` 단계가 이미 연속으로 보여 준다. 상자 높이를 바꾸는 조작기는 「차이는
 * 잠긴 높이를 따른다」 를 새로 묻는 일이라 이 조각의 한 주장을 둘로 쪼갠다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
