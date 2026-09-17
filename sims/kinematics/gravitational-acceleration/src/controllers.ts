import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 던지는 속력을 바꾸게 하면 꼭대기 자리만 옮겨지고 주장(변화량 조각의 길이가
 * 늘 같다)은 그대로라 덧붙일 말이 없다. 조각은 누르지 않아도 할 말을 마친다.
 */
export const controllers: readonly ControllerSpec[] = [];
