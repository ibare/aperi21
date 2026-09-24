// ========================================================================
// pendulum-amplitude-dependence — 런타임 상태
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { AMP_DEFAULT_DEG, RATIO } from './schema';

/** 잔상 한 점 — 그 각도를 언제 지났는지. 나이로 잘라내려고 시각을 함께 든다. */
export interface TrailSample {
  readonly th: number;
  readonly t: number;
}

export interface PendulumBob {
  /** 각도(라디안). 0 이 최하점. */
  readonly th: number;
  /** 각속도(라디안/초). */
  readonly om: number;
  /** 최근 `TRAIL_SPAN` 동안 지나온 각도들. */
  readonly trail: readonly TrailSample[];
  /**
   * 바닥(θ=0)을 지난 시각들. 프레임 사이를 선형 보간해 잡는다 — **사건을
   * 감지하는 것은 조각이다** (S-render).
   */
  readonly crossings: readonly number[];
  /** 지금까지 지난 횟수. 지연을 같은 횟수끼리만 재려고 센다. */
  readonly count: number;
}

export interface PendulumAmplitudeDependenceState {
  /** 조각의 시계(초). 프리롤이 여기까지 미리 굴려 둔다. */
  readonly t: number;
  /** 슬라이더가 미는 진폭(도). */
  readonly ampDeg: number;
  /** 지금 θ·ω 가 대응하는 진폭(도). 이 둘이 갈리면 위상을 보존한 채 크기만 맞춘다. */
  readonly appliedDeg: number;
  /** 슬라이더를 잡고 있는가 (`ControllerInstance.heldPath` 가 러너에서 적는다). */
  readonly held: boolean;
  /** 가장 큰 진자가 가장 작은 진자보다 늦게 바닥을 지난 시간(초). */
  readonly lag: number;
  /**
   * 그 지연이 문턱(`LAG_LIMIT`)을 넘었는가. 캡션 선언이 이 자리를 가리킨다
   * (`CaptionSlotDef.cases`) — 선언은 어디를 보라고만 말한다.
   */
  readonly lagExceeded: boolean;
  readonly bobs: readonly PendulumBob[];
}

export function initialState(_params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): PendulumAmplitudeDependenceState {
  const amp = (AMP_DEFAULT_DEG * Math.PI) / 180;
  return {
    t: 0,
    ampDeg: AMP_DEFAULT_DEG,
    appliedDeg: AMP_DEFAULT_DEG,
    held: false,
    lag: 0,
    lagExceeded: false,
    // 다섯이 같은 피벗에 겹쳐 매달린다. 길이가 같으므로 최하점은 한 점이고,
    // 등시성이 성립하면 다섯 추가 그 한 점에서 물리적으로 포개진다.
    bobs: RATIO.map((r) => ({ th: amp * r, om: 0, trail: [], crossings: [], count: 0 })),
  };
}
