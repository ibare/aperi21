import { DEFAULT_ORBITAL, HEAD_START, SAMPLE_SEED, type OrbitalKey } from './schema';

/** 측정 한 번의 결과 — 전자가 발견된 한 자리. 한 번 찍히면 움직이지 않는다. */
export interface Found {
  /** 원자 단위(보어 반지름) 3차원 좌표. */
  readonly x: number;
  readonly y: number;
  readonly z: number;
  /** 발견된 측정 시각(`tau`). */
  readonly born: number;
  /** 방금 발견된 자리로 보이는 시간(초). 발견 순간의 측정률로 정해진다. */
  readonly life: number;
}

/**
 * 상태.
 *
 * 발견 자리는 측정률의 적분이라 시각의 함수가 아니다 — `step` 이 쌓는다. 난수도
 * 상태에 둔다(시드에서 이어지는 수 하나). 같은 걸음은 언제나 같은 자리를 뽑는다.
 */
export interface AtomicOrbitalState {
  /** 고른 궤도. 조작기(`param-chips`)가 적는다. */
  orbital: OrbitalKey;
  /** 지금 쌓고 있는 궤도. `orbital` 과 다르면 `step` 이 비우고 다시 쌓는다. */
  shown: OrbitalKey;
  /** 지금까지 발견된 자리. */
  found: readonly Found[];
  /** 측정 시각(초). 궤도를 바꾸면 0 에서 `HEAD_START` 만큼 앞서 다시 시작한다. */
  tau: number;
  /** 아직 한 번이 되지 못한 측정의 누적 몫. */
  acc: number;
  /** 난수 상태(mulberry32). */
  rng: number;
  /** 흔들기 시계(초). 궤도를 바꿔도 되돌리지 않는다. 프리롤 뒤 0 이다. */
  clock: number;
  /** 캡션 구간 — 발견 수가 첫 구간 미만. */
  few: boolean;
  /** 캡션 구간 — 둘째 구간 미만(첫 구간 이상). */
  forming: boolean;
}

export function initialState(): AtomicOrbitalState {
  return {
    orbital: DEFAULT_ORBITAL,
    shown: DEFAULT_ORBITAL,
    found: [],
    tau: 0,
    acc: 0,
    rng: SAMPLE_SEED >>> 0,
    // 프리롤(`HEAD_START`)을 다 굴린 순간이 흔들기 시계 0 이다 — 원본의 루프 시계.
    clock: -HEAD_START,
    few: true,
    forming: false,
  };
}
