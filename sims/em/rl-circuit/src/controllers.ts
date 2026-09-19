// ========================================================================
// rl-circuit — 조작기 선언
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';
import { text } from './schema';

/**
 * 조작기는 하나 — 코일의 크기(작은 L · 큰 L).
 *
 * 독자가 「L 이 크면?」 을 직접 해 보면 같은 일(코일 몫이 저항으로 넘어감)이 두 배 느리게
 * 일어난다. 인덕턴스 값은 스테이지 상수(`inductance` · `inductanceLarge`)이고 칩은 어느 쪽을
 * 쓸지만 고른다. 고르면 조각 시계가 주기 첫머리로 돌아가(`restart`) 열린 스위치부터 다시 닫는다.
 * 코일 이름표(`L = … H`)가 고른 값을 그대로 보인다.
 *
 * 자리는 오른쪽 위 — 캡션 줄(아래 가운데)과 회로를 비킨다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'coil',
    type: 'param-chips',
    binds: { value: 'coil' },
    label: text('control.coil'),
    options: [
      { value: 'small', label: text('option.small') },
      { value: 'large', label: text('option.large') },
    ],
    restart: true,
    at: { screen: 'top-right' },
  },
];
