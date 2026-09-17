import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 반지름을 바꾸게 하면 칸 수가 정수가 아니게 되어 「한 칸 대 열여섯 칸」 의 셈이
 * 흐려진다. 조각은 아무것도 누르지 않아도 할 말을 마친다.
 */
export const controllers: readonly ControllerSpec[] = [];
