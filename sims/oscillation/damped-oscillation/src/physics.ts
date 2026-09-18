// ========================================================================
// damped-oscillation — 순수 물리
// ========================================================================
// 되미는 힘 −k·y 에 속도에 비례하는 저항 −b·v 가 더해진다. 약한 감쇠(γ < ω₀)에서
// 위 끝(y = A)에서 가만히 놓으면
//   y(τ) = A·e^(−γτ)·(cos ω_d τ + (γ/ω_d)·sin ω_d τ),
//   γ = b/2m,  ω₀ = √(k/m),  ω_d = √(ω₀² − γ²)
// 이다. 속도가 v = −A·(ω₀²/ω_d)·e^(−γτ)·sin ω_d τ 라 **꼭대기 · 바닥은 정확히 반 주기마다**
// 오고, 그 높이가 ±A·e^(−γτ) 다 — 이웃한 두 마루의 비는 언제나 e^(−γT) 로 같다.
// τ 는 쓰기 첫 단계가 시작한 뒤 흐른 시간이다. 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { AMPLITUDE, DAMPING, MASS, STIFFNESS } from './schema';
import type { DampedOscillationState } from './state';

export interface DampedOscillationConstants {
  /** 추의 질량(kg). */
  mass: number;
  /** 용수철 상수(N/m). */
  stiffness: number;
  /** 감쇠 계수 b(kg/s). */
  damping: number;
  /** 진폭(m). 위 끝에서 가만히 놓는다. */
  amplitude: number;
}

export function readConstants(stage: StageDef): DampedOscillationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    mass: c.mass ?? MASS,
    stiffness: c.stiffness ?? STIFFNESS,
    damping: c.damping ?? DAMPING,
    amplitude: c.amplitude ?? AMPLITUDE,
  };
}

/** 감쇠율 γ = b/2m (1/s). 포락선이 e^(−γτ) 로 준다. */
export function decayRate(c: DampedOscillationConstants): number {
  return c.damping / (2 * c.mass);
}

/**
 * 감쇠 진동의 각진동수 ω_d = √(ω₀² − γ²). 이 조각은 약한 감쇠에 머문다 — γ ≥ ω₀ 면
 * 진동하지 않는 영역(damping-regimes 의 주장)이라 여기서는 다루지 않고 던진다.
 */
export function dampedAngularFrequency(c: DampedOscillationConstants): number {
  const w0sq = c.stiffness / c.mass;
  const g = decayRate(c);
  if (g * g >= w0sq) throw new Error('damped-oscillation: 감쇠가 약해야 한다 (b < 2√(mk))');
  return Math.sqrt(w0sq - g * g);
}

/** 한 주기(초) = 2π/ω_d. 마루 사이 간격이다. */
export function periodOf(c: DampedOscillationConstants): number {
  return (2 * Math.PI) / dampedAngularFrequency(c);
}

/** τ 초 뒤 추의 변위(m, 평형점 기준 위가 +). τ = 0 에 y = A, 속도 0. */
export function displacementAt(tau: number, c: DampedOscillationConstants): number {
  const g = decayRate(c);
  const wd = dampedAngularFrequency(c);
  return c.amplitude * Math.exp(-g * tau) * (Math.cos(wd * tau) + (g / wd) * Math.sin(wd * tau));
}

/** τ 초 뒤의 포락선 높이 A·e^(−γτ). 마루(τ = nT)에서 곡선이 정확히 여기에 닿는다. */
export function envelopeAt(tau: number, c: DampedOscillationConstants): number {
  return c.amplitude * Math.exp(-decayRate(c) * tau);
}

/** 이웃한 두 마루의 비 = e^(−γT). 몇 번째 마루든 같다 — 이 조각의 주장이다. */
export function crestRatio(c: DampedOscillationConstants): number {
  return Math.exp(-decayRate(c) * periodOf(c));
}

/**
 * 펜이 적는 구간 — 시작 · 끝 시각(주기 안)과 지금까지 적은 진행도 0~1.
 *
 * **단계 경계는 선언이 정한다.** 쓰기 다섯 단계의 처음과 끝을 `timeline` 에게 묻는다
 * (S-piece 「시간표는 선언이다」). 펜은 이 구간 동안 기록지를 일정한 빠르기로 가로지른다 —
 * 가로 거리가 곧 시간이라야 「마루 사이 간격이 같다」 가 곧 「주기가 같다」 로 읽힌다.
 */
export interface PenWindow {
  from: number;
  to: number;
  progress: number;
  /** 지금 적는 중인가 — 펜 점과 이음선을 그릴 조건이다. */
  writing: boolean;
}

export function readPen(tl: TimelineFrame): PenWindow {
  const from = tl.start('write-1');
  const to = tl.end('write-5');
  return {
    from,
    to,
    progress: tl.span(from, to),
    writing: tl.u >= from && tl.u < to,
  };
}

/** 쓰기 첫 단계가 시작한 뒤 흐른 시간(초). */
export function elapsed(tl: TimelineFrame): number {
  return tl.u - tl.start('write-1');
}

/** 이번 바퀴에서 기록이 흐려진 정도의 반대 — 1 이면 또렷, 0 이면 다 지워졌다. */
export function recordOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('reset');
}

/** 포락선이 그려진 정도 0~1. */
export function envelopeProgress(tl: TimelineFrame): number {
  return tl.at('envelope');
}

/**
 * 지금 추의 변위. 바퀴 내내 잦아드는 운동을 따르다가, 다시 당기는 단계 동안 그 자리에서
 * 처음 자리(A)로 매끄럽게 옮겨진다 — 바퀴가 넘어가는 순간 추가 A 에 가만히 있어
 * 튀지 않는다.
 */
export function massDisplacement(tl: TimelineFrame, c: DampedOscillationConstants): number {
  const free = displacementAt(elapsed(tl), c);
  const lift = tl.at('reset');
  return free + (c.amplitude - free) * lift;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: DampedOscillationState }): DampedOscillationState {
  return params.state;
}
