// ========================================================================
// thermal-convection — 조작기
// ========================================================================
// 슬라이더 하나 — 흐름 세기. 0 으로 내리면 같은 온도차에서도 열이 올라가지 못하고 제자리에서
// 번지기만 한다. 「실려 간다」 가 흐름 때문임을 독자가 직접 확인하는 용도 (원본 NOTES (b)).
// 실제 흐름 세기는 `step` 이 이 값을 부드럽게 따라가게 한다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { FLOW_CONTROL, text } from './schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'flow',
    type: 'slider',
    binds: { value: 'flow' },
    range: [FLOW_CONTROL.min, FLOW_CONTROL.max],
    step: FLOW_CONTROL.step,
    digits: 2,
    label: text('label.flow'),
    at: { screen: 'bottom-right' },
  },
];
