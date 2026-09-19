// ========================================================================
// reactance-and-impedance — 순수 물리
// ========================================================================
// 진동수 f 에서 (ω = 2πf)
//   코일:   X_L = ωL,     전류 진폭 I_L = V / X_L
//   축전기: X_C = 1/(ωC), 전류 진폭 I_C = V / X_C
// 진동수를 올리면 X_L 은 비례해 커지고 X_C 는 반비례해 작아진다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  CAPACITANCE_UF,
  CURRENT_SCALE,
  FALL_PHASE,
  FREQ0_HZ,
  FREQ1_HZ,
  FREQ2_HZ,
  FREQ3_HZ,
  FREQ_STEPS,
  GRAPH_FREQ_MAX,
  GRAPH_REACTANCE_MAX,
  INDUCTANCE_MH,
  SCOPE_WINDOW_MS,
  VOLTAGE_V,
} from './schema';
import type { ReactanceAndImpedanceState } from './state';

export interface ReactanceAndImpedanceConstants {
  /** 전원 전압 진폭(V). */
  voltage: number;
  /** 인덕턴스(mH). */
  inductance: number;
  /** 전기 용량(μF). */
  capacitance: number;
  /** 진동수 단계(Hz) — `FREQ_STEPS` 순서. */
  freqs: number[];
  /** 기록지 한 폭의 시간(ms). */
  scopeWindow: number;
  /** 전류 1 A 의 기록지 높이(월드). */
  currentScale: number;
  /** 평면 가로축 끝(Hz) · 세로축 끝(Ω). */
  graphFreqMax: number;
  graphReactanceMax: number;
}

const FREQ_DEFAULTS: Record<(typeof FREQ_STEPS)[number]['constant'], number> = {
  freq0: FREQ0_HZ,
  freq1: FREQ1_HZ,
  freq2: FREQ2_HZ,
  freq3: FREQ3_HZ,
};

export function readConstants(stage: StageDef): ReactanceAndImpedanceConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    voltage: c.voltage ?? VOLTAGE_V,
    inductance: c.inductance ?? INDUCTANCE_MH,
    capacitance: c.capacitance ?? CAPACITANCE_UF,
    freqs: FREQ_STEPS.map((s) => c[s.constant] ?? FREQ_DEFAULTS[s.constant]),
    scopeWindow: c.scopeWindow ?? SCOPE_WINDOW_MS,
    currentScale: c.currentScale ?? CURRENT_SCALE,
    graphFreqMax: c.graphFreqMax ?? GRAPH_FREQ_MAX,
    graphReactanceMax: c.graphReactanceMax ?? GRAPH_REACTANCE_MAX,
  };
}

/** 코일이 막는 정도 X_L(Ω). */
export function inductiveReactance(f: number, c: ReactanceAndImpedanceConstants): number {
  return 2 * Math.PI * f * c.inductance * 1e-3;
}

/** 축전기가 막는 정도 X_C(Ω). */
export function capacitiveReactance(f: number, c: ReactanceAndImpedanceConstants): number {
  return 1 / (2 * Math.PI * f * c.capacitance * 1e-6);
}

/**
 * 지금 진동수(Hz). **단계 경계는 선언이 정한다** — 오름 단계마다 진행도만큼 로그 눈금으로
 * 한 단계를 오르고, 내림 단계의 진행도만큼 처음으로 내려온다. 지나간 단계는 1, 오지 않은
 * 단계는 0 이라 분기가 없다 (S-piece 「시간표는 선언이다」).
 */
export function frequencyNow(tl: TimelineFrame, c: ReactanceAndImpedanceConstants): number {
  const logs = c.freqs.map(Math.log);
  let logF = logs[0]!;
  FREQ_STEPS.forEach((s, k) => {
    if ('rise' in s) logF += tl.at(s.rise) * (logs[k]! - logs[k - 1]!);
  });
  logF -= tl.at(FALL_PHASE) * (logs[logs.length - 1]! - logs[0]!);
  return Math.exp(logF);
}

/**
 * 흐린 점선으로 남길 **한 단계 낮은 진동수**(Hz). 오름 단계가 시작되면 그 출발 진동수가
 * 남아 뒤따르는 머묾 단계 끝까지 간다. 첫 머묾과 내림 단계에는 없다(`null`) — 비교할
 * 「한 단계 낮은 것」 이 없다.
 */
export function previousFrequency(tl: TimelineFrame, c: ReactanceAndImpedanceConstants): number | null {
  if (tl.at(FALL_PHASE) > 0) return null;
  let prev: number | null = null;
  FREQ_STEPS.forEach((s, k) => {
    if ('rise' in s && tl.at(s.rise) > 0) prev = c.freqs[k - 1]!;
  });
  return prev;
}

export interface CircuitReading {
  /** 막는 정도(Ω). */
  reactance: number;
  /** 전류 진폭(A). */
  current: number;
}

/** 진동수 f 에서 두 회로를 읽는다. */
export function readCircuits(
  f: number,
  c: ReactanceAndImpedanceConstants,
): { coil: CircuitReading; capacitor: CircuitReading } {
  const xl = inductiveReactance(f, c);
  const xc = capacitiveReactance(f, c);
  return {
    coil: { reactance: xl, current: c.voltage / xl },
    capacitor: { reactance: xc, current: c.voltage / xc },
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ReactanceAndImpedanceState }): ReactanceAndImpedanceState {
  return params.state;
}
