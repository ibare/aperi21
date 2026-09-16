// ========================================================================
// vector-addition — 상태
// ========================================================================
// 연출은 전부 시각의 함수라 상태에 두지 않는다. 상태가 담는 것은 **독자가 끈
// 결과** 뿐이다 — 두 화살표가 지금 어디를 가리키는가, 그리고 지금 잡혀 있는가.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';

import { A0, B0, ORIGIN } from './schema';

export interface VectorAdditionState {
  /**
   * 벡터 가의 머리(월드). `point-drag` 가 여기에 직접 써 넣는다.
   * 꼬리가 원점이므로 이 점이 곧 벡터 가다.
   */
  aTip: Vec2;
  /**
   * 벡터 나의 머리(월드) — **가의 머리에 붙였을 때의 자리**다. `point-drag` 가
   * 여기에 쓴다. 미끄러지는 중의 머리가 아니라 붙은 자리인 이유는 조작기가
   * 시간표를 모르기 때문이다 (NOTES.md 「어휘 부족」).
   */
  bTip: Vec2;
  /** 벡터 나 자체. 옮겨 붙어도 변하지 않는 것이 이 조각의 주장이다. */
  bDelta: Vec2;
  /** 가의 머리를 잡고 있는가. */
  aHeld: boolean;
  /** 나의 머리를 잡고 있는가. */
  bHeld: boolean;
  /** 둘 중 하나라도 잡고 있는가. 캡션 슬롯이 이 경로를 본다. */
  dragging: boolean;
}

export function initialState(): VectorAdditionState {
  return {
    aTip: [ORIGIN[0] + A0[0], ORIGIN[1] + A0[1]],
    bTip: [ORIGIN[0] + A0[0] + B0[0], ORIGIN[1] + A0[1] + B0[1]],
    bDelta: B0,
    aHeld: false,
    bHeld: false,
    dragging: false,
  };
}
