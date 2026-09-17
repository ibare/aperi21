// ========================================================================
// river-crossing — 런타임 상태
// ========================================================================
// 원본처럼 **누적한다.** 이번 건너기가 시작된 뒤 흐른 화면 시간 `tau` 가 배의
// 자리를 정하고, 건너는 시간은 뱃머리 각도에서 물리로 나온다. 뱃머리를 바꾸면
// `tau` 가 0 으로 돌아가 처음부터 다시 건넌다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { START_TAU } from './schema';

export interface RiverCrossingState {
  /** 뱃머리 방향(°). 0 = 건너편 정면, + 하류 쪽, − 상류 쪽. 슬라이더가 적는다. */
  readonly headingDeg: number;
  /** 직전 걸음의 뱃머리 방향. 달라졌으면 독자가 바꾼 것이다 — 처음부터 다시 건넌다. */
  readonly prevHeadingDeg: number;
  /** 이번 건너기가 시작된 뒤 흐른 화면 시간(초). 원본 `tau`. */
  readonly tau: number;
  /**
   * 물살 줄무늬의 시계(초). 원본 루프의 `t` — 도착한 순간 0 이다. 줄무늬는 건너기와
   * 무관하게 흐르므로 `tau` 와 따로 센다.
   */
  readonly flowT: number;

  // ---- 캡션이 보는 자리 ----
  // 조건을 세는 것은 physics 이고, 선언(`schema.caption.cases`)은 이름만 가리킨다.

  /** 맞은편에서 벗어난 거리의 크기(m, 소수 첫째 자리). 방향 낱말은 문안 틀에 있다. */
  readonly driftText: string;
  /** 도착해 머무는 중이고, 맞은편에 닿았다. */
  readonly arrivedOpposite: boolean;
  /** 도착해 머무는 중이고, 맞은편보다 상류에 닿았다. */
  readonly arrivedUpstream: boolean;
  /** 도착해 머무는 중이고, 맞은편보다 하류에 닿았다. */
  readonly arrivedDownstream: boolean;
  /** 뱃머리를 기울인 채 건너는 중이다. */
  readonly crossingTilted: boolean;
}

export function initialState(_params?: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): RiverCrossingState {
  return {
    headingDeg: 0,
    prevHeadingDeg: 0,
    tau: 0,
    // 프리롤(START_TAU)을 지나 독자가 도착한 순간 0 이 되도록 그만큼 당겨 둔다.
    flowT: -START_TAU,
    driftText: '30.0',
    arrivedOpposite: false,
    arrivedUpstream: false,
    arrivedDownstream: false,
    crossingTilted: false,
  };
}
