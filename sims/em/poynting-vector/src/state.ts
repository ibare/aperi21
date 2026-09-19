// ========================================================================
// poynting-vector — 상태
// ========================================================================
// 움직임은 모두 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 스테이지 상수에서
// **한 번** 풀어 두는 장의 배치 — 관찰 자리마다의 E · S 화살표와 B 방향, S 흐름선이다.
// 라플라스 풀이가 수십 ms 라 매 프레임 다시 풀지 않는다. 같은 상수는 언제나 같은 배치를 낸다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import { cumulative, probes, readConstants, solvePotential, streamlines, type Probe } from './physics';

export interface PoyntingVectorState {
  /** 관찰 자리마다의 E · S 화살표 변위와 B 방향. */
  probes: readonly Probe[];
  /** S 흐름선(전지 틈 → 저항 몸통)과 그 누적 길이. */
  lines: readonly (readonly Vec2[])[];
  lineLengths: readonly (readonly number[])[];
}

export function initialState(params: { stage: StageDef }): PoyntingVectorState {
  const c = readConstants(params.stage);
  const grid = solvePotential(c);
  const lines = streamlines(grid, c);
  return {
    probes: probes(grid, c),
    lines,
    lineLengths: lines.map(cumulative),
  };
}
