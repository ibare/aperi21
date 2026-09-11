// ========================================================================
// archimedes-principle — 조작기 선언
// ========================================================================
// 조각이므로 조작기는 질문을 보이는 데 필요한 만큼만 둔다.
//
// 이 조각은 아무것도 누르지 않아도 저 혼자 담그고, 넘치고, 두 저울을 마주
// 움직이고, 할 말을 마친다. 슬라이더는 그 뒤에 남는 하나뿐인 손잡이다 —
// "매 순간 같다" 를 읽는 사람이 직접 아무 지점에서나 확인할 수 있게.
// 잡는 순간 자동 진행은 멈추고 (physics.step 의 manual), 잡은 손을 따른다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';
import { text } from './schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'submersion',
    type: 'slider',
    binds: { value: 'submersion' },
    range: [0, 1],
    label: text('control.submersion'),
  },
];
