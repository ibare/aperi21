import type { ControllerSpec } from '@aperi21/schema';

export function controllers(): ControllerSpec[] {
  return [
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
  ];
}
