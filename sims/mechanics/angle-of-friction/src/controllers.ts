// ========================================================================
// angle-of-friction — 조작기
// ========================================================================
// 슬라이더 하나 — 무거운 쪽 상자 수(2~5). 독자가 "더 무거우면?" 을 직접 해 볼 수 있게
// (원본 NOTES (c)). 잡고 있는 동안을 `heldPath` 로 알리고, 그 수를 언제 올릴지
// (기울이는 중이면 바로, 아니면 다음 회차)는 `step` 이 정한다.
//
// 원본은 캔버스 아래에 두었다. 여기서는 그림 위에 얹히므로 판이 가장 높이 서도 비어
// 있는 왼쪽 위에 둔다 (NOTES (a)).
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { STACK_RANGE, STACK_STEP, text } from './schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'stack',
    type: 'slider',
    binds: { value: 'slider' },
    heldPath: 'held',
    range: STACK_RANGE,
    step: STACK_STEP,
    digits: 0,
    label: text('label.slider'),
    at: { screen: 'top-left' },
  },
];
