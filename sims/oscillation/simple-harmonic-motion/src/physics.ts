// ========================================================================
// simple-harmonic-motion — 순수 물리
// ========================================================================
// 되미는 힘이 변위에 비례한다: F = −k·y. 위 끝(y = A)에서 가만히 놓으면
//   y(τ) = A·cos(ωτ),  ω = √(k/m)
// 이다. τ 는 쓰기 첫 단계가 시작한 뒤 흐른 시간이다. 모든 것이 시각의 함수라
// 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { AMPLITUDE, MASS, STIFFNESS } from './schema';
import type { SimpleHarmonicMotionState } from './state';

export interface SimpleHarmonicMotionConstants {
  /** 추의 질량(kg). */
  mass: number;
  /** 용수철 상수(N/m). */
  stiffness: number;
  /** 진폭(m). 위 끝에서 놓는다. */
  amplitude: number;
}

export function readConstants(stage: StageDef): SimpleHarmonicMotionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    mass: c.mass ?? MASS,
    stiffness: c.stiffness ?? STIFFNESS,
    amplitude: c.amplitude ?? AMPLITUDE,
  };
}

/** 각진동수 ω = √(k/m). */
export function angularFrequency(c: SimpleHarmonicMotionConstants): number {
  return Math.sqrt(c.stiffness / c.mass);
}

/** 한 주기(초) = 2π/ω. */
export function periodOf(c: SimpleHarmonicMotionConstants): number {
  return (2 * Math.PI) / angularFrequency(c);
}

/** τ 초 뒤 추의 변위(m, 평형점 기준 위가 +). */
export function displacementAt(tau: number, c: SimpleHarmonicMotionConstants): number {
  return c.amplitude * Math.cos(angularFrequency(c) * tau);
}

/** 변위 y 에서 추에 걸린 되미는 힘(N). 늘 평형점을 향하고 크기가 변위에 비례한다. */
export function restoringForce(y: number, c: SimpleHarmonicMotionConstants): number {
  return -c.stiffness * y;
}

/**
 * 펜이 적는 구간 — 시작 · 끝 시각(주기 안)과 지금까지 적은 진행도 0~1.
 *
 * **단계 경계는 선언이 정한다.** 쓰기 세 단계의 처음과 끝을 `timeline` 에게 묻는다
 * (S-piece 「시간표는 선언이다」). 펜은 이 구간 동안 기록지를 일정한 빠르기로 가로지른다 —
 * 가로 거리가 곧 시간이라야 곡선이 「시간에 따른 위치」 로 읽힌다.
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
  const to = tl.end('write-3');
  return {
    from,
    to,
    progress: tl.span(from, to),
    writing: tl.u >= from && tl.u < to,
  };
}

/** 쓰기 첫 단계가 시작한 뒤 흐른 시간(초). 추는 바퀴 내내 이 시계로 돈다. */
export function elapsed(tl: TimelineFrame): number {
  return tl.u - tl.start('write-1');
}

/** 이번 바퀴에서 기록이 흐려진 정도의 반대 — 1 이면 또렷, 0 이면 다 지워졌다. */
export function recordOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: SimpleHarmonicMotionState }): SimpleHarmonicMotionState {
  return params.state;
}
