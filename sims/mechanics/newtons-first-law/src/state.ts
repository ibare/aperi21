// ========================================================================
// newtons-first-law — 런타임 상태
// ========================================================================
// 이 조각은 **상태를 누적한다.** 버스와 승객의 자리는 적분으로 얻고, 자취는
// 0.3 초마다 한 쌍씩 쌓인다. 같은 시각이 언제나 같은 화면인 조각이 아니다 —
// 마찰 조작기를 언제 올렸는지에 따라 지금까지 온 길이 달라지기 때문이다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { REF, SAMPLE_DT, V0, px } from './schema';

/** 같은 시각에 찍은 버스와 승객의 자리(월드 x). 두 자취와 잇는 선이 이것 하나를 본다. */
export interface Sample {
  readonly bus: number;
  readonly rider: number;
}

export interface NewtonsFirstLawState {
  /** 사이클 안의 경과 시각(초). */
  readonly e: number;

  /** 버스 뒤끝. */
  readonly busX: number;
  readonly busV: number;
  /** 바퀴 회전각(라디안). 굴러가다 서는 것이 보이게 살 하나를 돌린다. */
  readonly wheel: number;

  /** 승객 중심. */
  readonly riderX: number;
  readonly riderV: number;

  /** 0.3 초마다 쌓이는 자취. */
  readonly samples: readonly Sample[];
  /** 다음 표본을 찍을 시각. */
  readonly nextSample: number;

  /** 앞칸에 닿은 시각(사이클 안). 아직이면 −1. */
  readonly hitAt: number;

  /** 마찰 조작기 0~100. 독자가 쥐는 유일한 값이라 사이클이 돌아도 지우지 않는다. */
  readonly friction: number;

  // ---- 캡션이 보는 자리 ----
  // 조건을 계산하는 것은 physics 이고, 선언(`schema.caption.cases`)은 그 결과가
  // 놓인 이 자리만 가리킨다 (원칙 2).

  /** 승객이 앞칸에 닿았는가. */
  readonly hitWall: boolean;
  /** 제동이 시작된 뒤, 마찰이 승객을 붙잡고 있는가. */
  readonly gripping: boolean;
  /** 마찰에 붙잡혀 승객이 버스와 함께 섰는가. */
  readonly stoppedTogether: boolean;
}

/**
 * 사이클 한 판의 처음. `initialState` 와 physics 의 사이클 리셋이 **같은 것**을 쓴다.
 *
 * 도착한 순간 이미 달려온 것처럼 보이도록 **지나온 자취를 미리 깔아 둔다**
 * (S-piece — 독자가 도착한 순간 이미 진행 중). 시계를 앞당기는 것으로는 안 되는
 * 자리다: 자취는 시각의 함수가 아니라 쌓인 것이라, 시계만 옮기면 뒤가 비어 있다.
 *
 * 마찰만 물려받는다. 독자가 올려 둔 값을 사이클이 돌 때마다 0 으로 되돌리면
 * 손잡이를 쥔 채로 화면이 손을 뿌리치는 것이 된다.
 */
export function freshState(friction: number): NewtonsFirstLawState {
  const busX = px(REF.busStart);
  const mark = busX + px(REF.markDx);
  const stride = V0 * SAMPLE_DT;
  const samples: Sample[] = [];
  for (let k = 3; k >= 1; k--) {
    const x = mark - stride * k;
    samples.push({ bus: x, rider: x });
  }
  return {
    e: 0,
    busX,
    busV: V0,
    wheel: 0,
    // 처음엔 승객이 지붕 표식과 같은 x 에 있다 — 잇는 선이 수직으로 선다.
    riderX: mark,
    riderV: V0,
    samples,
    nextSample: SAMPLE_DT,
    hitAt: -1,
    friction,
    hitWall: false,
    gripping: false,
    stoppedTogether: false,
  };
}

export function initialState(_params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): NewtonsFirstLawState {
  // 마찰 0 으로 연다. 힘이 없으면 어떻게 되는가가 이 조각이 먼저 하는 말이고,
  // 마찰은 그 대우를 독자가 손으로 시험하는 자리다.
  return freshState(0);
}
