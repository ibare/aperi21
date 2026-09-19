// ========================================================================
// diffraction-grating — 물리 (순수 함수)
// ========================================================================
// 먼 거리 근사(방향마다의 세기)로 셈한다. 방향 θ 에서 이웃한 틈 사이 위상 차는
// δ = 2π d sin θ / λ 이고, 틈 k 의 진폭 가중치를 w_k 라 하면 세기는 |Σ w_k e^{ikδ}|² 다.
// 가중치 합의 제곱으로 나눠 **틈 수마다 가장 밝은 곳을 1** 로 맞춘다 — 밝기 자체가 아니라 모양을
// 견주는 그림이다 (NOTES (b)).
//
// 스크린은 격자에서 L 떨어진 평면이라 높이 y 는 L tan θ 다. 주극대는 δ 가 2π 의 정수배인
// 방향이라 틈 수와 무관하다 — 그래서 줄의 자리가 그대로다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import {
  SCREEN_DISTANCE,
  SLITS_FEW,
  SLITS_MANY,
  SLITS_MID,
  SPACING_NM,
  WAVE_SPEED,
  WAVELENGTH_NM,
} from './schema';
import type { DiffractionGratingState } from './state';

export interface DiffractionGratingConstants {
  wavelengthNm: number;
  spacingNm: number;
  /** 1 이상 정수, few ≤ mid ≤ many 로 맞춘다. */
  slitsFew: number;
  slitsMid: number;
  slitsMany: number;
  screenDistance: number;
  waveSpeed: number;
}

/** 스테이지 상수를 기본값과 함께 읽는다 (원칙 2). */
export function readConstants(stage: StageDef): DiffractionGratingConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const few = Math.max(1, Math.round(c.slitsFew ?? SLITS_FEW));
  const mid = Math.max(few, Math.round(c.slitsMid ?? SLITS_MID));
  const many = Math.max(mid, Math.round(c.slitsMany ?? SLITS_MANY));
  return {
    wavelengthNm: c.wavelengthNm ?? WAVELENGTH_NM,
    spacingNm: c.spacingNm ?? SPACING_NM,
    slitsFew: few,
    slitsMid: mid,
    slitsMany: many,
    screenDistance: c.screenDistance ?? SCREEN_DISTANCE,
    waveSpeed: c.waveSpeed ?? WAVE_SPEED,
  };
}

/**
 * 틈 자리마다 열리는 순위 — 가운데에 가까운 자리부터 0, 1, 2, … 순위가 N 보다 작은 자리가
 * 「틈 N 개」 의 틈이다. 같은 거리면 위쪽 자리가 먼저다.
 */
export function openRanks(count: number): number[] {
  const c = (count - 1) / 2;
  const order = Array.from({ length: count }, (_, k) => k).sort(
    (a, b) => Math.abs(a - c) - Math.abs(b - c) || b - a,
  );
  const rank = new Array<number>(count).fill(0);
  order.forEach((k, r) => {
    rank[k] = r;
  });
  return rank;
}

/** 방향 sin θ 의 세기 0~1 — 가중치 합의 제곱으로 나눠 주극대가 1. 가중치는 자리 번호 순서. */
export function gratingIntensity(weights: readonly number[], sinTheta: number, spacingNm: number, nm: number): number {
  const delta = (2 * Math.PI * spacingNm * sinTheta) / nm;
  const cd = Math.cos(delta);
  const sd = Math.sin(delta);
  // e^{ikδ} 를 한 번씩 돌려 가며 더한다.
  let pr = 1;
  let pi = 0;
  let re = 0;
  let im = 0;
  let sum = 0;
  for (const w of weights) {
    re += w * pr;
    im += w * pi;
    sum += w;
    const nr = pr * cd - pi * sd;
    pi = pr * sd + pi * cd;
    pr = nr;
  }
  if (sum <= 0) return 0;
  return (re * re + im * im) / (sum * sum);
}

/** 스크린 높이 y 의 방향 sin θ. */
export function sinAt(y: number, L: number): number {
  return y / Math.hypot(y, L);
}

/** 주극대의 스크린 높이 — sin θ = mλ/d 인 m 마다, 스크린 반높이 안의 것만. 0 차 포함. */
export function principalMaxima(c: DiffractionGratingConstants, half: number): number[] {
  const out: number[] = [];
  const ratio = c.wavelengthNm / c.spacingNm;
  for (let m = 0; m * ratio < 1; m++) {
    const s = m * ratio;
    const y = (c.screenDistance * s) / Math.sqrt(1 - s * s);
    if (y > half) break;
    out.push(y);
    if (m > 0) out.push(-y);
  }
  return out;
}

/** 상태가 캡션 글자뿐이다 — 모든 움직임은 시각의 함수다. */
export function step(params: { state: DiffractionGratingState }): DiffractionGratingState {
  return params.state;
}
