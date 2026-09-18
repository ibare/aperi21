import type { ControllerSpec } from '@aperi21/schema';
import { IMPACT_ANGLE_OPTIONS, text } from './schema';

/**
 * 조작기는 하나 — 빗맞는 각을 고르는 칩 줄.
 *
 * 자동 진행만으로 주장은 끝난다(35° 한 번으로 쪼개짐과 두 합을 다 보인다). 칩은 독자가
 * 직접 해 봐야 아는 것을 위한 것이다 — 각을 바꾸면 **쪼개지는 몫은 달라지는데 x 줄과
 * y 기둥의 끝은 같은 자리**다. 한 각에서만 맞는 우연이 아니라는 확인이다.
 *
 * 고르면 처음부터 다시 달려온다 — `restart`. 상태를 쌓지 않으므로 시계를 되돌리면 된다.
 *
 * 자리는 왼쪽 위 — A 가 달려오는 길 위쪽이 비어 있고, 아래는 캡션 줄이다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'impact-angle',
    type: 'param-chips',
    binds: { value: 'impactAngle' },
    label: text('control.angle'),
    options: [
      { value: IMPACT_ANGLE_OPTIONS[0], label: text('option.angle20') },
      { value: IMPACT_ANGLE_OPTIONS[1], label: text('option.angle35') },
      { value: IMPACT_ANGLE_OPTIONS[2], label: text('option.angle55') },
    ],
    restart: true,
    at: { screen: 'top-left' },
  },
];
