// ========================================================================
// quality-factor — 순수 물리
// ========================================================================
// 감쇠 진동자 x'' + (ω₀/Q) x' + ω₀² x = F cos θ 하나를 두 Q 로 읽는다.
//
// - 구동 중에는 정상 상태로 근사한다. 진폭 A(r) = 1/√((1 − r²)² + (r/Q)²), 위상 지연
//   φ(r) = atan2(r/Q, 1 − r²), r = 구동 진동수 / f₀. 훑는 속도가 느려 순간마다 정상
//   상태에 있다고 본다(준정적). 구동 위상 θ 는 ω₀·r 를 시간으로 적분한 것이다.
// - 진폭은 **각자의 봉우리 높이로 나눈다.** 같은 힘이면 Q = 12 의 봉우리가 네 배
//   높아 Q = 3 의 곡선이 바닥에 깔린다. 이 조각이 견주는 것은 높이가 아니라 **폭**이라
//   높이를 맞춘다 — 곧 구동 세기를 진동자마다 1/봉우리 만큼 준 것과 같다.
// - 구동을 멈추면 자유 감쇠 진동 e^(−ω₀ s / 2Q)·cos(ω_d s + ψ). 진폭이 e^(−π)(약 4 %)
//   까지 줄어드는 데 Q 번 흔들린다(Q/f₀ 초).
//
// 모든 것이 시각의 함수다. 단계 경계는 시간표에게 묻는다 (S-piece 「시간표는 선언이다」).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { F0, Q_HIGH, Q_LOW, SWEEP_FROM, SWEEP_TO } from './schema';
import type { QualityFactorState } from './state';

export interface QualityFactorConstants {
  /** 고유 진동수(Hz). 두 진동자가 같다. */
  f0: number;
  /** 위 · 아래 진동자의 Q. */
  qLow: number;
  qHigh: number;
  /** 구동 진동수를 훑는 범위(f₀ 에 대한 비). */
  sweepFrom: number;
  sweepTo: number;
}

export function readConstants(stage: StageDef): QualityFactorConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    f0: c.f0 ?? F0,
    qLow: c.qLow ?? Q_LOW,
    qHigh: c.qHigh ?? Q_HIGH,
    sweepFrom: c.sweepFrom ?? SWEEP_FROM,
    sweepTo: c.sweepTo ?? SWEEP_TO,
  };
}

// ------------------------------------------------------------------------
// 공명 곡선
// ------------------------------------------------------------------------

/** 정상 상태 진폭(힘 F/k = 1 기준). */
function rawAmplitude(r: number, q: number): number {
  const a = 1 - r * r;
  const b = r / q;
  return 1 / Math.sqrt(a * a + b * b);
}

/** 봉우리 자리 r = √(1 − 1/2Q²). Q ≤ 1/√2 면 봉우리가 없다(0 에서 가장 크다). */
function peakRatio(q: number): number {
  const s = 1 - 1 / (2 * q * q);
  return s > 0 ? Math.sqrt(s) : 0;
}

/** 봉우리 높이로 나눈 진폭 0~1. */
export function amplitude(r: number, q: number): number {
  return rawAmplitude(r, q) / rawAmplitude(peakRatio(q), q);
}

/** 구동에 대한 위상 지연(라디안) 0~π. f₀ 에서 π/2. */
export function phaseLag(r: number, q: number): number {
  return Math.atan2(r / q, 1 - r * r);
}

/**
 * 반전력 폭 — 진폭이 봉우리의 1/√2 인 두 자리 [r₁, r₂]. 에너지가 절반인 자리이고 그 폭이
 * 대략 1/Q 다. 훑는 범위 안에서 찾지 못한 쪽은 범위 끝으로 둔다.
 */
export function halfPowerBand(q: number, from: number, to: number): readonly [number, number] {
  const target = Math.SQRT1_2;
  const peak = peakRatio(q);
  const f = (r: number): number => amplitude(r, q) - target;
  const solve = (lo: number, hi: number, rising: boolean): number => {
    // 봉우리 왼쪽은 오르막, 오른쪽은 내리막이다. 60 번이면 부동소수 끝까지 좁혀진다.
    let a = lo;
    let b = hi;
    for (let i = 0; i < 60; i++) {
      const m = (a + b) / 2;
      const below = f(m) < 0;
      if (below === rising) a = m;
      else b = m;
    }
    return (a + b) / 2;
  };
  const left = f(from) < 0 ? solve(from, peak, true) : from;
  const right = f(to) < 0 ? solve(peak, to, false) : to;
  return [left, right];
}

// ------------------------------------------------------------------------
// 시간표 읽기
// ------------------------------------------------------------------------

/** 그 단계 안에서 흐른 시간(초). 전에는 0, 뒤에는 그 단계의 길이. */
function elapsed(tl: TimelineFrame, id: string): number {
  return Math.min(Math.max(tl.u - tl.start(id), 0), tl.duration(id));
}

export interface DriveReading {
  /** 지금 구동 진동수 / f₀. 구동을 멈춘 뒤에는 1(마지막 값). */
  r: number;
  /** 구동 위상(라디안). 멈춘 뒤에는 멈춘 순간의 값. */
  theta: number;
  /** 구동 중인가. 울림 단계부터 거짓이다. */
  driving: boolean;
  /** 훑기 단계에서 곡선이 그려진 끝(비). 훑기가 끝나면 `sweepTo`. */
  drawnTo: number;
}

/**
 * 구동을 읽는다. 훑기(sweepFrom → sweepTo) · 되돌리기(sweepTo → 1) · f₀ 구동의 세 단계를
 * 이어 붙이고, 위상은 각 단계의 진동수를 시간으로 적분해 끊김 없이 잇는다. 세 단계 모두
 * 진동수가 선형으로 변하므로 적분이 닫힌 꼴이다.
 */
export function readDrive(tl: TimelineFrame, c: QualityFactorConstants): DriveReading {
  const w0 = 2 * Math.PI * c.f0;
  const r0 = c.sweepFrom;
  const r1 = c.sweepTo;

  const ds = tl.duration('sweep');
  const s1 = elapsed(tl, 'sweep');
  const rSweep = r0 + ((r1 - r0) * s1) / ds;
  const thSweep = w0 * (r0 * s1 + ((r1 - r0) * s1 * s1) / (2 * ds));

  const dt = tl.duration('tune');
  const s2 = elapsed(tl, 'tune');
  const rTune = r1 + ((1 - r1) * s2) / dt;
  const thTune = w0 * (r1 * s2 + ((1 - r1) * s2 * s2) / (2 * dt));

  const s3 = elapsed(tl, 'drive');
  const thDrive = w0 * s3;

  const inSweep = tl.u < tl.end('sweep');
  const inTune = !inSweep && tl.u < tl.end('tune');
  const r = inSweep ? rSweep : inTune ? rTune : 1;
  return {
    r,
    theta: thSweep + thTune + thDrive,
    driving: tl.u < tl.end('drive'),
    drawnTo: inSweep ? rSweep : r1,
  };
}

/** 구동을 멈춘 뒤 흐른 시간(초). 멈추기 전에는 0. 울림 뒤 단계에서도 계속 센다. */
export function sinceRelease(tl: TimelineFrame): number {
  return Math.max(0, tl.u - tl.end('drive'));
}

/**
 * 진동자 하나의 변위(봉우리 높이 = 1). 구동 중에는 정상 상태 A(r)·cos(θ − φ), 멈춘 뒤에는
 * 그 순간의 진폭 · 위상에서 출발하는 자유 감쇠 진동이다.
 */
export function displacement(
  drive: DriveReading,
  release: number,
  q: number,
  c: QualityFactorConstants,
): number {
  const lagged = drive.theta - phaseLag(drive.r, q);
  const a = amplitude(drive.r, q);
  if (drive.driving) return a * Math.cos(lagged);
  const w0 = 2 * Math.PI * c.f0;
  const wd = w0 * Math.sqrt(Math.max(0, 1 - 1 / (4 * q * q)));
  return a * Math.exp((-w0 * release) / (2 * q)) * Math.cos(lagged + wd * release);
}

/** 구동을 멈춘 뒤 진폭이 e^(−π) 로 줄어들기까지(초) = Q 번 흔들리는 시간 Q/f₀. */
export function ringTime(q: number, c: QualityFactorConstants): number {
  return q / c.f0;
}

// ------------------------------------------------------------------------
// 시간 기록
// ------------------------------------------------------------------------

/** 기록 판이 담는 시간(초) — 구동 단계 + 울림 단계. 판의 초당 폭이 여기서 나온다. */
export function stripSpan(tl: TimelineFrame): number {
  return tl.duration('drive') + tl.duration('ring');
}

/** 기록이 시작된 뒤 흐른 시간(초). 기록 판 끝에서 멈춘다. */
export function recorded(tl: TimelineFrame): number {
  return Math.min(Math.max(0, tl.u - tl.start('drive')), stripSpan(tl));
}

/**
 * 기록 판 위 시각 τ(구동 시작 기준 초)의 변위. 같은 시각의 `displacement` 와 같은 값이다 —
 * 판은 진동자가 지나온 자리를 적은 것이지 다른 계산이 아니다.
 */
export function recordAt(
  tl: TimelineFrame,
  tau: number,
  q: number,
  c: QualityFactorConstants,
): number {
  const w0 = 2 * Math.PI * c.f0;
  const dd = tl.duration('drive');
  // 구동 시작 순간의 위상 — 훑기와 되돌리기의 적분.
  const thStart =
    w0 * (c.sweepFrom * tl.duration('sweep') + ((c.sweepTo - c.sweepFrom) * tl.duration('sweep')) / 2) +
    w0 * (c.sweepTo * tl.duration('tune') + ((1 - c.sweepTo) * tl.duration('tune')) / 2);
  const inDrive = tau < dd;
  const drive: DriveReading = {
    r: 1,
    theta: thStart + w0 * Math.min(tau, dd),
    driving: inDrive,
    drawnTo: c.sweepTo,
  };
  return displacement(drive, inDrive ? 0 : tau - dd, q, c);
}

/** 이번 주기에서 그림이 흐려진 정도 — 마지막 단계에서 그린 것을 지우고 다시 훑는다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: QualityFactorState }): QualityFactorState {
  return params.state;
}
