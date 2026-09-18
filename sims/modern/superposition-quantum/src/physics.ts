// ========================================================================
// superposition-quantum — 순수 물리
// ========================================================================
// 상자 [0, L] 을 u = x / L 로 재면 정상 상태는 φₙ(u) = √2 sin(nπu) (넓이 1)이다.
// 겹친 상태 ψ = √w_a φ_a e^(−iθ_a) + √w_b φ_b e^(−iθ_b), θₙ = 2π n² t / T₁
// (T₁ = h / E₁ 를 화면 초로 늘인 값) 의 분포는
//
//   |ψ|² = w_a φ_a² + w_b φ_b² + 2 √(w_a w_b) φ_a φ_b cos Δ,   Δ = θ_b − θ_a.
//
// 앞 두 항은 「둘 중 하나로 정해져 있다」 의 분포(가중 평균)이고 멈춰 있다. 마지막 항(간섭 항)만
// 시간에 따라 변한다 — 둘이 함께 있어야만 생기는 항이다. φ_a φ_b 가 한쪽 반에서 양, 다른 반에서
// 음이면(1 · 2 준위) 분포가 좌우로 출렁인다.
//
// 모든 것이 조각 시계의 함수다 — 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { BOX_WIDTH, E1_PHASE_PERIOD, LEVEL_A, LEVEL_B, WEIGHT_A, WEIGHT_B } from './schema';
import type { SuperpositionQuantumState } from './state';

/** 봉우리 · 무게 중심을 셀 때 쓰는 표본 수. */
const PEAK_SAMPLES = 400;

export interface SuperpositionQuantumConstants {
  /** 겹치는 두 준위의 번호. */
  levelA: number;
  levelB: number;
  /** 두 성분의 몫(합으로 나눠 쓴다). */
  weightA: number;
  weightB: number;
  /** E₁ 위상 주기 h / E₁ (화면 초). */
  e1PhasePeriod: number;
  /** 큰 상자의 폭(월드). */
  boxWidth: number;
}

export function readConstants(stage: StageDef): SuperpositionQuantumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    levelA: c.levelA ?? LEVEL_A,
    levelB: c.levelB ?? LEVEL_B,
    weightA: c.weightA ?? WEIGHT_A,
    weightB: c.weightB ?? WEIGHT_B,
    e1PhasePeriod: c.e1PhasePeriod ?? E1_PHASE_PERIOD,
    boxWidth: c.boxWidth ?? BOX_WIDTH,
  };
}

/** 합이 1 인 두 몫. */
function weights(c: SuperpositionQuantumConstants): { wa: number; wb: number } {
  const sum = c.weightA + c.weightB || 1;
  return { wa: c.weightA / sum, wb: c.weightB / sum };
}

/** 정상 상태 n 의 파동 함수(u = x / L, 넓이 1). 양 벽에서 0 이다. */
export function phi(u: number, n: number): number {
  return Math.SQRT2 * Math.sin(n * Math.PI * u);
}

/** 정상 상태 n 하나의 분포 |φₙ|² — 시간에 따라 변하지 않는다. */
export function stationaryDensity(u: number, n: number): number {
  const v = phi(u, n);
  return v * v;
}

/** 「둘 중 하나로 정해져 있다」 의 분포 — 두 분포의 가중 평균. 멈춰 있다. */
export function eitherDensity(u: number, c: SuperpositionQuantumConstants): number {
  const { wa, wb } = weights(c);
  return wa * stationaryDensity(u, c.levelA) + wb * stationaryDensity(u, c.levelB);
}

/** 겹친 상태의 분포 |ψ|². `delta` 는 두 위상의 차 Δ = θ_b − θ_a. */
export function superposedDensity(u: number, delta: number, c: SuperpositionQuantumConstants): number {
  const { wa, wb } = weights(c);
  const cross = 2 * Math.sqrt(wa * wb) * phi(u, c.levelA) * phi(u, c.levelB);
  return eitherDensity(u, c) + cross * Math.cos(delta);
}

/** 준위 n 의 위상 θₙ(라디안) — 조각 시계 t 에서. 에너지가 n² 라 n² 빠르기로 돈다. */
export function phaseOf(n: number, t: number, c: SuperpositionQuantumConstants): number {
  const T1 = c.e1PhasePeriod || 1;
  return (2 * Math.PI * n * n * t) / T1;
}

/** 지금 두 위상과 그 차. */
export interface PhaseReading {
  thetaA: number;
  thetaB: number;
  /** Δ = θ_b − θ_a. */
  delta: number;
}

export function readPhase(tl: TimelineFrame, c: SuperpositionQuantumConstants): PhaseReading {
  const thetaA = phaseOf(c.levelA, tl.t, c);
  const thetaB = phaseOf(c.levelB, tl.t, c);
  return { thetaA, thetaB, delta: thetaB - thetaA };
}

/** 겹친 분포가 닿을 수 있는 가장 높은 값 — 큰 상자의 높이 배율을 정한다(시각과 무관). */
export function superposedPeak(c: SuperpositionQuantumConstants): number {
  let peak = 0;
  for (let i = 0; i <= PEAK_SAMPLES; i++) {
    const u = i / PEAK_SAMPLES;
    peak = Math.max(peak, superposedDensity(u, 0, c), superposedDensity(u, Math.PI, c));
  }
  return peak;
}

/** 정상 상태 분포의 가장 높은 값 — 작은 상자의 높이 배율. √2 sin 의 제곱이라 2 다. */
export function stationaryPeak(n: number): number {
  let peak = 0;
  for (let i = 0; i <= PEAK_SAMPLES; i++) peak = Math.max(peak, stationaryDensity(i / PEAK_SAMPLES, n));
  return peak;
}

/** 겹친 분포의 무게 중심 ⟨u⟩(0~1). 출렁임이 좌우 치우침으로 읽히게 하는 자리다. */
export function meanPosition(delta: number, c: SuperpositionQuantumConstants): number {
  let num = 0;
  let den = 0;
  for (let i = 0; i <= PEAK_SAMPLES; i++) {
    const u = i / PEAK_SAMPLES;
    const d = superposedDensity(u, delta, c);
    num += u * d;
    den += d;
  }
  return den > 0 ? num / den : 0.5;
}

/** 단계가 정하는 짙기 — 큰 상자(겹친 상태)와 점선(둘 중 하나). */
export interface EmphasisReading {
  /** 큰 상자가 앞에 선 정도 0~1. */
  superposed: number;
  /** 점선이 떠오른 정도 0~1. */
  either: number;
}

export function readEmphasis(tl: TimelineFrame): EmphasisReading {
  const reset = tl.at('reset');
  return { superposed: tl.at('join') - reset, either: tl.at('either') - reset };
}

/** 상태가 시계뿐인 조각 — 항등 step (S-sim). */
export function step(params: { state: SuperpositionQuantumState }): SuperpositionQuantumState {
  return params.state;
}
