import type { ControllerSpec } from '@aperi21/schema';

import { SPEED_RANGE, text } from './schema';

/**
 * 조작기는 하나 — 앞으로 던지는 빠르기.
 *
 * 독자가 품은 반론("더 빠르게 하면 더 오래 떠 있겠지")을 스스로 시험하고 스스로
 * 부정하게 하는 자리다. 0 까지 내리면 세 공이 겹쳐 한 줄로 떨어지는 극단도
 * 볼 수 있다. 세로 운동에는 닿지 않는다 — 조작기의 권한 범위 자체가 주장과
 * 같은 모양이다.
 *
 * 아무것도 누르지 않아도 조각은 할 말을 마친다. 이 손잡이는 확인용이지
 * 진행용이 아니다 (S-piece).
 *
 * 잡고 있는 동안 `held` 가 참이 된다(`heldPath` — 조작기 종류와 무관한 공통
 * 규약). 그동안 사다리의 기록을 비운다: 원본은 손잡이를 만질 때마다 다시
 * 던지며 잔상을 비웠고, 여기서 옮길 수 있는 것이 그 절반이다 (scene.ts).
 *
 * 자리는 캔버스 아래 줄 오른쪽 — 원본에서 캡션 오른쪽에 손잡이가 붙던 자리다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'speed',
    type: 'slider',
    binds: { value: 'v' },
    heldPath: 'held',
    range: SPEED_RANGE,
    label: text('control.speed'),
    at: { screen: 'bottom-right' },
  },
];
