// ========================================================================
// vector-addition — 조작기
// ========================================================================
// 그림 속 두 점이 그대로 손잡이다. 따로 뜨는 상자도 다이얼도 없다 —
// 머리-꼬리 잇기가 저 한 쌍에서만 맞아떨어진 우연이 아니라는 것은 **직접 바꿔
// 봐야** 믿긴다 (NOTES.md 「끌어 보기」).
//
// `scale-drag` 는 직선 트랙 위 1 차원이라 방향을 못 바꾸고, `angle-dial` 은 길이를
// 못 바꾸며, `placement` 는 팔레트에서 끌어다 놓는 것이다. 이 자리가 `point-drag` 다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { GRAB_RADIUS_PX } from './schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'a-head',
    type: 'point-drag',
    binds: { pos: 'aTip', held: 'aHeld' },
    grabRadius: GRAB_RADIUS_PX,
    // 러너가 적는 공통 규약과 조작기가 읽는 표시가 같은 곳을 가리킨다. 손잡이가
    // 잡힌 동안 커지는 것은 `binds.held` 를 렌더가 읽어서다.
    heldPath: 'aHeld',
  },
  {
    id: 'b-head',
    type: 'point-drag',
    binds: { pos: 'bTip', held: 'bHeld' },
    grabRadius: GRAB_RADIUS_PX,
    heldPath: 'bHeld',
  },
];
