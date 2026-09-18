// ========================================================================
// quantum-tunneling — 순수 물리
// ========================================================================
// 직사각 장벽 [0, w], 높이 V₀, 에너지 E < V₀. 단위 ħ²/2m = 1 이라 k = √E, κ = √(V₀ − E).
//
// 한 파수 k 의 **정확한 정상해**:
//   x < 0     ψ = e^{ikx} + r e^{−ikx}
//   0 ≤ x ≤ w ψ = A e^{−κx} + B e^{κx}
//   x > w     ψ = t e^{ikx}
// 두 경계에서 ψ 와 ψ′ 가 이어지는 조건으로 r · A · B · t 를 푼다. |r|² + |t|² = 1.
//
// 파동 묶음은 이 정상해에 가우스 포락선을 씌운 근사다(거울상 방법) — 중심 c 에서 오는
// 묶음 g(x − c), 장벽 왼쪽 면에 비친 되튄 묶음 r·g(−x − c), 장벽 오른쪽 면에서 나가는
// 묶음 t·g(x − w − c). 장벽 안은 정상해의 모양에 왼쪽 면의 포락선 값 g(−c)² 을 곱한다.
// 세 조각이 x = 0 과 x = w 에서 정확히 이어진다. 포락선이 파장보다 넓다는 근사라
// 파수 퍼짐(묶음마다 투과가 조금씩 다른 것)은 담지 않는다 — NOTES (b).
//
// 모든 것이 시각의 함수다 — 상태를 쌓지 않는다 (S-sim).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  BARRIER_HEIGHT,
  BARRIER_WIDTH,
  ENERGY,
  ENERGY_SCALE,
  PACKET_END,
  PACKET_SIGMA,
  PACKET_START,
  PSI_HEIGHT,
  WIDTH_RATIO,
} from './schema';
import type { QuantumTunnelingState } from './state';

export interface QuantumTunnelingConstants {
  /** 장벽 높이 V₀. */
  barrierHeight: number;
  /** 파동 묶음 에너지 E (< V₀). */
  energy: number;
  /** 얇은 장벽 두께 d. */
  barrierWidth: number;
  /** 두꺼운 장벽 두께 배수. */
  widthRatio: number;
  /** |ψ|² 의 위치 표준편차. */
  packetSigma: number;
  /** 묶음 중심의 처음 · 끝 자리. */
  packetStart: number;
  packetEnd: number;
  /** |ψ|² 한 단위의 월드 높이. */
  psiHeight: number;
  /** 에너지 한 단위의 월드 높이. */
  energyScale: number;
}

export function readConstants(stage: StageDef): QuantumTunnelingConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    barrierHeight: c.barrierHeight ?? BARRIER_HEIGHT,
    energy: c.energy ?? ENERGY,
    barrierWidth: c.barrierWidth ?? BARRIER_WIDTH,
    widthRatio: c.widthRatio ?? WIDTH_RATIO,
    packetSigma: c.packetSigma ?? PACKET_SIGMA,
    packetStart: c.packetStart ?? PACKET_START,
    packetEnd: c.packetEnd ?? PACKET_END,
    psiHeight: c.psiHeight ?? PSI_HEIGHT,
    energyScale: c.energyScale ?? ENERGY_SCALE,
  };
}

// ------------------------------------------------------------------------
// 복소수 — 정상해를 푸는 데만 쓴다
// ------------------------------------------------------------------------

interface Complex {
  re: number;
  im: number;
}

const cx = (re: number, im = 0): Complex => ({ re, im });
const add = (a: Complex, b: Complex): Complex => cx(a.re + b.re, a.im + b.im);
const sub = (a: Complex, b: Complex): Complex => cx(a.re - b.re, a.im - b.im);
const mul = (a: Complex, b: Complex): Complex =>
  cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const div = (a: Complex, b: Complex): Complex => {
  const d = b.re * b.re + b.im * b.im;
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
const abs2 = (a: Complex): number => a.re * a.re + a.im * a.im;

/** 한 장벽의 정상해 계수. */
export interface BarrierSolution {
  /** 장벽 두께. */
  width: number;
  /** 파수 · 감쇠 상수. */
  k: number;
  kappa: number;
  /** 반사 · 장벽 안 두 항 계수. */
  r: Complex;
  A: Complex;
  B: Complex;
  /** 투과율 |t|² · 반사율 |r|². 합이 1 이다. */
  T: number;
  R: number;
}

/** 두께 `width` 인 장벽의 정상해를 푼다. */
export function solveBarrier(c: QuantumTunnelingConstants, width: number): BarrierSolution {
  const k = Math.sqrt(c.energy);
  const kappa = Math.sqrt(c.barrierHeight - c.energy);
  // x = w 에서 τ = t e^{ikw} 로 두면 A · B 가 τ 에 비례한다. τ = 1 로 두고 푼 뒤 x = 0 조건으로 τ 를 정한다.
  const q = cx(0, k / kappa);
  const A1 = mul(cx(Math.exp(kappa * width) / 2), sub(cx(1), q));
  const B1 = mul(cx(Math.exp(-kappa * width) / 2), add(cx(1), q));
  // x = 0: 1 = (A + B)/2 + (κ / 2ik)(B − A)
  const lhs = add(mul(cx(0.5), add(A1, B1)), mul(div(cx(kappa), cx(0, 2 * k)), sub(B1, A1)));
  const tau = div(cx(1), lhs);
  const A = mul(A1, tau);
  const B = mul(B1, tau);
  const r = sub(add(A, B), cx(1));
  return { width, k, kappa, r, A, B, T: abs2(tau), R: abs2(r) };
}

/** 포락선 진폭 g(s) — |g|² 가 표준편차 σ 인 가우스, 봉우리 1. */
function envelope(s: number, sigma: number): number {
  return Math.exp(-(s * s) / (4 * sigma * sigma));
}

/**
 * 묶음 중심이 c 일 때 자리 x 의 확률 밀도 |ψ|² (들어오는 묶음 봉우리 = 1).
 *
 * - 장벽 왼쪽: 오는 묶음과 되튄 묶음이 겹치며 무늬를 만든다.
 * - 장벽 안: 정상해 |A e^{−κx} + B e^{κx}|² × 왼쪽 면의 포락선 — 지수로 줄어든다.
 * - 장벽 오른쪽: |t|² × 나가는 묶음.
 */
export function density(x: number, center: number, s: BarrierSolution, sigma: number): number {
  if (x < 0) {
    const g1 = envelope(x - center, sigma);
    const g2 = envelope(-x - center, sigma);
    // |g1 e^{ikx} + r g2 e^{−ikx}|² = g1² + |r|² g2² + 2 g1 g2 Re(r̄ e^{2ikx})
    const ph = 2 * s.k * x;
    const cross = s.r.re * Math.cos(ph) + s.r.im * Math.sin(ph);
    return g1 * g1 + s.R * g2 * g2 + 2 * g1 * g2 * cross;
  }
  if (x <= s.width) {
    const g0 = envelope(-center, sigma);
    const decay = Math.exp(-s.kappa * x);
    const grow = Math.exp(s.kappa * x);
    const psi = add(mul(s.A, cx(decay)), mul(s.B, cx(grow)));
    return g0 * g0 * abs2(psi);
  }
  const g3 = envelope(x - s.width - center, sigma);
  return s.T * g3 * g3;
}

/** 묶음 중심 — 주기 내내 같은 빠르기로 간다. */
export function packetCenter(tl: TimelineFrame, c: QuantumTunnelingConstants): number {
  const run = tl.span(tl.start('enter'), tl.end('fade'));
  return c.packetStart + (c.packetEnd - c.packetStart) * run;
}

/** 묶음의 불투명도 — 주기 이음매에서만 흐려진다. */
export function packetOpacity(tl: TimelineFrame): number {
  return tl.at('enter') * (1 - tl.at('fade'));
}

/** 상태가 시계뿐인 조각 — 항등 step (S-sim). */
export function step(params: { state: QuantumTunnelingState }): QuantumTunnelingState {
  return params.state;
}
