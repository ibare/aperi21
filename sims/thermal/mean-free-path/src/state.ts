// ========================================================================
// mean-free-path — 상태
// ========================================================================
// 쌓는 것이 없다. 두 상자의 분자 배치와 표시 분자의 꺾인 경로(충돌 시각 · 자리)는
// 스테이지 상수(시드 · 분자 수 · 밀도 배수 · 반지름 · 속력)에서 한 번 계산해 두고,
// scene 이 시각으로 읽는다 — 같은 시각은 언제나 같은 화면이다.
//
// `ratioText` · `rowScaleText` 는 캡션 · 이름표 `vars` 가 가리킬 **선언값의 글자**다 — 캡션 `vars` 가
// state 경로만 가리키므로(장부 G133) 스테이지 상수를 여기서 한 번 글자로 옮긴다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants, runBox, type BoxRun } from './physics';

export interface MeanFreePathState {
  /** [성긴 상자(밀도 n), 빽빽한 상자(밀도 densityRatio × n)]. */
  runs: readonly [BoxRun, BoxRun];
  /** 선언한 밀도 배수의 글자. */
  ratioText: string;
  /** 선언한 줄 배율의 글자. */
  rowScaleText: string;
}

export function initialState(params: { stage: StageDef }): MeanFreePathState {
  const c = readConstants(params.stage);
  return {
    runs: [runBox(c, 0, c.count), runBox(c, 1, c.count * c.densityRatio)],
    ratioText: String(c.densityRatio),
    rowScaleText: String(c.rowScale),
  };
}
