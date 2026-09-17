import type { ControllerSpec } from '@aperi21/schema';
import { TC_RANGE, TC_STEP, text } from './schema';

/**
 * 조작기는 하나 — 차가운 쪽 온도.
 *
 * 바닥에 가까이 내릴수록 빠져나가는 띠가 얇아지지만 50 K 에서도 사라지지 않음을 독자가
 * 직접 확인한다. 누르지 않아도 조각은 할 말을 마친다 (S-piece). 뜨거운 쪽은 고정이다.
 *
 * 자리는 왼쪽 아래, 캡션과 한 줄 — 원본은 그림 아래 조작기 줄 · 그 아래 캡션 줄이었다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'cold-temperature',
    type: 'slider',
    binds: { value: 'tc' },
    range: TC_RANGE,
    step: TC_STEP,
    digits: 0,
    unit: 'K',
    label: text('label.coldControl'),
    at: { screen: 'bottom-left' },
    size: [220, 44],
  },
];
