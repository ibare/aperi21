// ========================================================================
// range-and-surface-gravity — 상태
// ========================================================================
// 두 공의 자리가 모두 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션
// `vars` 가 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 는 state 경로만
// 가리키므로(장부 G133) 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해
// 줄이지 않는다 (S-piece 유효숫자).
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface RangeAndSurfaceGravityState {
  /** 눈금 칸 수 — 달의 공이 지나가는 칸 수다. 선언한 값을 그대로 옮긴다. */
  cells: string;
}

export function initialState(params: { stage: StageDef }): RangeAndSurfaceGravityState {
  const c = readConstants(params.stage);
  return { cells: String(c.cells) };
}
