import type { ControllerSpec } from '@aperi21/schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'launch-angle',
    type: 'angle-dial',
    binds: { angle: 'launch.theta' },
    range: [0, 90],
    tickAt: [45],
  },
  {
    id: 'launcher',
    type: 'pinball-launcher',
    binds: {
      power: 'launch.v0',
      trigger: 'phase',
    },
    powerRange: [1, 60],
  },
  /**
   * 파라미터(v0 · theta)는 `statePath` 로 위 두 조작기가 이미 만진다. 같은 값을
   * 파라미터 상자로 한 번 더 내놓으면 손잡이가 둘이 되어, 어느 쪽이 참인지
   * 화면이 말하지 못한다.
   */
  { id: 'stages', type: 'stage-tabs' },
  { id: 'views', type: 'view-tabs' },
  { id: 'envs', type: 'env-toggles' },
];
