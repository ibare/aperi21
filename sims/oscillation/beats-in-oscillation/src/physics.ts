// ========================================================================
// beats-in-oscillation — 순수 물리
// ========================================================================
// 추 둘이 각자 단진동한다.
//   y₁ = A·sin(2π f₁ t),   y₂ = A·sin(2π (f₁+Δf) t)
// 막대 가운데 점은 두 변위의 평균이고, 삼각함수 합 공식으로
//   (y₁+y₂)/2 = A·cos(π Δf t) · sin(2π (f₁+Δf/2) t)
// 라서 빠르게 흔들리되 그 폭이 |cos(π Δf t)| 로 느리게 부풀었다 잦아든다.
// 부풂 한 번의 길이는 1/Δf — 차이가 작을수록 길다.
//
// 모든 것이 시각의 닫힌 식이다. 기록지의 지나간 자리도 같은 식으로 계산한다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { AMPLITUDE, DF_BOTTOM, DF_TOP, F1, WINDOW } from './schema';
import type { BeatsInOscillationState } from './state';

const TAU = Math.PI * 2;

export interface BeatsInOscillationConstants {
  /** 왼쪽 추의 진동수(Hz). 두 줄이 같다. */
  f1: number;
  /** 위 · 아래 줄의 진동수 차이(Hz). */
  dfTop: number;
  dfBottom: number;
  /** 추 하나의 진폭(월드 m). */
  amplitude: number;
  /** 기록지가 담는 시간(초). */
  window: number;
}

export function readConstants(stage: StageDef): BeatsInOscillationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    f1: c.f1 ?? F1,
    dfTop: c.dfTop ?? DF_TOP,
    dfBottom: c.dfBottom ?? DF_BOTTOM,
    amplitude: c.amplitude ?? AMPLITUDE,
    window: c.window ?? WINDOW,
  };
}

/** 한 쌍의 한 순간. */
export interface PairReading {
  /** 왼쪽 · 오른쪽 추의 변위(m, 위가 +). */
  left: number;
  right: number;
  /** 막대 가운데 점의 변위 = 두 변위의 평균. */
  mid: number;
  /** 가운데 점 흔들림의 폭 A·|cos(π Δf t)| — 기록지의 포락선. */
  envelope: number;
}

/** 진동수 차이가 `df` 인 쌍을 시각 `t` 에서 읽는다. */
export function readPair(t: number, df: number, c: BeatsInOscillationConstants): PairReading {
  const left = c.amplitude * Math.sin(TAU * c.f1 * t);
  const right = c.amplitude * Math.sin(TAU * (c.f1 + df) * t);
  return {
    left,
    right,
    mid: (left + right) / 2,
    envelope: c.amplitude * Math.abs(Math.cos(Math.PI * df * t)),
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: BeatsInOscillationState }): BeatsInOscillationState {
  return params.state;
}
