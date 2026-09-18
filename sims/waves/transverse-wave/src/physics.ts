// ========================================================================
// transverse-wave — 순수 물리
// ========================================================================
// 오른쪽으로 가는 사인파 하나.
//   y(x, t) = A · cos( 2π (x − x_c0)/λ − 2π f t )
// t = 0 에 x_c0 이 마루이고, 그 마루는 x_c(t) = x_c0 + λ f t 로 나아간다.
// 줄 위의 점 x 는 x 를 떠나지 않는다 — 높이만 시각의 함수다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';

import { AMPLITUDE, CREST_START_X, FREQUENCY, WAVELENGTH } from './schema';
import type { TransverseWaveState } from './state';

export interface TransverseWaveConstants {
  /** 파장 λ(m). */
  wavelength: number;
  /** 진폭 A(m). */
  amplitude: number;
  /** 진동수 f(Hz). */
  frequency: number;
}

export function readConstants(stage: StageDef): TransverseWaveConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    wavelength: c.wavelength ?? WAVELENGTH,
    amplitude: c.amplitude ?? AMPLITUDE,
    frequency: c.frequency ?? FREQUENCY,
  };
}

/**
 * 이번 주기에서 물결이 흐른 시간(초) — 주기 안 시각 그대로다. 물결은 단계와 무관하게 흐르고
 * (구슬은 멈추지 않는다), 단계 길이의 합이 주기(1/f)의 정수배라 다음 주기로 넘어가도 이어진다.
 */
export function waveTime(tl: TimelineFrame): number {
  return tl.u;
}

/** 줄 위 x 자리의 높이(m). 이 점은 옆으로 움직이지 않는다. */
export function displacement(x: number, t: number, c: TransverseWaveConstants): number {
  const phase = (2 * Math.PI * (x - CREST_START_X)) / c.wavelength - 2 * Math.PI * c.frequency * t;
  return c.amplitude * Math.cos(phase);
}

/** 따라가는 마루의 x — 한 주기에 한 파장씩, 속력 λf 로 나아간다. */
export function crestX(t: number, c: TransverseWaveConstants): number {
  return CREST_START_X + c.wavelength * c.frequency * t;
}

/** 자취 · 마루 표지의 짙기 0~1. 마지막 단계에서 흐려지고 다음 주기에 처음부터 다시 그린다. */
export function markOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 자리가 시각의 함수다. */
export function step(params: { state: TransverseWaveState }): TransverseWaveState {
  return params.state;
}
