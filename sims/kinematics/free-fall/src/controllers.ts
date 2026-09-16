import type { ControllerSpec } from '@aperi21/schema';

import { AUTO, MASSES, text } from './schema';

/**
 * 무거운 공의 무게 — 후보 넷 중 하나를 고르는 칩 줄.
 *
 * 주장은 "무게를 아무리 키워도 결과가 같다" 인데, 독자가 직접 극단값을 눌러 봐야
 * "이 숫자에서만 우연히 그런 것 아닌가" 가 남지 않는다. 그래서 자동 순환 말고도
 * 2 · 10 · 50 kg 을 손으로 고를 수 있게 둔다.
 *
 * **환경(`env-toggles`)도 단계(`stage-tabs`)도 아니다.** 질량은 그 물체의 값이라
 * 값을 고르는 조작기(`param-chips`)가 맞는 자리다.
 *
 * 자리를 선언한다. 엔진의 조작기는 캔버스 **위에** 얹히는데, 기본 자리(왼쪽 아래)는
 * 캡션 슬롯(아래 가운데)과 같은 높이라 좁은 임베드에서 겹친다. 두 공은 위에서
 * 출발해 아래로 내려오므로 비는 쪽은 위 모서리다.
 *
 * `heldPath` 는 두지 않는다. 칩은 잡고 있는 조작기가 아니라 한 번 누르는 것이고,
 * 누르는 동안 양보해야 할 자동 진행도 없다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'heavy-mass',
    type: 'param-chips',
    binds: { value: 'massChoice' },
    at: { screen: 'top-left' },
    label: text('control.mass'),
    options: [
      { value: AUTO, label: text('option.auto') },
      { value: MASSES[0], label: text('option.mass2') },
      { value: MASSES[1], label: text('option.mass10') },
      { value: MASSES[2], label: text('option.mass50') },
    ],
  },
];
