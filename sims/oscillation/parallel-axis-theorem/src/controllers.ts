import type { ControllerSpec } from '@aperi21/schema';
import { OFFSET_OPTIONS, text } from './schema';

/**
 * 조작기는 하나 — 축 거리 d 를 고르는 칩 줄.
 *
 * 자동 진행만으로 주장은 끝난다(d = R 한 번으로 뒤처짐과 얹힌 조각을 다 보인다). 칩은
 * 독자가 직접 해 봐야 아는 것을 위한 것이다 — d 를 반으로 줄이면 얹힌 조각은 반이
 * 아니라 **네 분의 일**이 되고, d = 0 이면 두 원판이 나란히 돈다.
 *
 * 고르면 두 원판을 멈춘 자리에서 다시 출발시킨다 — `restart`. 이 조각은 상태를 쌓지
 * 않으므로 엔진 시계를 되돌리는 것으로 충분하다.
 *
 * 자리는 왼쪽 위 — 가운데 축 원판 위쪽이 비어 있고, 아래는 캡션 줄이다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'axis-offset',
    type: 'param-chips',
    binds: { value: 'offsetRatio' },
    label: text('control.offset'),
    options: [
      { value: OFFSET_OPTIONS[0], label: text('option.d0') },
      { value: OFFSET_OPTIONS[1], label: text('option.dHalf') },
      { value: OFFSET_OPTIONS[2], label: text('option.dFull') },
    ],
    restart: true,
    at: { screen: 'top-left' },
  },
];
