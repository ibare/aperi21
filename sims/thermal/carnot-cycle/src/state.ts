// ========================================================================
// carnot-cycle — 런타임 상태
// ========================================================================
// 도형은 모두 (순환 안 시각, 차가운 쪽 온도) 의 순수 함수다. 쌓는 것이 없다.
// 상태에 있는 것은 조작값 하나와, 캡션 슬롯이 끼울 값 문자열뿐이다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { deriveTexts, readConstants } from './physics';

export interface CarnotCycleState {
  /** 차가운 쪽 온도(K). 슬라이더가 여기에 쓴다. */
  readonly tc: number;

  // ---- 캡션 슬롯이 가리키는 자리 (`CaptionSlotDef.vars`) ----
  readonly thText: string;
  readonly tcText: string;
  readonly discardText: string;
  readonly workText: string;
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): CarnotCycleState {
  const c = readConstants(params.stage);
  return { tc: c.tcDefault, ...deriveTexts(c.tcDefault, c) };
}
