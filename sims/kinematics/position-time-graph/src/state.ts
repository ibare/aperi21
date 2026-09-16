// ========================================================================
// position-time-graph — 상태
// ========================================================================
// 이 조각은 시각의 함수로 끝나지 않는다. 높이는 빠르기를 적분해 쌓이고, 자취는
// 지나온 (시각, 높이) 표본이며, 자국은 정수 초를 지날 때 남는다. 판이 바뀌면 셋을
// 모두 비운다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';

import { V_FAST, V_SLOW } from './schema';

/** 구슬 하나와 그것이 남기는 것. 두 통로가 같은 모양을 쓴다. */
export interface LaneState {
  /** 빠르기(통로 높이 비율 / 초). 손잡이가 쥐는 자리다. */
  v: number;
  /** 지금 높이 0~1. 통로 바닥이 0, 꼭대기가 1. */
  pos: number;
  /** 지나온 (이번 판의 시각, 높이) 표본. 0.05 초마다 남긴다. */
  trail: readonly Vec2[];
  /** 정수 초를 지날 때의 (시각, 높이). */
  ticks: readonly Vec2[];
}

export interface PositionTimeGraphState {
  /**
   * 조각 시계(초). `preroll` 이 굴린 만큼에서 시작해 걸음마다 쌓인다 — 러너가
   * 시계를 `startAt` 으로 맞추므로 `scene` 이 받는 `timeline.t` 와 같은 값이다.
   *
   * `step` 은 `TimelineFrame` 을 받지 못한다. 그래서 판의 경계를 여기서 다시 센다
   * (NOTES 「어휘 부족」).
   */
  t: number;
  /** 지금 판(0 · 1). 아직 정해지지 않았으면 -2, 손잡이가 주도권을 가져갔으면 -1. */
  round: number;
  /** 이번 판이 시작하고 흐른 시간(초). 주행이 끝나면 더 늘지 않는다. */
  tr: number;

  /** 왼쪽 통로. */
  a: LaneState;
  /** 오른쪽 통로. */
  b: LaneState;

  /** 왼쪽 손잡이를 잡고 있는가. 러너가 `ControllerInstance.heldPath` 로 적는다. */
  heldA: boolean;
  /** 오른쪽 손잡이를 잡고 있는가. */
  heldB: boolean;

  /**
   * 손잡이가 주도권을 가져갔는가. 한 번 잡으면 돌아가지 않는다 — 자동 진행이
   * 판을 지우고 빠르기를 되돌리면, 독자가 방금 올린 손잡이가 저 혼자 되돌아간다.
   * 캡션 슬롯의 `cases` 가 가리키는 자리이기도 하다.
   */
  manual: boolean;
}

/** 판 하나를 처음부터. 빠르기는 부르는 쪽이 정한다 — 자동이면 맞바꾼 값, 수동이면 그대로. */
export function freshLane(v: number): LaneState {
  return { v, pos: 0, trail: [[0, 0]], ticks: [] };
}

export function initialState(): PositionTimeGraphState {
  return {
    t: 0,
    round: -2,
    tr: 0,
    a: freshLane(V_SLOW),
    b: freshLane(V_FAST),
    heldA: false,
    heldB: false,
    manual: false,
  };
}
