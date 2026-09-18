import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 도착하면 이미 오가는 중이고, 멈출 때까지 두고 보면 주장이 끝난다 — 독자가 직접
 * 해 보아야 할 것이 없다 (S-piece). 거칠기를 고르게 하는 안을 재어 봤지만, 거칠기를
 * 바꾸면 멈추기까지의 반주기 수가 달라지는데 시간표 단계의 길이는 조작값을 따라가지
 * 못한다(장부 G13). 짧게 끝난 뒤에도 `slide` 단계가 이어져 캡션이 화면과 어긋난다.
 */
export const controllers: readonly ControllerSpec[] = [];
