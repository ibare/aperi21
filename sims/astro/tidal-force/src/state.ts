import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { resetCloud, seededOffsets } from './physics';

/**
 * 먼지 구름의 적분 상태.
 *
 * 늘어남은 입자마다 1/r² 중력을 실제로 적분한 결과라 **시각의 함수가 아니다** —
 * 상태를 쌓는다. 시간표의 어느 단계인지는 `clock` 으로 `step` 이 스스로 센다
 * (엔진이 `step` 에 시간표를 넘기지 않는다, NOTES G01).
 */
export interface TidalForceState {
  /** 조각 시계(초). 엔진 시계와 같은 셈 — 느린 단계에서는 느리게 흐른 dt 를 더한다. */
  clock: number;
  /** 지금 주기 번호. 바뀌면 구름을 처음 자리로 되돌린다. */
  cycle: number;
  /** 구름 중심 — [x, y, vx, vy]. 천체가 원점이다. */
  center: readonly number[];
  /** 먼지 — 입자마다 [x, y, vx, vy] 를 이어 붙인 배열. 0 번은 천체 쪽 끝, 1 번은 반대쪽 끝. */
  dust: readonly number[];
  /** 먼지의 처음 상대 위치 [x, y, ...]. 시드에서 한 번 뽑아 주기마다 다시 쓴다. */
  offsets: readonly number[];
  /** 흐름 무늬 획마다의 위상 0~1. 같은 시드의 이어지는 난수다. */
  streakSeeds: readonly number[];
  /** 양 끝이 모두 처음 반지름의 `stretchRatio` 배를 넘었는가. 캡션 슬롯의 `cases` 가 본다. */
  stretched: boolean;
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): TidalForceState {
  const { offsets, streakSeeds } = seededOffsets(params.stage.constants);
  return resetCloud(params.stage.constants, offsets, streakSeeds, 0, 0);
}
