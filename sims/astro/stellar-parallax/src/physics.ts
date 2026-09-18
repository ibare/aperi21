// ========================================================================
// stellar-parallax — 순수 물리 · 배치 계산
// ========================================================================
// 지구는 태양 둘레 반지름 1 AU(그림에서 `ORBIT_R`)의 원을 돈다. 별 S 가 태양에서 거리 D 에
// 있을 때, 지구 E 에서 본 별의 방향은 S − E 의 방향이다. 배경 별은 무한히 멀어 어디서 보나
// 같은 방향이므로, 이 방향이 곧 배경 별 사이에서 별이 보이는 자리다.
//
// 연주시차 p 는 별에서 1 AU 가 보이는 각이다 — tan p = R / D. 그래서 별의 그림 거리를
// 선언된 p(″)에서 정한다: D = R / tan(p × 과장 배율). 두 배 먼 별은 p 가 절반이다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ANGLE_EXAGGERATION,
  BG_MARGIN_DEG,
  BG_R,
  BG_SPREAD,
  BG_STARS_PER_ARC,
  FAR_DIR_DEG,
  FAR_DISTANCE_PC,
  FAR_PARALLAX_ARCSEC,
  NEAR_DIR_DEG,
  NEAR_DISTANCE_PC,
  NEAR_PARALLAX_ARCSEC,
  ORBIT_R,
  SUN,
} from './schema';
import type { StellarParallaxState } from './state';

export const DEG = Math.PI / 180;
/** 1″ = 1/3600°. */
const ARCSEC = DEG / 3600;

export interface StellarParallaxConstants {
  nearDistancePc: number;
  nearParallaxArcsec: number;
  farDistancePc: number;
  farParallaxArcsec: number;
  angleExaggeration: number;
}

export function readConstants(stage: StageDef): StellarParallaxConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    nearDistancePc: c.nearDistancePc ?? NEAR_DISTANCE_PC,
    nearParallaxArcsec: c.nearParallaxArcsec ?? NEAR_PARALLAX_ARCSEC,
    farDistancePc: c.farDistancePc ?? FAR_DISTANCE_PC,
    farParallaxArcsec: c.farParallaxArcsec ?? FAR_PARALLAX_ARCSEC,
    angleExaggeration: c.angleExaggeration ?? ANGLE_EXAGGERATION,
  };
}

/** 두 단계 id — 첫 해(오가는 폭이 자람) → 둘째 해(각 p 를 매닮). */
export const YEARS = ['sweep', 'measure'] as const;

/** 지구가 돈 바퀴 수 0~2. 시간표 두 단계의 진행도 합이다. */
export function orbitTurns(tl: TimelineFrame): number {
  let sum = 0;
  for (const id of YEARS) sum += tl.at(id);
  return sum;
}

/**
 * 한 해의 시작 자리(라디안). 두 별 방향의 가운데에서 90° 뒤 — 두 별 모두 한쪽 끝 가까이에서
 * 출발해 반 년 뒤 반대쪽 끝에 이른다.
 */
export const EARTH_START = ((NEAR_DIR_DEG + FAR_DIR_DEG) / 2 - 90) * DEG;

/** 바퀴 수 → 지구의 각(라디안, 반시계). */
export function earthAngle(turns: number): number {
  return EARTH_START + 2 * Math.PI * turns;
}

export function onOrbit(a: number): Vec2 {
  return [SUN.x + ORBIT_R * Math.cos(a), SUN.y + ORBIT_R * Math.sin(a)];
}

/** 별 하나의 배치 — 방향(라디안) · 그림 거리 · 자리 · 그려지는 p(라디안). */
export interface StarGeom {
  readonly dir: number;
  readonly dist: number;
  readonly pos: Vec2;
  /** 그림 속 p(라디안) = 선언된 p(″) × 과장 배율. */
  readonly pDrawn: number;
}

/** 선언된 p(″)에서 별의 자리를 정한다 — tan p = R / D. */
export function starGeom(parallaxArcsec: number, dirDeg: number, exaggeration: number): StarGeom {
  const pDrawn = parallaxArcsec * ARCSEC * exaggeration;
  const dist = ORBIT_R / Math.tan(pDrawn);
  const dir = dirDeg * DEG;
  return { dir, dist, pos: [SUN.x + dist * Math.cos(dir), SUN.y + dist * Math.sin(dir)], pDrawn };
}

export function nearStar(c: StellarParallaxConstants): StarGeom {
  return starGeom(c.nearParallaxArcsec, NEAR_DIR_DEG, c.angleExaggeration);
}

export function farStar(c: StellarParallaxConstants): StarGeom {
  return starGeom(c.farParallaxArcsec, FAR_DIR_DEG, c.angleExaggeration);
}

/** 각(라디안)을 (−π, π] 로 감는다. */
export function wrap(a: number): number {
  const w = a - 2 * Math.PI * Math.round(a / (2 * Math.PI));
  return w <= -Math.PI ? w + 2 * Math.PI : w;
}

/**
 * 지구 각 a 에서 본 별의 방향이 태양에서 본 방향(`dir`)에서 어긋난 각(라디안).
 * 배경 별 사이에서 별이 보이는 자리의 어긋남이다.
 */
export function apparentOffset(s: StarGeom, a: number): number {
  const e = onOrbit(a);
  const ang = Math.atan2(s.pos[1] - e[1], s.pos[0] - e[0]);
  return wrap(ang - s.dir);
}

/** 한 해 동안 어긋남의 끝 — 시선이 궤도에 접할 때 sin δ = R / D. */
export function fullSwing(s: StarGeom): number {
  return Math.asin(ORBIT_R / s.dist);
}

/** 첫 해 동안 지금까지 쓸고 지나간 어긋남의 범위 [최소, 최대](라디안). 표본을 모은다. */
export function sweptRange(s: StarGeom, turns: number, samples: number): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  const n = Math.max(1, Math.ceil(samples * Math.min(1, turns)));
  for (let k = 0; k <= n; k++) {
    const d = apparentOffset(s, earthAngle((Math.min(1, turns) * k) / n));
    lo = Math.min(lo, d);
    hi = Math.max(hi, d);
  }
  return [lo, hi];
}

/** 별에서 1 AU 가 수직으로 보이는 궤도 위 자리 — p 를 재는 곳. 별 방향에서 90° 앞. */
export function perpendicularEarth(s: StarGeom): Vec2 {
  return onOrbit(s.dir + Math.PI / 2);
}

/** 별 중심 배경 원호 위, 방향 dir + off 의 점. */
export function onBackground(s: StarGeom, off: number, r: number = BG_R): Vec2 {
  const a = s.dir + off;
  return [s.pos[0] + r * Math.cos(a), s.pos[1] + r * Math.sin(a)];
}

/** 원호가 덮는 반폭(라디안) — 한 해 흔들림 끝 + 여유. */
export function arcHalf(s: StarGeom): number {
  return fullSwing(s) + BG_MARGIN_DEG * DEG;
}

/** 시드를 받는 결정적 난수 (mulberry32). `Math.random` 을 쓰지 않는다 — 같은 시드는 같은 별. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** 흩뿌린 배경 별 하나 — 원호 위 자리 u(−1~1, 반폭 기준) · 반지름 어긋남(−1~1) · 밝기(0~1). */
export interface BackgroundStar {
  readonly u: number;
  readonly v: number;
  readonly bright: number;
}

/** 원호 둘에 흩뿌릴 배경 별. 시드가 같으면 언제나 같다. */
export function scatterBackground(seed: number): [BackgroundStar[], BackgroundStar[]] {
  const rnd = mulberry32(seed);
  const arc = (): BackgroundStar[] => {
    const out: BackgroundStar[] = [];
    for (let k = 0; k < BG_STARS_PER_ARC; k++) {
      out.push({ u: rnd() * 2 - 1, v: rnd() * 2 - 1, bright: rnd() });
    }
    return out;
  };
  return [arc(), arc()];
}

/** 배경 별 하나의 월드 자리. */
export function backgroundStarPos(s: StarGeom, b: BackgroundStar): Vec2 {
  return onBackground(s, b.u * arcHalf(s), BG_R + b.v * BG_SPREAD);
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: StellarParallaxState }): StellarParallaxState {
  return params.state;
}
