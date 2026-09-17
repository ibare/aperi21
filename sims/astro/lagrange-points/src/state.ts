import { TEST } from './schema';

/** 시험 물체 하나. 좌표는 함께 도는 틀의 물리 단위. */
export interface TestBody {
  /** 놓인 평형점 번호(0~4 = L1~L5). */
  readonly li: number;
  /** [x, y, vx, vy]. */
  readonly s: readonly [number, number, number, number];
  /** 놓인 시각(조각 시계, 초). */
  readonly born: number;
  /** 떠난 것으로 본 시각. 아직이면 `null`. */
  readonly endAt: number | null;
  /** 자취 표본 [x, y, 시각]. 오래된 것이 앞. */
  readonly trail: readonly (readonly [number, number, number])[];
}

/**
 * 원본의 누적 상태 그대로 — 물체마다 RK4 로 적분하므로 시각의 함수가 아니다.
 * 난수 시드도 상태에 둔다. 같은 시각은 언제나 같은 화면이다.
 */
export interface LagrangePointsState {
  readonly bodies: readonly TestBody[];
  /** 미리 돌린 시간을 포함한 누적 시각(초). */
  readonly clock: number;
  /** 고정 걸음 번호 — 자취는 두 걸음에 한 번 남긴다(원본). */
  readonly frame: number;
  /** 점마다 다음 물체를 놓을 시각. */
  readonly nextEmit: readonly number[];
  /** mulberry32 내부 값. */
  readonly rng: number;
  /** 실시간 가변 dt 를 고정 걸음으로 나누는 누적기 (NOTES G39). */
  readonly acc: number;
}

export function initialState(): LagrangePointsState {
  return {
    bodies: [],
    clock: 0,
    frame: 0,
    nextEmit: [0, 1, 2, 3, 4].map((i) => (i * TEST.emitEvery) / 5),
    rng: TEST.seed >>> 0,
    acc: 0,
  };
}
