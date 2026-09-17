// ========================================================================
// total-internal-reflection — 조작기
// ========================================================================
// 원본의 두 조작.
// - 장면 끌기 — 임계각 바로 아래에 독자가 머물러 보게. 원본은 장면 어디를 눌러도 되지만 엔진의 끌기는
//   손잡이 둘레만 잡힌다(`point-drag`). 손잡이는 광원 위에 두고 넓게 잡히게 한다(NOTES 「어휘 부족」 G21).
//   손을 뗀 뒤 5 초 지나 자동 진행으로 돌아가는 것은 `step` 이 한다.
// - 매질 버튼 — 임계각이 굴절률로 정해진다는 조건. 원본처럼 캡션 줄 오른쪽에 둔다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';
import { MEDIA, text } from './schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'aim',
    type: 'point-drag',
    binds: { pos: 'dragPos', held: 'dragHeld' },
    grabRadius: 48,
    handle: 'ring',
  },
  {
    id: 'medium',
    type: 'param-chips',
    binds: { value: 'n' },
    options: [
      { value: MEDIA.water, label: text('control.water') },
      { value: MEDIA.glass, label: text('control.glass') },
      { value: MEDIA.diamond, label: text('control.diamond') },
    ],
    at: { screen: 'bottom-right', offset: [0, 0] },
  },
];
