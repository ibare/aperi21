import type { ControllerSpec } from '@aperi21/schema';
import { HIT } from './schema';

/**
 * 왼쪽 원래 장면의 컵 · 책 · 책상을 누르면 그 물체부터 떼어 낸다.
 *
 * 자동 진행만으로 주장은 끝나지만, 독자가 헷갈리는 물체를 바로 골라 볼 수 있게 둔다
 * (원본 NOTES (c)). 자리는 물체가 **쉬는 자리**다 — 떼어 내는 중인 물체를 따라가지 않는다.
 * 사각형이 맞닿으면 먼저 선언한 것이 잡히므로 원본 HIT 순서(컵 · 책 · 책상)로 선언한다.
 * 누르면 러너가 `pressed.<물체>` 에 true 를 적고 `step` 이 소비한 걸음에서 지운다.
 */
export const controllers: readonly ControllerSpec[] = [
  { id: 'press-cup', type: 'press-area', binds: { pressed: 'pressed.cup' }, area: HIT.cup },
  { id: 'press-book', type: 'press-area', binds: { pressed: 'pressed.book' }, area: HIT.book },
  { id: 'press-table', type: 'press-area', binds: { pressed: 'pressed.table' }, area: HIT.table },
];
