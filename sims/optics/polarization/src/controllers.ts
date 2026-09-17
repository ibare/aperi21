// ========================================================================
// polarization — 조작기
// ========================================================================
// 원본의 두 조작 — 가운데 판 끼우기/빼기 단추, 각도 슬라이더(0~180°, 1° 간격). 독자가 「몇 도에서
// 가장 밝은가」 를 직접 더듬어 보게 둔다(원본 NOTES (c)). 건드리면 자동 진행을 멈추고 지금 값을
// 넘겨받는 것은 `step` 이 한다.
//
// 단추 문안은 상태에 따라 「빼기」 · 「끼우기」 로 바뀐다. `button.label` 은 고정 문안이라
// 같은 자리에 인스턴스 둘을 두고 `visibleWhen` 으로 하나만 보인다.
// 자리는 원본처럼 캡션 아래 한 줄 — 단추 왼쪽, 슬라이더 그 오른쪽.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';
import { text } from './schema';

const BUTTON_AT = { screen: 'bottom-left', offset: [0, 0] } as const;
const BUTTON_SIZE: [number, number] = [130, 28];

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'remove',
    type: 'button',
    binds: { pressed: 'togglePressed' },
    visibleWhen: 'showRemove',
    label: text('control.remove'),
    at: BUTTON_AT,
    size: BUTTON_SIZE,
  },
  {
    id: 'insert',
    type: 'button',
    binds: { pressed: 'togglePressed' },
    visibleWhen: 'showInsert',
    label: text('control.insert'),
    at: BUTTON_AT,
    size: BUTTON_SIZE,
  },
  {
    id: 'angle',
    type: 'slider',
    binds: { value: 'angleDeg' },
    heldPath: 'angleHeld',
    range: [0, 180],
    step: 1,
    digits: 0,
    unit: '°',
    label: text('control.angle'),
    at: { screen: 'bottom-left', offset: [146, 0] },
    size: [260, 44],
  },
];
