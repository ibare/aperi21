// ========================================================================
// emf-and-internal-resistance — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다 — 알갱이 자리는 시간표 단계마다 일정한
// 속력을 곧바로 적분해 얻는다(physics `flowDistance`). state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface EmfAndInternalResistanceState {
  /** 기전력(선언값 그대로). */
  emf: string;
  /** 단계마다의 바깥 저항(선언값 그대로). */
  load1: string;
  load2: string;
  load3: string;
}

export function initialState(params: { stage: StageDef }): EmfAndInternalResistanceState {
  const c = readConstants(params.stage);
  return {
    emf: String(c.emf),
    load1: String(c.loads[0]),
    load2: String(c.loads[1]),
    load3: String(c.loads[2]),
  };
}
