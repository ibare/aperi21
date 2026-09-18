import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 「끝까지 식히면 저항이 0 이 되는가」 하나이고, 그 답은
 * 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece). 온도를 끌게 하면 독자가
 * T_c 를 한 번에 건너뛰어 「수직으로 떨어진다」 는 순간을 못 볼 수 있다.
 */
export const controllers: readonly ControllerSpec[] = [];
