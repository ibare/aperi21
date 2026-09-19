// ========================================================================
// displacement-current — 순수 물리
// ========================================================================
// 차는 동안 단계 시작에서 s 초가 지나면 도선 전류는 첫 순간의 e^(−s/τ) 배다. 판에 쌓인
// 전하(다 참 = 1)는 그 적분이라
//   q(s) = (1 − e^(−s/τ)) / (1 − e^(−T/τ))      (T = 단계 길이 — 단계가 끝날 때 꼭 1)
// 이다. 비우는 동안은 같은 모양으로 거꾸로 간다.
//
// 판 사이 전기 선속은 q 에 비례하므로 그 변화율(변위 전류)은 도선 전류와 **같다**.
// 반지름 r 의 고리가 두르는 전류는 —
//   도선 고리: 도선 전류 i 전부
//   틈 고리:   변위 전류 i × min(1, (r/R)²)   (R = 원판 반지름, 판 사이 장은 고르다)
// 이고 고리 위 자기장은 두른 전류 ÷ r 에 비례한다. 세 고리의 반지름이 같고 r ≥ R 이면
// 세 고리의 자기장이 같다. 모든 것이 시각의 함수라 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  B_ARROW_SCALE,
  DEPTH_SKEW,
  E_LINE_COUNT,
  FLOW_SCALE,
  I_ARROW_SCALE,
  FADE_GAIN,
  PLATE_GAP,
  PLATE_RADIUS,
  RING_RADIUS,
  TAU,
} from './schema';
import type { DisplacementCurrentState } from './state';

export interface DisplacementCurrentConstants {
  tau: number;
  plateRadius: number;
  plateGap: number;
  ringRadius: number;
  eLineCount: number;
  iArrowScale: number;
  bArrowScale: number;
  fadeGain: number;
  flowScale: number;
  depthSkew: number;
}

export function readConstants(stage: StageDef): DisplacementCurrentConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    tau: c.tau ?? TAU,
    plateRadius: c.plateRadius ?? PLATE_RADIUS,
    plateGap: c.plateGap ?? PLATE_GAP,
    ringRadius: c.ringRadius ?? RING_RADIUS,
    eLineCount: c.eLineCount ?? E_LINE_COUNT,
    iArrowScale: c.iArrowScale ?? I_ARROW_SCALE,
    bArrowScale: c.bArrowScale ?? B_ARROW_SCALE,
    fadeGain: c.fadeGain ?? FADE_GAIN,
    flowScale: c.flowScale ?? FLOW_SCALE,
    depthSkew: c.depthSkew ?? DEPTH_SKEW,
  };
}

/** 단계 진행도 a(0~1)에서 그 단계가 옮긴 전하의 몫(0~1). 단계 길이 T 초. */
function movedShare(a: number, T: number, tau: number): number {
  return (1 - Math.exp((-a * T) / tau)) / (1 - Math.exp(-T / tau));
}

/** 판에 쌓인 전하(다 참 = 1). 차는 단계에서 오르고 비우는 단계에서 내린다. */
export function chargeAt(tl: TimelineFrame, c: DisplacementCurrentConstants): number {
  const up = movedShare(tl.at('charge'), tl.duration('charge'), c.tau);
  const down = movedShare(tl.at('discharge'), tl.duration('discharge'), c.tau);
  return up - down;
}

/**
 * 도선 전류(차기 시작한 첫 순간 = 1). 오른쪽으로 흐르면 +. 다 참 · 빔 단계에서는 0 이다.
 * 판 사이의 변위 전류도 같은 값이다(선속 변화율 = 전하 변화율).
 */
export function currentAt(tl: TimelineFrame, c: DisplacementCurrentConstants): number {
  if (tl.phase === 'charge') return Math.exp((-tl.at('charge') * tl.duration('charge')) / c.tau);
  if (tl.phase === 'discharge') return -Math.exp((-tl.at('discharge') * tl.duration('discharge')) / c.tau);
  return 0;
}

/** 도선을 두른 고리의 자기장(첫 순간의 도선 고리 = 1). */
export function wireRingField(i: number): number {
  return i;
}

/**
 * 틈을 두른 고리의 자기장. 두른 변위 전류는 고리 안에 든 선속의 몫만큼이다 — 고리가
 * 원판보다 작으면 줄어든다. 고리가 원판을 다 두르면 도선 고리와 같다.
 */
export function gapRingField(i: number, c: DisplacementCurrentConstants): number {
  const share = Math.min(1, (c.ringRadius / c.plateRadius) ** 2);
  return i * share;
}

/**
 * E 선(과 판의 +/− 표식)이 나타나는 순번. 가운데부터 채우면 한쪽으로 몰려 보이므로
 * 반씩 나눠 가며(0.5 · 0.25 · 0.75 · …) 가장 가까운 빈 자리를 고른다 — 몇 가닥이든
 * 판 위에 고르게 퍼진다. `rank[k]` 는 k 번째 자리(아래부터)가 몇 번째로 서는지.
 */
export function appearanceRank(n: number): number[] {
  const rank = new Array<number>(n).fill(-1);
  let placed = 0;
  for (let depth = 1; placed < n; depth *= 2) {
    for (let j = 1; j < 2 * depth && placed < n; j += 2) {
      const target = (j / (2 * depth)) * (n - 1);
      let best = -1;
      for (let k = 0; k < n; k++) {
        if (rank[k] !== -1) continue;
        if (best === -1 || Math.abs(k - target) < Math.abs(best - target)) best = k;
      }
      if (best !== -1) rank[best] = placed++;
    }
  }
  return rank;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: DisplacementCurrentState }): DisplacementCurrentState {
  return params.state;
}
