// ========================================================================
// drag-force — 런타임 상태
// ========================================================================
// 상태를 비울 수 없는 조각이다. 속도와 위치는 `m·a = F − b·v − c·v²` 를 매 걸음
// 적분해 얻고, 지난 자리는 그 적분이 0.25 초마다 지나온 자리에 쌓인다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';

/** 섬광 한 번의 기록 — 그 순간의 위치와 속도. 막대 높이는 속도에서 계산한다. */
export interface StrobeMark {
  readonly x: number;
  readonly v: number;
}

export interface DragForceState {
  /** 달린 거리(원본 단위). */
  readonly x: number;
  /** 속도. */
  readonly v: number;
  /** 이번 달리기에서 흐른 시간(초). */
  readonly clock: number;
  /** 다음 섬광 시각(초). */
  readonly nextStrobe: number;
  /** 지난 자리 기록. 되감을 때 비운다. */
  readonly strobes: readonly StrobeMark[];
  /** 멈춘 장면을 붙잡아 둔 남은 시간(초). 달리는 중이면 0 이하. */
  readonly hold: number;
  /**
   * 1차 몫이 아직 2차 몫보다 큰가(정지 상태 포함). 캡션 선언이 이 자리를 가리킨다
   * (`CaptionSlotDef.cases`) — 선언은 어디를 보라고만 말한다.
   */
  readonly linearDominant: boolean;
}

export function initialState(_params?: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): DragForceState {
  return {
    x: 0,
    v: 0,
    clock: 0,
    nextStrobe: 0,
    strobes: [],
    hold: 0,
    linearDominant: true,
  };
}
