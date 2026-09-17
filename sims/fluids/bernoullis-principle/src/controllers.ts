// ========================================================================
// bernoullis-principle — 조작기
// ========================================================================
// 슬라이더 하나 — 좁은 곳의 굵기(입구 대비). 독자가 "더 좁히면 더 내려가나" 를 직접 해 볼
// 수 있게 (원본 NOTES (c)). 잡는 순간 자동 변화가 멈추고, 자동 중에는 `step` 이 손잡이를
// 지금 굵기에 맞춘다.
//
// 원본은 캔버스 아래 왼쪽에 두었다. 엔진의 조작기는 그림 위에 얹히므로 관 아래 빈 줄
// (왼쪽 아래)에 둔다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { THROAT_RANGE, THROAT_STEP, text } from './schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'throat',
    type: 'slider',
    binds: { value: 'ratio' },
    heldPath: 'held',
    range: THROAT_RANGE,
    step: THROAT_STEP,
    digits: 2,
    label: text('label.throat'),
    at: { screen: 'bottom-left' },
  },
];
