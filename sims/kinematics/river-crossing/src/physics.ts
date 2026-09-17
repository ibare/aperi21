// ========================================================================
// river-crossing — 순수 물리
// ========================================================================
// 배는 물에 대해 뱃머리 방향으로 3 m/s, 물은 +x 로 1.5 m/s. 강둑에서 본 배의
// 위치는 둘의 합이다 — 물에 대한 배(흐린 배) + 물살이 옮긴 거리(떠밀린 거리).
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';

import {
  BOAT_SPEED,
  FLOW_SPEED,
  HOLD,
  ON_TARGET_EPS,
  PLAYBACK,
  RIVER_WIDTH,
  STREAK_COUNT,
  STREAK_OVERHANG_PX,
  STREAK_SEED,
} from './schema';
import type { RiverCrossingState } from './state';

// ------------------------------------------------------------------------
// 건너기
// ------------------------------------------------------------------------

export interface Crossing {
  /** 뱃머리 각(라디안). 0 = 건너편, + 하류 쪽. */
  readonly th: number;
  /** 강둑에서 본 속도의 물살 방향 성분(m/s). */
  readonly vx: number;
  /** 건너는 성분(m/s). */
  readonly vy: number;
  /** 건너는 데 걸리는 물리 시간(s). */
  readonly T: number;
  /** 맞은편에서 벗어난 거리(m). + 하류. */
  readonly drift: number;
}

export function crossing(deg: number): Crossing {
  const th = (deg * Math.PI) / 180;
  const vx = FLOW_SPEED + BOAT_SPEED * Math.sin(th);
  const vy = BOAT_SPEED * Math.cos(th);
  const T = RIVER_WIDTH / vy;
  return { th, vx, vy, T, drift: vx * T };
}

export interface CrossingPose {
  /** 물에 대한 배(흐린 배)의 위치(m). */
  readonly ghost: readonly [number, number];
  /** 강둑에서 본 배의 위치(m). */
  readonly boat: readonly [number, number];
  /** 물살이 옮긴 거리(m). */
  readonly pushed: number;
}

/** 물리 경과 시간 `simT` 에서의 두 배. */
export function poseAt(c: Crossing, simT: number): CrossingPose {
  const gx = BOAT_SPEED * Math.sin(c.th) * simT;
  const gy = BOAT_SPEED * Math.cos(c.th) * simT;
  const pushed = FLOW_SPEED * simT;
  return { ghost: [gx, gy], boat: [gx + pushed, gy], pushed };
}

// ------------------------------------------------------------------------
// 물살 줄무늬 — 시드에서 나온다
// ------------------------------------------------------------------------
//
// 같은 시각이 언제나 같은 화면이어야 하므로 난수는 시드를 받는다 (S-sim).
// 생성기와 뽑는 순서를 원본 하네스(`piece-kit.js` 의 mulberry32, 시드 1)와
// 똑같이 두어 줄무늬 자리가 원본과 같다.

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

/** 줄무늬 하나. 원본 단위(px) 그대로 둔다 — scene 이 월드로 옮긴다. */
export interface Streak {
  /** 되감기 폭 안의 처음 자리 0~1. */
  readonly x0: number;
  /** 원본 화면 y(px). */
  readonly yPx: number;
  /** 원본 길이(px). */
  readonly lenPx: number;
}

export function streaks(seed: number): Streak[] {
  const rnd = mulberry32(seed);
  const out: Streak[] = [];
  // 원본: RIVER_TOP(30) + 8 + r · (220 − 16)
  for (let i = 0; i < STREAK_COUNT; i++) {
    const x0 = rnd();
    const yPx = 30 + 8 + rnd() * (220 - 16);
    const lenPx = 10 + rnd() * 16;
    out.push({ x0, yPx, lenPx });
  }
  return out;
}

/** 줄무늬 46개. 한 번 뽑고 계속 쓴다. */
export const STREAKS: readonly Streak[] = streaks(STREAK_SEED);

/**
 * 시각 `t`(원본 시계, 초)에서 줄무늬의 원본 화면 x(px).
 * 원본: `((x0·span + shift) % span) − 30`, `shift = 1.5·4·PX·t`.
 */
export function streakXPx(s: Streak, t: number, spanPx: number, pxPerM: number, playback: number): number {
  const shift = FLOW_SPEED * playback * pxPerM * t;
  // 시계가 음수여도(앞당김 이전) 되감기 폭 안에 들도록 양의 나머지를 쓴다.
  const wrapped = (((s.x0 * spanPx + shift) % spanPx) + spanPx) % spanPx;
  return wrapped - STREAK_OVERHANG_PX;
}

// ------------------------------------------------------------------------
// step
// ------------------------------------------------------------------------

/** 이번 건너기에서 배가 건넌 물리 시간(s). 도착하면 건너는 시간에 멈춘다. */
export function simTime(c: Crossing, tau: number): number {
  return Math.min(tau, c.T / PLAYBACK) * PLAYBACK;
}

export function step(params: {
  state: RiverCrossingState;
  dt: number;
  stage?: StageDef;
  environments?: EnvironmentDef[];
}): RiverCrossingState {
  const s = params.state;
  const c = crossing(s.headingDeg);
  const screenT = c.T / PLAYBACK;

  // 뱃머리를 바꾸면 처음부터 다시 건넌다 (원본 슬라이더 입력).
  let tau = s.headingDeg !== s.prevHeadingDeg ? 0 : s.tau;
  tau += params.dt;
  // 건너고, HOLD 만큼 머문 뒤 처음부터.
  if (tau >= screenT + HOLD) tau = 0;

  const arrived = tau >= screenT;
  const onTarget = Math.abs(c.drift) < ON_TARGET_EPS;
  return {
    headingDeg: s.headingDeg,
    prevHeadingDeg: s.headingDeg,
    tau,
    flowT: s.flowT + params.dt,
    driftText: Math.abs(c.drift).toFixed(1),
    arrivedOpposite: arrived && onTarget,
    arrivedUpstream: arrived && !onTarget && c.drift < 0,
    arrivedDownstream: arrived && !onTarget && c.drift > 0,
    crossingTilted: !arrived && s.headingDeg !== 0,
  };
}
