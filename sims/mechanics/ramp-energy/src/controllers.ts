import type { ControllerSpec } from '@aperi21/schema';
import { DROP_MAX, DROP_MIN, DROP_X, LANES } from './schema';

/**
 * 출발 높이 손잡이 — 레인마다 하나씩 **셋**이다.
 *
 * 셋이 같은 자리(`drop`)를 잡는다. 아무 손잡이나 끌면 세 레인의 낙차가 함께
 * 바뀌는 것이 원본의 조작이고, 그것은 조작기가 **인스턴스**이기 때문에 그대로
 * 선언된다 — 같은 종류를 셋 두려고 종류 이름을 따로 만들지 않는다 (원칙 7).
 *
 * 트랙은 그림 속 낙차 점선과 같은 자리다. 위로 끌수록 낙차가 커진다.
 * 잡고 있는 동안 `held` 가 참이 되고(`heldPath`), 그동안 공을 출발선에 세워 두는
 * 일과 놓은 뒤 새 높이로 다시 굴리는 일은 `physics.ts` 의 `step` 이 한다.
 *
 * 이 손잡이가 하는 일은 주장을 **일반화**하는 것이다. 낙차를 줄이면 세 줄의 점
 * 간격이 함께 좁아지는데, 그래도 셋은 여전히 서로 같다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'drop-steep-first',
    type: 'scale-drag',
    binds: { value: 'drop', held: 'held' },
    heldPath: 'held',
    track: {
      pos: [DROP_X, LANES[0].baseY + DROP_MIN],
      direction: [0, 1],
      size: DROP_MAX - DROP_MIN,
    },
    range: [DROP_MIN, DROP_MAX],
  },
  {
    id: 'drop-straight',
    type: 'scale-drag',
    binds: { value: 'drop', held: 'held' },
    heldPath: 'held',
    track: {
      pos: [DROP_X, LANES[1].baseY + DROP_MIN],
      direction: [0, 1],
      size: DROP_MAX - DROP_MIN,
    },
    range: [DROP_MIN, DROP_MAX],
  },
  {
    id: 'drop-steep-last',
    type: 'scale-drag',
    binds: { value: 'drop', held: 'held' },
    heldPath: 'held',
    track: {
      pos: [DROP_X, LANES[2].baseY + DROP_MIN],
      direction: [0, 1],
      size: DROP_MAX - DROP_MIN,
    },
    range: [DROP_MIN, DROP_MAX],
  },
];
