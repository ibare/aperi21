import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 **같은 저항에 전압을 올리면 전류가 비례해 는다** 하나이고, 그 답은
 * 전압을 한 칸씩 올리는 시간표와 두 저항을 나란히 둔 배치로 아무것도 누르지 않아도 한
 * 주기 안에 끝난다 (S-piece). 전압을 끌게 하면 점이 정박값 사이에 찍혀 「칸 하나 = 같은
 * 전압」 이 흐려지고, 저항을 끌게 하면 두 직선의 견줌이 한 직선의 기울기 움직임으로 바뀐다.
 */
export const controllers: readonly ControllerSpec[] = [];
