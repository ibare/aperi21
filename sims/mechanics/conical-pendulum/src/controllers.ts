// ========================================================================
// conical-pendulum — 조작기 선언
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';
import { W_MAX, W_MIN, text } from './schema';

/**
 * 조작기는 하나 — 돌리는 빠르기.
 *
 * 독자가 멈춘 빠르기에서 "정말 같은 높이인가" 를 확인하는 자리다. 건드리지 않으면 자동
 * 진행이 주장을 끝낸다 (S-piece). 잡기 전에는 `step` 이 곡선 값을 `omega` 에 적어 손잡이가
 * 따라 움직이고, 잡는 순간(`heldPath`) 수동이 되어 그 뒤로는 놓은 빠르기로 돈다(원본).
 *
 * 자리는 왼쪽 아래 — 원본의 조절기 줄이 캡션 아래 왼쪽에 있었다. 폭은 원본 입력 칸 320 px.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'speed',
    type: 'slider',
    binds: { value: 'omega' },
    heldPath: 'held',
    range: [W_MIN, W_MAX],
    digits: 2,
    // 단위 표기라 번역 대상이 아니다 (C1 판정 3).
    unit: 'rad/s',
    label: text('label.speed'),
    at: { screen: 'bottom-left' },
    size: [320, 44],
  },
];
