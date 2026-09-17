import type { ControllerSpec } from '@aperi21/schema';
import { GRAB_RADIUS_PX } from './schema';

/**
 * 조작기 선언은 데이터다 (원칙 7). 하나 — 가벼운 추를 끄는 것.
 *
 * 자동 진행만으로 주장은 끝나지만, 독자가 직접 거리를 바꿔 기울기와 수평을 확인해
 * 볼 수 있게 둔다 (원본 inventory `controls`).
 *
 * 손잡이는 가벼운 추 가운데(`handle`)에 있다. 끌린 자리를 저울대 위로 투영하는 것은
 * `physics.step` 이다 — `snapTo` 는 선언이라 도는 저울대를 따라가지 못한다.
 * 잡혔다는 사실은 `binds.held` 가 적는다. 같은 사실에 `heldPath` 로 이름을 하나 더
 * 두지 않는다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'light-weight-drag',
    type: 'point-drag',
    binds: { pos: 'handle', held: 'held' },
    grabRadius: GRAB_RADIUS_PX,
    handle: 'ring',
  },
];
