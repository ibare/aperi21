// ========================================================================
// phase-in-ac-circuit — 순수 물리
// ========================================================================
// 같은 교류 전압 v(t) = V cos(ω(t − t₀)) 를 이상적인 소자 하나에 건다 (ω = 2πf).
//   저항:   i = (V/R) cos(ω(t − t₀))            — 전압과 같은 위상
//   축전기: i = C dv/dt ∝ cos(ω(t − t₀) + π/2)  — 1/4 주기 앞선다
//   코일:   v = L di/dt ⇒ i ∝ cos(ω(t − t₀) − π/2) — 1/4 주기 늦는다
// 소자마다의 위상(0 · +π/2 · −π/2)은 이상 소자의 법칙이라 스테이지 상수로 두지 않는다 —
// 바꿀 수 있게 두면 저작자가 법칙과 어긋난 그림을 만들 수 있다.
//
// t₀ 는 기록지 한 폭의 가운데다. 전압 마루가 기록지 가운데에 오도록 시간 원점을 잡는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { CURRENT_AMPLITUDE, FREQUENCY_HZ, SCOPE_WINDOW_MS, VOLTAGE_AMPLITUDE } from './schema';
import type { PhaseInAcCircuitState } from './state';

export interface PhaseInAcCircuitConstants {
  /** 진동수(Hz). */
  frequency: number;
  /** 기록지 한 폭의 시간(ms). */
  scopeWindow: number;
  /** 전압 · 전류의 표시 진폭(월드). */
  voltageAmplitude: number;
  currentAmplitude: number;
}

export function readConstants(stage: StageDef): PhaseInAcCircuitConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    frequency: c.frequency ?? FREQUENCY_HZ,
    scopeWindow: c.scopeWindow ?? SCOPE_WINDOW_MS,
    voltageAmplitude: c.voltageAmplitude ?? VOLTAGE_AMPLITUDE,
    currentAmplitude: c.currentAmplitude ?? CURRENT_AMPLITUDE,
  };
}

export type Element = 'resistor' | 'capacitor' | 'inductor';

/** 전류가 전압보다 앞서는 위상(라디안). 이상 소자의 법칙이다. */
export function currentLead(element: Element): number {
  if (element === 'capacitor') return Math.PI / 2;
  if (element === 'inductor') return -Math.PI / 2;
  return 0;
}

/** 기록지 폭 안의 시각 s(0~1, 폭에 대한 비)에서 전압 위상 ω(t − t₀). 가운데(s = ½)에서 0. */
export function voltagePhase(s: number, c: PhaseInAcCircuitConstants): number {
  const windowS = c.scopeWindow * 1e-3;
  return 2 * Math.PI * c.frequency * windowS * (s - 0.5);
}

/** 폭 안 시각 s 에서의 전압 · 전류(표시 높이, 월드). */
export function voltageAt(s: number, c: PhaseInAcCircuitConstants): number {
  return c.voltageAmplitude * Math.cos(voltagePhase(s, c));
}
export function currentAt(element: Element, s: number, c: PhaseInAcCircuitConstants): number {
  return c.currentAmplitude * Math.cos(voltagePhase(s, c) + currentLead(element));
}

/**
 * 전류 마루가 오는 폭 안 시각 s. 전압 마루(½)에서 앞선 위상만큼 당긴다 —
 * 축전기는 1/4 주기 왼쪽(먼저), 코일은 오른쪽(늦게).
 */
export function currentCrest(element: Element, c: PhaseInAcCircuitConstants): number {
  const periodsInWindow = c.frequency * c.scopeWindow * 1e-3;
  return 0.5 - currentLead(element) / (2 * Math.PI) / periodsInWindow;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: PhaseInAcCircuitState }): PhaseInAcCircuitState {
  return params.state;
}
