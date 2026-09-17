import { DEFAULT_HEAVY_M } from './schema';
import { equilibriumAngle, omegaAt } from './physics';

/** 줄에 매단 추 하나. `th` 는 연직에서 바깥으로 기운 각도(rad). */
export interface Bob {
  th: number;
  thd: number;
}

/**
 * 누적 상태. 원본의 `bobs` · `phi` 와 piece-kit 시계를 그대로 옮기고, 조작기 자리와
 * 고정 걸음 적립을 더했다.
 */
export interface FictitiousForceState {
  /** 조각 시계(초). `step` 이 고정 걸음마다 쌓는다 — ω 가 이 시각의 함수다. */
  t: number;
  /** 러너의 걸음을 고정 걸음으로 쪼개고 남은 시간(초). */
  acc: number;
  /** 왼쪽(가벼운) 추. */
  left: Bob;
  /** 오른쪽(무거운) 추. */
  right: Bob;
  /** 틀이 돈 누적 각도(rad) — 바깥 풍경이 흘러가는 양. */
  phi: number;
  /** 오른쪽 추 질량(kg). 슬라이더가 적는다. */
  heavyMass: number;
  /** 두 추의 질량이 같은가 — 캡션 슬롯이 읽는다. */
  equalMass: boolean;
}

export function initialState(): FictitiousForceState {
  // 원본 `makeBob` — 두 추 모두 t = 0 의 ω 에서 멈춰 설 각도로 연다.
  const th0 = equilibriumAngle(omegaAt(0));
  return {
    t: 0,
    acc: 0,
    left: { th: th0, thd: 0 },
    right: { th: th0, thd: 0 },
    phi: 0,
    heavyMass: DEFAULT_HEAVY_M,
    equalMass: false, // 기본 3 kg 대 1 kg — 첫 걸음부터 `step` 이 다시 센다
  };
}
