// ========================================================================
// wave-basics — 순수 물리
// ========================================================================
// 오른쪽으로 가는 사인파 하나.
//   y(x, τ) = A · cos( 2π (x − x_P)/λ − 2π τ/T )
// τ = 0 에 P(x_P)와 그 한 파장 뒤(x_P − λ)가 둘 다 마루다. 뒤의 마루는
//   x_c(τ) = x_P − λ + λ · τ/T
// 로 나아가 τ = T 에 P 에 닿고, 그때 P 의 높이 A · cos(2π τ/T) 는 한 바퀴를 마친다.
// 한 주기에 한 파장 — 속력은 λ/T 이고 이 식 밖의 값은 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';

import { AMPLITUDE, PERIOD, POINT_X, WAVELENGTH } from './schema';
import type { WaveBasicsState } from './state';

export interface WaveBasicsConstants {
  /** 파장 λ(m) — 조작기의 출발값. */
  wavelength: number;
  /** 진폭 A(m) — 조작기의 출발값. */
  amplitude: number;
  /** 주기 T(s). */
  period: number;
}

export function readConstants(stage: StageDef): WaveBasicsConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    wavelength: c.wavelength ?? WAVELENGTH,
    amplitude: c.amplitude ?? AMPLITUDE,
    period: c.period ?? PERIOD,
  };
}

/**
 * 이번 주기에서 파동이 흐른 시간 τ(0 ~ T).
 *
 * **단계 경계는 선언이 정한다** — `travel` 의 진행도로 읽어, 한 번 오르내리는 동안이 곧 그
 * 단계 한 벌이다. `hold` · `fade` 동안은 `at('travel') = 1` 이라 τ = T 에 멈춰 있고, 그 모양은
 * τ = 0 과 같아 다음 주기로 이어질 때 줄이 튀지 않는다.
 */
export function waveTime(tl: TimelineFrame, period: number): number {
  return period * tl.at('travel');
}

/** 줄 위 x 자리의 높이(m). */
export function displacement(x: number, tau: number, s: WaveBasicsState, period: number): number {
  const phase = (2 * Math.PI * (x - POINT_X)) / s.wavelength - (2 * Math.PI * tau) / period;
  return s.amplitude * Math.cos(phase);
}

/** 따라가는 마루의 x — P 에서 한 파장 뒤에서 출발해 한 주기에 한 파장을 간다. */
export function trackedCrestX(tau: number, s: WaveBasicsState, period: number): number {
  return POINT_X - s.wavelength + (s.wavelength * tau) / period;
}

/** 막대 · 자취 · 마루 표지의 짙기 0~1. 마지막 단계에서 흐려지고 다음 주기에 다시 자란다. */
export function markOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 조작값을 그대로 둔다. */
export function step(params: { state: WaveBasicsState }): WaveBasicsState {
  return params.state;
}
