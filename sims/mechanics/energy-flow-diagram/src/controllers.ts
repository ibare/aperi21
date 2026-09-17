import type { ControllerSpec } from '@aperi21/schema';

import { BULB, text } from './schema';

/**
 * 전구 종류 — 두 칸 선택.
 *
 * 자동 진행만으로 주장은 끝난다(백열전구). 전구를 LED 로 바꾸면 빛 갈래가 2 → 14 로
 * 굵어지지만 발전소 열 갈래 62 는 그대로라는 것을 독자가 직접 해 봐야 "어디서 새는가"
 * 의 답이 전구 쪽만이 아님이 남는다.
 *
 * 값을 고르는 것이라 `param-chips`. 원본처럼 그림 위 오른쪽에 두고 줄 이름표는 없다.
 * 배분이 옮겨 가는 0.6 초는 조각의 `step` 이 `mix` 로 쌓는다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'bulb',
    type: 'param-chips',
    binds: { value: 'bulb' },
    at: { screen: 'top-right' },
    options: [
      { value: BULB.incandescent, label: text('option.incandescent') },
      { value: BULB.led, label: text('option.led') },
    ],
  },
];
