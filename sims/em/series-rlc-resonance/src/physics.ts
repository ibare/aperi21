// ========================================================================
// series-rlc-resonance — 순수 물리
// ========================================================================
// 진동수 f 에서 (ω = 2πf)
//   코일 몫    X_L = ωL
//   축전기 몫  X_C = 1/(ωC)
//   임피던스   Z = √(R² + (X_L − X_C)²)
//   전류 진폭  I = V / Z
// 두 몫이 같아지는 f₀ = 1/(2π√(LC)) 에서 Z = R 로 가장 작고 전류가 가장 크다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  CAPACITANCE_UF,
  FREQ_MAX_HZ,
  FREQ_MIN_HZ,
  GRAPH_CURRENT_MAX_A,
  GRAPH_FREQ_MAX_HZ,
  INDUCTANCE_MH,
  OHM_SCALE,
  PHASE,
  RESISTANCE_HIGH_OHM,
  RESISTANCE_LOW_OHM,
  VOLTAGE_V,
} from './schema';
import type { SeriesRlcResonanceState } from './state';

export interface SeriesRlcResonanceConstants {
  /** 전원 전압 진폭(V). */
  voltage: number;
  /** 첫 쓸기 · 둘째 쓸기의 저항(Ω). */
  resistanceHigh: number;
  resistanceLow: number;
  /** 인덕턴스(mH) · 전기 용량(μF). */
  inductance: number;
  capacitance: number;
  /** 쓰는 범위(Hz). */
  freqMin: number;
  freqMax: number;
  /** 평면 가로축 끝(Hz) · 세로축 끝(A). */
  graphFreqMax: number;
  graphCurrentMax: number;
  /** 사슬에서 1 Ω 의 길이(월드). */
  ohmScale: number;
}

export function readConstants(stage: StageDef): SeriesRlcResonanceConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    voltage: c.voltage ?? VOLTAGE_V,
    resistanceHigh: c.resistanceHigh ?? RESISTANCE_HIGH_OHM,
    resistanceLow: c.resistanceLow ?? RESISTANCE_LOW_OHM,
    inductance: c.inductance ?? INDUCTANCE_MH,
    capacitance: c.capacitance ?? CAPACITANCE_UF,
    freqMin: c.freqMin ?? FREQ_MIN_HZ,
    freqMax: c.freqMax ?? FREQ_MAX_HZ,
    graphFreqMax: c.graphFreqMax ?? GRAPH_FREQ_MAX_HZ,
    graphCurrentMax: c.graphCurrentMax ?? GRAPH_CURRENT_MAX_A,
    ohmScale: c.ohmScale ?? OHM_SCALE,
  };
}

/** 코일 몫 X_L(Ω). */
export function inductiveReactance(f: number, c: SeriesRlcResonanceConstants): number {
  return 2 * Math.PI * f * c.inductance * 1e-3;
}

/** 축전기 몫 X_C(Ω). */
export function capacitiveReactance(f: number, c: SeriesRlcResonanceConstants): number {
  return 1 / (2 * Math.PI * f * c.capacitance * 1e-6);
}

/** 공진 진동수 f₀(Hz) — 두 몫이 같아지는 곳. */
export function resonanceFrequency(c: SeriesRlcResonanceConstants): number {
  return 1 / (2 * Math.PI * Math.sqrt(c.inductance * 1e-3 * c.capacitance * 1e-6));
}

/** 저항 R 일 때 진동수 f 의 전류 진폭(A). */
export function currentAmplitude(f: number, r: number, c: SeriesRlcResonanceConstants): number {
  const x = inductiveReactance(f, c) - capacitiveReactance(f, c);
  return c.voltage / Math.hypot(r, x);
}

/**
 * 첫 쓸기가 지금까지 닿은 진동수(Hz). 오름 단계의 진행도만큼 fMin → f₀ → fMax 로 간다.
 * 지나간 단계는 1, 오지 않은 단계는 0 이라 분기가 없다 (S-piece 「시간표는 선언이다」).
 */
export function sweepReachHigh(tl: TimelineFrame, c: SeriesRlcResonanceConstants): number {
  const f0 = resonanceFrequency(c);
  return c.freqMin + tl.at(PHASE.approachHigh) * (f0 - c.freqMin) + tl.at(PHASE.pastHigh) * (c.freqMax - f0);
}

/** 둘째 쓸기가 지금까지 닿은 진동수(Hz). */
export function sweepReachLow(tl: TimelineFrame, c: SeriesRlcResonanceConstants): number {
  const f0 = resonanceFrequency(c);
  return c.freqMin + tl.at(PHASE.approachLow) * (f0 - c.freqMin) + tl.at(PHASE.pastLow) * (c.freqMax - f0);
}

/**
 * 지금 구동 진동수(Hz). 두 쓸기의 오름을 더하고, 되돌아가는 두 단계(`swap` · `clear`)의
 * 진행도만큼 fMax 에서 fMin 으로 내려온다.
 */
export function frequencyNow(tl: TimelineFrame, c: SeriesRlcResonanceConstants): number {
  const span = c.freqMax - c.freqMin;
  return (
    sweepReachHigh(tl, c) +
    (sweepReachLow(tl, c) - c.freqMin) -
    span * (tl.at(PHASE.swap) + tl.at(PHASE.clear))
  );
}

/** 지금 저항(Ω). `swap` 동안 작은 쪽으로 줄고, `clear` 동안 큰 쪽으로 돌아간다. */
export function resistanceNow(tl: TimelineFrame, c: SeriesRlcResonanceConstants): number {
  const d = c.resistanceLow - c.resistanceHigh;
  return c.resistanceHigh + d * (tl.at(PHASE.swap) - tl.at(PHASE.clear));
}

/**
 * 이름표에 띄울 저항 — 선언값 그대로다(계산해 반올림하지 않는다, S-piece 유효숫자).
 * `swap` 이 시작되면 작은 쪽, `clear` 가 시작되면 큰 쪽. 단계 경계는 선언이 정한다.
 */
export function resistanceLabelValue(tl: TimelineFrame, c: SeriesRlcResonanceConstants): number {
  return tl.at(PHASE.swap) > 0 && tl.at(PHASE.clear) === 0 ? c.resistanceLow : c.resistanceHigh;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: SeriesRlcResonanceState }): SeriesRlcResonanceState {
  return params.state;
}
