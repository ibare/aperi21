// ========================================================================
// terminal-velocity — 런타임 상태
// ========================================================================
// 상태를 비울 수 없는 조각이다. 속도와 높이는 `a = g − k·v²` 를 매 프레임
// 적분해 얻고, 자국은 그 적분이 지나온 자리에 쌓인다 — **종단 속도를 상수로
// 꽂지 않고 적분의 결과로 나타나게** 두는 것이 이 조각의 전부다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { LEVEL_DEFAULT, Y_START } from './schema';

export interface TerminalVelocityState {
  /** 물체 높이(월드). 원점은 캔버스 세로 중앙이고 위가 양수다. */
  readonly y: number;
  /** 낙하 속력. 아래로 가는 쪽이 양수다. */
  readonly v: number;
  /** 자국을 남긴 높이들. 사이클 동안 쌓이고, 되감을 때 비워진다. */
  readonly marks: readonly number[];
  /** 마지막 자국 이후 흐른 시간(초). `STROBE` 에 이르면 자국 하나가 는다. */
  readonly sinceMark: number;
  /**
   * 바닥에 닿은 뒤 흐른 시간(초). 아직 떨어지는 중이면 음수다.
   *
   * 원본의 `hold` 를 그대로 옮겼다 — 완성된 사다리를 `HOLD` 만큼 붙잡아 두고
   * 되감는다.
   */
  readonly hold: number;

  /** 슬라이더가 미는 저항 세기(0…8). */
  readonly level: number;
  /** 지금 물리가 쓰고 있는 세기. 이 둘이 갈리면 처음부터 다시 떨어진다. */
  readonly appliedLevel: number;
  /** 슬라이더를 잡고 있는가 (`ControllerInstance.heldPath` 가 러너에서 적는다). */
  readonly held: boolean;

  /**
   * 저항이 중력을 따라잡았는가. 캡션 선언이 이 자리를 가리킨다
   * (`CaptionSlotDef.cases`) — 선언은 어디를 보라고만 말한다.
   */
  readonly caught: boolean;
  /** 막 떨어지기 시작했는가. 위와 같은 규약. */
  readonly justStarted: boolean;
}

export function initialState(_params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): TerminalVelocityState {
  return {
    y: Y_START,
    v: 0,
    marks: [Y_START],
    sinceMark: 0,
    hold: -1,
    level: LEVEL_DEFAULT,
    appliedLevel: LEVEL_DEFAULT,
    held: false,
    caught: false,
    justStarted: true,
  };
}
