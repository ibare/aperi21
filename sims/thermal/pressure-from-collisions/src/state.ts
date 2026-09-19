// ========================================================================
// pressure-from-collisions — 상태
// ========================================================================
// 쌓는 것이 없다. 분자 자리 · 벽 섬광 · 눈금 · 막대 칸은 모두 시각의 함수다.
// state 에 두는 것은 둘뿐이다 —
//  - 시드에서 한 번 뽑은 분자 목록 (같은 시드는 같은 첫 화면)
//  - 캡션 `vars` 가 가리킬 **선언값의 글자**. 캡션 `vars` 가 state 경로만 가리키므로
//    (장부 G133) 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { createMolecules, readConstants, type Molecule } from './physics';

export interface PressureFromCollisionsState {
  molecules: Molecule[];
  /** 오른쪽 상자의 속력 배수 — 선언값 그대로의 글자. */
  k: string;
}

export function initialState(params: { stage: StageDef }): PressureFromCollisionsState {
  const c = readConstants(params.stage);
  return {
    molecules: createMolecules(c),
    k: String(c.speedFactor),
  };
}
