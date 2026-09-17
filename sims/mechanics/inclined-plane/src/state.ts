// ========================================================================
// inclined-plane — 상태
// ========================================================================
// 자동 진행의 각은 시각의 함수라 scene 이 시간표에서 읽는다. 상태가 담는 것은
// **독자가 슬라이더로 정한 각과 그것을 자동 진행에 섞는 정도**뿐이다 — 손을 뗀 뒤
// 기다린 시간과 돌아간 정도는 시각이 아니라 누적이다 (원본 `state`).
// ========================================================================

import { inclinedPlaneSchema } from './schema';
import { autoAngleAt } from './physics';

export interface InclinedPlaneState {
  /**
   * 조각 시계(초). `step` 이 `dt` 를 쌓는다. 자동 진행 중 슬라이더가 따라갈 각을
   * 시간표에서 다시 읽는 데만 쓴다 — `step` 은 `TimelineFrame` 을 받지 못한다
   * (NOTES 「어휘 부족」 2).
   */
  clock: number;
  /** 슬라이더 값(도). 잡고 있는 동안은 조작기가 여기에 쓴다. */
  slider: number;
  /** 독자가 마지막으로 정한 각(도). 원본 `manualDeg`. */
  manual: number;
  /** 독자의 각을 섞는 정도 0~1. 1 이면 독자의 각, 0 이면 자동 진행. 원본 `weight`. */
  weight: number;
  /** 손을 뗀 뒤 흐른 시간(초). 원본 `idle`. */
  idle: number;
  /** 슬라이더를 잡고 있는가 (`heldPath`). */
  held: boolean;
}

export function initialState(): InclinedPlaneState {
  const clock = inclinedPlaneSchema.startAt ?? 0;
  const auto = Math.round(autoAngleAt(clock));
  return { clock, slider: auto, manual: auto, weight: 0, idle: 0, held: false };
}
