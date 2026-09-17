// ========================================================================
// refraction-of-waves — 조작기
// ========================================================================
// 슬라이더 하나 — 느린 쪽 속력. 「뒤처짐이 없으면 꺾임도 없다」 는 대조를 독자가 직접
// 해 볼 수 있게 둔다 (원본 NOTES (c)). 1 까지 올리면 점선이 사라지고 마루가 곧게 지나간다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { RATIO, text } from './schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'ratio',
    type: 'slider',
    binds: { value: 'ratio' },
    range: [RATIO.min, RATIO.max],
    step: RATIO.step,
    digits: 2,
    label: text('label.ratio'),
    at: { screen: 'bottom-right' },
  },
];
