// ========================================================================
// statistical-fluctuation — 런타임 상태
// ========================================================================
// 쌓는 것이 없다. 상자마다 입자의 처음 자리 · 속도를 시드에서 한 번 뽑아 두고, 어느
// 시각의 자리든 physics 의 닫힌 식으로 읽는다. 캡션 · 이름표가 끼울 입자 수 글자도 여기서
// 한 번 스테이지 상수에서 만든다 (G133 우회로, `sims/modern/time-dilation` 선례).
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { readConstants, sampleParticles, type Particle } from './physics';

export interface StatisticalFluctuationState {
  /** 상자마다의 입자(위 · 가운데 · 아래 순). 모두 처음부터 상자 전체에 고르게 퍼져 있다. */
  readonly boxes: readonly (readonly Particle[])[];
  /** 상자마다의 입자 수 N 글자 — 이름표 `{n}` 자리. */
  readonly countTexts: readonly string[];
  /** 캡션 `{a}` · `{b}` · `{c}` 자리 (`schema.caption.vars`). */
  readonly countText1: string;
  readonly countText2: string;
  readonly countText3: string;
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): StatisticalFluctuationState {
  const c = readConstants(params.stage);
  const countTexts = c.counts.map((n) => String(n));
  return {
    boxes: c.counts.map((n, i) => sampleParticles(n, c.seed + i, c)),
    countTexts,
    countText1: countTexts[0]!,
    countText2: countTexts[1]!,
    countText3: countTexts[2]!,
  };
}
