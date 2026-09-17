// ========================================================================
// vector-decomposition — 상태
// ========================================================================
// 연출은 전부 시각의 함수라 scene 이 시간표에서 읽는다. 상태가 담는 것은
// **손잡이가 서야 할 자리**와 **독자가 정한 화살표** 뿐이다 — 조작기는 상태
// 경로만 읽으므로, 자동으로 도는 끝점도 상태에 적혀 있어야 손잡이가 따라간다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';

import { autoTip, frameAt } from './physics';

export interface VectorDecompositionState {
  /**
   * 조각 시계(초). `step` 이 `dt` 를 쌓는다. 손잡이 자리(`tip`)를 시간표에서
   * 다시 읽는 데만 쓴다 — 조작기가 시간표를 모르기 때문이다 (NOTES 「어휘 부족」 1).
   */
  clock: number;
  /**
   * 원래 화살표의 끝점(월드). 꼬리가 원점이므로 이 점이 곧 벡터다.
   * `point-drag` 가 잡고 있는 동안은 조작기가 여기에 쓴다.
   */
  tip: Vec2;
  /** 독자가 끌어 정한 화살표. 한 번 정하면 자동 목록 대신 이것을 쓴다(원본 `userVec`). */
  user: Vec2 | null;
  /** 끝점을 잡고 있는가. */
  held: boolean;
}

export function initialState(): VectorDecompositionState {
  return { clock: 0, tip: autoTip(frameAt(0)), user: null, held: false };
}
