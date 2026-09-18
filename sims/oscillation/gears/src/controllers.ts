import type { ControllerSpec } from '@aperi21/schema';
import { BIG_TEETH_OPTIONS, text } from './schema';

/**
 * 조작기는 하나 — 큰 기어의 톱니 수를 고르는 칩 줄.
 *
 * 자동 진행만으로 주장은 끝난다(톱니 16개 한 번으로 두 단계를 다 보인다). 칩은 독자가
 * 직접 해 봐야 아는 것을 위한 것이다 — 톱니를 20개로 늘리면 작은 기어가 한 바퀴 도는
 * 동안 강조된 톱니가 큰 기어의 5분의 2만 채우고(더 느리다), 팔과 돌림힘은 2.5r · 2.5τ
 * 로 길어진다(더 세다). 느려진 배수와 세진 배수가 늘 같다는 것을 독자가 확인한다.
 *
 * 고르면 처음부터 다시 센다 — `restart`. 이 조각은 상태를 쌓지 않으므로 엔진 시계를
 * 되돌리는 것으로 충분하다.
 *
 * 자리는 왼쪽 위 — 작은 기어 위쪽이 비어 있고, 아래는 캡션 줄이다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'big-teeth',
    type: 'param-chips',
    binds: { value: 'bigTeeth' },
    label: text('control.bigTeeth'),
    options: [
      { value: BIG_TEETH_OPTIONS[0], label: text('option.teeth12') },
      { value: BIG_TEETH_OPTIONS[1], label: text('option.teeth16') },
      { value: BIG_TEETH_OPTIONS[2], label: text('option.teeth20') },
    ],
    restart: true,
    at: { screen: 'top-left' },
  },
];
