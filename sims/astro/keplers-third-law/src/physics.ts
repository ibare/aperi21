// ========================================================================
// keplers-third-law — 순수 물리
// ========================================================================
// 원 궤도 둘. 원 궤도의 긴반지름은 반지름이다.
//
//   바깥 주기 T_out = end('half')        (시간표가 정한다)
//   안쪽 주기 T_in  = T_out ÷ periodRatio (스테이지 상수)
//   각 θ = 2π · t / T                      (반시계, 출발선 = +x)
//
// 「안쪽과 같은 빠르기라면」 유령은 바깥 궤도 위를 안쪽 행성의 빠르기(2π·a / T_in)로 돈다.
// 둘레가 radiusRatio 배라 한 바퀴에 radiusRatio × T_in 이 걸린다 — 실제 바깥 주기보다 짧다.
// 그 차이가 「바깥 행성은 더 느리게 간다」 이다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { OUTER_RADIUS, PERIOD_RATIO, RADIUS_RATIO } from './schema';
import type { KeplersThirdLawState } from './state';

export interface KeplersThirdLawConstants {
  /** 바깥 반지름 ÷ 안쪽 반지름. */
  radiusRatio: number;
  /** 바깥 주기 ÷ 안쪽 주기. */
  periodRatio: number;
  /** 바깥 궤도 반지름(월드). */
  outerRadius: number;
}

export function readConstants(stage: StageDef): KeplersThirdLawConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    radiusRatio: c.radiusRatio ?? RADIUS_RATIO,
    periodRatio: c.periodRatio ?? PERIOD_RATIO,
    outerRadius: c.outerRadius ?? OUTER_RADIUS,
  };
}

/** 안쪽 궤도 반지름(월드). */
export function innerRadius(c: KeplersThirdLawConstants): number {
  return c.outerRadius / c.radiusRatio;
}

/** 바깥 주기(초) — `half` 가 끝나는 순간 바깥 행성이 한 바퀴를 마친다. */
export function outerPeriod(tl: TimelineFrame): number {
  return tl.end('half');
}

/** 안쪽 주기(초). */
export function innerPeriod(tl: TimelineFrame, c: KeplersThirdLawConstants): number {
  return outerPeriod(tl) / c.periodRatio;
}

/** 유령(안쪽 빠르기로 바깥 궤도를 도는 것)이 한 바퀴에 걸리는 시간(초). */
export function ghostPeriod(tl: TimelineFrame, c: KeplersThirdLawConstants): number {
  return innerPeriod(tl, c) * c.radiusRatio;
}

/**
 * 움직임의 시계(초). 바깥 행성이 한 바퀴를 마치면 멈춘다 — `hold` · `fade` 동안 두 행성은
 * 출발선에 서 있고, 다음 주기가 출발선에서 다시 떠난다.
 */
export function motionTime(tl: TimelineFrame): number {
  return Math.min(tl.u, outerPeriod(tl));
}

/** 반지름 r 인 원 위, 각 θ 의 자리. */
export function onCircle(r: number, theta: number): Vec2 {
  return [r * Math.cos(theta), r * Math.sin(theta)];
}

export interface OrbitReading {
  /** 안쪽 행성의 각(rad, 누적). */
  innerAngle: number;
  /** 바깥 행성의 각(rad, 0 ~ 2π). */
  outerAngle: number;
  /** 유령의 각(rad, 0 ~ 2π). 한 바퀴를 마치면 출발선에 멈춘다. */
  ghostAngle: number;
  /** 유령이 한 바퀴를 마쳤는가. */
  ghostDone: boolean;
  /** 안쪽 행성이 마친 바퀴 수(정수). */
  innerLaps: number;
  /** 안쪽 행성의 지금 바퀴 진행도 0~1. */
  innerLapProgress: number;
  /** 바깥 행성의 한 바퀴 진행도 0~1. */
  outerProgress: number;
  /** 유령의 한 바퀴 진행도 0~1. */
  ghostProgress: number;
}

/** 경계에서 부동소수 때문에 7.9999… 바퀴로 읽히지 않게 하는 허용치. */
const LAP_EPS = 1e-9;

export function readOrbits(tl: TimelineFrame, c: KeplersThirdLawConstants): OrbitReading {
  const t = motionTime(tl);
  const tIn = innerPeriod(tl, c);
  const tOut = outerPeriod(tl);
  const tGhost = ghostPeriod(tl, c);

  const laps = t / tIn;
  const innerLaps = Math.min(Math.floor(laps + LAP_EPS), Math.ceil(c.periodRatio - LAP_EPS));
  const outerProgress = Math.min(1, t / tOut);
  const ghostProgress = Math.min(1, t / tGhost);

  return {
    innerAngle: 2 * Math.PI * laps,
    outerAngle: 2 * Math.PI * outerProgress,
    ghostAngle: 2 * Math.PI * ghostProgress,
    ghostDone: ghostProgress >= 1 - LAP_EPS,
    innerLaps,
    innerLapProgress: Math.max(0, laps - innerLaps),
    outerProgress,
    ghostProgress,
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: KeplersThirdLawState }): KeplersThirdLawState {
  return params.state;
}
