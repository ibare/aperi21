import type { ControllerSpec } from '@aperi21/schema';
import { SPEED_RANGE, SPEED_STEP, text } from './schema';

/**
 * 관찰자 속도 하나.
 *
 * 자동 진행은 세 값(오른쪽 0.60c · 왼쪽 0.60c · 정지)만 보여 준다. 독자가 0.05c 같은
 * 작은 속도에서도 순서가 갈린다는 것(간격만 좁아진다)을 직접 확인하게 둔다. 잡는 순간
 * 자동 순환을 멈추고 그 속도로 계속 훑는다 — 그 전환은 `step` 이 `held` 를 보고 한다.
 * 자동 진행 중에는 조작기가 자동 속도를 따라 움직인다(`step` 이 `slider` 에 적는다).
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'speed',
    type: 'slider',
    binds: { value: 'slider' },
    heldPath: 'held',
    range: SPEED_RANGE,
    step: SPEED_STEP,
    digits: 2,
    unit: 'c',
    label: text('label.speed'),
    at: { screen: 'bottom-right' },
  },
];
