// ========================================================================
// reynolds-number — 순수 물리
// ========================================================================
// Re = ρvD/η. 세 관이 같은 물이라 ρ/η 가 같고, Re 는 굵기 배수 × 빠르기 배수를
// 따라간다. 흔들림의 성장률은 Re 하나로 정한다 — 이웃 `laminar-vs-turbulent` 와 같은
//   σ(Re) = k · (Re / Re_c − 1)
// 모형이다. 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  BASE_SPEED,
  GROWTH_K,
  PIPE_SCALES,
  RE_CRITICAL,
  RE_HIGH,
  RE_LOW,
  SEED_SPACING,
} from './schema';
import type { ReynoldsNumberState } from './state';

export type PipeId = 'top' | 'mid' | 'bottom';
export const PIPE_IDS: readonly PipeId[] = ['top', 'mid', 'bottom'];

export interface PipeScale {
  /** 굵기 배수(위 관 = 1). */
  d: number;
  /** 빠르기 배수(위 관 = 1). */
  v: number;
}

export interface ReynoldsConstants {
  reLow: number;
  reHigh: number;
  reCritical: number;
  growthK: number;
  pipes: Record<PipeId, PipeScale>;
  /** 위 관이 `reLow` 일 때의 화면 유속(월드/초). */
  baseSpeed: number;
  /** 흔들림을 넣는 간격(흐름 방향 월드 거리). */
  seedSpacing: number;
}

export function readConstants(stage: StageDef): ReynoldsConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    reLow: c.reLow ?? RE_LOW,
    reHigh: c.reHigh ?? RE_HIGH,
    reCritical: c.reCritical ?? RE_CRITICAL,
    growthK: c.growthK ?? GROWTH_K,
    pipes: {
      top: { d: c.dTop ?? PIPE_SCALES.top.d, v: c.vTop ?? PIPE_SCALES.top.v },
      mid: { d: c.dMid ?? PIPE_SCALES.mid.d, v: c.vMid ?? PIPE_SCALES.mid.v },
      bottom: { d: c.dBottom ?? PIPE_SCALES.bottom.d, v: c.vBottom ?? PIPE_SCALES.bottom.v },
    },
    baseSpeed: c.baseSpeed ?? BASE_SPEED,
    seedSpacing: c.seedSpacing ?? SEED_SPACING,
  };
}

/**
 * 지금 흐름의 세기 — 위 관 Re 가 `reLow` 에서 `reHigh` 까지 어디쯤인가(0~1).
 * **단계 경계는 선언이 정한다** — 빨라짐 · 느려짐의 진행도를 시간표에게 묻는다.
 * 느림 단계에서는 둘 다 0, 빠름 단계에서는 `rise` 1 · `fall` 0 이다.
 */
export function ramp(tl: TimelineFrame): number {
  return tl.at('rise') - tl.at('fall');
}

/** 위 관의 지금 Re. 셋 모두 이 비율로 빨라진다. */
export function referenceRe(tl: TimelineFrame, c: ReynoldsConstants): number {
  return c.reLow + (c.reHigh - c.reLow) * ramp(tl);
}

/** 관 하나의 Re — 위 관 Re × 굵기 배수 × 빠르기 배수. */
export function pipeRe(ref: number, s: PipeScale): number {
  return ref * s.d * s.v;
}

/** 관 하나의 화면 유속(월드/초). 빠르기 배수와 지금 흐름의 세기를 따른다. */
export function pipeSpeed(ref: number, s: PipeScale, c: ReynoldsConstants): number {
  return c.baseSpeed * s.v * (ref / c.reLow);
}

/**
 * 교란 성장률 σ.
 *   Re < Re_c → 음수 (점성이 지운다)
 *   Re > Re_c → 양수 (스스로 커진다)
 */
export function growthRate(re: number, c: ReynoldsConstants): number {
  return c.growthK * (re / c.reCritical - 1);
}

/**
 * 정박값에 머무는 동안 관 옆 칩이 보일 Re. 빨라지고 느려지는 동안은 없다(null) —
 * 지나가는 값을 반올림해 띄우면 표에 없는 수를 화면이 말한다 (S-piece 유효숫자).
 * 선언값(정박 Re × 배수)을 그대로 문자열로 쓴다.
 */
export function heldRe(tl: TimelineFrame, s: PipeScale, c: ReynoldsConstants): string | null {
  if (tl.phase === 'low') return String(pipeRe(c.reLow, s));
  if (tl.phase === 'high') return String(pipeRe(c.reHigh, s));
  return null;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. 흔들림의 누적은 `filament` 어휘가 한다. */
export function step(params: { state: ReynoldsNumberState }): ReynoldsNumberState {
  return params.state;
}
