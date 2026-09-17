import type { ControllerSpec } from '@aperi21/schema';

import { text } from './schema';

/**
 * 액체 — 두 칸 선택 (물 | 수은).
 *
 * 자동 진행은 물만으로 주장을 마친다. 주제의 「하강」 은 같은 기제의 부호만 뒤집힌 것이라
 * 조각을 따로 두지 않고 독자가 확인하게 둔다. 고르면 조각의 `step` 이 기둥을 처음부터 다시
 * 담근다. 같은 칸을 다시 눌러도 다시 담그도록 누른 순간을 `heldPath` 로 알아챈다.
 *
 * 원본은 캡션 줄 오른쪽에 두었다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'liquid',
    type: 'param-chips',
    binds: { value: 'liquid' },
    heldPath: 'chipHeld',
    at: { screen: 'bottom-right', offset: [-8, -8] },
    options: [
      { value: 'water', label: text('option.water') },
      { value: 'mercury', label: text('option.mercury') },
    ],
  },
];
