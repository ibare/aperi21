import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 두 렌즈를 한 화면에 나란히 두고 같은 평행광을 보내는 것으로 「한쪽은 렌즈 뒤 한 점에
 * 모이고, 한쪽은 렌즈 앞 한 점에서 나온 것처럼 퍼진다」 가 자동 진행으로 끝난다.
 * 초점 거리를 끌게 하면 두 초점이 함께 움직일 뿐 주장이 늘지 않는다.
 */
export const controllers: readonly ControllerSpec[] = [];
