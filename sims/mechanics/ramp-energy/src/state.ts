import type { EnvironmentDef, StageDef, Vec2 } from '@aperi21/schema';
import { DROP_DEFAULT, LANES, U0 } from './schema';

/**
 * 공 하나.
 *
 * **좌표를 담지 않는다.** 자리는 길 위의 진행 `u` 와 낙차에서 파생되므로,
 * 손잡이로 낙차를 바꾸면 길과 공이 함께 다시 놓인다.
 */
export interface BallState {
  /** 길 위의 진행. 0 출발, 1 활주로 진입, 그 뒤로는 활주로를 간다. */
  readonly u: number;
  /** 마지막 자국을 찍은 뒤 흐른 시간(초). */
  readonly since: number;
  /**
   * 지나온 자리. **늙지 않는다** — 점 사이 간격이 곧 속력이라 지우면 주장이
   * 사라진다. 한 사이클이 끝나면 통째로 비운다.
   */
  readonly marks: readonly Vec2[];
}

export interface RampEnergyState {
  /** 세 레인이 함께 쓰는 낙차(m). 손잡이(`scale-drag`)가 이 자리에 쓴다. */
  readonly drop: number;
  /**
   * 손잡이를 잡고 있는가. 러너가 `heldPath` 로 적고, `scale-drag` 의
   * `binds.held` 도 같은 자리를 가리킨다. 캡션의 첫 `case` 가 읽는 자리이기도 하다.
   */
  readonly held: boolean;
  /**
   * 셋 다 활주로에 내려섰는가. **이 조각의 동사가 일어난 순간**이고, 캡션이
   * 이 자리를 보고 문안을 고른다 (`caption.cases`). 조건을 세는 것은 physics 다.
   */
  readonly allOnFloor: boolean;
  readonly balls: readonly BallState[];
}

/** 출발선에 세운 공 셋. 사이클이 돌 때마다, 손잡이를 잡을 때마다 여기로 돌아온다. */
export function ballsAtStart(): BallState[] {
  return LANES.map(() => ({ u: U0, since: 0, marks: [] }));
}

export function initialState(_params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): RampEnergyState {
  return { drop: DROP_DEFAULT, held: false, allOnFloor: false, balls: ballsAtStart() };
}
