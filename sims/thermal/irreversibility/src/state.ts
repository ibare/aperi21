// ========================================================================
// irreversibility — 런타임 상태
// ========================================================================
// 쌓는 것이 없다. 알갱이 격자(쉬는 자리 · 떨림 진동수 · 위상)와 공의 충돌 목록을 스테이지
// 상수에서 한 번 만들어 두고, 어느 시각의 화면이든 physics 의 닫힌 식으로 읽는다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { impactsOf, readConstants, sampleGrains, type Grain, type Impact } from './physics';

export interface IrreversibilityState {
  /** 바닥 알갱이. 윗줄 가운데가 공 바로 밑이다. */
  readonly grains: readonly Grain[];
  /** 떨어뜨린 순간부터 공이 설 때까지의 충돌. */
  readonly impacts: readonly Impact[];
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): IrreversibilityState {
  const c = readConstants(params.stage);
  return {
    grains: sampleGrains(c),
    impacts: impactsOf(c),
  };
}
