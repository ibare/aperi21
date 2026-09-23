import type { ControllerSpec } from '@aperi21/schema';
import { U_END } from './schema';

/**
 * 조작기 선언은 데이터다 (원칙 7 ④). 하나 — 자석을 잡아 끄는 것.
 *
 * 자동 진행만으로 주장은 끝나지만, "내가 어느 쪽으로 끌든 힘은 내 반대편" 은
 * 손으로 해 봐야 몸에 남는다. 멈춰 쥐고 있으면 전류가 사라지는 것도 그렇다.
 *
 * 트랙은 자석이 지나가는 축 그 자체다 — 따로 뜨는 슬라이더 상자가 아니다.
 * 잡고 있는 동안 `held` 가 참이 되고, 러너는 그 사실만 적는다. 놓은 뒤 마지막
 * 속도의 방향으로 자동 왕복을 잇는 것은 `physics.step` 이 한다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'magnet-drag',
    type: 'scale-drag',
    heldPath: 'held',
    binds: { value: 'target', held: 'held' },
    track: { pos: [-U_END, 0], direction: [1, 0], size: 2 * U_END },
    range: [-U_END, U_END],
  },
];
