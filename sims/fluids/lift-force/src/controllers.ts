// ========================================================================
// lift-force — 조작기
// ========================================================================
// 슬라이더 하나 — 받음각. 0° 로 내리면 위아래가 나란히 가고 압력 띠가 대칭이 된다.
// 앞지르기가 날개의 비대칭 자세에서 온다는 것을 독자가 직접 확인하는 용도 (원본 NOTES (c)).
// 값이 바뀌면 `step` 이 연기를 새로 흘린다.
//
// 원본은 캡션 오른쪽에 두었다. 엔진에서도 캡션 줄 오른쪽 아래에 둔다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { AOA, text } from './schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'aoa',
    type: 'slider',
    binds: { value: 'aoaDeg' },
    range: [AOA.min, AOA.max],
    step: AOA.step,
    digits: 0,
    unit: '°',
    label: text('label.aoa'),
    at: { screen: 'bottom-right' },
  },
];
