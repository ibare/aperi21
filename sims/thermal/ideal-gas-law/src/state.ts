// ========================================================================
// ideal-gas-law — 상태
// ========================================================================
// 쌓는 것이 없다. 피스톤 자리 · 막대 높이 · 분자 자리는 모두 시간표 시각의 함수다.
// state 에 두는 것은 둘뿐이다 —
//  - 시드에서 한 번 뽑은 분자 목록 (같은 시드는 같은 첫 화면)
//  - 캡션 `vars` 가 가리킬 **선언값의 글자**. 캡션 `vars` 가 state 경로만 가리키므로
//    (장부 G133) 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { createMolecules, readConstants, type Molecule } from './physics';

export interface IdealGasLawState {
  molecules: Molecule[];
  /** 1 단계에서 부피를 나누는 수 · 2 · 3 단계의 온도 배수 — 선언값 그대로의 글자. */
  k1: string;
  k2: string;
  k3: string;
}

export function initialState(params: { stage: StageDef }): IdealGasLawState {
  const c = readConstants(params.stage);
  return {
    molecules: createMolecules(c),
    k1: String(c.volumeDivisor),
    k2: String(c.isobaricHeat),
    k3: String(c.isochoricHeat),
  };
}
