// ========================================================================
// quantum-harmonic-oscillator — 순수 물리
// ========================================================================
// 포물선 우물 V = ½ ξ² ħω (ξ = x / x₀) 의 정상 상태:
//   Eₙ = (n + ½) ħω,   ψₙ(ξ) = Hₙ 에르미트 함수 (마디 n 개).
// 이웃 준위 사이는 언제나 ħω 하나이고, 바닥 준위도 V = 0 에서 ½ħω 떠 있다.
//
// 에르미트 함수는 세 항 점화식으로 얻는다 —
//   ψ₀ = π^(−¼) e^(−ξ²/2),  ψₙ = √(2/n) ξ ψₙ₋₁ − √((n−1)/n) ψₙ₋₂.
//
// 모든 것이 시각의 함수다 — 상태를 쌓지 않는다. 준위마다 내려놓음 · 자라남 진행도는
// 시간표 선언에게 묻는다 (S-piece 「시간표는 선언이다」).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { LEVEL_COUNT, PSI_HEIGHT, PSI_RANGE, QUANTUM, X_SCALE } from './schema';
import type { QuantumHarmonicOscillatorState } from './state';

export interface QuantumHarmonicOscillatorConstants {
  /** ħω 한 칸의 월드 높이. */
  quantum: number;
  /** ξ 한 칸의 월드 폭. */
  xScale: number;
  /** 보일 준위 수(n = 0 … N − 1). */
  levelCount: number;
  /** 준위 위에 얹는 ψ 의 높이(월드). */
  psiHeight: number;
  /** ψ 를 긋는 ξ 범위(±). */
  psiRange: number;
}

export function readConstants(stage: StageDef): QuantumHarmonicOscillatorConstants {
  const c = stage.constants ?? {};
  return {
    quantum: c.quantum ?? QUANTUM,
    xScale: c.xScale ?? X_SCALE,
    levelCount: c.levelCount ?? LEVEL_COUNT,
    psiHeight: c.psiHeight ?? PSI_HEIGHT,
    psiRange: c.psiRange ?? PSI_RANGE,
  };
}

/** 준위 n 의 월드 높이 = (n + ½) ħω. */
export function levelY(n: number, c: QuantumHarmonicOscillatorConstants): number {
  return (n + 0.5) * c.quantum;
}

/** 포물선 우물의 월드 높이 V(x) = ½ ξ² ħω. */
export function potentialY(x: number, c: QuantumHarmonicOscillatorConstants): number {
  const xi = x / c.xScale;
  return 0.5 * xi * xi * c.quantum;
}

/** 우물이 높이 y 에 닿는 월드 가로 자리(양수 쪽). 고전 되돌이점이기도 하다. */
export function wellHalfWidthAt(y: number, c: QuantumHarmonicOscillatorConstants): number {
  return Math.sqrt((2 * Math.max(y, 0)) / c.quantum) * c.xScale;
}

/** 정규화된 에르미트 함수 ψₙ(ξ). */
export function hermiteFunction(n: number, xi: number): number {
  let prev = 0;
  let cur = Math.pow(Math.PI, -0.25) * Math.exp((-xi * xi) / 2);
  for (let k = 1; k <= n; k++) {
    const next = Math.sqrt(2 / k) * xi * cur - Math.sqrt((k - 1) / k) * prev;
    prev = cur;
    cur = next;
  }
  return cur;
}

/**
 * 준위 n 의 ψ 표본(월드 x, 최대 |값| 1 로 맞춘 ψ). 그림 배율이라 준위마다 가장 큰 봉우리를
 * 같은 높이로 맞춘다 — 정규화 크기(ψ₀ 가 가장 높다)는 이 주장의 것이 아니다 (NOTES (b)).
 */
export function psiSamples(
  n: number,
  samples: number,
  c: QuantumHarmonicOscillatorConstants,
): { x: number; v: number }[] {
  const raw: { x: number; v: number }[] = [];
  let peak = 0;
  for (let i = 0; i <= samples; i++) {
    const xi = -c.psiRange + (2 * c.psiRange * i) / samples;
    const v = hermiteFunction(n, xi);
    peak = Math.max(peak, Math.abs(v));
    raw.push({ x: xi * c.xScale, v });
  }
  const s = peak > 0 ? 1 / peak : 0;
  return raw.map((p) => ({ x: p.x, v: p.v * s }));
}

/** 표본에서 부호가 바뀌는 자리(마디)의 월드 x. 선형 보간한다. */
export function nodesOf(pts: readonly { x: number; v: number }[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    // 표본이 마디에 정확히 떨어지면(홀수 n 의 ξ = 0) 그 표본이 마디다.
    if (b.v === 0 && a.v !== 0) out.push(b.x);
    else if (a.v * b.v < 0) out.push(a.x + ((b.x - a.x) * a.v) / (a.v - b.v));
  }
  return out;
}

export interface LevelReading {
  /** 벽돌이 위에서 내려와 얹힌 비율 0~1. 바닥 준위는 언제나 1. */
  drop: number;
  /** 이 준위에 ψ 가 자라난 비율 0~1. 바닥 준위는 언제나 1. */
  grow: number;
}

/**
 * 준위 n 의 지금 모습. 단계 id 는 `drop-n` · `grow-n` 이다 — 준위 수와 단계 목록은
 * 짝이라 상수만 바꾸면 없는 단계를 불러 엔진이 던진다 (장부 G13).
 */
export function readLevel(tl: TimelineFrame, n: number): LevelReading {
  if (n <= 0) return { drop: 1, grow: 1 };
  return { drop: tl.at(`drop-${n}`), grow: tl.at(`grow-${n}`) };
}

/** 위 준위들이 흐려진 정도 0~1. 주기 끝에서 바닥 준위 하나로 돌아간다. */
export function fadeOut(tl: TimelineFrame): number {
  return tl.at('fade');
}

/** 상태가 시계뿐인 조각 — 항등 step (S-sim). */
export function step(params: { state: QuantumHarmonicOscillatorState }): QuantumHarmonicOscillatorState {
  return params.state;
}
