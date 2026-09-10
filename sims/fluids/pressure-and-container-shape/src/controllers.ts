// ========================================================================
// pressure-and-container-shape — 조작 UI 선언
// ========================================================================
// 조각이므로 조작기는 하나다. 아무것도 만지지 않아도 물은 저 혼자 차오르고
// 수면은 나란해지며 세 압력은 같은 숫자에 이른다. 슬라이더는 그 뒤에,
// "다른 높이에서도 그런가" 를 독자가 직접 확인하기 위해서만 있다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';
import { TARGET_LEVEL_RANGE, text } from './schema';

/** Bundle.controllers */
export function controllers(): ControllerSpec[] {
  return [
    {
      id: 'water-level',
      type: 'slider',
      binds: { value: 'targetHeight' },
      range: [TARGET_LEVEL_RANGE[0], TARGET_LEVEL_RANGE[1]],
      label: text('label.targetHeight'),
      unit: 'm',
    },
  ];
}
