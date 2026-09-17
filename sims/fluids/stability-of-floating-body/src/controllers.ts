// ========================================================================
// stability-of-floating-body — 조작기
// ========================================================================
// 슬라이더 하나 — 두 배의 무게중심 높이. 자동 진행만으로 주장은 끝나지만, "위에 있어도
// 된다, 다만 어디까지인가" 를 독자가 직접 확인하게 둔다. 0.60 m 이하로 내리면 좁은 배도
// 되세워지고 캡션도 따라 바뀐다. 옮기면 `step` 이 자취를 비우고 기울기별 표를 다시 만든다
// (원본 `setZg` — 자세는 그대로, 다시 놓지 않는다).
//
// 원본은 캡션 아래 왼쪽 줄에 두었다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { ZG, text } from './schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'zg',
    type: 'slider',
    binds: { value: 'zg' },
    range: [ZG.min, ZG.max],
    step: ZG.step,
    digits: 2,
    unit: 'm',
    label: text('label.zg'),
    at: { screen: 'bottom-left', offset: [-8, -4] },
  },
];
