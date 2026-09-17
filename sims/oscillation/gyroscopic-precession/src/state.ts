import { DEFAULT_L, PHI0 } from './schema';
import { seedTips } from './physics';

/**
 * 누적 상태. 세차각과 스핀각은 스핀 조작값(|L|)에 따른 빠르기의 적분이고, 토막은 1 초마다
 * 기록한 세차각 목록이라 시각만으로 되살릴 수 없다 — 스핀을 바꾼 순간부터 다시 쌓는다.
 */
export interface GyroscopicPrecessionState {
  /** 조절기가 쓰는 자리 — 독자가 고른 스핀. */
  spin: number;
  /** 지금 토막이 쌓이는 기준 |L|. `spin` 과 다르면 `step` 이 토막을 비우고 새로 시작한다. */
  L: number;
  /** 세차각(rad). */
  phi: number;
  /** 원판 제 축 회전각(rad). */
  psi: number;
  /** 마지막 토막 뒤 흐른 시간(초). */
  since: number;
  /** 토막 경계의 세차각 목록. 이웃한 둘이 토막 하나다. 마지막이 가장 최근. */
  tips: number[];
}

export function initialState(): GyroscopicPrecessionState {
  return {
    spin: DEFAULT_L,
    L: DEFAULT_L,
    phi: PHI0,
    psi: 0,
    since: 0,
    tips: seedTips(PHI0, DEFAULT_L),
  };
}
