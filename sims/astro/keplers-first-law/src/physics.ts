// ========================================================================
// keplers-first-law — 순수 물리
// ========================================================================
// 행성은 태양을 한 초점으로 하는 타원 위를 케플러 운동으로 돈다.
//   평균 근점 이각 M = M₀ + 2π · (바퀴 수) · u / (시간표 주기)
//   케플러 방정식 E − e sin E = M 을 뉴턴법으로 풀어 이심 근점 이각 E 를 얻는다.
// 가운데를 원점으로, 태양은 왼쪽 초점 (−c, 0), 빈 초점은 오른쪽 (c, 0) 이다 (c = a e).
// 모든 것이 시각의 함수라 상태를 쌓지 않는다 — 같은 시각은 언제나 같은 자리다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { ECCENTRICITY, MEAN_ANOMALY_AT_START, ORBITS_PER_CYCLE, SEMI_MAJOR } from './schema';
import type { KeplersFirstLawState } from './state';

export interface KeplersFirstLawConstants {
  /** 긴반지름 a(월드). */
  semiMajor: number;
  /** 이심률 e (0 ≤ e < 1). */
  eccentricity: number;
  /** 한 주기(시간표) 동안의 바퀴 수. */
  orbitsPerCycle: number;
  /** 주기 시작의 평균 근점 이각(라디안). */
  meanAnomalyAtStart: number;
}

export function readConstants(stage: StageDef): KeplersFirstLawConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    semiMajor: c.semiMajor ?? SEMI_MAJOR,
    eccentricity: c.eccentricity ?? ECCENTRICITY,
    orbitsPerCycle: c.orbitsPerCycle ?? ORBITS_PER_CYCLE,
    meanAnomalyAtStart: c.meanAnomalyAtStart ?? MEAN_ANOMALY_AT_START,
  };
}

/** 타원의 모양 — 가운데 · 두 초점 · 짧은반지름. */
export interface EllipseGeometry {
  a: number;
  b: number;
  /** 가운데에서 초점까지(c = a e). */
  focal: number;
  center: Vec2;
  sun: Vec2;
  emptyFocus: Vec2;
}

export function ellipseGeometry(k: KeplersFirstLawConstants): EllipseGeometry {
  const a = k.semiMajor;
  const e = k.eccentricity;
  const focal = a * e;
  return {
    a,
    b: a * Math.sqrt(1 - e * e),
    focal,
    center: [0, 0],
    sun: [-focal, 0],
    emptyFocus: [focal, 0],
  };
}

/** 이심 근점 이각 E 의 타원 위 자리. E = 0 이 근일점(태양 쪽 꼭짓점)이고 반시계로 돈다. */
export function pointAtEccentricAnomaly(E: number, g: EllipseGeometry): Vec2 {
  return [g.center[0] - g.a * Math.cos(E), g.center[1] - g.b * Math.sin(E)];
}

/** 케플러 방정식 E − e sin E = M 을 푼다. 뉴턴법, e < 1 에서 몇 번이면 수렴한다. */
export function solveKepler(M: number, e: number): number {
  let E = e < 0.8 ? M : Math.PI;
  for (let i = 0; i < 12; i++) {
    E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  return E;
}

/** 지금 행성 자리. 시간표 주기 안 시각 `u` 에서 평균 근점 이각을 얻는다 — 주기 끝에서 이음매 없이 이어진다. */
export function planetAt(tl: TimelineFrame, k: KeplersFirstLawConstants, g: EllipseGeometry): Vec2 {
  const M = k.meanAnomalyAtStart + (2 * Math.PI * k.orbitsPerCycle * tl.u) / tl.period;
  return pointAtEccentricAnomaly(solveKepler(M, k.eccentricity), g);
}

/** 두 점 사이 거리. */
export function distance(p: Vec2, q: Vec2): number {
  return Math.hypot(p[0] - q[0], p[1] - q[1]);
}

/** 궤도 타원 표본(닫힌 선). 타원 어휘가 없어 점으로 표본한다 (장부 G28). */
export function orbitPoints(g: EllipseGeometry, samples: number): Vec2[] {
  return Array.from({ length: samples }, (_, i) => pointAtEccentricAnomaly((i / samples) * 2 * Math.PI, g));
}

/** 상태 없음 — 항등. */
export function step(params: { state: KeplersFirstLawState }): KeplersFirstLawState {
  return params.state;
}
