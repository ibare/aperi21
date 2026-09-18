// ========================================================================
// diurnal-motion — 순수 물리 · 배치 계산
// ========================================================================
// 하늘은 천구의 북극을 축으로 한 시간에 `degPerHour` 도씩 돈다. 별 하나는
// 북극에서 떨어진 각 p(= 90° − 적위)와 시간각 H 로 정해지고, 시간이 흐르면 H 만 는다.
//
// 투영은 **천구의 북극을 가운데 둔 방위 등거리 투영**이다 — 북극에서 p 만큼 떨어진
// 별을 원점에서 p 만큼, 시간각 방향으로 놓는다. 이 투영에서는 하늘의 회전이 평면의
// 강체 회전 그대로라, 별의 길이 북극을 가운데 둔 동심원이 되고 별자리가 모양을
// 지닌 채 돈다. 대가로 지평선은 곧은 선이 아니라 양옆이 조금 올라간 곡선이 된다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  DAY_HOURS,
  DEG_PER_HOUR,
  LATITUDE_DEG,
  START_SIDEREAL_HOURS,
  STAR_COUNT,
  STAR_MAX_POLAR_DEG,
  STAR_SEED,
  SWEEP_PHASES,
  type CatalogStar,
} from './schema';
import type { DiurnalMotionState } from './state';

const DEG = Math.PI / 180;

/** 목록 별 점 반지름(화면 px) — 0 등급일 때의 크기. */
const MAG_SIZE_BASE_PX = 3.6;
/** 목록 별 점 반지름이 등급 하나에 줄어드는 양(화면 px). */
const MAG_SIZE_PER_MAG_PX = 0.55;
/** 점 반지름의 하한(화면 px). */
const MIN_STAR_SIZE_PX = 1;
/** 배경 별 점 반지름(화면 px) — 가장 작은 크기. */
const BG_STAR_SIZE_MIN_PX = 0.9;
/** 배경 별 점 반지름의 폭(화면 px) — 난수 세제곱에 곱해 큰 별을 드물게 한다. */
const BG_STAR_SIZE_SPAN_PX = 1.5;

export interface DiurnalMotionConstants {
  /** 관측 위도(도). */
  latitude: number;
  /** 하늘이 한 시간에 도는 각(도). */
  degPerHour: number;
  /** 빨리 감는 길이(시간). */
  dayHours: number;
  /** 시작 항성시(시). */
  startSiderealHours: number;
  starSeed: number;
  starCount: number;
  starMaxPolarDeg: number;
}

export function readConstants(stage: StageDef): DiurnalMotionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    latitude: c.latitude ?? LATITUDE_DEG,
    degPerHour: c.degPerHour ?? DEG_PER_HOUR,
    dayHours: c.dayHours ?? DAY_HOURS,
    startSiderealHours: c.startSiderealHours ?? START_SIDEREAL_HOURS,
    starSeed: c.starSeed ?? STAR_SEED,
    starCount: Math.max(0, Math.round(c.starCount ?? STAR_COUNT)),
    starMaxPolarDeg: c.starMaxPolarDeg ?? STAR_MAX_POLAR_DEG,
  };
}

/**
 * 흐른 시간(시). 빨리 감는 토막들의 진행도를 토막 길이로 가중해 더한다 — 저작자가 한 토막을
 * 늘이면 그 토막 동안 천천히 감긴다. 빨리 감기가 끝난 뒤(`full` · `reset`)는 하루 그대로다.
 */
export function elapsedHours(tl: TimelineFrame, c: DiurnalMotionConstants): number {
  let done = 0;
  let total = 0;
  for (const id of SWEEP_PHASES) {
    const d = tl.duration(id);
    done += tl.at(id) * d;
    total += d;
  }
  return total > 0 ? (c.dayHours * done) / total : 0;
}

/** 흐른 시간만큼 하늘이 돈 각(라디안). */
export function turnAngle(hours: number, c: DiurnalMotionConstants): number {
  return hours * c.degPerHour * DEG;
}

// ------------------------------------------------------------------------
// 별
// ------------------------------------------------------------------------

/** 하늘 위의 별 — 북극에서 떨어진 각 p(도), 시작 시간각 h0(라디안), 점 크기(화면 px). */
export interface SkyStar {
  readonly p: number;
  readonly h0: number;
  readonly size: number;
}

/** 겉보기 등급 → 점 반지름(화면 px). 밝을수록 크다. 표지일 뿐 밝기의 양을 주장하지 않는다. */
export function sizeForMagnitude(mag: number): number {
  return Math.max(MIN_STAR_SIZE_PX, MAG_SIZE_BASE_PX - MAG_SIZE_PER_MAG_PX * mag);
}

/** 목록의 별(적경 · 적위)을 시작 항성시의 하늘 별로. */
export function catalogToSky(s: CatalogStar, c: DiurnalMotionConstants): SkyStar {
  return {
    p: 90 - s.dec,
    h0: (c.startSiderealHours - s.ra) * c.degPerHour * DEG,
    size: sizeForMagnitude(s.mag),
  };
}

/** 시드 난수 — mulberry32. 같은 시드는 언제나 같은 별 무리를 낸다 (S-sim). */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 북극에서 이 각(도) 안쪽에는 배경 별을 두지 않는다 — 북극성 자리를 비운다. */
const POLE_CLEAR_DEG = 4;

/**
 * 흩뿌린 배경 별. 천구 위에 고르게(면적 기준 — cos p 가 고르게) 뿌리고, 어두운 별이 많게 크기를 뽑는다.
 */
export function backgroundStars(c: DiurnalMotionConstants): SkyStar[] {
  const random = mulberry32(c.starSeed);
  const cosMin = Math.cos(c.starMaxPolarDeg * DEG);
  const cosMax = Math.cos(POLE_CLEAR_DEG * DEG);
  const out: SkyStar[] = [];
  for (let i = 0; i < c.starCount; i++) {
    const cp = cosMin + (cosMax - cosMin) * random();
    const h0 = random() * 2 * Math.PI;
    const r = random();
    out.push({ p: Math.acos(cp) / DEG, h0, size: BG_STAR_SIZE_MIN_PX + BG_STAR_SIZE_SPAN_PX * r * r * r });
  }
  return out;
}

/**
 * 시간각 H(라디안)의 별을 화면 평면으로. 북쪽을 바라보는 관측자에게 동쪽이 오른쪽이다 —
 * 남중(H = 0)이 북극 위, 떠오르는 쪽(H < 0)이 오른쪽. H 가 늘면 시계 반대 방향으로 돈다.
 */
export function skyPoint(p: number, h: number): Vec2 {
  return [-p * Math.sin(h), p * Math.cos(h)];
}

/** 별의 지금 자리 — 시작 시간각에서 하늘이 돈 각만큼. */
export function starAt(s: SkyStar, turn: number): Vec2 {
  return skyPoint(s.p, s.h0 + turn);
}

/** 별이 지나온 길 — 시작 자리에서 지금 자리까지의 원호. */
export function trailOf(s: SkyStar, turn: number, stepDeg: number): Vec2[] {
  const n = Math.max(1, Math.ceil(turn / (stepDeg * DEG)));
  const pts: Vec2[] = [];
  for (let k = 0; k <= n; k++) pts.push(skyPoint(s.p, s.h0 + (turn * k) / n));
  return pts;
}

/**
 * 지평선 — 고도 0 인 자리. 위도 φ 에서 북극에서 p, 시간각 H 인 점의 고도가 0 이려면
 * sin φ cos p + cos φ sin p cos H = 0, 곧 tan p = tan φ / (−cos H) (북극 아래쪽, cos H < 0).
 * 왼쪽(서)에서 오른쪽(동)으로 표본한다.
 */
export function horizonCurve(c: DiurnalMotionConstants, stepDeg: number): Vec2[] {
  const tanPhi = Math.tan(c.latitude * DEG);
  const pts: Vec2[] = [];
  for (let hd = 90 + stepDeg / 2; hd < 270; hd += stepDeg) {
    const h = hd * DEG;
    const p = Math.atan(tanPhi / -Math.cos(h)) / DEG;
    pts.push(skyPoint(p, h));
  }
  return pts;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: DiurnalMotionState }): DiurnalMotionState {
  return params.state;
}
