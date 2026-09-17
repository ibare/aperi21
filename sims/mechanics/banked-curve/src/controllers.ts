// ========================================================================
// banked-curve — 조작기
// ========================================================================
// 경사각 슬라이더 하나와 「자동으로 보기」 단추 하나.
//
// 자동 순환만으로 주장은 끝난다. 다만 "맞는 각은 한 점, 양옆은 반대로 실패" 를 손으로
// 가늠해 보게 하려고 슬라이더를 둔다 (원본 NOTES (c)). 손대면 `heldPath` 로 알아챈 `step`
// 이 자동을 멈추고 그 기울기로 되풀이한다. 자동 중에는 `step` 이 슬라이더를 지금 기울기에
// 맞춘다. 「자동으로 보기」는 손으로 정한 뒤에만 보이고(`visibleWhen`), 누르면 러너가
// `pressed` 에 true 를 적고 `step` 이 소비하며 지운다.
//
// 원본은 캔버스 **아래** 줄에 슬라이더와 단추를 나란히 두었다. 같은 순서로 왼쪽 아래에 둔다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { SLIDER_RANGE, SLIDER_STEP, text } from './schema';

/** 슬라이더 크기(화면 px). 원본 막대 폭 280 px 에 이름표·값 자리를 더했다. */
const SLIDER_SIZE: [number, number] = [300, 36];

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'angle',
    type: 'slider',
    binds: { value: 'slider' },
    heldPath: 'held',
    range: SLIDER_RANGE,
    step: SLIDER_STEP,
    digits: 1,
    unit: '°',
    label: text('label.slider'),
    size: SLIDER_SIZE,
    at: { screen: 'bottom-left' },
  },
  {
    id: 'auto',
    type: 'button',
    binds: { pressed: 'pressed' },
    visibleWhen: 'manual',
    label: text('label.auto'),
    at: { screen: 'bottom-left', offset: [SLIDER_SIZE[0] + 12, -6] },
  },
];
