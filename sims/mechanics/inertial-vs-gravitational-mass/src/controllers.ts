// ========================================================================
// inertial-vs-gravitational-mass — 조작기 선언
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';
import { text } from './schema';

/**
 * 조작기는 하나 — 올려 볼 물체(돌 · 쇠공 · 나무토막)를 고르는 칩 줄.
 *
 * 크기와 질량이 엇갈린 물체(큰 나무토막은 가볍고 작은 쇠공은 무겁다)로 바꿔도 두 방식이
 * 늘 같은 개수에서 맞는다는 것을 독자가 확인한다. 자동 진행은 돌만으로 주장을 마친다.
 *
 * 고르면 추 1 개부터 다시 시작한다 — `restart`. 이 조각은 시험 시계와 저울 각을 상태에 쌓으므로
 * 엔진 시계를 되돌리는 것만으로는 처음이 되지 않는다. 누르는 동안(`heldPath`)과 고른 값이
 * 바뀐 것을 step 이 알아채 상태를 비운다 (physics.ts `step`).
 *
 * 자리는 왼쪽 아래 — 원본의 물체 단추 줄이 캡션 아래 왼쪽에 있었다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'object',
    type: 'param-chips',
    binds: { value: 'obj' },
    label: text('control.object'),
    options: [
      { value: 'stone', label: text('object.stone') },
      { value: 'iron', label: text('object.iron') },
      { value: 'wood', label: text('object.wood') },
    ],
    restart: true,
    heldPath: 'held',
    at: { screen: 'bottom-left' },
  },
];
