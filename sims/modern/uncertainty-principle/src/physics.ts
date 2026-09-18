// ========================================================================
// uncertainty-principle — 순수 물리
// ========================================================================
// 가우스 파동 묶음은 위치 분포 |ψ(x)|² 와 운동량 분포 |φ(p)|² 가 모두 가우스이고,
// 두 표준편차의 곱이 바닥값 ħ/2 에 딱 닿는다: σp = ħ / (2σx). 다른 모양의 묶음은
// 곱이 이보다 크다 — 이 조각은 바닥에 선 상태만 보인다 (NOTES (b)).
//
// σx 는 시간표가 정한다. `squeeze` 진행도만큼 좁은 쪽으로, `widen` 진행도만큼 다시
// 넓은 쪽으로 간다. 두 끝 사이는 **비로** 잇는다(로그로 고르게) — 그래야 평면 위
// 점이 쌍곡선을 고른 빠르기로 미끄러진다. 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { HBAR, SIGMA_X_NARROW, SIGMA_X_WIDE } from './schema';
import type { UncertaintyPrincipleState } from './state';

export interface UncertaintyConstants {
  /** ħ(그림 단위). */
  hbar: number;
  /** 가장 넓을 때 · 가장 좁을 때의 Δx. */
  sigmaXWide: number;
  sigmaXNarrow: number;
}

export function readConstants(stage: StageDef): UncertaintyConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    hbar: c.hbar ?? HBAR,
    sigmaXWide: c.sigmaXWide ?? SIGMA_X_WIDE,
    sigmaXNarrow: c.sigmaXNarrow ?? SIGMA_X_NARROW,
  };
}

/** 최소 불확정 상태의 운동량 폭. 위치 폭에 반비례한다. */
export function sigmaP(sigmaX: number, c: UncertaintyConstants): number {
  return c.hbar / (2 * sigmaX);
}

export interface Spreads {
  sigmaX: number;
  sigmaP: number;
}

/**
 * 지금 시각의 두 폭. **단계 경계는 선언이 정한다** — 좁히기 · 풀기의 시작과 길이를
 * 시간표에게 묻는다 (S-piece 「시간표는 선언이다」).
 */
export function readSpreads(tl: TimelineFrame, c: UncertaintyConstants): Spreads {
  const k = tl.at('squeeze') - tl.at('widen');
  const sigmaX = c.sigmaXWide * Math.pow(c.sigmaXNarrow / c.sigmaXWide, k);
  return { sigmaX, sigmaP: sigmaP(sigmaX, c) };
}

/** 넓이 1 인 가우스 밀도. 두 분포 모두 이 꼴이다. */
export function gaussianDensity(u: number, sigma: number): number {
  return Math.exp(-(u * u) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));
}

/** 두 판이 담아야 할 가장 뾰족한 봉우리 높이(밀도 단위) — 판의 세로 배율을 정한다. */
export function peakDensities(c: UncertaintyConstants): { x: number; p: number } {
  return {
    x: gaussianDensity(0, c.sigmaXNarrow),
    p: gaussianDensity(0, sigmaP(c.sigmaXWide, c)),
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: UncertaintyPrincipleState }): UncertaintyPrincipleState {
  return params.state;
}
