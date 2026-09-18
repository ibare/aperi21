import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 누르는 힘을 끌게 하면 압력 화살표가 길어지고 줄어드는 것이 보이지만, 이 조각이 답하는
 * 것은 **같은 압력이 넓이 N 배에서 N 배 힘이 되는가 — 대신 1/N 만 오르는가** 이고, 그
 * 답은 힘의 크기와 무관하다. 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
