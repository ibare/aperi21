// ========================================================================
// youngs-double-slit — 조작기
// ========================================================================
// 원본의 조작 하나 — 아래 슬릿 열기/닫기 단추. 독자가 직접 열어 줄이 꺼지는 것을 확인하는 것이 이 주제의
// 핵심 경험이다(원본 NOTES (c)). 누르면 자동 주기를 멈추고 그 시각부터 물결을 켜고 끄는 것은 `step` 이 한다.
//
// 단추 문안은 상태에 따라 「열기」 · 「닫기」 로 바뀐다. `button.label` 은 고정 문안이라 같은 자리에
// 인스턴스 둘을 두고 `visibleWhen` 으로 하나만 보인다. 자리는 원본처럼 캡션 줄 오른쪽 끝.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';
import { text } from './schema';

const BUTTON_AT = { screen: 'bottom-right', offset: [0, 0] } as const;
const BUTTON_SIZE: [number, number] = [130, 28];

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'open',
    type: 'button',
    binds: { pressed: 'togglePressed' },
    visibleWhen: 'showOpen',
    label: text('control.open'),
    at: BUTTON_AT,
    size: BUTTON_SIZE,
  },
  {
    id: 'close',
    type: 'button',
    binds: { pressed: 'togglePressed' },
    visibleWhen: 'showClose',
    label: text('control.close'),
    at: BUTTON_AT,
    size: BUTTON_SIZE,
  },
];
