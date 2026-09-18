// ========================================================================
// escape-velocity — 순수 물리
// ========================================================================
// 행성 표면(r = R)에서 곧장 바깥쪽으로 쏜 물체의 반지름 방향 운동. 무차원 단위로 푼다 —
// 길이는 행성 반지름 R, 시간은 √(R³/GM), 속도는 √(GM/R). 이 단위에서 GM = 1, R = 1,
// 탈출 속도 = √2 이다.
//
// 에너지 ε = v₀²/2 − 1 의 부호로 셋이 갈린다 (반지름 방향 케플러 해).
//   ε < 0  돌아온다   r = a(1 − cos E),   t = a^{3/2} (E − sin E) + 상수,   a = −1/(2ε)
//   ε = 0  문턱       r = (1 + 3t/√2)^{2/3}
//   ε > 0  떠난다     r = a(cosh F − 1),  t = a^{3/2} (sinh F − F) + 상수,   a = 1/(2ε)
// 모든 자리가 시각의 닫힌 식이라 쌓는 상태가 없다 — 같은 시각은 언제나 같은 화면이다.
//
// 「중력이 줄지 않는다면」 레인은 표면의 중력(무차원 1)이 높이와 무관하게 그대로인 던지기다.
//   h = v₀t − t²/2,  꼭대기 h = v₀²/2 — 속도의 제곱에 비례할 뿐 문턱이 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ARROW_PER_KMS,
  EXIT_AT,
  FLIGHT_SHARE,
  GM_KM3_S2,
  PLANET_RADIUS_KM,
  SPEED_1,
  SPEED_2,
  SPEED_3,
  SPEED_4,
  SPEED_5,
  WORLD_PER_RADIUS,
} from './schema';
import type { EscapeVelocityState } from './state';

export interface EscapeVelocityConstants {
  /** 행성의 GM(km³/s²). */
  gm: number;
  /** 행성 반지름(km). */
  planetRadius: number;
  /** 샷마다의 처음 속도(km/s). 시간표의 `shot1`~`shot5` 와 같은 순서다. */
  speeds: readonly number[];
  /** 월드 길이 per 행성 반지름. */
  worldPerRadius: number;
  /** 속도 화살표 배율(월드 per km/s). */
  arrowPerKms: number;
  /** 돌아오는 샷에서 비행이 차지하는 단계 몫. */
  flightShare: number;
  /** 돌아오지 않는 샷이 화면 끝을 벗어나는 단계 진행도. */
  exitAt: number;
}

export function readConstants(stage: StageDef): EscapeVelocityConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    gm: c.gm ?? GM_KM3_S2,
    planetRadius: c.planetRadius ?? PLANET_RADIUS_KM,
    speeds: [
      c.speed1 ?? SPEED_1,
      c.speed2 ?? SPEED_2,
      c.speed3 ?? SPEED_3,
      c.speed4 ?? SPEED_4,
      c.speed5 ?? SPEED_5,
    ],
    worldPerRadius: c.worldPerRadius ?? WORLD_PER_RADIUS,
    arrowPerKms: c.arrowPerKms ?? ARROW_PER_KMS,
    flightShare: c.flightShare ?? FLIGHT_SHARE,
    exitAt: c.exitAt ?? EXIT_AT,
  };
}

/**
 * 샷 단계 id. 스테이지 상수 `speed1`~`speed5` 와 한 줄씩 짝이다. 샷 수 5 가 코드에 있다 —
 * 목록을 선언할 자리가 없다 (장부 G105).
 */
export const SHOT_PHASES = ['shot1', 'shot2', 'shot3', 'shot4', 'shot5'] as const;

/** 무차원 속도 1 이 몇 km/s 인지 — √(GM/R). */
export function speedUnit(c: EscapeVelocityConstants): number {
  return Math.sqrt(c.gm / c.planetRadius);
}

/** 무차원 처음 속도. */
export function launchSpeed(c: EscapeVelocityConstants, kms: number): number {
  return kms / speedUnit(c);
}

// ------------------------------------------------------------------------
// 실제 중력 — 반지름 방향 케플러 운동
// ------------------------------------------------------------------------

/** 에너지가 이만큼 0 에 가까우면 문턱(포물선) 식을 쓴다. */
const THRESHOLD_EPS = 1e-9;
/** 이분법 반복 수. 2⁻⁶⁰ 이면 double 한계까지 좁혀진다. */
const BISECT_STEPS = 60;

export interface RadialReading {
  /** 중심에서의 거리(행성 반지름 단위, 표면 = 1). */
  r: number;
  /** 반지름 방향 속도(무차원, 바깥 +). */
  v: number;
  /** 이번 샷에서 지금까지 닿은 가장 먼 거리. 자취가 여기까지 선다. */
  reach: number;
  /** 꼭대기를 지났으면 그 거리, 아직이거나 돌아오지 않는 샷이면 null. */
  peak: number | null;
}

/** 단조 증가 함수 f 의 f(x) = y 를 [lo, hi] 에서 푼다. */
function solveIncreasing(f: (x: number) => number, y: number, lo: number, hi: number): number {
  let a = lo;
  let b = hi;
  for (let i = 0; i < BISECT_STEPS; i++) {
    const m = (a + b) / 2;
    if (f(m) < y) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

const keplerM = (e: number): number => e - Math.sin(e);
const keplerN = (f: number): number => Math.sinh(f) - f;

/** 돌아오는 샷의 총 비행 시간(무차원). 돌아오지 않으면 `Infinity`. */
export function flightTime(v0: number): number {
  const eps = (v0 * v0) / 2 - 1;
  if (eps >= -THRESHOLD_EPS) return Infinity;
  const a = -1 / (2 * eps);
  const e0 = Math.acos(1 - 1 / a);
  return Math.pow(a, 1.5) * (keplerM(2 * Math.PI - e0) - keplerM(e0));
}

/** 돌아오지 않는 샷이 거리 r 에 닿는 시각(무차원). */
export function timeToReach(v0: number, r: number): number {
  const eps = (v0 * v0) / 2 - 1;
  if (Math.abs(eps) <= THRESHOLD_EPS) return ((Math.pow(r, 1.5) - 1) * Math.SQRT2) / 3;
  const a = 1 / (2 * eps);
  const f0 = Math.acosh(1 + 1 / a);
  const f1 = Math.acosh(1 + r / a);
  return Math.pow(a, 1.5) * (keplerN(f1) - keplerN(f0));
}

/** 쏜 뒤 무차원 시각 s 의 자리 · 속도. 돌아온 뒤에는 표면에 멈춘다. */
export function realAt(v0: number, s: number): RadialReading {
  const eps = (v0 * v0) / 2 - 1;

  if (eps < -THRESHOLD_EPS) {
    const a = -1 / (2 * eps);
    const e0 = Math.acos(1 - 1 / a);
    const peakR = 2 * a;
    const scale = Math.pow(a, 1.5);
    const target = keplerM(e0) + s / scale;
    if (target >= keplerM(2 * Math.PI - e0)) return { r: 1, v: 0, reach: peakR, peak: peakR };
    const e = solveIncreasing(keplerM, target, e0, 2 * Math.PI - e0);
    const r = a * (1 - Math.cos(e));
    const speed = Math.sqrt(Math.max(0, 2 / r - 1 / a));
    const rising = e < Math.PI;
    return { r, v: rising ? speed : -speed, reach: rising ? r : peakR, peak: rising ? null : peakR };
  }

  if (eps <= THRESHOLD_EPS) {
    const r = Math.pow(1 + (3 * s) / Math.SQRT2, 2 / 3);
    return { r, v: Math.sqrt(2 / r), reach: r, peak: null };
  }

  const a = 1 / (2 * eps);
  const f0 = Math.acosh(1 + 1 / a);
  const scale = Math.pow(a, 1.5);
  const target = keplerN(f0) + s / scale;
  // 위쪽 끝을 넉넉히 넓힌 뒤 좁힌다.
  let hi = f0 + 1;
  while (keplerN(hi) < target) hi *= 2;
  const f = solveIncreasing(keplerN, target, f0, hi);
  const r = a * (Math.cosh(f) - 1);
  return { r, v: Math.sqrt(2 / r + 1 / a), reach: r, peak: null };
}

// ------------------------------------------------------------------------
// 중력이 줄지 않는다면 — 균일한 중력 속 던지기
// ------------------------------------------------------------------------

export interface UniformReading {
  /** 표면에서의 높이(행성 반지름 단위). */
  h: number;
  /** 위쪽 속도(무차원). */
  v: number;
  /** 꼭대기를 지났으면 그 높이, 아직이면 null. */
  peak: number | null;
}

export function uniformAt(v0: number, s: number): UniformReading {
  const peakH = (v0 * v0) / 2;
  if (s >= 2 * v0) return { h: 0, v: 0, peak: peakH };
  return { h: v0 * s - (s * s) / 2, v: v0 - s, peak: s >= v0 ? peakH : null };
}

// ------------------------------------------------------------------------
// 화면 시간 → 물리 시간
// ------------------------------------------------------------------------

/**
 * 샷 하나의 물리 시간 창(무차원). 단계 진행도 0~1 이 이 창에 대응한다.
 *
 * 돌아오는 샷은 비행이 단계의 `flightShare` 를 차지한다. 돌아오지 않는 샷은 단계 진행도
 * `exitAt` 에서 거리 `exitR` 에 닿는다 — 화면 오른쪽 끝을 벗어나는 순간이다.
 */
export function shotWindow(c: EscapeVelocityConstants, v0: number, exitR: number): number {
  const t = flightTime(v0);
  if (Number.isFinite(t)) return t / c.flightShare;
  return timeToReach(v0, exitR) / c.exitAt;
}

/**
 * 시간표에서 지금 쏘고 있는 샷과 그 샷의 진행도를 읽는다. `hold` · `fade` 동안은 마지막 샷이
 * 끝난 채(진행도 1)로 남는다. 단계 경계는 선언이 정한다 — `phase` · `at(id)` 로 읽는다.
 */
export function currentShot(tl: TimelineFrame): { index: number; progress: number } {
  const i = SHOT_PHASES.indexOf(tl.phase as (typeof SHOT_PHASES)[number]);
  if (i >= 0) return { index: i, progress: tl.at(tl.phase) };
  return { index: SHOT_PHASES.length - 1, progress: 1 };
}

/** 표지의 짙기 0~1. 마지막 단계에서 흐려지고 다음 주기에 새로 쌓인다. */
export function markOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: EscapeVelocityState }): EscapeVelocityState {
  return params.state;
}
