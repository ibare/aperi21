import type { EnvironmentDef, StageDef, Vec2 } from '@aperi21/schema';
import { deriveReadings, readConstants } from './physics';
import { KNOT_START } from './schema';

export interface EquilibriumOfForcesState {
  /**
   * 조각 시계(초). 시간표의 시계와 같은 걸음으로 흐른다 — `step` 은 시간표 프레임을
   * 받지 못해서 왼쪽 추 칸 수의 대본을 이 시계로 읽는다 (NOTES 「어휘 부족」).
   */
  clock: number;
  /** 매듭 자리(월드). 프레임 사이에 쌓인다. */
  knot: Vec2;
  /** 매듭 속도(월드/초). */
  vel: Vec2;
  /** 지금 왼쪽 추 칸 수. 대본이 정하고 scene 이 읽는다. */
  left: number;

  /**
   * 조작기가 쥐는 자리(월드). 잡고 있지 않으면 매듭을 따라온다. 잡고 있는 동안에는
   * 포인터 자리이고, 그것을 끌 수 있는 범위 안으로 붙이는 것은 `step` 이다.
   */
  handle: Vec2;
  /** 독자가 매듭을 잡고 있는가. 러너가 적는다. 캡션 `cases` 도 이 자리를 본다. */
  held: boolean;

  /**
   * 틈이 문턱(0.03 칸) 아래인가. 캡션 분기와 알짜힘 · 틈 화살표 그리기가 **같은 값**을
   * 본다 — 둘이 따로 판정되면 캡션과 화면이 어긋난다. 세는 것은 physics 다.
   */
  closed: boolean;
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): EquilibriumOfForcesState {
  const c = readConstants(params.stage);
  // 도착한 순간 이미 틈이 열려 있다 — 매듭은 4칸일 때의 평형 자리, 추는 3칸으로 연다
  // (원본 그대로). 시계를 앞당기는 것이 아니라 한 칸이 막 빠진 순간에서 시작하는 것이다.
  const base = {
    clock: 0,
    knot: KNOT_START,
    vel: [0, 0] as Vec2,
    left: c.leftFew,
    handle: KNOT_START,
    held: false,
  };
  return { ...base, ...deriveReadings(base, c) };
}
