// ========================================================================
// lc-oscillation — 순수 물리
// ========================================================================
// 저항 없는 LC 회로 하나뿐이다. 위상각 θ 에서 (ω = 1/√(LC))
//   q = Q₀·cos θ              (위 판의 전하)
//   I = −dq/dt = Q₀·ω·sin θ   (위 판에서 빠져나가 윗도선을 오른쪽으로 흐르면 +)
//   U_E = q²/2C = E·cos²θ,  U_B = ½LI² = E·sin²θ,  E = Q₀²/2C
// 이라서 두 몫의 합은 언제나 E 이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  CAPACITANCE_UF,
  CHARGE_PER_MARK_UC,
  CURRENT_ARROW_SCALE,
  CURRENT_PER_LINE_MA,
  INDUCTANCE_MH,
  INITIAL_CHARGE_UC,
  QUARTER_PHASES,
  SLOW_MOTION,
} from './schema';
import type { LcOscillationState } from './state';

export interface LcOscillationConstants {
  /** 인덕턴스(mH). */
  inductance: number;
  /** 전기 용량(μF). */
  capacitance: number;
  /** 처음 판 전하(μC). */
  initialCharge: number;
  /** 화면 시간 배율 — 화면 1 초 = 실제 1/slowMotion 초. */
  slowMotion: number;
  /** 표식 하나 · 전기력선 한 가닥의 전하(μC). */
  chargePerMark: number;
  /** 자기력선 한 가닥의 전류(mA). */
  currentPerLine: number;
  /** 전류 화살표 길이 배율(월드 per mA). */
  currentArrowScale: number;
}

export function readConstants(stage: StageDef): LcOscillationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    inductance: c.inductance ?? INDUCTANCE_MH,
    capacitance: c.capacitance ?? CAPACITANCE_UF,
    initialCharge: c.initialCharge ?? INITIAL_CHARGE_UC,
    slowMotion: c.slowMotion ?? SLOW_MOTION,
    chargePerMark: c.chargePerMark ?? CHARGE_PER_MARK_UC,
    currentPerLine: c.currentPerLine ?? CURRENT_PER_LINE_MA,
    currentArrowScale: c.currentArrowScale ?? CURRENT_ARROW_SCALE,
  };
}

/** 각진동수(rad/s, 실제 시간). */
export function angularFrequency(c: LcOscillationConstants): number {
  return 1 / Math.sqrt(c.inductance * 1e-3 * c.capacitance * 1e-6);
}

/** 가장 센 전류(mA) = Q₀·ω. */
export function peakCurrent(c: LcOscillationConstants): number {
  return c.initialCharge * 1e-6 * angularFrequency(c) * 1e3;
}

/**
 * 지금 위상각(라디안). **단계 경계는 선언이 정한다** — 네 사분 단계의 진행도를 더하면
 * 0~4 가 되고, 그것에 π/2 를 곱한 것이 위상각이다. 분기가 없다: 지나간 단계는 1,
 * 오지 않은 단계는 0 이다 (S-piece 「시간표는 선언이다」).
 */
export function phaseAngle(tl: TimelineFrame): number {
  let quarters = 0;
  for (const id of QUARTER_PHASES) quarters += tl.at(id);
  return (Math.PI / 2) * quarters;
}

export interface CircuitReading {
  /** 위 판의 전하(μC). 아래 판은 그 반대. */
  charge: number;
  /** 전류(mA). 위 판에서 나와 윗도선을 오른쪽으로 흐르면 +. */
  current: number;
  /** 전기 에너지의 몫 0~1 (U_E / E). */
  electricShare: number;
  /** 자기 에너지의 몫 0~1 (U_B / E). 둘을 더하면 언제나 1 이다. */
  magneticShare: number;
}

/** 위상각에서 회로를 읽는다. 위 판이 + 로 가득 찬 채 출발한다. */
export function readCircuit(theta: number, c: LcOscillationConstants): CircuitReading {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    charge: c.initialCharge * cos,
    current: peakCurrent(c) * sin,
    electricShare: cos * cos,
    magneticShare: sin * sin,
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: LcOscillationState }): LcOscillationState {
  return params.state;
}
