import type { ControllerSpec } from '@aperi21/schema';
import { SWEEP_END_DEG } from './state';

/**
 * 조각이므로 조작기는 하나다. 그마저도 **자동 회전이 끝난 뒤에야** 나온다.
 *
 * 독자가 아무것도 누르지 않아도 판은 저절로 반 바퀴를 돌아 자취를 원으로
 * 닫는다. 화면이 할 말을 마친 다음에야 다이얼을 건네, 같은 일을 독자가 직접
 * 해 보게 한다 — 손으로 돌려도 화살표 길이가 그대로라는 것.
 *
 * 다이얼의 0..180° 는 임의로 자른 범위가 아니다. 판은 두께 없는 면이라 방향이
 * 180° 주기이고, 그래서 이 반원이 판이 가질 수 있는 방향 전부다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'plate-angle',
    type: 'angle-dial',
    binds: { angle: 'plate.thetaDeg' },
    // 자동 회전이 끝난 뒤에야 나온다. 조건을 세는 것은 physics 이고 선언은 그
    // 결과가 놓인 자리를 가리킨다.
    visibleWhen: 'sweepComplete',
    range: [0, SWEEP_END_DEG],
    tickAt: [0, 45, 90, 135, SWEEP_END_DEG],
  },
];
