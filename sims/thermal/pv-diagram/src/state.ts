// ========================================================================
// pv-diagram — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 (장부 G133 우회 — `time-dilation` 선례).
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { deriveTexts, readConstants } from './physics';

export interface PvDiagramState {
  readonly nAText: string;
  readonly nBText: string;
}

export function initialState(params: { stage: StageDef }): PvDiagramState {
  return deriveTexts(readConstants(params.stage));
}
