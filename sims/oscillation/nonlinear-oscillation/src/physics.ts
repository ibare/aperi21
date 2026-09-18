// ========================================================================
// nonlinear-oscillation — 순수 물리
// ========================================================================
// 되미는 힘이 F = −k·x·(1 + (x/L)⁴) 인 용수철에 질량 m 인 추를 매달고, 진폭 A 에서 가만히
// 놓는다. 닫힌 꼴의 해가 없어서 **사분 주기**(꼭대기 → 평형점)만 RK4 로 적분해 표본으로
// 두고, 나머지 세 사분은 대칭으로 되짚는다 — 힘이 x 에 대해 홀함수라 운동이 위아래 ·
// 앞뒤로 대칭이다. 한 번 적분하면 어떤 시각의 변위든 표본 보간으로 곧바로 나오므로,
// 모든 것이 시각의 함수이고 쌓는 상태가 없다.
//
// 비교 기준(점선)은 같은 k 로 비례하는 용수철 — y = A·cos(ω₀τ), ω₀ = √(k/m).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { AMPLITUDE_LARGE, AMPLITUDE_SMALL, MASS, STIFFEN_LENGTH, STIFFNESS } from './schema';
import type { NonlinearOscillationState } from './state';

export interface NonlinearOscillationConstants {
  /** 추의 질량(kg). */
  mass: number;
  /** 작은 변위에서의 용수철 상수(N/m). */
  stiffness: number;
  /** 단단해지기 시작하는 길이 L(m). */
  stiffenLength: number;
  /** 위 · 아래 추의 진폭(m). */
  amplitudeSmall: number;
  amplitudeLarge: number;
}

export function readConstants(stage: StageDef): NonlinearOscillationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    mass: c.mass ?? MASS,
    stiffness: c.stiffness ?? STIFFNESS,
    stiffenLength: c.stiffenLength ?? STIFFEN_LENGTH,
    amplitudeSmall: c.amplitudeSmall ?? AMPLITUDE_SMALL,
    amplitudeLarge: c.amplitudeLarge ?? AMPLITUDE_LARGE,
  };
}

/** 비례하는 용수철의 각진동수 ω₀ = √(k/m). */
export function linearAngularFrequency(c: NonlinearOscillationConstants): number {
  return Math.sqrt(c.stiffness / c.mass);
}

/** 변위 x(m)에서 이 용수철이 되미는 힘(N). 늘 평형점을 향한다. */
export function restoringForce(x: number, c: NonlinearOscillationConstants): number {
  const r = x / c.stiffenLength;
  return -c.stiffness * x * (1 + r * r * r * r);
}

/** 같은 변위에서 **비례하는** 용수철이 되미는 힘(N) = −k·x. 비교 화살표가 이것이다. */
export function proportionalForce(x: number, c: NonlinearOscillationConstants): number {
  return -c.stiffness * x;
}

/** 비례하는 용수철이 τ 초 뒤 있을 자리(m). 점선이 이것이다. */
export function linearDisplacementAt(tau: number, amplitude: number, c: NonlinearOscillationConstants): number {
  return amplitude * Math.cos(linearAngularFrequency(c) * tau);
}

/**
 * 한 진폭의 운동. 꼭대기에서 평형점까지(사분 주기) 고른 시간 간격의 표본이다.
 * `quarter` 가 사분 주기(초), `samples[i]` 는 i·dt 초 뒤의 변위다.
 */
export interface Orbit {
  amplitude: number;
  quarter: number;
  period: number;
  dt: number;
  samples: readonly number[];
}

/** 사분 주기 적분 걸음 수의 기준 — 비례 용수철 사분 주기를 이만큼으로 나눈 간격으로 걷는다. */
const STEPS_PER_LINEAR_QUARTER = 600;
/** 적분이 끝나지 않을 때의 안전 상한(걸음). 진폭이 0 이거나 선언이 잘못돼도 멈춘다. */
const MAX_STEPS = 20000;

/**
 * 진폭 A 에서 놓은 추의 사분 주기를 RK4 로 적분한다. 순수 함수 — 같은 입력이면 같은 표본이다.
 * 평형점을 지나는 순간은 마지막 두 표본 사이를 선형으로 잘라 사분 주기를 얻는다.
 */
export function solveOrbit(amplitude: number, c: NonlinearOscillationConstants): Orbit {
  const w0 = linearAngularFrequency(c);
  const dt = Math.PI / 2 / w0 / STEPS_PER_LINEAR_QUARTER;
  const acc = (x: number): number => restoringForce(x, c) / c.mass;
  const samples: number[] = [amplitude];
  let x = amplitude;
  let v = 0;
  let quarter = Math.PI / 2 / w0;
  for (let i = 0; i < MAX_STEPS && amplitude > 0; i++) {
    const k1x = v;
    const k1v = acc(x);
    const k2x = v + (dt / 2) * k1v;
    const k2v = acc(x + (dt / 2) * k1x);
    const k3x = v + (dt / 2) * k2v;
    const k3v = acc(x + (dt / 2) * k2x);
    const k4x = v + dt * k3v;
    const k4v = acc(x + dt * k3x);
    const nx = x + (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    const nv = v + (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
    if (nx <= 0) {
      // 평형점을 지났다. x → nx 사이에서 0 이 되는 자리를 잘라 사분 주기로 삼는다.
      quarter = (i + x / (x - nx)) * dt;
      samples.push(0);
      break;
    }
    samples.push(nx);
    x = nx;
    v = nv;
  }
  return { amplitude, quarter, period: 4 * quarter, dt, samples };
}

/** 사분 주기 안 s 초(0 ≤ s ≤ quarter)의 변위. 표본 사이는 선형 보간. */
function quarterAt(o: Orbit, s: number): number {
  const f = Math.max(0, Math.min(s, o.quarter)) / o.dt;
  const i = Math.floor(f);
  const last = o.samples.length - 1;
  if (i >= last) return o.samples[last] ?? 0;
  const a = o.samples[i] ?? 0;
  const b = o.samples[i + 1] ?? 0;
  // 마지막 칸은 평형점에서 잘린 칸이라 길이가 dt 보다 짧다.
  const cellEnd = Math.min((i + 1) * o.dt, o.quarter);
  const w = cellEnd > i * o.dt ? (s - i * o.dt) / (cellEnd - i * o.dt) : 0;
  return a + (b - a) * Math.max(0, Math.min(1, w));
}

/** 놓은 뒤 τ 초의 변위(m, 평형점 기준 위가 +). 네 사분을 대칭으로 되짚는다. */
export function displacementAt(o: Orbit, tau: number): number {
  if (o.period <= 0) return 0;
  const q = o.quarter;
  const s = ((tau % o.period) + o.period) % o.period;
  if (s < q) return quarterAt(o, s);
  if (s < 2 * q) return -quarterAt(o, 2 * q - s);
  if (s < 3 * q) return -quarterAt(o, s - 2 * q);
  return quarterAt(o, 4 * q - s);
}

/**
 * 펜이 적는 구간 — 시작 · 끝 시각(주기 안)과 지금까지 적은 진행도 0~1.
 *
 * **단계 경계는 선언이 정한다.** 쓰기 두 단계의 처음과 끝을 `timeline` 에게 묻는다
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
  const to = tl.end('write-2');
  return {
    from,
    to,
    progress: tl.span(from, to),
    writing: tl.u >= from && tl.u < to,
  };
}

/** 추를 놓은 뒤 흐른 시간(초). 쓰기 첫 단계가 시작하는 순간 놓는다. */
export function released(tl: TimelineFrame): number {
  return tl.u - tl.start('write-1');
}

/**
 * 지금 추의 변위. 놓은 뒤로는 제 운동을 따라가고, 마지막 단계(`fade`)에서는 그 자리에서
 * 꼭대기(+A)로 천천히 다시 당겨진다 — 다음 바퀴의 놓는 자리와 이어져 바퀴 경계에서 튀지 않는다.
 */
export function massDisplacement(tl: TimelineFrame, o: Orbit): number {
  const y = displacementAt(o, released(tl));
  const pull = tl.at('fade');
  return y + (o.amplitude - y) * pull;
}

/** 이번 바퀴에서 기록이 흐려진 정도의 반대 — 1 이면 또렷, 0 이면 다 지워졌다. */
export function recordOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: NonlinearOscillationState }): NonlinearOscillationState {
  return params.state;
}
