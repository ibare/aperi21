// ========================================================================
// coulombs-law — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 스테이지 상수(거리 배수)를 여기서 한 번 글자로 옮긴다. 도착한 순간 이미 진행 중인
// 그림은 `startAt` 이 만든다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface CoulombsLawState {
  /** 가운데 · 아래 쌍의 거리 배수 (스테이지 상수 그대로). */
  midRatio: string;
  farRatio: string;
  /** 그 배수의 제곱 — 점선 기준을 나눈 칸 수이자 힘이 줄어든 배수. */
  midParts: string;
  farParts: string;
}

export function initialState(params: { stage: StageDef }): CoulombsLawState {
  const c = readConstants(params.stage);
  return {
    midRatio: String(c.ratioMid),
    farRatio: String(c.ratioFar),
    midParts: String(c.ratioMid * c.ratioMid),
    farParts: String(c.ratioFar * c.ratioFar),
  };
}
