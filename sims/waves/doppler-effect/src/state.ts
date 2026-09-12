import { EMIT_PERIOD, PREROLL, SOURCE_START_X } from './schema';

/**
 * 한 번의 방출. **한 번 정해지면 움직이지 않는다** — 파면이 변한 게 아니라
 * 원천이 옮겨 갔다는 주장의 물증이 이 자리들이다.
 */
export interface Front {
  /** 방출점(월드 x). */
  readonly x: number;
  /** 방출 시각(조각 시계, 초). */
  readonly t0: number;
}

export interface DopplerEffectState {
  /** 조각 시계(초). 방출 나이를 이걸로 잰다 — 프리롤도 여기에 쌓인다. */
  readonly t: number;
  /** 자동 진행 시간표 위치(초). 프리롤 동안은 음수라 정지 구간에 있다. */
  readonly tau: number;
  /** 원천 자리(월드 x). */
  readonly x: number;
  /** 원천 속력(월드/초). */
  readonly v: number;
  /** 방출 누산기(초). */
  readonly emitAcc: number;
  /** 방출 이력. 파면과 방출점이 **같은 목록**을 본다 — 같은 대상의 두 부분이다. */
  readonly fronts: readonly Front[];
  /** 독자가 슬라이더를 한 번이라도 잡았는가. 잡은 뒤에는 자동으로 돌아가지 않는다. */
  readonly manual: boolean;
  /** 조작기가 읽고 쓰는 자리. */
  readonly ui: {
    /** 원천 속도 v/c. 손대기 전에는 `step` 이 자동 값을 여기 적는다. */
    readonly vc: number;
    /** 지금 슬라이더를 잡고 있는가. 러너가 적는다 (`ControllerInstance.heldPath`). */
    readonly held: boolean;
  };
  /** 캡션이 가리키는 자리. 조건을 세는 것은 physics 이고 선언은 결과만 본다. */
  readonly says: {
    readonly stopped: boolean;
    readonly starting: boolean;
  };
}

export function initialState(): DopplerEffectState {
  return {
    t: 0,
    // 프리롤이 끝나는 순간 0 이 된다. 그 구간이 통째로 정지 구간이라 마운트
    // 시점의 화면은 "한자리에서 퍼지는 동심원" 이다.
    tau: -PREROLL,
    x: SOURCE_START_X,
    v: 0,
    // 첫 걸음에 바로 하나 낳는다.
    emitAcc: EMIT_PERIOD,
    fronts: [],
    manual: false,
    ui: { vc: 0, held: false },
    says: { stopped: true, starting: false },
  };
}
