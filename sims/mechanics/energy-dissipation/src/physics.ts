// ========================================================================
// energy-dissipation — 순수 물리
// ========================================================================
// 쿨롱 마찰이 걸린 용수철 진동자는 반주기마다 닫힌 해를 갖는다. 반주기 하나는
// ±δ(= μmg/k) 로 옮겨진 평형점을 중심으로 한 단순 조화 운동이고, 그 반주기가 끝날
// 때 진폭이 2δ 만큼 줄어 있다.
//
// 그래서 이 조각은 **상태를 쌓지 않는다.** 물체의 자리도, 문지른 거리도, 바닥에
// 쌓인 열의 분포도 모두 시각의 함수다 (S-sim 「상태가 시계뿐인 조각」).
//
// 열은 문지른 **거리**에 비례한다 — 마찰력 μmg 가 미끄러진 길이만큼 일을 한다.
// 한 자리에 쌓이는 열은 그 자리가 물체 밑에 깔려 있던 동안 미끄러진 거리이며,
// 물체가 여러 번 지나간 가운데가 가장 두껍다.
// ========================================================================

import { AMPLITUDE, BLOCK_W, DELTA, HALF_CYCLES, HALF_PERIOD } from './schema';
import type { EnergyDissipationState } from './state';

/** 각진동수 ω — 반주기 하나가 `HALF_PERIOD` 초다. */
const OMEGA = Math.PI / HALF_PERIOD;

/** 반주기 `j` 의 시작 자리(용수철 자연 길이 기준 변위). 부호가 번갈아 바뀐다. */
function startOf(j: number): number {
  const sign = j % 2 === 0 ? 1 : -1;
  return sign * (AMPLITUDE - 2 * j * DELTA);
}

/** 반주기 `j` 의 평형점 ±δ — 마찰이 운동 반대쪽으로 밀어 옮겨 놓은 자리. */
function centerOf(j: number): number {
  return (j % 2 === 0 ? 1 : -1) * DELTA;
}

/** 반주기 `j` 동안 미끄러지는 길이 = 진폭의 두 배(평형점 기준). */
function spanOf(j: number): number {
  return 2 * Math.abs(startOf(j) - centerOf(j));
}

/** 시각 → 물체의 변위(용수철 자연 길이 기준). `tau` 는 미끄러짐이 시작된 뒤 흐른 초. */
export function displacementAt(tau: number): number {
  const total = HALF_CYCLES * HALF_PERIOD;
  if (tau >= total) return 0;
  const j = Math.max(0, Math.floor(tau / HALF_PERIOD));
  const local = tau - j * HALF_PERIOD;
  const s = startOf(j);
  const c = centerOf(j);
  return c + (s - c) * Math.cos(OMEGA * local);
}

/** 지금까지 미끄러진 총 거리. 마찰이 한 일은 이 거리에 비례한다. */
export function slidDistanceAt(tau: number): number {
  const total = HALF_CYCLES * HALF_PERIOD;
  if (tau >= total) return 2 * HALF_CYCLES * HALF_CYCLES * DELTA;
  const j = Math.max(0, Math.floor(tau / HALF_PERIOD));
  let sum = 0;
  for (let i = 0; i < j; i++) sum += spanOf(i);
  return sum + Math.abs(displacementAt(tau) - startOf(j));
}

/**
 * 처음 에너지 중 지금까지 열이 된 몫(0~1).
 *
 * E₀ = ½kA₀², 마찰이 한 일 = μmg·L = kδ·L 이므로 몫은 2δL/A₀² 다. 마지막
 * 반주기가 끝나면 정확히 1 이 된다 — `AMPLITUDE = 2·HALF_CYCLES·δ` 로 맞춘 결과다.
 */
export function heatFractionAt(tau: number): number {
  const f = (2 * DELTA * slidDistanceAt(tau)) / (AMPLITUDE * AMPLITUDE);
  return Math.min(1, Math.max(0, f));
}

/** 지금까지 물체 중심이 지나온 구간들(변위 기준). 겹치는 것을 합치지 않고 그대로 센다. */
function traversedSpans(tau: number): [number, number][] {
  const total = HALF_CYCLES * HALF_PERIOD;
  const clamped = Math.min(tau, total);
  const j = Math.min(HALF_CYCLES - 1, Math.max(0, Math.floor(clamped / HALF_PERIOD)));
  const spans: [number, number][] = [];
  for (let i = 0; i < j; i++) {
    const a = startOf(i);
    const b = 2 * centerOf(i) - a;
    spans.push([Math.min(a, b), Math.max(a, b)]);
  }
  const a = startOf(j);
  const b = clamped >= total ? 2 * centerOf(j) - a : displacementAt(clamped);
  spans.push([Math.min(a, b), Math.max(a, b)]);
  return spans;
}

/**
 * 바닥 띠의 칸마다 쌓인 열 — **지나간 횟수**의 단위다(1 = 물체가 한 번 문지르고 감).
 *
 * 한 자리가 받는 열은 그 자리가 물체 밑(중심에서 반폭 안)에 있던 동안 물체가
 * 미끄러진 거리에 비례한다. 접촉면 전체가 함께 문지르므로 물체 폭으로 나눈다.
 *
 * `x0`~`x1` 은 띠가 덮는 구간(변위 기준), `cols` 는 칸 수다.
 */
export function heatCells(tau: number, x0: number, x1: number, cols: number): number[] {
  const spans = traversedSpans(tau);
  const half = BLOCK_W / 2;
  const cells: number[] = new Array<number>(cols).fill(0);
  for (let i = 0; i < cols; i++) {
    const p = x0 + ((x1 - x0) * (i + 0.5)) / cols;
    let sum = 0;
    for (const [a, b] of spans) {
      const lo = Math.max(a, p - half);
      const hi = Math.min(b, p + half);
      if (hi > lo) sum += hi - lo;
    }
    cells[i] = sum / BLOCK_W;
  }
  return cells;
}

/** 쌓는 상태가 없다 — 물체도 열도 모두 시각의 함수다. */
export function step(params: { state: EnergyDissipationState }): EnergyDissipationState {
  return params.state;
}
