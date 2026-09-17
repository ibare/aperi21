// ========================================================================
// rc-circuit — 조작기 선언
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';
import { text } from './schema';

/**
 * 조작기는 하나 — 저항 R 의 세 단(작게 · 기본 · 크게).
 *
 * 독자가 「저항이 크면?」 을 직접 해 보면 흐름이 느려지고 τ 초 값만 바뀌며, τ 단위 그래프의
 * 모양은 그대로다. 고르면 충전부터 다시 시작한다 — 누르는 동안(`heldPath`)과 고른 값이
 * 바뀐 것을 step 이 알아채 상태를 비운다 (physics.ts `step`).
 *
 * 원본은 끝 이름표(작게 · 크게)가 붙은 세 단 슬라이더였다. `slider` 는 값 글자를 끌 수
 * 없고 끝 이름표가 없어 「0 · 1 · 2」 가 뜬다(장부 G22) — 단 이름이 곧 뜻이라 칩 줄로 둔다.
 * 자리는 오른쪽 아래 — 원본의 슬라이더가 캡션 오른쪽에 있었다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'resistance',
    type: 'param-chips',
    binds: { value: 'r' },
    label: text('control.resistance'),
    options: [
      { value: 0, label: text('option.small') },
      { value: 1, label: text('option.default') },
      { value: 2, label: text('option.large') },
    ],
    heldPath: 'held',
    at: { screen: 'bottom-right' },
  },
];
