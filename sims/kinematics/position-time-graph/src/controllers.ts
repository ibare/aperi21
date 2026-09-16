// ========================================================================
// position-time-graph — 조작기 선언
// ========================================================================
// 빠르기 손잡이 둘. 자동 진행이 이미 할 말을 마치지만, 손으로 올려 선이 그 자리에서
// 꺾이는 것을 보는 일은 대체할 수 없다.
//
// 손잡이는 state 의 빠르기를 **직접** 쥔다. 자동 진행도 같은 자리에 값을 쓰므로,
// 손대기 전에는 손잡이가 지금 빠르기를 비추기만 한다 — 원본이 매 프레임
// `sA.value = st.v[0]` 로 하던 일이 선언 하나로 사라졌다.
//
// 잡고 있는 동안은 `heldPath` 가 참이 된다. 러너는 그 사실만 적고, 주도권을 어떻게
// 가져가고 놓은 뒤 무엇으로 돌아갈지는 `physics.step` 이 안다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { text, V_RANGE } from './schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'speed-a',
    type: 'slider',
    heldPath: 'heldA',
    binds: { value: 'a.v' },
    range: [V_RANGE[0], V_RANGE[1]],
    label: text('label.speedA'),
  },
  {
    id: 'speed-b',
    type: 'slider',
    heldPath: 'heldB',
    binds: { value: 'b.v' },
    range: [V_RANGE[0], V_RANGE[1]],
    label: text('label.speedB'),
  },
];
