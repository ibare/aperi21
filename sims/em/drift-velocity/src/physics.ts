// ========================================================================
// drift-velocity — 순수 물리 · 배치 계산
// ========================================================================
// 도선 속 전자는 고리를 따라 고르게 놓여 있다. 한 전자의 자리는
//
//   고리 위 자리 s = 번호 × 간격 + 표류 거리 D(t)      (고리 둘레로 감는다)
//   화면 자리     = s 의 점 + 열운동 흔들림(시드, 번호, 시각)
//
// 표류 거리 D 는 스위치가 닫혀 있던 시간의 누적 × 표류 속력이다 — 닫힌 동안에만 늘고,
// **모든 전자에 같은 값**이다. 그래서 스위치를 닫는 순간 도선 곳곳의 전자가 한꺼번에
// 밀리기 시작하고, 여는 순간 한꺼번에 멈춘다. 주기 번호 × 한 주기의 닫힌 시간을 더해
// 주기 경계에서 튀지 않는다.
//
// 모든 것이 시각의 함수다. 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  CARRIER_SPACING,
  DRIFT_EXAGGERATION,
  DRIFT_MM_PER_S,
  LOOP_BOTTOM,
  LOOP_LEFT,
  LOOP_RIGHT,
  LOOP_TOP,
  SEED,
  THERMAL_AMPLITUDE,
  THERMAL_RATE,
  TRAIL_SECONDS,
  WORLD_MM,
} from './schema';
import type { DriftVelocityState } from './state';

// ------------------------------------------------------------------------
// 상수
// ------------------------------------------------------------------------

export interface DriftVelocityConstants {
  /** 표류 속력의 정박값(mm/s) — 이름표가 그대로 쓴다. */
  driftMmPerS: number;
  /** 월드 한 단위의 길이(mm). */
  worldMm: number;
  /** 표류 과장 배율. */
  driftExaggeration: number;
  /** 화면에서의 표류 속력(월드/초) = driftMmPerS × driftExaggeration / worldMm. */
  driftSpeed: number;
  thermalAmplitude: number;
  thermalRate: number;
  carrierSpacing: number;
  trailSeconds: number;
  seed: number;
}

export function readConstants(stage: StageDef): DriftVelocityConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const driftMmPerS = c.driftMmPerS ?? DRIFT_MM_PER_S;
  const worldMm = c.worldMm ?? WORLD_MM;
  const driftExaggeration = c.driftExaggeration ?? DRIFT_EXAGGERATION;
  return {
    driftMmPerS,
    worldMm,
    driftExaggeration,
    driftSpeed: (driftMmPerS * driftExaggeration) / worldMm,
    thermalAmplitude: c.thermalAmplitude ?? THERMAL_AMPLITUDE,
    thermalRate: c.thermalRate ?? THERMAL_RATE,
    carrierSpacing: c.carrierSpacing ?? CARRIER_SPACING,
    trailSeconds: c.trailSeconds ?? TRAIL_SECONDS,
    seed: c.seed ?? SEED,
  };
}

// ------------------------------------------------------------------------
// 고리 — 전자가 도는 방향으로 적는다
// ------------------------------------------------------------------------

/** 고리의 꼭짓점. 왼쪽 위에서 시작해 왼쪽 변을 내려가고, 아래 변 → 오른쪽 변 → 위 변. */
export const LOOP_PATH: readonly Vec2[] = [
  [LOOP_LEFT, LOOP_TOP],
  [LOOP_LEFT, LOOP_BOTTOM],
  [LOOP_RIGHT, LOOP_BOTTOM],
  [LOOP_RIGHT, LOOP_TOP],
  [LOOP_LEFT, LOOP_TOP],
];

const SIDE_LEFT = LOOP_TOP - LOOP_BOTTOM;
const SIDE_BOTTOM = LOOP_RIGHT - LOOP_LEFT;

/** 고리 둘레(월드). */
export const LOOP_LENGTH = 2 * (SIDE_LEFT + SIDE_BOTTOM);

/** 왼쪽 변의 높이 y → 고리 위 자리. */
export function sOnLeft(y: number): number {
  return LOOP_TOP - y;
}
/** 아래 변의 x → 고리 위 자리. */
export function sOnBottom(x: number): number {
  return SIDE_LEFT + (x - LOOP_LEFT);
}
/** 오른쪽 변의 높이 y → 고리 위 자리. */
export function sOnRight(y: number): number {
  return SIDE_LEFT + SIDE_BOTTOM + (y - LOOP_BOTTOM);
}

/** 고리 위 자리를 둘레 안으로 감는다. */
export function wrap(s: number): number {
  const r = s % LOOP_LENGTH;
  return r < 0 ? r + LOOP_LENGTH : r;
}

export interface PathPoint {
  pos: Vec2;
  /** 진행 방향(단위). */
  dir: Vec2;
  /** 고리 안쪽을 향하는 법선(단위). */
  inward: Vec2;
}

/** 고리 위 자리 s 의 점 · 방향. */
export function pointAt(s: number): PathPoint {
  let rest = wrap(s);
  for (let k = 0; k < LOOP_PATH.length - 1; k++) {
    const a = LOOP_PATH[k]!;
    const b = LOOP_PATH[k + 1]!;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (rest <= len || k === LOOP_PATH.length - 2) {
      const dir: Vec2 = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
      const f = Math.min(rest, len);
      return { pos: [a[0] + dir[0] * f, a[1] + dir[1] * f], dir, inward: [-dir[1], dir[0]] };
    }
    rest -= len;
  }
  throw new Error('drift-velocity: 고리 경로가 비었다');
}

/** 고리 위 구간 [a, b] (a < b, 둘레 안) 을 꺾은선으로. 모서리를 그대로 담는다. */
export function subPath(a: number, b: number): Vec2[] {
  const pts: Vec2[] = [pointAt(a).pos];
  let acc = 0;
  for (let k = 0; k < LOOP_PATH.length - 1; k++) {
    const p = LOOP_PATH[k]!;
    const q = LOOP_PATH[k + 1]!;
    acc += Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (acc > a && acc < b) pts.push(q);
  }
  pts.push(pointAt(b).pos);
  return pts;
}

/** 고리에서 빼낼 구간들을 뺀 나머지 구간 목록. 빼낼 구간은 둘레 안에서 겹치지 않는다. */
export function arcsWithout(cuts: readonly (readonly [number, number])[]): [number, number][] {
  const sorted = [...cuts].sort((p, q) => p[0] - q[0]);
  const out: [number, number][] = [];
  let from = 0;
  for (const [a, b] of sorted) {
    if (a > from) out.push([from, a]);
    from = Math.max(from, b);
  }
  if (from < LOOP_LENGTH) out.push([from, LOOP_LENGTH]);
  return out;
}

// ------------------------------------------------------------------------
// 스위치 · 표류 — 시간표의 두 경계(닫힘 단계의 끝 · 열림 단계의 시작)를 읽는다
// ------------------------------------------------------------------------

/** 전류가 흐르고 있는가 — 레버가 닿은 순간부터 들리기 시작하는 순간까지. */
export function isClosed(tl: TimelineFrame): boolean {
  return tl.u >= tl.end('close') && tl.u < tl.start('release');
}

/** 레버가 벌어진 정도 0~1. 닫힘 단계에서 내려오고 열림 단계에서 들린다. */
export function switchOpenness(tl: TimelineFrame): number {
  return 1 - tl.at('close') + tl.at('release');
}

/** 한 주기에서 스위치가 닫혀 있는 시간(초). */
export function closedSpan(tl: TimelineFrame): number {
  return tl.start('release') - tl.end('close');
}

/** 이번 주기에 닫힌 뒤 흐른 시간(초). 닫히기 전 0, 열린 뒤에는 닫힌 시간 전부. */
export function closedSoFar(tl: TimelineFrame): number {
  return Math.min(closedSpan(tl), Math.max(0, tl.u - tl.end('close')));
}

/**
 * 표류 거리(월드) — 모든 전자에 같다. 지난 주기들의 몫 + 이번 주기의 몫이라
 * 주기가 바뀌어도 이어진다.
 */
export function driftDistance(tl: TimelineFrame, c: DriftVelocityConstants): number {
  return c.driftSpeed * (tl.cycle * closedSpan(tl) + closedSoFar(tl));
}

/** 이번 주기가 시작할 때(스위치가 열려 있는 동안)의 표류 거리. 닫힐 때까지 그대로다. */
export function driftAtCycleStart(tl: TimelineFrame, c: DriftVelocityConstants): number {
  return c.driftSpeed * tl.cycle * closedSpan(tl);
}

// ------------------------------------------------------------------------
// 전자
// ------------------------------------------------------------------------

/** 고리 위 전자 수 — 간격에 가장 가깝게, 둘레를 고르게 나눈다. */
export function carrierCount(c: DriftVelocityConstants): number {
  return Math.max(1, Math.round(LOOP_LENGTH / c.carrierSpacing));
}

/** 전자 번호 i 의 고리 위 자리(흔들림 없음). */
export function carrierS(i: number, n: number, drift: number): number {
  return wrap((i * LOOP_LENGTH) / n + drift);
}

/**
 * 스위치 옆 자리에 가장 가까운 전자 번호 — 이번 주기에 표시할 전자.
 * 주기가 시작할 때의 자리로 고르므로 한 주기 동안 바뀌지 않는다.
 */
export function taggedIndex(siteS: number, n: number, driftStart: number): number {
  const i = Math.round(((siteS - driftStart) * n) / LOOP_LENGTH);
  return ((i % n) + n) % n;
}

/** 시드 · 번호 · 칸 · 축에서 뽑은 −1~1 의 결정적 값. 같은 인자는 언제나 같은 값이다. */
function hash(seed: number, i: number, k: number, axis: number): number {
  let h = (seed * 374761393 + i * 668265263 + k * 2246822519 + axis * 3266489917) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 3266489917) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return (h / 4294967295) * 2 - 1;
}

/** 한 축의 흔들림 −1~1. 1/rate 초마다 새 자리를 뽑고 그 사이를 코사인으로 잇는다(값 잡음). */
function jitter(seed: number, i: number, axis: number, t: number, rate: number): number {
  const x = t * rate;
  const k = Math.floor(x);
  const f = x - k;
  const w = (1 - Math.cos(Math.PI * f)) / 2;
  return hash(seed, i, k, axis) * (1 - w) + hash(seed, i, k + 1, axis) * w;
}

/**
 * 전자 i 의 열운동 흔들림 — (진행 방향 몫, 안쪽 법선 몫), 월드. (시드, 번호, 조각 시계)의 함수라
 * 주기 경계와 상관없이 이어진다.
 */
export function thermalOffset(i: number, t: number, c: DriftVelocityConstants): Vec2 {
  return [
    jitter(c.seed, i, 0, t, c.thermalRate) * c.thermalAmplitude,
    jitter(c.seed, i, 1, t, c.thermalRate) * c.thermalAmplitude,
  ];
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: DriftVelocityState }): DriftVelocityState {
  return params.state;
}
