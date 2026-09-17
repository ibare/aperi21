import type { ControllerSpec } from '@aperi21/schema';

import { ORBITAL_KEYS, text } from './schema';

/**
 * 궤도 고르기 — 1s · 2p · 3d.
 *
 * 누르지 않아도 기본 2p 로 주장은 끝난다. 누르면 발견 자리를 비우고 처음부터 다시
 * 쌓는다(조각의 `step` 이 `orbital` ≠ `shown` 을 보고 한다). 한 점씩 찍히는 처음 장면을
 * 다시 보는 것과, 상태가 다르면 쌓이는 모양이 달라진다는 것을 독자가 해 보게 한다.
 *
 * 원본처럼 캡션 줄 오른쪽 끝에 둔다. 줄 이름표는 없다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'orbital',
    type: 'param-chips',
    binds: { value: 'orbital' },
    at: { screen: 'bottom-right', offset: [-16, -6] },
    options: ORBITAL_KEYS.map((k) => ({ value: k, label: text(`option.${k}`) })),
  },
];
