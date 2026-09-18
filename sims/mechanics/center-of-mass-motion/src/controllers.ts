import type { ControllerSpec } from '@aperi21/schema';
import { PUSH_OPTIONS, text } from './schema';

/**
 * 조작기는 하나 — 갈라질 때 떼어 미는 세기를 고르는 칩 줄.
 *
 * 자동 진행만으로 주장은 끝난다(「세게」 한 번으로 돌고 · 출렁이고 · 흩어지는 것을 다
 * 보인다). 칩은 독자가 직접 해 봐야 아는 것을 위한 것이다 — **미는 힘을 바꾸면 두
 * 덩어리의 길은 크게 달라지는데 질량 중심의 길은 한 화소도 달라지지 않는다.**
 * 「없음」 은 용수철이 풀려나기만 하는 경우로, 그때도 둘은 돌던 기세로 흩어진다.
 *
 * 고르면 처음부터 다시 던진다 — `restart`. 이 조각은 상태를 쌓지 않으므로 엔진 시계를
 * 되돌리는 것으로 충분하다.
 *
 * 자리는 왼쪽 위 — 던지는 자리 위쪽이 비어 있고, 아래는 캡션 줄이다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'push',
    type: 'param-chips',
    binds: { value: 'push' },
    label: text('control.push'),
    options: [
      { value: PUSH_OPTIONS[0], label: text('option.push0') },
      { value: PUSH_OPTIONS[1], label: text('option.push1') },
      { value: PUSH_OPTIONS[2], label: text('option.push2') },
    ],
    restart: true,
    at: { screen: 'top-left' },
  },
];
