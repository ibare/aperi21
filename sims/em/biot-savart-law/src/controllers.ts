import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 **조각마다의 작은 장이 어떻게 더해져 전체 장이 되는가** 하나이고,
 * 그 답은 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece). 관측점을 끌게 하면 축을
 * 벗어난 자리에서 사슬이 닫히지 않아 「옆 몫이 지워진다」 는 이 그림의 결론이 바뀐다 —
 * 그것은 다른 조각의 주장이다.
 */
export const controllers: readonly ControllerSpec[] = [];
