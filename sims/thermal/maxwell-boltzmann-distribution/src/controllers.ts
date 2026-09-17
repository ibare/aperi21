import type { ControllerSpec } from '@aperi21/schema';
import { TEMP_RANGE, text } from './schema';

/**
 * 조작기는 하나 — 온도.
 *
 * 독자가 중간 온도에서 멈춰 보고 싶을 때를 위해 둔다. 누르지 않아도 조각은 할 말을
 * 마친다 (S-piece). 잡는 순간 `held` 가 참이 되고, 그 뒤로는 자동 진행이 멈춰 온도가
 * 슬라이더 값으로 부드럽게 따라간다 (physics.ts `step`).
 *
 * 자리는 왼쪽 아래, 캡션과 한 줄 — 원본의 조작기 줄이 그림 아래였다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'temperature',
    type: 'slider',
    binds: { value: 'sliderT' },
    heldPath: 'held',
    range: TEMP_RANGE,
    step: 10,
    digits: 0,
    unit: 'K',
    label: text('label.temperature'),
    at: { screen: 'bottom-left' },
    size: [220, 44],
  },
];
