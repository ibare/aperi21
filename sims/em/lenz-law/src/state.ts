import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { deriveReadings, readConstants } from './physics';

/** 자석이 지금 무엇을 하고 있는가. `drag` 는 독자가 잡고 있는 동안이다. */
export type LenzLawMode = 'move' | 'pause' | 'drag';

export interface LenzLawState {
  /** 자석 자리(코일 반경 단위 = 월드 x). */
  u: number;
  /** 자동 진행 방향. */
  dir: 1 | -1;
  /** 지금 국면. */
  mode: LenzLawMode;
  /** 끝에서 멈춰 있는 시간의 잔여(초). */
  timer: number;
  /** 지금 속도(u/s). 매 걸음 Δu/dt 로 다시 얻는다 — 끌 때도 같은 방식이다. */
  v: number;
  /** 전류가 고리를 도는 위상(rad). 프레임 사이에 쌓인다. */
  phase: number;

  /**
   * 조작기가 쥐는 자리. 잡고 있지 않을 때는 자석을 따라온다 — 손잡이가 늘 자석
   * 위에 있어야 잡을 것이 어디인지 알 수 있다.
   */
  target: number;
  /**
   * 독자가 자석을 잡고 있는가. 러너가 `ControllerInstance.heldPath` 로 적는다.
   * 놓은 뒤 무엇으로 돌아갈지는 `physics.step` 이 안다.
   */
  held: boolean;

  /** 유도 전류(정규화). 부호가 도는 방향, 크기가 세기. */
  current: number;
  /** 자석이 받는 힘(정규화). 언제나 v 의 반대 부호다. */
  force: number;

  // 국면 — 캡션 슬롯의 `cases` 가 가리키는 자리다. 세는 것은 physics 가 한다
  // (원칙 2 — 선언은 어디를 보라고만 말한다).
  /** 자석이 멈춰 있다. */
  still: boolean;
  /** 자석이 코일 한가운데 — 전류가 방향을 바꾸는 중이다. */
  turning: boolean;
  /** 자석이 코일로 다가온다. */
  approaching: boolean;
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): LenzLawState {
  const c = readConstants(params.stage);
  // 왕복의 출발점에서 연다. "도착한 순간 이미 달리고 있다" 는 여기가 아니라
  // 선언(`schema.preroll`)이 만든다 — 시작 시점은 저작 결정이다 (원칙 2).
  const u = -c.uEnd;
  const v = c.v0;
  return {
    u,
    dir: 1,
    mode: 'move',
    timer: 0,
    v,
    phase: 0,
    target: u,
    held: false,
    ...deriveReadings(u, v, c),
  };
}
