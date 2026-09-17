// ========================================================================
// river-crossing — 조작기 선언
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';
import { HEADING_RANGE, HEADING_STEP, text } from './schema';

/**
 * 조작기는 하나 — 뱃머리 방향.
 *
 * 주제가 "뱃머리를 어디로 두느냐로 도착점이 달라진다" 라서, 독자가 상류 쪽으로
 * 틀어 맞은편에 닿는 각도(−30°)를 직접 찾아볼 수 있게 둔다. 자동 진행은 0° 에서
 * 주장을 끝내므로 누르지 않아도 된다.
 *
 * 5° 간격으로 붙고 값은 정수로 보인다. 원본의 "상류 쪽 30°" 처럼 부호로 낱말을
 * 고르는 표시는 선언에 로직을 넣게 되므로 하지 않고, 이름표 문안으로 방향을 알린다.
 *
 * 자리는 왼쪽 아래 — 원본의 조작기 줄이 캡션 아래 왼쪽에 있었다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'heading',
    type: 'slider',
    binds: { value: 'headingDeg' },
    range: [HEADING_RANGE[0], HEADING_RANGE[1]],
    step: HEADING_STEP,
    digits: 0,
    label: text('label.heading'),
    // 단위 표기라 번역 대상이 아니다 (C1 판정 3).
    unit: '°',
    at: { screen: 'bottom-left' },
    size: [300, 44],
  },
];
