import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 열면 바로 뿜고, 계속 뿜고, 동시 출발 표지가 알아서 돌아온다. 조각은 아무것도
 * 누르지 않아도 할 말을 마쳐야 한다 — 눌러야 하는 것이 되는 순간 문단 옆에
 * 놓이지 못한다.
 */
export const controllers: readonly ControllerSpec[] = [];
