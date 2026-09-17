import type { EnvironmentDef, StageDef, Vec2 } from '@aperi21/schema';
import { handleAt, readConstants, readingOf, scriptedForce } from './physics';

export interface TensionState {
  /**
   * 조각 시계(초). 시간표의 시계와 같은 걸음으로 흐른다 — `step` 은 시간표 프레임을
   * 받지 못해서 힘의 대본을 이 시계로 읽는다 (NOTES 「어휘 부족」).
   */
  clock: number;
  /** 손이 당기는 힘 F(N). 줄 한 가닥이라 세 저울의 장력이 모두 이것이다. */
  force: number;
  /**
   * 화면의 모든 눈금 글자와 캡션이 읽는 값 — F 를 반올림한 정수 문자열 하나.
   * 원본 `shown`. 캡션 슬롯의 `vars` 가 이 경로를 가리킨다.
   */
  reading: string;

  /**
   * 조작기가 쥐는 자리(월드). 잡고 있지 않으면 주먹 가운데를 따라온다. 잡고 있는 동안에는
   * 포인터 자리이고, 그 가로 위치를 힘으로 바꾸는 것은 `step` 이다.
   */
  handle: Vec2;
  /** 독자가 손을 잡고 있는가. 러너가 적는다. */
  held: boolean;
  /** 바로 앞 걸음에 잡고 있었는가 — 놓는 순간을 알아채려고 둔다. */
  wasHeld: boolean;
  /** 놓은 순간의 힘. 자동 진행 값으로 섞어 돌아가는 중이 아니면 null. 원본 releaseF. */
  releaseFrom: number | null;
  /** 놓은 뒤 흐른 시간(초). 원본 releaseAge. */
  releaseAge: number;
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): TensionState {
  const c = readConstants(params.stage);
  // 원본 `F = autoForce(0)` — 도착한 순간 30 N 에서 막 더 당기기 시작한다.
  const force = scriptedForce(0, c);
  return {
    clock: 0,
    force,
    reading: readingOf(force),
    handle: handleAt(force),
    held: false,
    wasHeld: false,
    releaseFrom: null,
    releaseAge: 0,
  };
}
