// ========================================================================
// random-walk — 상태
// ========================================================================
// 쌓는 것이 없다. 모든 걸음을 여기서 시드로 한 번 미리 걸어 두고, 화면은 걸음 번호로
// 읽기만 한다 (S-sim — 같은 시각은 같은 화면).
//
// 캡션 `vars` 가 state 경로만 가리키므로(장부 G133) 스테이지 상수를 여기서 한 번 글자로
// 옮긴다. 계산해 줄이지 않는다 — 선언값 그대로다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants, walkAll } from './physics';

export interface RandomWalkState {
  /** 걸음 번호마다 걷는 이들의 자리(칸). 0 번이 출발 순간이다. */
  frames: readonly (readonly number[])[];
  /** 캡션에 끼우는 선언값의 글자. */
  walkersText: string;
  stepsFirstText: string;
  stepsSecondText: string;
  spreadFirstText: string;
  spreadSecondText: string;
}

export function initialState(params: { stage: StageDef }): RandomWalkState {
  const c = readConstants(params.stage);
  return {
    frames: walkAll(c),
    walkersText: String(c.walkers),
    stepsFirstText: String(c.stepsFirst),
    stepsSecondText: String(c.stepsSecond),
    spreadFirstText: String(c.spreadFirst),
    spreadSecondText: String(c.spreadSecond),
  };
}
