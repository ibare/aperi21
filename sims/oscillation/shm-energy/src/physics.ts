// ========================================================================
// shm-energy — 순수 물리
// ========================================================================
// 단진동 하나뿐이다. 위상각 θ 에서
//   x = A·cos θ,  v = −A·ω·sin θ   (ω = √(k/m))
//   KE = ½mv² = E·sin²θ,  PE = ½kx² = E·cos²θ,  E = ½kA²
// 이라서 두 몫의 합은 언제나 E 이고, sin²θ 는 한 주기(θ 가 2π 도는 동안)에 두 번 차오른다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { AMPLITUDE, MASS, QUARTER_PHASES, STIFFNESS } from './schema';
import type { ShmEnergyState } from './state';

export interface ShmEnergyConstants {
  /** 상자 질량(kg). */
  mass: number;
  /** 용수철 상수(N/m). */
  stiffness: number;
  /** 진폭(m). */
  amplitude: number;
}

export function readConstants(stage: StageDef): ShmEnergyConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    mass: c.mass ?? MASS,
    stiffness: c.stiffness ?? STIFFNESS,
    amplitude: c.amplitude ?? AMPLITUDE,
  };
}

export interface OscillatorReading {
  /** 상자 중심의 변위(m). 평형점이 0, 오른쪽이 +. */
  x: number;
  /** 속도(m/s). 오른쪽이 +. */
  v: number;
  /** 운동 에너지의 몫 0~1 (KE / E). */
  kineticShare: number;
  /** 탄성 퍼텐셜의 몫 0~1 (PE / E). 둘을 더하면 언제나 1 이다. */
  potentialShare: number;
}

/**
 * 지금 위상각(라디안). **단계 경계는 선언이 정한다** — 네 사분 단계의 진행도를 더하면
 * 0~4 가 되고, 그것에 π/2 를 곱한 것이 위상각이다. 분기가 없다: 지나간 단계는 1,
 * 오지 않은 단계는 0 이다 (S-piece 「시간표는 선언이다」). 저작자가 단계 길이를 바꾸면
 * 그 사분 주기가 그만큼 느려지거나 빨라질 뿐 끝 · 가운데를 지나는 순간은 단계 경계에 남는다.
 */
export function phaseAngle(tl: TimelineFrame): number {
  let quarters = 0;
  for (const id of QUARTER_PHASES) quarters += tl.at(id);
  return (Math.PI / 2) * quarters;
}

/** 위상각에서 상자와 두 에너지 몫을 읽는다. 상자는 오른쪽 끝(+A)에서 놓여 출발한다. */
export function readOscillator(theta: number, c: ShmEnergyConstants): OscillatorReading {
  const omega = Math.sqrt(c.stiffness / c.mass);
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    x: c.amplitude * cos,
    v: -c.amplitude * omega * sin,
    kineticShare: sin * sin,
    potentialShare: cos * cos,
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ShmEnergyState }): ShmEnergyState {
  return params.state;
}
