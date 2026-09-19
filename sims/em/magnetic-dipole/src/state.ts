// ========================================================================
// magnetic-dipole — 상태
// ========================================================================
// 움직이는 것은 시간표 진행도의 함수(배율 · 옅기)뿐이라 쌓는 것이 없다. state 에 두는 것은
// 두 원천의 장선이다 — 스테이지 상수의 함수라 여기서 한 번 추적한다. 배율을 줄이는 동안은
// 같은 선을 원천 중심에서 비례로 줄이면 된다(장선의 모양은 축척을 바꿔도 그대로다 —
// 원천과 보는 거리를 함께 줄인 그림이 멀리서 본 그림이다). 모듈 스코프 캐시를 두지 않는다
// (원칙 6 — 인스턴스 독립).
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { fieldLines, loopSource, magnetSource, readConstants, type FieldLine } from './physics';

export interface MagneticDipoleState {
  /** 고리 전류의 장선(원천 좌표, 가까이 본 배율). */
  readonly loopLines: readonly FieldLine[];
  /** 막대자석의 장선 — 같은 준위 목록. */
  readonly magnetLines: readonly FieldLine[];
}

export function initialState(params: { stage: StageDef }): MagneticDipoleState {
  const c = readConstants(params.stage);
  return {
    loopLines: fieldLines(loopSource(c), c),
    magnetLines: fieldLines(magnetSource(c), c),
  };
}
