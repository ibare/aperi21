// ========================================================================
// parallel-plate-capacitor — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface ParallelPlateCapacitorState {
  /** 간격을 나누는 수(`gapDivisor`)의 글자 — 캡션 「d/{gap}」 · 「{gap}배」. */
  gapDivisor: string;
  /** 넓이를 곱하는 수(`areaMultiple`)의 글자 — 캡션 「{area}배」. */
  areaMultiple: string;
}

export function initialState(params: { stage: StageDef }): ParallelPlateCapacitorState {
  const c = readConstants(params.stage);
  return {
    gapDivisor: String(c.gapDivisor),
    areaMultiple: String(c.areaMultiple),
  };
}
