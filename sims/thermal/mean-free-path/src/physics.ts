// ========================================================================
// mean-free-path — 순수 물리
// ========================================================================
// DOM · 캔버스 · 색을 모른다. 난수는 (시드, 상자 번호)에서 뽑는다 (S-sim).
//
// 상자는 주기 경계다 — 오른쪽으로 나간 분자는 왼쪽으로 들어온다. 벽에 튕기는 것을
// 충돌로 세면 「분자끼리 부딪히기까지의 거리」 가 벽까지의 거리로 흐려지기 때문이다.
//
// 다른 분자들은 제자리에 둔다. 표시 분자는 곧게 가다가 어느 분자와 중심 거리가
// 지름(2r)이 되는 순간 탄성으로 튕긴다 — 부딪힌 자리의 법선에 대해 속도를 거울처럼
// 뒤집고 속력은 그대로다. 그래서 충돌 목록만 있으면 어느 시각의 자리든 닫힌 계산으로
// 나온다. 한 주기의 경로는 `initialState` 가 시드로 한 번 계산해 두고, scene 은 시각으로
// 읽는다. `step` 에 쌓지 않는다 — 같은 시각은 언제나 같은 화면이다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  BOX_H,
  BOX_W,
  COUNT,
  DENSITY_RATIO,
  PLACE_GAP,
  RADIUS,
  SEED,
  SIM_SECONDS,
  ROW_SCALE,
  SPEED,
  TRAIL_SECONDS,
} from './schema';
import type { MeanFreePathState } from './state';

export interface MeanFreePathConstants {
  seed: number;
  /** 성긴 상자의 분자 수. */
  count: number;
  /** 빽빽한 상자의 밀도 배수(정수). */
  densityRatio: number;
  /** 분자 반지름(월드). */
  radius: number;
  /** 표시 분자 속력(월드/초). */
  speed: number;
  /** 흩을 때 두 분자 표면 사이의 최소 틈(월드). */
  placeGap: number;
  /** 미리 계산하는 경로 길이(초). */
  simSeconds: number;
  /** 경로 꼬리 길이(초). */
  trailSeconds: number;
  /** 아래 줄이 거리를 늘려 그리는 배율. */
  rowScale: number;
}

export function readConstants(stage: StageDef): MeanFreePathConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    seed: Math.round(c.seed ?? SEED),
    count: Math.max(1, Math.round(c.count ?? COUNT)),
    densityRatio: Math.max(1, Math.round(c.densityRatio ?? DENSITY_RATIO)),
    radius: c.radius ?? RADIUS,
    speed: c.speed ?? SPEED,
    placeGap: c.placeGap ?? PLACE_GAP,
    simSeconds: c.simSeconds ?? SIM_SECONDS,
    trailSeconds: c.trailSeconds ?? TRAIL_SECONDS,
    rowScale: c.rowScale ?? ROW_SCALE,
  };
}

// ------------------------------------------------------------------------
// 시드 난수 — 다른 sim 의 것을 쓰지 않고 여기 둔다 (S-sim · C3).
// ------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** (시드, 상자 번호)에서 그 상자의 난수열을 연다. 두 상자가 같은 수열을 쓰지 않는다. */
function boxRng(seed: number, box: number): () => number {
  return mulberry32(Math.imul(seed + 1, 0x9e3779b1) ^ Math.imul(box + 1, 0x85ebca77));
}

// ------------------------------------------------------------------------
// 한 상자의 경로
// ------------------------------------------------------------------------

/**
 * 한 상자에서 표시 분자가 간 길. 자리는 **펼친 좌표**(감싸지 않은 좌표)다 — 상자로
 * 감는 것은 그릴 때 한다.
 */
export interface BoxRun {
  /** 제자리에 있는 다른 분자의 중심. 상자 안 좌표 [0, W) × [0, H). */
  molecules: Vec2[];
  /** 꺾인 시각. `times[0]` 은 출발(0), 그 뒤는 충돌 시각. */
  times: number[];
  /** 그 시각의 자리(펼친 좌표). `points[k≥1]` 이 k 번째 충돌 자리다. */
  points: Vec2[];
  /** 그 시각부터의 방향(단위 벡터). */
  dirs: Vec2[];
}

/** 주기 경계에서 두 점 사이의 가장 짧은 거리의 제곱. */
function wrappedDist2(a: Vec2, b: Vec2): number {
  let dx = Math.abs(a[0] - b[0]);
  let dy = Math.abs(a[1] - b[1]);
  dx = Math.min(dx, BOX_W - dx);
  dy = Math.min(dy, BOX_H - dy);
  return dx * dx + dy * dy;
}

/** 표본을 한 번에 앞으로 훑는 길이(월드). 이 길이마다 가까운 분자 사본만 본다. */
const SCAN_STEP = 2;
/** 막 튕긴 자리에서 같은 분자를 다시 잡지 않는 여유(월드). */
const EPS = 1e-9;
/** 한 구간을 찾으려고 훑는 최대 길이(월드). 이만큼 가도 안 맞으면 계산을 멈춘다. */
const SCAN_LIMIT = 200;
/** 흩기를 다시 뽑는 최대 횟수. 상자가 너무 빽빽해 못 놓으면 그만큼만 놓는다. */
const PLACE_TRIES = 4000;

/** p 에서 방향 v 로 갈 때 처음 부딪히는 분자까지의 거리와 그 분자 사본의 중심. */
function nextHit(p: Vec2, v: Vec2, molecules: readonly Vec2[], d: number): { s: number; center: Vec2 } | null {
  for (let s0 = 0; s0 < SCAN_LIMIT; s0 += SCAN_STEP) {
    const ax = p[0] + v[0] * s0;
    const ay = p[1] + v[1] * s0;
    const bx = p[0] + v[0] * (s0 + SCAN_STEP);
    const by = p[1] + v[1] * (s0 + SCAN_STEP);
    const minX = Math.min(ax, bx) - d;
    const maxX = Math.max(ax, bx) + d;
    const minY = Math.min(ay, by) - d;
    const maxY = Math.max(ay, by) + d;
    let best: { s: number; center: Vec2 } | null = null;
    for (const m of molecules) {
      const i0 = Math.ceil((minX - m[0]) / BOX_W);
      const i1 = Math.floor((maxX - m[0]) / BOX_W);
      const j0 = Math.ceil((minY - m[1]) / BOX_H);
      const j1 = Math.floor((maxY - m[1]) / BOX_H);
      for (let i = i0; i <= i1; i++) {
        for (let j = j0; j <= j1; j++) {
          const cx = m[0] + i * BOX_W;
          const cy = m[1] + j * BOX_H;
          const wx = p[0] - cx;
          const wy = p[1] - cy;
          const b = wx * v[0] + wy * v[1];
          if (b >= 0) continue; // 멀어지는 중이면 부딪히지 않는다
          const cc = wx * wx + wy * wy - d * d;
          const disc = b * b - cc;
          if (disc < 0) continue;
          const s = -b - Math.sqrt(disc);
          if (s <= EPS) continue;
          if (!best || s < best.s) best = { s, center: [cx, cy] };
        }
      }
    }
    if (best && best.s <= s0 + SCAN_STEP) return best;
  }
  return null;
}

/** 한 상자의 분자를 흩고, 표시 분자가 `simSeconds` 동안 간 길을 계산한다. */
export function runBox(c: MeanFreePathConstants, box: number, count: number): BoxRun {
  const rng = boxRng(c.seed, box);
  const d = 2 * c.radius;
  const sep = d + c.placeGap;

  const molecules: Vec2[] = [];
  for (let tries = 0; molecules.length < count && tries < PLACE_TRIES; tries++) {
    const q: Vec2 = [rng() * BOX_W, rng() * BOX_H];
    if (molecules.every((m) => wrappedDist2(m, q) >= sep * sep)) molecules.push(q);
  }

  // 표시 분자 — 다른 분자와 겹치지 않는 자리에서 뽑은 방향으로 떠난다.
  let start: Vec2 = [BOX_W / 2, BOX_H / 2];
  for (let tries = 0; tries < PLACE_TRIES; tries++) {
    const q: Vec2 = [rng() * BOX_W, rng() * BOX_H];
    if (molecules.every((m) => wrappedDist2(m, q) >= sep * sep)) {
      start = q;
      break;
    }
  }
  const a = rng() * 2 * Math.PI;
  let dir: Vec2 = [Math.cos(a), Math.sin(a)];

  const times = [0];
  const points: Vec2[] = [start];
  const dirs: Vec2[] = [dir];
  let t = 0;
  let p = start;
  while (t < c.simSeconds) {
    const hit = nextHit(p, dir, molecules, d);
    if (!hit) break;
    t += hit.s / c.speed;
    p = [p[0] + dir[0] * hit.s, p[1] + dir[1] * hit.s];
    const nx = p[0] - hit.center[0];
    const ny = p[1] - hit.center[1];
    const nl = Math.hypot(nx, ny) || 1;
    const n: Vec2 = [nx / nl, ny / nl];
    const vn = dir[0] * n[0] + dir[1] * n[1];
    const rx = dir[0] - 2 * vn * n[0];
    const ry = dir[1] - 2 * vn * n[1];
    // 반올림이 쌓여 방향이 단위 길이에서 벗어나지 않게 다시 맞춘다.
    const rl = Math.hypot(rx, ry) || 1;
    dir = [rx / rl, ry / rl];
    times.push(t);
    points.push(p);
    dirs.push(dir);
  }
  return { molecules, times, points, dirs };
}

// ------------------------------------------------------------------------
// 시각으로 읽기
// ------------------------------------------------------------------------

/** 시각 t 에 몇 번째 구간에 있는가 — `times[k] ≤ t` 인 가장 큰 k. */
export function legAt(run: BoxRun, t: number): number {
  let lo = 0;
  let hi = run.times.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (run.times[mid]! <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** 시각 t 의 자리(펼친 좌표). */
export function positionAt(run: BoxRun, t: number, speed: number): Vec2 {
  const k = legAt(run, t);
  const p = run.points[k]!;
  const v = run.dirs[k]!;
  const s = (t - run.times[k]!) * speed;
  return [p[0] + v[0] * s, p[1] + v[1] * s];
}

/**
 * 시각 t 까지 **끝난** 충돌 사이 구간의 길이들. 출발 ~ 첫 충돌은 충돌 사이가 아니라 빼고,
 * 아직 가는 중인 구간도 뺀다.
 */
export function freePathsUntil(run: BoxRun, t: number, speed: number): number[] {
  const out: number[] = [];
  for (let k = 1; k + 1 < run.times.length && run.times[k + 1]! <= t; k++) {
    out.push((run.times[k + 1]! - run.times[k]!) * speed);
  }
  return out;
}

export function mean(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

// ------------------------------------------------------------------------
// 상자로 감기 — 펼친 좌표의 선분을 상자 안 조각들로 자른다
// ------------------------------------------------------------------------

/** 펼친 좌표의 점을 상자 안 좌표로 감는다. */
export function wrap(p: Vec2): Vec2 {
  const x = p[0] - Math.floor(p[0] / BOX_W) * BOX_W;
  const y = p[1] - Math.floor(p[1] / BOX_H) * BOX_H;
  return [x, y];
}

/**
 * 선분 a→b(펼친 좌표)를 상자 경계에서 잘라 상자 안 조각들로 돌려준다. 조각마다 두 점이다.
 * 상자를 가로지르는 곳에서 선을 끊는 어휘가 없어 조각이 자른다 (NOTES (c) 새 부족).
 */
export function wrapSegment(a: Vec2, b: Vec2): Vec2[][] {
  const cuts = [0, 1];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const addCuts = (from: number, delta: number, size: number) => {
    if (delta === 0) return;
    const lo = Math.min(from, from + delta);
    const hi = Math.max(from, from + delta);
    for (let k = Math.ceil(lo / size); k * size <= hi; k++) {
      const u = (k * size - from) / delta;
      if (u > 0 && u < 1) cuts.push(u);
    }
  };
  addCuts(a[0], dx, BOX_W);
  addCuts(a[1], dy, BOX_H);
  cuts.sort((x, y) => x - y);
  const out: Vec2[][] = [];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const u0 = cuts[i]!;
    const u1 = cuts[i + 1]!;
    if (u1 - u0 <= EPS) continue;
    const um = (u0 + u1) / 2;
    const ox = Math.floor((a[0] + dx * um) / BOX_W) * BOX_W;
    const oy = Math.floor((a[1] + dy * um) / BOX_H) * BOX_H;
    out.push([
      [a[0] + dx * u0 - ox, a[1] + dy * u0 - oy],
      [a[0] + dx * u1 - ox, a[1] + dy * u1 - oy],
    ]);
  }
  return out;
}

/**
 * 상자 안 자리 p 에 반지름 r 인 원을 그릴 때 필요한 사본들 — 경계에 걸치면 맞은편에도
 * 그 몫이 보여야 한다(주기 경계). 상자 안 좌표로 돌려준다.
 */
export function images(p: Vec2, r: number): Vec2[] {
  const out: Vec2[] = [];
  for (const i of [-1, 0, 1]) {
    for (const j of [-1, 0, 1]) {
      const x = p[0] + i * BOX_W;
      const y = p[1] + j * BOX_H;
      if (x + r < 0 || x - r > BOX_W || y + r < 0 || y - r > BOX_H) continue;
      out.push([x, y]);
    }
  }
  return out;
}

/** 쌓는 것이 없다 — 모든 움직임은 시각의 함수다 (S-sim 「상태가 시계뿐인 조각」). */
export function step(params: { state: MeanFreePathState }): MeanFreePathState {
  return params.state;
}
