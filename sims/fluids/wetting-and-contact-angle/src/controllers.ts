import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 표면을 독자가 고르게 하면(유리 | 왁스) 바뀌는 순간 가장자리 줄다리기가 기우는 장면은
 * 보이지만, 아무것도 누르지 않은 독자는 한쪽 표면만 보고 지나간다. 이 조각이 답하는 것은
 * **같은 방울이 왜 표면마다 다른 각으로 멈추는가** 하나이고, 그 답은 두 표면을 한 주기
 * 안에 오가며 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
