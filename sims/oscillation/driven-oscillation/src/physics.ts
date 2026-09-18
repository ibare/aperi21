// ========================================================================
// driven-oscillation — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. `step` 은 항등이다.
//
// 손이 용수철 위 끝을 h(t) = H·cos ωt 로 흔든다. 추의 운동은
//
//   m·y'' + c·y' + k·y = k·h(t)
//
// 이고, 흔들기 시작한 뒤 한참 지나 남는 정상 상태 해는
//
//   y(t) = A·cos(ωt − φ)
//   A = H·ω₀² / √((ω₀² − ω²)² + (2ζω₀ω)²)
//   φ = atan2(2ζω₀ω, ω₀² − ω²)
//
// 이다. **각진동수가 ω(손의 것)이지 ω₀(용수철의 것)가 아니다** — 이 조각의 앞 절반.
// φ 는 ω ≪ ω₀ 에서 0 에 가깝고(같이 움직인다), ω ≫ ω₀ 에서 π 에 가깝다(반대로
// 움직인다) — 뒤 절반.
//
// 과도 응답(흔들기 시작할 때 섞이는 고유 진동)은 두지 않는다. 독자가 도착한 순간
// 이미 오래 흔들어 온 그림이다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import {
  DAMPING_RATIO,
  FAST_FREQ,
  HAND_AMPLITUDE,
  NATURAL_FREQ,
  PAPER_SPEED,
  SLOW_FREQ,
} from './schema';
import type { DrivenOscillationState } from './state';

export interface DrivenOscillationConstants {
  naturalFreq: number;
  slowFreq: number;
  fastFreq: number;
  handAmplitude: number;
  dampingRatio: number;
  paperSpeed: number;
}

export function readConstants(stage: StageDef): DrivenOscillationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    naturalFreq: c.naturalFreq ?? NATURAL_FREQ,
    slowFreq: c.slowFreq ?? SLOW_FREQ,
    fastFreq: c.fastFreq ?? FAST_FREQ,
    handAmplitude: c.handAmplitude ?? HAND_AMPLITUDE,
    dampingRatio: c.dampingRatio ?? DAMPING_RATIO,
    paperSpeed: c.paperSpeed ?? PAPER_SPEED,
  };
}

/** 한 구동 진동수에 대한 정상 상태 응답. */
export interface Response {
  /** 손의 각진동수(rad/s). 추도 이 각진동수로 흔들린다. */
  omega: number;
  /** 손의 진폭. */
  handAmp: number;
  /** 추의 진폭. */
  massAmp: number;
  /** 추가 손보다 늦는 위상(rad). 0 ~ π. */
  lag: number;
}

export function response(driveFreq: number, c: DrivenOscillationConstants): Response {
  const w = 2 * Math.PI * driveFreq;
  const w0 = 2 * Math.PI * c.naturalFreq;
  const re = w0 * w0 - w * w;
  const im = 2 * c.dampingRatio * w0 * w;
  return {
    omega: w,
    handAmp: c.handAmplitude,
    massAmp: (c.handAmplitude * w0 * w0) / Math.hypot(re, im),
    lag: Math.atan2(im, re),
  };
}

/** 시각 t 의 손 변위(쉬는 자리 기준, 위가 +). */
export function handAt(r: Response, t: number): number {
  return r.handAmp * Math.cos(r.omega * t);
}

/** 시각 t 의 추 변위(쉬는 자리 기준, 위가 +). */
export function massAt(r: Response, t: number): number {
  return r.massAmp * Math.cos(r.omega * t - r.lag);
}

/**
 * 구간 [from, to] 안에서 손이 꼭대기에 오는 시각들. 손 변위가 H·cos ωt 이므로
 * ωt = 2πk 인 시각이다.
 */
export function handCrests(r: Response, from: number, to: number): number[] {
  const period = (2 * Math.PI) / r.omega;
  const out: number[] = [];
  for (let k = Math.ceil(from / period); k * period <= to; k++) out.push(k * period);
  return out;
}

/** 쌓는 상태가 없다. */
export function step(params: { state: DrivenOscillationState }): DrivenOscillationState {
  return params.state;
}
