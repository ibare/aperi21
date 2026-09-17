import type { ControllerSpec } from '@aperi21/schema';
import { FRICTION_RANGE, FRICTION_STEP, text } from './schema';

/**
 * 조작기는 하나 — 마찰.
 *
 * 자동 진행은 기본 0.40 으로 이미 주장을 마친다. 이것을 둔 이유는 대조를 독자가
 * 직접 확인하게 하려는 것이다 — 0 으로 두면 상태점이 제 고리를 돌기만 한다.
 * 원본처럼 캡션 줄의 오른쪽 끝에 둔다. 자리는 저작 결정이라 선언이 말한다 (원칙 7).
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'friction',
    type: 'slider',
    binds: { value: 'friction' },
    range: FRICTION_RANGE,
    step: FRICTION_STEP,
    digits: 2,
    label: text('control.friction'),
    at: { screen: 'bottom-right' },
  },
];
