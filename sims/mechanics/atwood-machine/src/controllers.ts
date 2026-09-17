// ========================================================================
// atwood-machine — 조작기 선언
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';
import { DIFF_RANGE, DIFF_STEP, text } from './schema';

/**
 * 조작기는 하나 — 오른쪽 기계의 두 추 차이 (0~2 kg, 0.1 간격).
 *
 * 합 5 kg 은 그대로 두고 두 추를 (5±차이)/2 로 나눈다. 값을 바꾸면 두 기계를 모두 출발
 * 높이부터 다시 놓아 같은 시계에서 비교되게 한다 — `restart`. 추의 자리가 주기 안
 * 시각의 닫힌 식이라 시계를 0 으로 되돌리는 것만으로 처음이 된다. 끄는 동안에는 0 에
 * 붙잡혀 있다가 놓으면 흐른다.
 *
 * 캡션은 실제 착지로 문장을 고르므로 step 이 주기 안 시각을 따로 센다. 잡는 동안(`heldPath`)
 * 그 시각도 0 에 둔다.
 *
 * 자동 진행만으로 주장은 이미 끝난다. 0 이면 "차이가 없으면 가속도도 없다" 가 보인다.
 * 자리는 왼쪽 아래 — 원본의 조절기 줄이 캡션 아래 왼쪽에 있었다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'diff',
    type: 'slider',
    binds: { value: 'diff' },
    range: [DIFF_RANGE[0], DIFF_RANGE[1]],
    step: DIFF_STEP,
    digits: 1,
    label: text('label.slider'),
    // 단위 표기라 번역 대상이 아니다 (C1 판정 3).
    unit: 'kg',
    restart: true,
    // 잡는 동안 캡션용 주기 안 시각을 0 에 붙잡는다 — 러너가 되돌린 시계와 맞춘다.
    heldPath: 'held',
    at: { screen: 'bottom-left' },
    size: [300, 44],
  },
];
