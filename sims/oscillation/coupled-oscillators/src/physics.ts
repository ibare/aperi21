// ========================================================================
// coupled-oscillators — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. `step` 은 항등이다.
//
// 같은 진자 둘(각진동수 ω₀ = √(g/L))을 약한 용수철(k/m = κ)로 잇고, 왼쪽만
// θ₀ 만큼 당겼다 놓는다. 작은 각의 선형 운동은 두 진동수의 합이다.
//
//   ω₁ = ω₀,  ω₂ = √(ω₀² + 2κ),  Δ = ω₂ − ω₁,  ω̄ = (ω₁ + ω₂)/2
//   θ_L(t) = θ₀ · cos(Δt/2) · cos(ω̄t)
//   θ_R(t) = θ₀ · sin(Δt/2) · sin(ω̄t)
//
// 앞 인수가 흔들림의 폭이다. 왼쪽 폭이 cos 로 줄어드는 동안 오른쪽 폭이 sin 으로
// 자란다. 한 번 흔들림 동안의 에너지 몫은 폭의 제곱 — cos² · sin² — 이라 합은 1 이다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { AMPLITUDE, COUPLING, G, PENDULUM_LENGTH, PIVOT_HALF_GAP } from './schema';
import type { CoupledOscillatorsState } from './state';

export interface CoupledOscillatorsConstants {
  g: number;
  length: number;
  coupling: number;
  amplitude: number;
}

export function readConstants(stage: StageDef): CoupledOscillatorsConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    g: c.g ?? G,
    length: c.length ?? PENDULUM_LENGTH,
    coupling: c.coupling ?? COUPLING,
    amplitude: c.amplitude ?? AMPLITUDE,
  };
}

/** 흔들림 폭 호가 거슬러 올라가는 시간 = 한 번 흔들림(초)의 배수. 한 번이면 폭 끝까지 닿는다. */
const SWEEP_SWINGS = 1;
/** 폭 호의 표본 수. */
const SWEEP_SAMPLES = 36;

export interface Pendulum {
  /** 매단 점. */
  pivot: Vec2;
  /** 지금 각(rad, 연직에서 오른쪽이 +). */
  theta: number;
  /** 지난 한 번 흔들림 동안의 각 — 오래된 것부터. 폭 호가 이것을 따라 옅어진다. */
  sweep: number[];
  /** 에너지 몫 0~1. */
  share: number;
}

export interface Reading {
  left: Pendulum;
  right: Pendulum;
  length: number;
  amplitude: number;
}

/** 매단 점 · 각 → 추 자리. */
export function bobAt(pivot: Vec2, theta: number, radius: number): Vec2 {
  return [pivot[0] + radius * Math.sin(theta), pivot[1] - radius * Math.cos(theta)];
}

/**
 * 조각 시계 → 두 진자. 같은 시각은 언제나 같은 값이다.
 *
 * 시간표 단계는 읽지 않는다 — 단계는 캡션을 고를 뿐이고, 운동은 시계의 함수다.
 * 단계 길이(반 맥놀이)는 schema 가 같은 상수에서 계산해 두었다.
 */
export function derive(tl: TimelineFrame, c: CoupledOscillatorsConstants): Reading {
  const w1 = Math.sqrt(c.g / c.length);
  const w2 = Math.sqrt(w1 * w1 + 2 * c.coupling);
  const delta = w2 - w1;
  const wBar = (w1 + w2) / 2;
  const A = c.amplitude;

  const thetaL = (t: number): number => A * Math.cos((delta * t) / 2) * Math.cos(wBar * t);
  const thetaR = (t: number): number => A * Math.sin((delta * t) / 2) * Math.sin(wBar * t);

  const t = tl.t;
  const back = (SWEEP_SWINGS * 2 * Math.PI) / wBar;
  const sweepOf = (f: (t: number) => number): number[] => {
    const out: number[] = [];
    for (let i = 0; i <= SWEEP_SAMPLES; i++) out.push(f(t - back + (back * i) / SWEEP_SAMPLES));
    return out;
  };

  const envL = Math.cos((delta * t) / 2);
  const envR = Math.sin((delta * t) / 2);

  return {
    left: {
      pivot: [-PIVOT_HALF_GAP, 0],
      theta: thetaL(t),
      sweep: sweepOf(thetaL),
      share: envL * envL,
    },
    right: {
      pivot: [PIVOT_HALF_GAP, 0],
      theta: thetaR(t),
      sweep: sweepOf(thetaR),
      share: envR * envR,
    },
    length: c.length,
    amplitude: A,
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: CoupledOscillatorsState }): CoupledOscillatorsState {
  return params.state;
}
