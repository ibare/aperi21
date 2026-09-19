// ========================================================================
// adiabatic-process — 상태
// ========================================================================
// 쌓는 것이 없다. 피스톤 자리 · 온도계 · P–V 두 점 · 분자 자리는 모두 시간표 시각의 함수다.
// state 에 두는 것은 둘뿐이다 —
//  - 시드에서 한 번 뽑은 분자 목록 (같은 시드는 같은 첫 화면)
//  - 캡션 · 눈금이 끼울 **선언값의 글자**. 캡션 `vars` 가 state 경로만 가리키므로
//    (장부 G133) 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { createMolecules, readConstants, type Molecule } from './physics';

export interface AdiabaticProcessState {
  molecules: Molecule[];
  /** 처음 · 끝 온도(K), 부피 배수, 두 곡선의 끝 압력 비 — 선언값 그대로의 글자. */
  t0: string;
  t1: string;
  k: string;
  pIso: string;
  pAdia: string;
}

export function initialState(params: { stage: StageDef }): AdiabaticProcessState {
  const c = readConstants(params.stage);
  return {
    molecules: createMolecules(c),
    t0: String(c.t0),
    t1: String(c.tEndShown),
    k: String(c.k),
    pIso: String(c.pIsoEndShown),
    pAdia: String(c.pAdiaEndShown),
  };
}
