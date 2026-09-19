// ========================================================================
// uniform-field — 상태
// ========================================================================
// 움직임은 모두 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 **스테이지 상수에서
// 한 번만 계산하는 배치** — 도체 판의 전하 분포와 그것이 만드는 장선 — 뿐이다.
// 매 프레임 풀기에는 무겁고, 둘 선언 자리가 없어 여기 담는다 (장부 G189,
// `poynting-vector` 선례). `step` 은 이것을 바꾸지 않는다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import { fieldLines, readConstants, solvePlates, type SolvedPlates } from './physics';

export interface UniformFieldState {
  /** 두 판의 선분 전하 분포와 장 배율. */
  plates: SolvedPlates;
  /** 장선 — 판 사이에서 곧고 양 끝에서 휜다. */
  lines: Vec2[][];
}

export function initialState(params: { stage: StageDef }): UniformFieldState {
  const c = readConstants(params.stage);
  const plates = solvePlates(c);
  return { plates, lines: fieldLines(plates, c) };
}
