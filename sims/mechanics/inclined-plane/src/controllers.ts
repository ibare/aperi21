// ========================================================================
// inclined-plane — 조작기
// ========================================================================
// 슬라이더 하나. "그럼 거의 세우면?" 을 독자가 직접 해 보고 싶어지는 자리라 둔다
// (원본 NOTES (c)). 잡고 있는 동안을 `heldPath` 로 알리고, 놓은 뒤 돌아가는 것은
// `step` 이 한다.
//
// 원본은 캔버스 **아래**에 슬라이더를 두었다. 여기서는 그림 위에 얹히므로 늘 비어
// 있는 왼쪽 위에 자리를 준다 (NOTES (a)).
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { SLIDER_RANGE, SLIDER_STEP, text } from './schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'angle',
    type: 'slider',
    binds: { value: 'slider' },
    heldPath: 'held',
    range: SLIDER_RANGE,
    step: SLIDER_STEP,
    digits: 0,
    unit: '°',
    label: text('label.slider'),
    at: { screen: 'top-left' },
  },
];
