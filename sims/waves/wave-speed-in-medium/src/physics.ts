// ========================================================================
// wave-speed-in-medium — 순수 물리
// ========================================================================
// 팽팽한 줄의 파속 v = √(T/μ). 세 줄에 같은 모양의 가우스 펄스를 같은 순간 보내면
//   y(x, τ) = A · exp( −((x − x₀ − v τ)/σ)² )
// 로 모양을 지키며 나아간다. 줄마다 다른 것은 v 하나다. 오른쪽 끝의 반사는 다루지 않는다 —
// 가장 빠른 펄스가 끝에 닿기 전에 경주가 멈춘다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';

import {
  DENSITY_FACTOR,
  LINEAR_DENSITY,
  PULSE_AMPLITUDE,
  PULSE_START,
  PULSE_WIDTH,
  STRING_LENGTH,
  TENSION,
  TENSION_FACTOR,
} from './schema';
import type { WaveSpeedInMediumState } from './state';

export interface WaveSpeedInMediumConstants {
  /** 기준 장력 T(N). */
  tension: number;
  /** 기준 선밀도 μ(kg/m). */
  linearDensity: number;
  /** 위 줄의 장력 배수. */
  tensionFactor: number;
  /** 아래 줄의 선밀도 배수. */
  densityFactor: number;
  /** 줄 길이(m). */
  length: number;
  /** 펄스 출발 자리(m). */
  pulseStart: number;
  /** 펄스 높이(m). */
  amplitude: number;
  /** 펄스 반폭 σ(m). */
  pulseWidth: number;
}

export function readConstants(stage: StageDef): WaveSpeedInMediumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    tension: c.tension ?? TENSION,
    linearDensity: c.linearDensity ?? LINEAR_DENSITY,
    tensionFactor: c.tensionFactor ?? TENSION_FACTOR,
    densityFactor: c.densityFactor ?? DENSITY_FACTOR,
    length: c.length ?? STRING_LENGTH,
    pulseStart: c.pulseStart ?? PULSE_START,
    amplitude: c.amplitude ?? PULSE_AMPLITUDE,
    pulseWidth: c.pulseWidth ?? PULSE_WIDTH,
  };
}

/** 줄 하나 — 장력과 선밀도. */
export interface StringMedium {
  id: 'taut' | 'base' | 'heavy';
  tension: number;
  linearDensity: number;
}

/** 세 줄 — 위(장력만 배수) · 가운데(기준) · 아래(선밀도만 배수). */
export function strings(c: WaveSpeedInMediumConstants): readonly StringMedium[] {
  return [
    { id: 'taut', tension: c.tension * c.tensionFactor, linearDensity: c.linearDensity },
    { id: 'base', tension: c.tension, linearDensity: c.linearDensity },
    { id: 'heavy', tension: c.tension, linearDensity: c.linearDensity * c.densityFactor },
  ];
}

/** 팽팽한 줄의 파속 √(T/μ)(m/s). */
export function waveSpeed(s: StringMedium): number {
  return Math.sqrt(s.tension / s.linearDensity);
}

/**
 * 경주가 시작한 뒤 흐른 물리 시간(초). 단계의 **선언된 길이 × 진행도** 라서 `hold` · `fade` 동안은
 * 경주 끝 시각에 붙잡힌다. 단계 길이를 모듈 상수로 읽지 않는다 (S-piece).
 */
export function raceTime(tl: TimelineFrame): number {
  return tl.duration('race') * tl.at('race');
}

/** 경주가 끝나는 물리 시각 — 눈금 간격을 정한다. */
export function raceEnd(tl: TimelineFrame): number {
  return tl.duration('race');
}

/** 펄스 가운데의 자리(벽에서 m). */
export function pulseCenter(s: StringMedium, tau: number, c: WaveSpeedInMediumConstants): number {
  return c.pulseStart + waveSpeed(s) * tau;
}

/** 줄 위 x 자리의 높이(m). 펄스 모양은 세 줄이 같다. */
export function displacement(x: number, center: number, c: WaveSpeedInMediumConstants): number {
  const d = (x - center) / c.pulseWidth;
  return c.amplitude * Math.exp(-d * d);
}

/** 펄스 · 막대의 짙기 0~1. 마지막 단계에서 흐려지고 다음 주기에 처음부터 다시 달린다. */
export function markOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 자리가 시각의 함수다. */
export function step(params: { state: WaveSpeedInMediumState }): WaveSpeedInMediumState {
  return params.state;
}
