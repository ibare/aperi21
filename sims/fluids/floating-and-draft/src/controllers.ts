import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 밀도를 끌게 하면 독자가 확인할 수 있는 것은 「밀도가 크면 깊이 잠긴다」 인데, 같은 크기 세 상자가
 * 한 물통에서 나란히 그것을 보이고, 물 쪽 밀도는 `salt` 단계가 연속으로 바꿔 보인다. 한 상자를
 * 끄는 슬라이더는 나란히 견주는 그림을 한 상자짜리로 줄인다.
 */
export const controllers: readonly ControllerSpec[] = [];
