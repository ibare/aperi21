import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { deriveReadings, potential, readConstants } from './physics';
import { U_START } from './schema';

export interface PotentialEnergyCurveState {
  /** 물체 자리(위치 축). */
  u: number;
  /** 속도. 매 하위 단계 √(2(E−U)) 로 다시 맞춘다. */
  v: number;
  /** 전체 에너지 — 선의 높이. */
  E: number;

  /** 조각 시계(초). `step` 이 시간표를 받지 못해 스스로 센다 (NOTES G01). */
  clock: number;
  /** 고정 걸음(1/60 초)에 못 미친 남은 시간. 실시간 dt 가 가변이라 둔다 (NOTES G39). */
  acc: number;
  /** 지금까지 걸은 고정 걸음 수. 자국을 5 걸음마다 찍는다. */
  frame: number;
  /** 같은 시간 간격으로 찍은 과거 자리. 오래된 것이 앞. */
  trail: number[];

  /** 조작기가 쥐는 선 높이. 손대기 전에는 선을 따라온다 — 손잡이가 늘 선 위에 있게. */
  target: number;
  /** 독자가 선을 잡고 있는가. 러너가 `heldPath` 로 적는다. */
  held: boolean;
  /** 독자가 한 번이라도 선을 끌었는가. 그 뒤로는 끈 높이가 목표다(원본과 같다). */
  manual: boolean;

  /** 물체가 닿을 수 있는 구간의 양 끝 — 전환점. */
  uL: number;
  uR: number;
  // 캡션 슬롯의 `cases` 가 가리키는 자리. 세는 것은 physics 다 (원칙 2).
  /** 닿는 구간이 가운데 언덕 꼭대기를 품는다. */
  spansBoth: boolean;
  /** 언덕에 막혀 왼쪽 골짜기에 갇혔다. */
  trappedLeft: boolean;
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): PotentialEnergyCurveState {
  const c = readConstants(params.stage);
  const u = U_START;
  const E = c.eLow;
  // 도착한 순간 이미 오른쪽으로 달리고 있다 (S-piece) — 원본 초기 상태 그대로.
  const v = Math.sqrt(2 * Math.max(0, E - potential(u)));
  return {
    u,
    v,
    E,
    clock: 0,
    acc: 0,
    frame: 0,
    trail: [],
    target: E,
    held: false,
    manual: false,
    ...deriveReadings(u, E),
  };
}
