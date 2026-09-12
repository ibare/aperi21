// ========================================================================
// gas-pressure — 조작기 선언
// ========================================================================
// 조작기 선언은 **데이터**다 (원칙 7 ④).
//
// 자동 진행이 온도를 왕복시키며 할 말을 다 마친다. 슬라이더는 그 뒤에 남는
// 하나뿐인 손잡이다 — "내가 올리면 진짜로 빨라지나" 는 손으로 해 봐야 믿긴다.
//
// 잡는 순간 러너가 `heldPath` 에 true 를 적고, 자동 진행은 그때 양보한다.
// 놓은 뒤에 무엇으로 돌아갈지는 조각이 안다 — 이 조각은 **돌아가지 않는다**.
// 자동으로 되돌리는 버튼을 두지 않은 것과 같은 결정이다 (physics.step 의 manual).
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';
import { T_COLD, T_HOT, text } from './schema';

/** 슬라이더 상자 크기(화면 px). 오른쪽 아래, 막대 이름표 아래의 빈 띠에 놓인다. */
const SLIDER_SIZE: [number, number] = [200, 40];

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'temperature',
    type: 'slider',
    binds: { value: 'slider.temperature' },
    heldPath: 'slider.held',
    range: [T_COLD, T_HOT],
    label: text('control.temperature'),
    unit: 'K',
    at: { screen: 'bottom-right' },
    size: SLIDER_SIZE,
  },
];
