// ========================================================================
// lagrange-points — 순수 물리
// ========================================================================
// 회전 틀 제한 삼체 운동 방정식(코리올리 항 포함) · RK4 · 평형점 찾기(이분법) ·
// 유효 퍼텐셜 지형과 등고선(마칭 스퀘어). 모두 원본 그대로 옮겼다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import { DT, MU, PLOT, SUBSTEPS, TERRAIN, TEST, TIME_SCALE } from './schema';
import type { LagrangePointsState, TestBody } from './state';

type S4 = readonly [number, number, number, number];

export const EARTH: Vec2 = [-MU, 0];
export const MOON: Vec2 = [1 - MU, 0];

/** 유효 퍼텐셜 (높을수록 언덕). */
export function potential(x: number, y: number): number {
  const r1 = Math.hypot(x + MU, y);
  const r2 = Math.hypot(x - 1 + MU, y);
  return -(1 - MU) / r1 - MU / r2 - (x * x + y * y) / 2;
}

function deriv(s: S4): S4 {
  const [x, y, vx, vy] = s;
  const dx1 = x + MU;
  const dx2 = x - 1 + MU;
  const r1 = Math.hypot(dx1, y);
  const r2 = Math.hypot(dx2, y);
  const a = (1 - MU) / (r1 * r1 * r1);
  const b = MU / (r2 * r2 * r2);
  return [vx, vy, 2 * vy + x - a * dx1 - b * dx2, -2 * vx + y - a * y - b * y];
}

function add(s: S4, k: S4, h: number): S4 {
  return [s[0] + h * k[0], s[1] + h * k[1], s[2] + h * k[2], s[3] + h * k[3]];
}

function rk4(s: S4, h: number): S4 {
  const k1 = deriv(s);
  const k2 = deriv(add(s, k1, h / 2));
  const k3 = deriv(add(s, k2, h / 2));
  const k4 = deriv(add(s, k3, h));
  return [
    s[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    s[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    s[2] + (h / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
    s[3] + (h / 6) * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3]),
  ];
}

function axisForce(x: number): number {
  return deriv([x, 0, 0, 0])[2];
}

function bisect(lo: number, hi: number): number {
  for (let i = 0; i < 80; i++) {
    const m = (lo + hi) / 2;
    if (Math.sign(axisForce(m)) === Math.sign(axisForce(lo))) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}

/** 다섯 평형점. L1~L3 은 축 위 알짜 힘의 부호가 바뀌는 곳을 이분법으로 찾는다. */
export const LPOINTS: readonly Vec2[] = [
  [bisect(-MU + 0.05, 1 - MU - 0.01), 0],
  [bisect(1 - MU + 0.01, 2), 0],
  [bisect(-2, -MU - 0.05), 0],
  [0.5 - MU, Math.sqrt(3) / 2],
  [0.5 - MU, -Math.sqrt(3) / 2],
];

/** mulberry32 — 원본 `PieceKit.random` 과 같은 수열. */
function nextRandom(seed: number): { value: number; seed: number } {
  const s = (seed + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: s };
}

/** 원본 `advance(dt)` 한 번 — 고정 걸음. */
function advance(state: LagrangePointsState): LagrangePointsState {
  const { clock } = state;
  let rng = state.rng;
  const bodies: TestBody[] = [...state.bodies];
  const nextEmit = [...state.nextEmit];

  for (let li = 0; li < LPOINTS.length; li++) {
    while (clock >= nextEmit[li]!) {
      const L = LPOINTS[li]!;
      const r = nextRandom(rng);
      rng = r.seed;
      const ang = r.value * Math.PI * 2;
      bodies.push({
        li,
        s: [L[0] + TEST.offset * Math.cos(ang), L[1] + TEST.offset * Math.sin(ang), 0, 0],
        born: clock,
        endAt: null,
        trail: [],
      });
      nextEmit[li] = nextEmit[li]! + TEST.emitEvery;
    }
  }

  const h = (DT * TIME_SCALE) / SUBSTEPS;
  const out: TestBody[] = [];
  for (const b of bodies) {
    let { s, endAt } = b;
    let trail = b.trail;
    if (endAt === null) {
      for (let k = 0; k < SUBSTEPS; k++) s = rk4(s, h);
      const [x, y] = s;
      const L = LPOINTS[b.li]!;
      // 지구에 닿거나 달 우물 안으로 떨어지면 떠난 것으로 본다 — 그 뒤 달 둘레를 도는 행로는 주장 밖.
      const crashed =
        Math.hypot(x - EARTH[0], y) < TEST.earthCapture || Math.hypot(x - MOON[0], y) < TEST.moonCapture;
      const away = Math.hypot(x - L[0], y - L[1]) > TEST.leaveDist || Math.hypot(x, y) > TEST.farDist;
      if (crashed || away || !Number.isFinite(x + y) || clock - b.born > TEST.life) endAt = clock;
      if (state.frame % 2 === 0 && !crashed) trail = [...trail, [x, y, clock]];
    }
    let drop = 0;
    while (drop < trail.length && clock - trail[drop]![2] > TEST.trailKeep) drop++;
    if (drop > 0) trail = trail.slice(drop);
    if (endAt !== null && clock - endAt > TEST.fade) continue;
    out.push({ li: b.li, s, born: b.born, endAt, trail });
  }

  return { ...state, bodies: out, nextEmit, rng, clock: clock + DT, frame: state.frame + 1 };
}

/** 한 걸음 이 넘으면 끊는다 — 탭이 오래 멈췄다 돌아와도 한 프레임에 몰아 걷지 않는다. */
const MAX_SUBSTEPS = 8;

/**
 * 한 걸음. 실시간 dt 는 가변이라 고정 걸음(1/60 초)으로 나눠 걷는다 — 원본 `PieceKit.loop` 과 같다.
 * `preroll` 과 검사 시각 이동은 dt = 1/60 으로 부르므로 한 번에 한 걸음이다.
 */
export function step(params: { state: LagrangePointsState; dt: number }): LagrangePointsState {
  let state = params.state;
  let acc = state.acc + params.dt;
  let n = 0;
  while (acc >= DT - 1e-9 && n < MAX_SUBSTEPS) {
    acc -= DT;
    state = advance(state);
    n++;
  }
  if (n === MAX_SUBSTEPS) acc = Math.min(acc, DT);
  return { ...state, acc: Math.max(0, acc) };
}

// ------------------------------------------------------------------------
// 지형 — 정적이라 한 번만 만든다
// ------------------------------------------------------------------------

export interface Terrain {
  readonly min: Vec2;
  readonly max: Vec2;
  readonly cols: number;
  readonly rows: number;
  /** 명암 값 0~1 (원본 t², 행 우선 · 첫 행이 위). */
  readonly values: readonly number[];
  /** 등고선 선분. */
  readonly contours: readonly (readonly Vec2[])[];
}

let cached: Terrain | null = null;

/**
 * 유효 퍼텐셜 지형. 원본은 캔버스 2px 마다 퍼텐셜을 계산해 명암을 칠하고(t = 정규화값의 제곱),
 * 같은 격자에서 마칭 스퀘어로 등고선을 뽑았다. 격자 · 높이 · 사상 모두 원본 그대로다.
 *
 * 순수 계산이고 입력이 상수뿐이라 모듈에 한 번 둔다 (인스턴스 상태가 아니다).
 */
export function terrain(): Terrain {
  if (cached) return cached;
  const cell = TERRAIN.cell;
  const cols = Math.ceil((TERRAIN.halfW * 2) / cell) + 1;
  const rows = Math.ceil((PLOT.halfH * 2) / cell) + 1;
  const x0 = -TERRAIN.halfW;
  const y0 = PLOT.halfH;
  const hi = potential(LPOINTS[3]![0], LPOINTS[3]![1]);
  const lo = TERRAIN.low;

  const vals = new Float64Array(cols * rows);
  const values: number[] = new Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const u = potential(x0 + i * cell, y0 - j * cell);
      vals[j * cols + i] = u;
      let t = (u - lo) / (hi - lo);
      t = Math.max(0, Math.min(1, t));
      values[j * cols + i] = t * t;
    }
  }

  const levels = [
    potential(LPOINTS[0]![0], 0),
    potential(LPOINTS[1]![0], 0),
    potential(LPOINTS[2]![0], 0),
    ...TERRAIN.peakDrops.map((d) => hi - d),
    ...TERRAIN.slopeLevels,
  ];
  const contours: Vec2[][] = [];
  const at = (i: number, j: number): Vec2 => [x0 + i * cell, y0 - j * cell];
  for (const lv of levels) {
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = vals[j * cols + i]!;
        const b = vals[j * cols + i + 1]!;
        const c = vals[(j + 1) * cols + i + 1]!;
        const d = vals[(j + 1) * cols + i]!;
        const pts: Vec2[] = [];
        const edge = (v1: number, v2: number, p1: Vec2, p2: Vec2): void => {
          if (v1 < lv !== v2 < lv) {
            const f = (lv - v1) / (v2 - v1);
            pts.push([p1[0] + (p2[0] - p1[0]) * f, p1[1] + (p2[1] - p1[1]) * f]);
          }
        };
        edge(a, b, at(i, j), at(i + 1, j));
        edge(b, c, at(i + 1, j), at(i + 1, j + 1));
        edge(c, d, at(i + 1, j + 1), at(i, j + 1));
        edge(d, a, at(i, j + 1), at(i, j));
        for (let k = 0; k + 1 < pts.length; k += 2) contours.push([pts[k]!, pts[k + 1]!]);
      }
    }
  }

  cached = {
    min: [x0, y0 - rows * cell],
    max: [x0 + cols * cell, y0],
    cols,
    rows,
    values,
    contours,
  };
  return cached;
}
