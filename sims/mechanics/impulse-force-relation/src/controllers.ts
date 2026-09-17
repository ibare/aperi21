// ========================================================================
// impulse-force-relation — 조작기 선언
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';
import { T_SOFT_RANGE, T_SOFT_STEP, text } from './schema';

/**
 * 조작기는 하나 — 방석에서 멈추는 데 걸리는 시간 (0.25~2 초, 0.25 간격, 기본 1.5).
 *
 * 0.25 로 두면 벽과 같은 뾰족한 곡선이 되고, 늘리면 언덕이 낮아진다. 값을 바꾸면 두 공을 처음부터
 * 다시 날려 같은 시계에서 비교되게 한다 — `restart`. 공 · 화살표 · 곡선이 주기 안 시각의 닫힌
 * 식이라 시계를 0 으로 되돌리는 것만으로 처음이 된다.
 *
 * 캡션은 방석 쪽이 실제로 멈췄는지로 문장을 고르므로 step 이 주기 안 시각을 따로 센다. 잡는
 * 동안(`heldPath`) 그 시각도 0 에 둔다.
 *
 * 자리는 오른쪽 아래 — 원본의 조절기가 캡션 줄 오른쪽 끝에 있었다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'soft-time',
    type: 'slider',
    binds: { value: 'tSoft' },
    range: [T_SOFT_RANGE[0], T_SOFT_RANGE[1]],
    step: T_SOFT_STEP,
    digits: 2,
    label: text('label.slider'),
    // 단위 표기라 번역 대상이 아니다 (C1 판정 3).
    unit: 's',
    restart: true,
    heldPath: 'held',
    at: { screen: 'bottom-right' },
  },
];
