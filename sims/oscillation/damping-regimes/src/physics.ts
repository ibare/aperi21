// ========================================================================
// damping-regimes — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 세 추의 변위가 모두 놓은 뒤 흐른 시간 τ 의 닫힌 식이고,
// `step` 은 항등이다.
//
//   x'' + 2ζω₀x' + ω₀²x = 0,  x(0) = −A (아래로 당김),  x'(0) = 0
//
//   ζ < 1  x = −A·e^(−ζω₀τ)·(cos ω_d τ + ζω₀/ω_d · sin ω_d τ),  ω_d = ω₀√(1−ζ²)
//   ζ = 1  x = −A·(1 + ω₀τ)·e^(−ω₀τ)
//   ζ > 1  x = −A·(r₂e^(r₁τ) − r₁e^(r₂τ)) / (r₂ − r₁),  r₁,₂ = −ω₀(ζ ∓ √(ζ²−1))
//
// 「멎은 때」 는 |x| 가 당긴 거리의 `settleBand` 몫 안으로 들어와 창 끝까지 다시
// 나가지 않는 첫 시각이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  AMPLITUDE,
  OMEGA,
  SETTLE_BAND,
  WINDOW,
  ZETA_CRITICAL,
  ZETA_OVER,
  ZETA_UNDER,
} from './schema';
import type { DampingRegimesState } from './state';

export interface DampingRegimesConstants {
  omega: number;
  amplitude: number;
  zetaUnder: number;
  zetaOver: number;
  settleBand: number;
  window: number;
}

export function readConstants(stage: StageDef): DampingRegimesConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    omega: c.omega ?? OMEGA,
    amplitude: c.amplitude ?? AMPLITUDE,
    zetaUnder: c.zetaUnder ?? ZETA_UNDER,
    zetaOver: c.zetaOver ?? ZETA_OVER,
    settleBand: c.settleBand ?? SETTLE_BAND,
    window: c.window ?? WINDOW,
  };
}

/** 위에서부터 세 줄의 감쇠비 — 부족 · 임계 · 과도. */
export function zetas(c: DampingRegimesConstants): readonly [number, number, number] {
  return [c.zetaUnder, ZETA_CRITICAL, c.zetaOver];
}

/** 놓은 뒤 τ 초의 변위(m, 위가 +). 아래로 A 만큼 당겼다가 가만히 놓았다. */
export function displacement(zeta: number, tau: number, c: DampingRegimesConstants): number {
  const w = c.omega;
  const a = -c.amplitude;
  if (tau <= 0) return a;
  if (Math.abs(zeta - 1) < 1e-9) {
    return a * (1 + w * tau) * Math.exp(-w * tau);
  }
  if (zeta < 1) {
    const wd = w * Math.sqrt(1 - zeta * zeta);
    return (
      a * Math.exp(-zeta * w * tau) * (Math.cos(wd * tau) + ((zeta * w) / wd) * Math.sin(wd * tau))
    );
  }
  const s = Math.sqrt(zeta * zeta - 1);
  const r1 = -w * (zeta - s);
  const r2 = -w * (zeta + s);
  return (a * (r2 * Math.exp(r1 * tau) - r1 * Math.exp(r2 * tau))) / (r2 - r1);
}

/** 멎음 판정의 걸음(초). 부족 감쇠가 폭 안팎을 드나드는 것을 놓치지 않을 만큼 잘다. */
const SETTLE_SCAN_DT = 0.002;

/**
 * 멎은 때(초). 창 끝에서 거슬러 오르며 폭 밖으로 나간 마지막 시각을 찾는다.
 * 창 끝에서도 폭 밖이면 창 안에서 멎지 않은 것이라 `null`.
 */
export function settleTime(zeta: number, c: DampingRegimesConstants): number | null {
  const band = c.settleBand * c.amplitude;
  if (Math.abs(displacement(zeta, c.window, c)) > band) return null;
  for (let t = c.window; t >= 0; t -= SETTLE_SCAN_DT) {
    if (Math.abs(displacement(zeta, t, c)) > band) return t + SETTLE_SCAN_DT;
  }
  return 0;
}

/**
 * 시간표 → 놓은 뒤 흐른 시간 τ(초)와 물러나는 정도.
 *
 * 단계 경계를 상수로 가르지 않는다 — `early` 첫머리에서 `late` 끝까지를 시간 창
 * 하나로 고르게 편다(`span`). 저작자가 두 단계 길이를 바꾸면 흐르는 빠르기만 바뀐다.
 */
export function clock(tl: TimelineFrame, c: DampingRegimesConstants): { tau: number; opacity: number } {
  const run = tl.span(tl.start('early'), tl.end('late'));
  return { tau: c.window * run, opacity: 1 - tl.at('fade') };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: DampingRegimesState }): DampingRegimesState {
  return params.state;
}
