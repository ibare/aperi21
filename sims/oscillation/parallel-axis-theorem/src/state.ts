import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 두 원판의 각 · 막대 높이가 모두 시간표 진행도의 함수다.
 *
 * 남는 것은 독자가 고른 축 거리(d/R) 하나와, 그것에서 따라 나오는 캡션 판정 하나다.
 */
export interface ParallelAxisTheoremState {
  /** 고른 축 거리 d 를 반지름 R 에 대한 비로. 칩 줄이 쓴다. */
  offsetRatio: number;
  /** 두 축이 같은 자리인가(d = 0). 캡션 슬롯의 `cases` 가 읽는다. */
  sameAxis: boolean;
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): ParallelAxisTheoremState {
  const d = readConstants(params.stage).offsetRatioDefault;
  return { offsetRatio: d, sameAxis: d === 0 };
}
