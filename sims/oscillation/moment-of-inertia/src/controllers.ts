// ========================================================================
// moment-of-inertia — 조작기
// ========================================================================
// 슬라이더 하나 — 오른쪽 질량을 둘 자리(0.30R ~ 1.00R, 0.05 간격). 자동 진행은 세 자리만
// 보이므로, 독자가 0.05R 씩 옮기며 뒤처짐이 거리보다 가파르게 커지는 것을 직접 느끼게 한다.
//
// 만지면 두 바퀴가 멈춘 상태에서 같은 돌림힘으로 새 시행을 시작한다 — `restart` 로 조각 시계를
// 0 에 두고, `heldPath` 로 잡는 순간 지금 바퀴 각을 이어 받는다(step). 그 뒤로는 그 반지름으로
// 돌림 + 멈춤을 반복한다. 자동 진행 중에는 슬라이더가 지금 반지름을 따라간다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';
import { SLIDER_RANGE, SLIDER_STEP, text } from './schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'radius',
    type: 'slider',
    binds: { value: 'r' },
    range: SLIDER_RANGE,
    step: SLIDER_STEP,
    digits: 2,
    // 반지름 단위 표식 (C1 판정 3).
    unit: 'R',
    label: text('label.slider'),
    restart: true,
    heldPath: 'held',
    at: { screen: 'bottom-right' },
  },
];
