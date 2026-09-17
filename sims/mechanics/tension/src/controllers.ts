import type { ControllerSpec } from '@aperi21/schema';
import { GRAB_RADIUS_PX } from './schema';

/**
 * 조작기 선언은 데이터다 (원칙 7). 하나 — 손을 잡아 좌우로 끄는 것.
 *
 * 자동 진행만으로 주장은 끝나지만, 어디까지 끌어도 세 저울이 함께 움직이는지 독자가
 * 직접 확인하게 둔다 (원본 inventory `controls`).
 *
 * 손잡이는 주먹 가운데(`handle`)에 있다. 끌린 자리의 **가로 성분만** 힘으로 바꾸는 것과
 * 놓은 뒤 0.8 초 동안 자동 진행으로 섞어 돌아가는 것은 `physics.step` 이다.
 * 잡혔다는 사실은 `binds.held` 와 `heldPath` 가 **같은 경로**(`held`)에 적는다 — 이름은
 * 하나다. `heldPath` 는 조작기 공통 규약이라 자동 진행이 양보하는 자리를 에디터가 읽는다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'hand-drag',
    type: 'point-drag',
    heldPath: 'held',
    binds: { pos: 'handle', held: 'held' },
    grabRadius: GRAB_RADIUS_PX,
    handle: 'ring',
  },
];
