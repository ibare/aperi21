import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 아무것도 누르지 않아도 켜짐 → 번짐 → 꺼짐으로 주장이 끝난다. 파원 거리 · 파장
 * 조절은 「줄 개수가 바뀐다」 는 다른 주장이라 두지 않는다.
 */
export const controllers: readonly ControllerSpec[] = [];
