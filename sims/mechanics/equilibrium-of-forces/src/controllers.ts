import type { ControllerSpec } from '@aperi21/schema';
import { GRAB_RADIUS_PX } from './schema';

/**
 * 조작기 선언은 데이터다 (원칙 7). 하나 — 매듭을 끄는 것.
 *
 * 자동 진행만으로 주장은 끝나지만, 독자가 평형을 깨 보면 틈이 벌어지고 놓으면 다시
 * 닫히는 자리로 돌아오는 것을 확인할 수 있게 둔다 (원본 inventory `controls`).
 *
 * 끌린 자리를 범위 안으로 붙이고, 놓은 뒤 닫히는 자리로 끌려가는 것은 `physics.step`
 * 이다. 잡혔다는 사실은 `binds.held` 가 적는다 — 같은 사실에 `heldPath` 로 이름을
 * 하나 더 두지 않는다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'knot-drag',
    type: 'point-drag',
    binds: { pos: 'handle', held: 'held' },
    grabRadius: GRAB_RADIUS_PX,
    handle: 'ring',
  },
];
