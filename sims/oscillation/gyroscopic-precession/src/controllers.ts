import type { ControllerSpec } from '@aperi21/schema';
import { L_RANGE, L_STEP, text } from './schema';

/**
 * 조작기는 하나 — 스핀(|L|).
 *
 * 자동 진행이 주장을 이미 마친다. 이것은 「같은 길이의 토막이 더 긴 L 을 덜 돌린다」를
 * 독자가 직접 확인하는 자리다. 값을 바꾸면 `step` 이 토막을 비우고 새 반지름에서 다시
 * 5 개로 시작한다(원본). 자리는 원본처럼 캡션 줄의 오른쪽 — 옆에 「한 바퀴 N초」가 붙는다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'spin',
    type: 'slider',
    binds: { value: 'spin' },
    range: L_RANGE,
    step: L_STEP,
    digits: 1,
    label: text('control.spin'),
    at: { screen: 'bottom-right', offset: [-110, 0] },
    size: [160, 44],
  },
];
