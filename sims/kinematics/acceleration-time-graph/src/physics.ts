// ========================================================================
// acceleration-time-graph — 순수 물리
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { ACCEL, SLAB_TIMING } from './schema';
import type { AccelerationTimeGraphState } from './state';

export interface SlabTiming {
  /** 칸이 그래프에서 막대까지 옮겨지는 시간(초). */
  flight: number;
  /** 축 아래 칸이 막대를 깎는 시간(초). */
  erase: number;
}

export function readTiming(stage: StageDef): SlabTiming {
  const c = stage.constants;
  return { flight: c.flight ?? SLAB_TIMING.flight, erase: c.erase ?? SLAB_TIMING.erase };
}

/** 칸 k 가 얹히기 직전까지 쌓인 속도 변화(m/s). 칸 폭은 1 s. */
export function velocityBefore(k: number): number {
  let v = 0;
  for (let i = 0; i < k; i++) v += ACCEL[i]! * 1;
  return v;
}

/** 넓이를 모두 얹고 깎은 뒤의 속도 변화(m/s). */
export function finalVelocityChange(): number {
  return velocityBefore(ACCEL.length);
}

/**
 * 원본 포매터 그대로 — 부동소수 잡음만 없애고(소수 첫째 자리) 음수 부호를 '−' 로.
 * 표의 값(2 · 1 · 0 · −1.5 · 4.5 · 3)이 모두 이 자릿수라 유효숫자를 줄이지 않는다.
 */
export function formatValue(v: number): string {
  return String(Math.round(v * 10) / 10).replace('-', '−');
}

/** 칸 k 의 시각표 — 채우기 · 비행 · 깎기 구간의 진행도. 모두 시각의 함수다. */
export interface SlabProgress {
  /** 채워지는 정도 [k, k+1]. */
  fill: number;
  /** 비행 진행도 [k+1, k+1+flight] (이징 적용). */
  flight: number;
  /** 깎기 진행도 [착지, 착지+erase] (이징 적용). 양의 칸은 늘 0. */
  erase: number;
  /** 비행이 끝났는가. */
  landed: boolean;
  /** 막대 값이 이 칸을 반영했는가 — 가속도 0 칸은 채우기가 끝나면, 음의 칸은 깎기가 끝나면. */
  settled: boolean;
}

export function slabProgress(tl: TimelineFrame, timing: SlabTiming, k: number): SlabProgress {
  const a = ACCEL[k]!;
  const leave = k + 1;
  const land = leave + timing.flight;
  const fill = tl.span(k, leave);
  const flightRaw = tl.span(leave, land);
  const erase = a < 0 ? tl.span(land, land + timing.erase, 'smooth') : 0;
  const landed = flightRaw >= 1;
  const settled =
    a === 0 ? fill >= 1 : a > 0 ? landed : tl.span(land, land + timing.erase) >= 1;
  return { fill, flight: tl.span(leave, land, 'smooth'), erase, landed, settled };
}

/** 쌓는 상태가 없다 — 모든 움직임이 시각의 함수다. */
export function step(params: { state: AccelerationTimeGraphState }): AccelerationTimeGraphState {
  return params.state;
}
