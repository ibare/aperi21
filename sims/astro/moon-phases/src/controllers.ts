import type { ControllerSpec } from '@aperi21/schema';

/**
 * 왼쪽 칸의 달을 끌어 궤도 위 자리를 옮긴다.
 *
 * 독자가 "이 자리면 어떻게 보이지?" 를 직접 해 보게 하는 것이다. 누르지 않아도 한 바퀴(16 초)
 * 안에 주장은 끝난다. 끌린 자리를 궤도 각으로 바꾸고 놓은 뒤 그 자리에서 다시 도는 일은
 * `step` 이 한다. 원본의 잡히는 폭(±34 px)을 반경으로 준다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'moon',
    type: 'point-drag',
    binds: { pos: 'moonPos', held: 'held' },
    grabRadius: 34,
    handle: 'ring',
  },
];
