// ========================================================================
// wave-attenuation — 순수 물리
// ========================================================================
// 오른쪽으로 가는 사인파가 흡수하는 줄 위를 간다. 줄은 한 줄이라 파동이 퍼지지 않는다 —
// 진폭을 줄이는 것은 줄이 에너지를 흡수하는 것 하나뿐이다.
//   A(x)    = A0 · e^(−αx)
//   y(x, t) = A(x) · sin(ω t − k x)
// 같은 거리 d 를 지날 때마다 진폭에 e^(−αd) 가 곱해진다 — 어디서 재도 같은 몫이다.
//
// 따라가는 마루는 위상 ω t − k x = π/2 인 자리다. 파속 λ / T 로 움직이고, 그 높이는 곧 그
// 자리의 A(x) 다. 매 주기 `travel` 의 시작에 x = 0 바로 뒤(−λ, 0]에 있는 마루를 고른다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';

import {
  ABSORPTION,
  AMPLITUDE,
  MARK_COUNT,
  MARK_SPACING,
  PERIOD,
  ROPE_TAIL,
  STEP_RATIO,
  WAVELENGTH,
} from './schema';
import type { WaveAttenuationState } from './state';

export interface WaveAttenuationConstants {
  /** x = 0 의 진폭 A0(m). */
  amplitude: number;
  /** 파장 λ(m). */
  wavelength: number;
  /** 주기 T(s). */
  period: number;
  /** 흡수 계수 α(1/m). */
  absorption: number;
  /** 표시점 사이 거리 d(m). */
  markSpacing: number;
  /** 표시점 하나를 지날 때 남는 몫 — 화면에 띄우는 정박값. */
  stepRatio: number;
  /** 표시점 개수(x = 0 포함). */
  markCount: number;
}

export function readConstants(stage: StageDef): WaveAttenuationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    amplitude: c.amplitude ?? AMPLITUDE,
    wavelength: c.wavelength ?? WAVELENGTH,
    period: c.period ?? PERIOD,
    absorption: c.absorption ?? ABSORPTION,
    markSpacing: c.markSpacing ?? MARK_SPACING,
    stepRatio: c.stepRatio ?? STEP_RATIO,
    markCount: Math.max(1, Math.round(c.markCount ?? MARK_COUNT)),
  };
}

/** 표시점 k 의 x(k = 0 은 손잡이 자리). */
export function markX(k: number, c: WaveAttenuationConstants): number {
  return k * c.markSpacing;
}

/** 줄 오른쪽 끝의 x — 마지막 표시점 너머로 마루가 빠져나갈 자리를 둔다. */
export function ropeEndX(c: WaveAttenuationConstants): number {
  return markX(c.markCount - 1, c) + ROPE_TAIL;
}

/** x 자리의 진폭 A(x) = A0 · e^(−αx) (m). */
export function envelope(x: number, c: WaveAttenuationConstants): number {
  return c.amplitude * Math.exp(-c.absorption * x);
}

/** 줄 위 x 자리의 높이(m). 시각은 조각 시계 `t` 라서 주기가 바뀌어도 물결이 끊기지 않는다. */
export function displacement(x: number, t: number, c: WaveAttenuationConstants): number {
  const omega = (2 * Math.PI) / c.period;
  const k = (2 * Math.PI) / c.wavelength;
  return envelope(x, c) * Math.sin(omega * t - k * x);
}

/** 위상을 파장 단위로 센 값 — 마루(위상 π/2)가 x = 0 에 있을 때 정수다. */
function crestCount(t: number, c: WaveAttenuationConstants): number {
  return t / c.period - 1 / 4;
}

/**
 * 이번 주기에 따라가는 마루의 x(m).
 *
 * **단계 경계는 선언이 정한다** — `travel` 이 시작한 조각 시각을 시간표에게 묻고
 * (`start('travel')`), 그때 x = 0 바로 뒤에 있던 마루를 고른다. 그 뒤의 자리는 파속 ×
 * 흐른 시간이라 단계 길이와 무관하다.
 */
export function crestX(tl: TimelineFrame, c: WaveAttenuationConstants): number {
  const cycleStart = tl.t - tl.u;
  const t0 = cycleStart + tl.start('travel');
  const pick = Math.ceil(crestCount(t0, c));
  return c.wavelength * (crestCount(tl.t, c) - pick);
}

/** 막대가 흐려지는 몫 0~1. 마지막 단계에서 흐려지고 다음 주기에 비어서 다시 선다. */
export function barOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다. */
export function step(params: { state: WaveAttenuationState }): WaveAttenuationState {
  return params.state;
}
