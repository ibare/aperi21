// ========================================================================
// youngs-modulus — 순수 물리
// ========================================================================

import type { TimelineFrame } from '@aperi21/schema';
import { DIAMETER_MM, G, MASS, U_HIGH, U_LOW } from './schema';
import type { YoungsModulusState } from './state';

/** 선의 단면적(m²). */
export const AREA = Math.PI * Math.pow(DIAMETER_MM / 2 / 1000, 2);

/**
 * 받침대가 내려간 정도 u. 내려가는 단계에서 오르고, 올라오는 단계에서 되돌아간다.
 * 단계의 길이와 이징은 선언(`schema.timeline`)이 정한다.
 */
export function platformU(tl: TimelineFrame): number {
  const s = tl.at('lower') - tl.at('raise');
  return U_LOW + (U_HIGH - U_LOW) * s;
}

/** 선이 받는 힘의 몫 0~1. u > 1 이면 추가 온전히 매달린다. */
export function loadShare(u: number): number {
  return Math.min(u, 1);
}

/**
 * 선에서 천장으로부터 `lengthM` 인 지점까지가 늘어난 길이(mm).
 * 응력 = 몫 × 무게 / 단면적, 변형률 = 응력 / 영률.
 */
export function stretchMM(E: number, share: number, lengthM: number): number {
  const stress = (share * MASS * G) / AREA;
  return (stress / E) * lengthM * 1000;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: YoungsModulusState }): YoungsModulusState {
  return params.state;
}
