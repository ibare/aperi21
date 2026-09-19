// ========================================================================
// maxwells-demon — 런타임 상태
// ========================================================================
// 쌓는 것이 없다. 알갱이의 처음 자리 · 속도를 시드에서 한 번 뽑아 두고, 어느 시각의
// 자리든 physics 로 읽는다. 캡션이 끼울 한 칸 분자 수 글자도 여기서 한 번 스테이지
// 상수에서 만든다 (G133 우회로, `sims/modern/time-dilation` 선례).
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { readConstants, sampleMolecules, type Molecule } from './physics';

export interface MaxwellsDemonState {
  /** 알갱이마다의 처음 자리 · 속도 · 칸. 앞 절반이 왼쪽, 뒤 절반이 오른쪽이다. */
  readonly molecules: readonly Molecule[];
  /** 한 칸 분자 수 — 캡션 `{n}` 자리 (`schema.caption.vars`). */
  readonly perSideText: string;
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): MaxwellsDemonState {
  const c = readConstants(params.stage);
  return {
    molecules: sampleMolecules(c),
    perSideText: String(c.perSide),
  };
}
