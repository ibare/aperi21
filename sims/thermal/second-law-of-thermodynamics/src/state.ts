// ========================================================================
// second-law-of-thermodynamics — 런타임 상태
// ========================================================================
// 쌓는 것이 없다. 분자의 처음 자리 · 속도를 시드에서 한 번 뽑아 두고, 어느 시각의
// 자리든 physics 의 닫힌 식으로 읽는다. 캡션이 끼울 분자 수 글자도 여기서 한 번
// 스테이지 상수에서 만든다 (G133 우회로, `sims/modern/time-dilation` 선례).
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { readConstants, sampleMolecules, type Molecule } from './physics';

export interface SecondLawOfThermodynamicsState {
  /** 분자마다의 처음 자리 · 속도. 모두 칸막이 왼쪽에서 출발한다. */
  readonly molecules: readonly Molecule[];
  /** 분자 수 N — 캡션 `{n}` 자리 (`schema.caption.vars`). */
  readonly countText: string;
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SecondLawOfThermodynamicsState {
  const c = readConstants(params.stage);
  return {
    molecules: sampleMolecules(c),
    countText: String(c.count),
  };
}
