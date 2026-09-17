// ========================================================================
// fictitious-force — 조작기
// ========================================================================
// 오른쪽 추의 질량 슬라이더 하나 (1~3 kg, 1 kg 간격).
//
// 자동 진행만으로도 1 kg 대 3 kg 비교가 주장을 마친다. 다만 "질량을 바꿔도 각도가 안
// 변한다" 는 직접 끌어 볼 때 가장 설득력이 있다 (원본 NOTES (c)). 자동이 이 값을 밀지
// 않으므로 `heldPath` 는 두지 않는다.
//
// 원본은 캔버스 **아래** 줄에 슬라이더를 두었다. 왼쪽 아래에 둔다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { MASS_RANGE, MASS_STEP, text } from './schema';

/** 슬라이더 크기(화면 px). 원본 막대 폭 160 px 에 이름표·값 자리를 더했다. */
const SLIDER_SIZE: [number, number] = [260, 36];

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'mass',
    type: 'slider',
    binds: { value: 'heavyMass' },
    range: MASS_RANGE,
    step: MASS_STEP,
    digits: 0,
    unit: 'kg',
    label: text('label.mass'),
    size: SLIDER_SIZE,
    at: { screen: 'bottom-left' },
  },
];
