import { DEFAULT_FRICTION, RNG_SEED } from './schema';
import { seedCycle } from './physics';

/** 한 진자의 (각도, 각속도). */
export interface PhaseState {
  th: number;
  om: number;
}

export interface PhaseSpaceState {
  /** 마찰 계수 γ. 조작기(`friction`)가 쓴다. */
  friction: number;
  /** 캡션 판정 — 마찰이 0 인가. `physics.ts` 가 센다. */
  frictionZero: boolean;
  /** 캡션 판정 — 추적 상태가 바닥에 멈췄는가. */
  settled: boolean;

  /** 고정 걸음 수. 조각 시계 = ticks · TICK (시간표 시계와 같은 원점). */
  ticks: number;
  /** 고정 걸음으로 아직 쓰지 않은 시간(초). */
  acc: number;
  /** 지금 무리를 흩뿌린 주기 번호. */
  cycle: number;
  /** 흩뿌린 뒤 흐른 걸음 수. */
  cycleTicks: number;
  /** mulberry32 난수 상태. 주기마다 이어서 뽑는다. */
  rng: number;

  /** 무리의 각도 · 각속도. */
  th: Float64Array;
  om: Float64Array;
  /** 잔상 고리 버퍼 — 걸음마다 한 벌. `histTh[k * N + i]`. */
  histTh: Float32Array;
  histOm: Float32Array;
  histHead: number;
  histCount: number;

  /** 추적하는 한 진자. */
  tracked: PhaseState;
  /** 주기 시작부터의 추적 기록. */
  path: readonly PhaseState[];
}

export function initialState(): PhaseSpaceState {
  const base = {
    friction: DEFAULT_FRICTION,
    frictionZero: false,
    settled: false,
    ticks: 0,
    acc: 0,
    cycle: 0,
    rng: RNG_SEED,
  };
  return { ...base, ...seedCycle(RNG_SEED) };
}
