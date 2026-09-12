import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { derivePhase, readConstants } from './physics';

/**
 * 잔상 한 칸 — 그 순간 두 음의 변위.
 *
 * **개수가 아니라 시각으로 센다.** 원본은 고정 dt 를 전제로 270칸 링버퍼를 썼지만,
 * 엔진의 `dt` 는 프레임마다 다르다. 시각을 함께 들고 있으면 어떤 걸음으로 굴려도
 * 오른쪽 끝이 '지금' 이고 왼쪽 끝이 시간창의 시작이다.
 */
export interface BeatsSample {
  /** 이 값이 만들어진 조각 시각(초). */
  readonly t: number;
  /** 첫째 음의 변위. */
  readonly a: number;
  /** 둘째 음의 변위. */
  readonly b: number;
}

/**
 * 지금 두 음이 놓인 국면. **캡션 슬롯이 이 자리를 가리킨다** (`caption.cases`).
 *
 * 문안이 아니라 boolean 이다 — 문구를 정하는 것은 선언의 일이고 physics 는 조회기를
 * 갖지 않는다 (C1).
 */
export interface BeatsPhase {
  /** 차이가 0 — 어긋남이 아예 없다. */
  readonly locked: boolean;
  /** 발맞춰 흔들린다. */
  readonly inPhase: boolean;
  /** 정반대로 엇갈렸다. */
  readonly opposed: boolean;
  /** 어긋나는 중. */
  readonly drifting: boolean;
  /** 다시 발맞추는 중. */
  readonly returning: boolean;
}

export interface BeatsState {
  /** 두 음의 진동수 차이(Hz). 조작기가 여기에 쓴다. */
  readonly df: number;
  /**
   * 독자가 조작기를 잡고 있는 동안 true. 러너가 적는다
   * (`ControllerInstance.heldPath`).
   */
  readonly held: boolean;
  /** 조각이 누적한 시각(초). 잔상과 마디가 이 시계 위에 놓인다. */
  readonly clock: number;
  /**
   * 각 음의 **누적** 위상(rad).
   *
   * `sin(2πft)` 를 쓰면 조작기로 진동수를 바꾸는 순간 파형이 점프한다 — 주기 운동을
   * 다루는 조각이면 전부 밟는 함정이다 (원본 NOTES). 위상을 쌓아야 이어진다.
   */
  readonly phase1: number;
  readonly phase2: number;
  /** 두 위상의 차(rad). 누적값이라 차이를 바꿔도 이어진다. */
  readonly drift: number;
  /** 지금까지 지나온 마디의 번호. 이것이 늘어난 프레임에 마디를 하나 찍는다. */
  readonly nodeIndex: number;
  /** 최근 시간창의 잔상. */
  readonly samples: readonly BeatsSample[];
  /** 합이 지워진 순간들의 시각(초). 잔상과 같은 시간축 위에 있다. */
  readonly nodes: readonly number[];
  readonly phase: BeatsPhase;
}

export function initialState(_params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): BeatsState {
  const c = readConstants(_params.stage);
  return {
    df: c.df0,
    held: false,
    clock: 0,
    phase1: 0,
    phase2: 0,
    drift: 0,
    nodeIndex: 0,
    // 비어 있다. 채우는 것은 `schema.preroll` 이 시키는 `step` 이다 — 도착한
    // 순간을 만드는 일이 조각마다 손으로 역산하는 일이 아니게 되었다.
    samples: [],
    nodes: [],
    phase: derivePhase(0, c.df0),
  };
}
