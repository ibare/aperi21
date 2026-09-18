// ========================================================================
// rocket-equation — 순수 물리
// ========================================================================
// 모든 것이 시각의 함수다. 칸 k 를 비율 p 만큼 태웠을 때 붙는 속도도, 그동안
// 흐른 거리도 닫힌 꼴로 나온다 — 상태를 쌓을 것이 없어 `step` 은 항등이다 (S-sim).
//
// 칸 하나가 질량 1, 연료가 아닌 몫이 `DRY_MASS`. 칸 k 를 태우기 직전의 질량은
// `DRY_MASS + BLOCKS - (k-1)` 이고, 태우는 동안 유량이 일정해 질량은 시간에 비례해 준다.
// ========================================================================

import { BLOCKS, DRY_MASS } from './schema';
import type { RocketEquationState } from './state';

/** 칸 k(뒤에서부터 1)를 태우기 직전의 질량. */
export function massBefore(k: number): number {
  return DRY_MASS + BLOCKS - (k - 1);
}

/**
 * 칸 k 를 비율 p(0~1)만큼 태웠을 때 붙은 속도 — **뿜는 빠르기 1 단위**로 잰 값이다.
 * 로켓 방정식 Δv = ve·ln(m전/m후) 그대로다.
 */
export function blockGain(k: number, p: number): number {
  const m = massBefore(k);
  const q = Math.min(Math.max(p, 0), 1);
  return Math.log(m / (m - q));
}

/** 여덟 칸 전부를 다 태웠을 때 붙는 속도(뿜는 빠르기 1 단위). ln(10/2) = 1.609. */
export function totalGain(): number {
  let sum = 0;
  for (let k = 1; k <= BLOCKS; k++) sum += blockGain(k, 1);
  return sum;
}

/**
 * 칸 k 를 비율 p 만큼 태우는 **동안 흐른 거리** — 뿜는 빠르기 1 · 한 칸 태우는 시간 1
 * 단위로 잰 값이고, 그 칸을 태우기 시작할 때의 속도는 빼고 센다.
 *
 * ∫₀ᵖ ln(m/(m−s)) ds 를 그대로 적분한 것이다. p=0 이면 0.
 */
export function blockShift(k: number, p: number): number {
  const m = massBefore(k);
  const q = Math.min(Math.max(p, 0), 1);
  const rest = m - q;
  return q * Math.log(m) - (m * Math.log(m) - m) + (rest * Math.log(rest) - rest);
}

/**
 * 시드에서 뽑는 0~1. 별자리를 프레임마다 다시 뽑아도 같은 자리에 오게 한다 —
 * 같은 시각은 언제나 같은 화면이다 (S-piece).
 */
export function stableUnit(index: number, salt: number): number {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** 상태가 비어 있어 걸음이 하는 일이 없다. 시각이 화면을 전부 정한다 (S-sim). */
export function step(params: { state: RocketEquationState }): RocketEquationState {
  return params.state;
}
