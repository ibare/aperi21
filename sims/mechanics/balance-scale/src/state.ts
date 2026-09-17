import type { EnvironmentDef, StageDef, Vec2 } from '@aperi21/schema';
import { deriveReadings, equilibrium, handleAt, readConstants } from './physics';

export interface BalanceScaleState {
  /**
   * 조각 시계(초). 시간표의 시계와 같은 걸음으로 흐른다 — `step` 은 시간표 프레임을
   * 받지 못해서 가벼운 추 거리의 대본을 이 시계로 읽는다 (NOTES 「어휘 부족」).
   */
  clock: number;
  /** 저울대 각(라디안). 양수면 오른쪽(가벼운 쪽)이 내려간다. 프레임 사이에 쌓인다. */
  theta: number;
  /** 각속도(라디안/초). */
  omega: number;
  /** 가벼운 추의 거리(눈금 칸). 대본 또는 끌기가 정한다. */
  xLight: number;

  /**
   * 조작기가 쥐는 자리(월드). 잡고 있지 않으면 가벼운 추 가운데를 따라온다 — 손잡이가
   * 늘 추 위에 있어야 잡을 것이 어디인지 안다. 잡고 있는 동안에는 포인터 자리이고,
   * 그것을 저울대 위로 투영하는 것은 `step` 이다.
   */
  handle: Vec2;
  /** 독자가 가벼운 추를 잡고 있는가. 러너가 적는다. */
  held: boolean;
  /** 독자가 한 번이라도 끌었는가. 끈 뒤로는 대본이 멈춘다 (원본 그대로). */
  manual: boolean;

  // 캡션 국면 — 슬롯의 `cases` 가 가리키는 자리. 세는 것은 physics 다 (원칙 2).
  /** 대본 중 수평 단계에서 1.5° 안에 들었다. */
  levelReached: boolean;
  /** 끌어 본 뒤, 1° 안에서 수평이다. */
  manualLevel: boolean;
  /** 끌어 본 뒤, 무거운 쪽으로 기울어 있다. */
  manualHeavy: boolean;
  /** 끌어 본 뒤, 가벼운 쪽으로 기울어 있다. */
  manualLight: boolean;
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): BalanceScaleState {
  const c = readConstants(params.stage);
  // 도착한 순간 이미 기운 채로 있다 — 2칸일 때의 평형각에서 연다 (원본 그대로).
  // 시계를 앞당기는 것이 아니라 대본의 첫 자리에서 저울이 이미 멈춰 있는 것이다.
  const theta = equilibrium(c.armNear, c);
  const base = {
    clock: 0,
    theta,
    omega: 0,
    xLight: c.armNear,
    handle: handleAt(c.armNear, theta),
    held: false,
    manual: false,
  };
  return { ...base, ...deriveReadings(base, 'near') };
}
