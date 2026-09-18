// ========================================================================
// wave-energy — 순수 물리
// ========================================================================
// 오른쪽으로 가는 사인파. 두 줄은 진폭만 다르다.
//   y(x, t)   = a · sin(ω t − k x)
//   v_y(x, t) = a ω · cos(ω t − k x)
// 오른쪽 끝의 고리는 반사 없이 파동을 받아 삼킨다(끝이 줄의 임피던스 Z 와 맞는다).
// 그때 고리가 받는 일률은 P = Z · v_y² 이고, 같은 줄 · 같은 진동수에서 v_y 는 진폭에
// 비례하므로 P 는 진폭의 제곱을 따라간다.
//
// 막대에 쌓인 양은 `fill` 단계 시작부터 P 를 적분한 것이다. 한 칸은 **위 줄이 `fill`
// 동안 받은 양**으로 잡는다 — 그래서 위 막대는 단계 끝에 꼭 한 칸, 아래 막대는 매 순간
// 그 (배수)² 배다. Z · ω² 는 두 줄에 같아 비에서 사라진다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';

import { AMPLITUDE, AMPLITUDE_RATIO, PERIOD, ROPE_LENGTH, ROPE_START, WAVELENGTH } from './schema';
import type { WaveEnergyState } from './state';

export interface WaveEnergyConstants {
  /** 위 줄의 진폭 A(m). */
  amplitude: number;
  /** 아래 줄의 진폭 배수. */
  amplitudeRatio: number;
  /** 파장 λ(m). */
  wavelength: number;
  /** 주기 T(s). */
  period: number;
  /** 손잡이에서 받는 고리까지의 줄 길이(m). */
  ropeLength: number;
}

export function readConstants(stage: StageDef): WaveEnergyConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    amplitude: c.amplitude ?? AMPLITUDE,
    amplitudeRatio: c.amplitudeRatio ?? AMPLITUDE_RATIO,
    wavelength: c.wavelength ?? WAVELENGTH,
    period: c.period ?? PERIOD,
    ropeLength: c.ropeLength ?? ROPE_LENGTH,
  };
}

/** 받는 고리의 x — 손잡이 자리에서 줄 길이만큼. */
export function ropeEndX(c: WaveEnergyConstants): number {
  return ROPE_START + c.ropeLength;
}

/** 줄 위 x 자리의 높이(m). 시각은 조각 시계 `t` 라서 주기가 바뀌어도 물결이 끊기지 않는다. */
export function displacement(x: number, t: number, a: number, c: WaveEnergyConstants): number {
  return a * Math.sin(phase(x, t, c));
}

/** 줄 위 x 자리의 세로 속도(m/s). */
export function velocity(x: number, t: number, a: number, c: WaveEnergyConstants): number {
  const omega = (2 * Math.PI) / c.period;
  return a * omega * Math.cos(phase(x, t, c));
}

function phase(x: number, t: number, c: WaveEnergyConstants): number {
  return (2 * Math.PI * t) / c.period - (2 * Math.PI * x) / c.wavelength;
}

/**
 * ∫ cos²(ω τ − k x_끝) dτ, τ ∈ [from, to]. 고리가 받은 일에서 두 줄에 같은 Z · a² · ω² 를
 * 뺀 몫이다.
 */
function endWorkShape(from: number, to: number, c: WaveEnergyConstants): number {
  const omega = (2 * Math.PI) / c.period;
  const kx = (2 * Math.PI * ropeEndX(c)) / c.wavelength;
  const s = (tau: number) => Math.sin(2 * (omega * tau - kx));
  return (to - from) / 2 + (s(to) - s(from)) / (4 * omega);
}

/**
 * 진폭 `a` 인 줄의 끝 막대에 쌓인 양(칸). 한 칸 = 진폭 A 인 위 줄이 `fill` 동안 받은 양.
 *
 * **단계 경계는 선언이 정한다** — `fill` 이 시작한 조각 시각과 길이를 시간표에게 묻는다.
 * `watch` 동안은 0, `hold` · `fade` 동안은 다 찬 값에 멈춘다.
 */
export function storedCells(tl: TimelineFrame, a: number, c: WaveEnergyConstants): number {
  const cycleStart = tl.t - tl.u;
  const from = cycleStart + tl.start('fill');
  const to = from + tl.duration('fill');
  const now = Math.min(Math.max(tl.t, from), to);
  const full = endWorkShape(from, to, c);
  if (full <= 0) return 0;
  const ratio = a / c.amplitude;
  return (ratio * ratio * endWorkShape(from, now, c)) / full;
}

/** 막대의 짙기 0~1. 마지막 단계에서 흐려지고 다음 주기에 비어서 다시 찬다. */
export function barOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다. */
export function step(params: { state: WaveEnergyState }): WaveEnergyState {
  return params.state;
}
