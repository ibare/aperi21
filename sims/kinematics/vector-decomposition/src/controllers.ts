// ========================================================================
// vector-decomposition — 조작기
// ========================================================================
// 원래 화살표의 끝점 자체가 손잡이다. "아무 방향이든 똑같이 갈라지는가" 는 독자가
// 직접 해 보고 싶어지는 지점이라 둔다 (원본 NOTES (c)).
//
// 손잡이는 **테두리만** 두른다(`handle: 'ring'`). 채운 점을 얹으면 화살촉이 가려져
// "이 화살표의 끝" 이 아니라 "따로 있는 점" 으로 읽힌다 — 원본도 옅은 원 테두리다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { GRAB_RADIUS_PX } from './schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'tip',
    type: 'point-drag',
    binds: { pos: 'tip', held: 'held' },
    grabRadius: GRAB_RADIUS_PX,
    handle: 'ring',
  },
];
