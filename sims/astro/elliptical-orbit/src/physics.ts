// ========================================================================
// elliptical-orbit — 순수 물리
// ========================================================================
// 중심 천체를 원점에 고정하고 긴반지름 a 를 그대로 둔 채 이심률 e 만 바꾼다.
//   가운데 = (a e, 0), 빈 초점 = (2 a e, 0), 근점 = (−a(1 − e), 0), 원점 = (a(1 + e), 0).
//   e = 0 이면 두 초점이 원점에 겹치고 궤도는 반지름 a 의 원이다.
// 행성은 케플러 운동으로 돈다 — 평균 근점 이각 M = M₀ + 2π · (바퀴 수) · u / (시간표 주기).
// 주기는 a 만의 함수라 e 가 바뀌어도 같은 M 시계를 쓴다. 원 위의 유령 점도 같은 M 으로 돈다.
// 모든 것이 시각의 함수라 상태를 쌓지 않는다 — 같은 시각은 언제나 같은 자리다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ECCENTRICITY_1,
  ECCENTRICITY_2,
  ECCENTRICITY_3,
  MEAN_ANOMALY_AT_START,
  ORBITS_PER_CYCLE,
  SEMI_MAJOR,
} from './schema';
import type { EllipticalOrbitState } from './state';

/** 원 궤도의 이심률. 두 초점이 겹친다는 정의 그 자체라 저작 상수가 아니다. */
export const CIRCLE_ECCENTRICITY = 0;

export interface EllipticalOrbitConstants {
  /** 긴반지름 a(월드). */
  semiMajor: number;
  /** 첫째 · 둘째 · 셋째 정박 이심률 (0 ≤ e < 1). */
  eccentricity1: number;
  eccentricity2: number;
  eccentricity3: number;
  /** 한 주기(시간표) 동안의 바퀴 수. */
  orbitsPerCycle: number;
  /** 주기 시작의 평균 근점 이각(라디안). */
  meanAnomalyAtStart: number;
}

export function readConstants(stage: StageDef): EllipticalOrbitConstants {
  const c = stage.constants ?? {};
  return {
    semiMajor: c.semiMajor ?? SEMI_MAJOR,
    eccentricity1: c.eccentricity1 ?? ECCENTRICITY_1,
    eccentricity2: c.eccentricity2 ?? ECCENTRICITY_2,
    eccentricity3: c.eccentricity3 ?? ECCENTRICITY_3,
    orbitsPerCycle: c.orbitsPerCycle ?? ORBITS_PER_CYCLE,
    meanAnomalyAtStart: c.meanAnomalyAtStart ?? MEAN_ANOMALY_AT_START,
  };
}

/**
 * 지금 이심률. 단계 진행도의 합이다 — 원에서 출발해 `spreadN` 마다 다음 정박값으로 벌어지고,
 * `close` 에서 원으로 되돌아온다. 단계 경계 상수로 가르지 않는다 (S-piece).
 */
export function eccentricityAt(tl: TimelineFrame, k: EllipticalOrbitConstants): number {
  return (
    CIRCLE_ECCENTRICITY +
    (k.eccentricity1 - CIRCLE_ECCENTRICITY) * tl.at('spread1') +
    (k.eccentricity2 - k.eccentricity1) * tl.at('spread2') +
    (k.eccentricity3 - k.eccentricity2) * tl.at('spread3') +
    (CIRCLE_ECCENTRICITY - k.eccentricity3) * tl.at('close')
  );
}

/** 궤도의 모양 — 중심 천체는 늘 원점, 나머지는 e 를 따라 오른쪽으로 벌어진다. */
export interface OrbitGeometry {
  a: number;
  b: number;
  e: number;
  center: Vec2;
  sun: Vec2;
  emptyFocus: Vec2;
  periapsis: Vec2;
  apoapsis: Vec2;
}

export function orbitGeometry(a: number, e: number): OrbitGeometry {
  const focal = a * e;
  return {
    a,
    b: a * Math.sqrt(1 - e * e),
    e,
    center: [focal, 0],
    sun: [0, 0],
    emptyFocus: [2 * focal, 0],
    periapsis: [focal - a, 0],
    apoapsis: [focal + a, 0],
  };
}

/** 이심 근점 이각 E 의 궤도 위 자리. E = 0 이 근점(왼쪽 꼭짓점)이고 반시계로 돈다. */
export function pointAtEccentricAnomaly(E: number, g: OrbitGeometry): Vec2 {
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

/** 지금 평균 근점 이각. 한 주기에 정수 바퀴라 주기 끝에서 이음매 없이 이어진다 (장부 G129). */
export function meanAnomalyAt(tl: TimelineFrame, k: EllipticalOrbitConstants): number {
  return k.meanAnomalyAtStart + (2 * Math.PI * k.orbitsPerCycle * tl.u) / tl.period;
}

/** 평균 근점 이각 M 에서 그 궤도 위 행성 자리. */
export function bodyAt(M: number, g: OrbitGeometry): Vec2 {
  return pointAtEccentricAnomaly(solveKepler(M, g.e), g);
}

/** 궤도 표본(닫힌 선). 타원 어휘가 없어 점으로 표본한다 (장부 G28). */
export function orbitPoints(g: OrbitGeometry, samples: number): Vec2[] {
  return Array.from({ length: samples }, (_, i) => pointAtEccentricAnomaly((i / samples) * 2 * Math.PI, g));
}

/** 상태 없음 — 항등. */
export function step(params: { state: EllipticalOrbitState }): EllipticalOrbitState {
  return params.state;
}
