import type { ControllerSpec } from '@aperi21/schema';
import { LEVEL_RANGE, text } from './schema';

/**
 * 조작기는 하나 — 공기 저항 세기.
 *
 * 이 하나를 둔 이유는 **주장이 특정 숫자의 우연이 아님**을 독자가 직접 확인하는
 * 자리이기 때문이다. 어느 값으로 놓아도 저항은 결국 중력을 따라잡고 자국 간격은
 * 평평해진다. 누르지 않아도 조각은 할 말을 마친다 (S-piece).
 *
 * 잡고 있는 동안 `held` 가 참이 된다. 그동안에만 조각이 값을 받아 정수 눈금으로
 * 스냅하고, 세기가 바뀌면 처음부터 다시 떨어진다 (physics.ts `step`).
 *
 * 자리는 왼쪽 아래 — 물체는 가운데 축을 따라 내려오고 사다리의 가장 낮은
 * 가로대도 그보다 위라, 이 구석만 비어 있다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'drag-level',
    type: 'slider',
    binds: { value: 'level' },
    heldPath: 'held',
    range: LEVEL_RANGE,
    label: text('label.drag'),
    at: { screen: 'bottom-left' },
  },
];
