// ========================================================================
// optical-fiber — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 섬유 모양과 광선 경로가 모두 스테이지 상수와 시간표 진행도의 함수이고
// `step` 은 항등이다.
//
// 광선 추적은 조각의 몫이다. plugin-optics 의 `traceRay` 는 섬유를 모르므로 벽 조각(곧은 선 ·
// 원호)과의 교점을 여기서 구하고, 벽에 닿을 때마다 입사각을 임계각과 **직접** 비교한다 —
// `refract` 는 전반사 때 말없이 반사 벡터를 돌려주기 때문이다. 반사는 `reflect`, 새어 나가는
// 빛의 꺾임은 `refract` 를 그대로 쓴다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { reflect, refract } from '@aperi21/plugin-optics';
import {
  BEND_DEG,
  CLAD_HALF,
  CORE_HALF,
  CRITICAL_DEG,
  ENTRY_LEN,
  FIBER_LEN,
  GENTLE_RADIUS,
  LAUNCH_DEG,
  LAUNCH_OFFSET,
  LEAK_LEN,
  N_CLAD,
  N_CORE,
  TIGHT_RADIUS,
} from './schema';
import type { OpticalFiberState } from './state';

export const DEG = Math.PI / 180;

export interface OpticalFiberConstants {
  nCore: number;
  nClad: number;
  /** 임계각 정박값(도) — 화면 글자와 부채의 강조선. 판정은 굴절률로 한다. */
  criticalDeg: number;
  coreHalf: number;
  cladHalf: number;
  entryLen: number;
  fiberLen: number;
  bendDeg: number;
  gentleRadius: number;
  tightRadius: number;
  launchOffset: number;
  launchDeg: number;
}

export function readConstants(stage?: StageDef): OpticalFiberConstants {
  const c = (stage?.constants ?? {}) as Record<string, number | undefined>;
  return {
    nCore: c.nCore ?? N_CORE,
    nClad: c.nClad ?? N_CLAD,
    criticalDeg: c.criticalDeg ?? CRITICAL_DEG,
    coreHalf: c.coreHalf ?? CORE_HALF,
    cladHalf: c.cladHalf ?? CLAD_HALF,
    entryLen: c.entryLen ?? ENTRY_LEN,
    fiberLen: c.fiberLen ?? FIBER_LEN,
    bendDeg: c.bendDeg ?? BEND_DEG,
    gentleRadius: c.gentleRadius ?? GENTLE_RADIUS,
    tightRadius: c.tightRadius ?? TIGHT_RADIUS,
    launchOffset: c.launchOffset ?? LAUNCH_OFFSET,
    launchDeg: c.launchDeg ?? LAUNCH_DEG,
  };
}

// ------------------------------------------------------------------------
// 섬유 모양 — 곧은 들머리 · 반시계로 휘는 원호 · 곧은 날머리. 섬유 전체 길이는 휨과 무관하게 같다.
// ------------------------------------------------------------------------

export interface FiberShape {
  /** 들머리 가운데(월드). 섬유는 여기서 +x 로 출발한다. */
  origin: Vec2;
  entryLen: number;
  /** 휨 반지름(가운데 선) · 휘는 각(라디안). */
  radius: number;
  bend: number;
  exitLen: number;
}

export function fiberShape(c: OpticalFiberConstants, origin: Vec2, radius: number): FiberShape {
  const bend = c.bendDeg * DEG;
  return {
    origin,
    entryLen: c.entryLen,
    radius,
    bend,
    exitLen: Math.max(0, c.fiberLen - c.entryLen - radius * bend),
  };
}

/** 가운데 선에서 왼쪽(휨 중심 쪽)으로 `s` 만큼 벗어난 자리의 점 — 가운데 선 길이 `l` 에서. */
export function fiberPoint(f: FiberShape, l: number, s: number): Vec2 {
  const [x0, y0] = f.origin;
  if (l <= f.entryLen) return [x0 + l, y0 + s];
  const arcLen = f.radius * f.bend;
  const cx = x0 + f.entryLen;
  const cy = y0 + f.radius;
  if (l <= f.entryLen + arcLen) {
    const a = -Math.PI / 2 + (l - f.entryLen) / f.radius;
    const r = f.radius - s;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  const e = l - f.entryLen - arcLen;
  const a = -Math.PI / 2 + f.bend;
  const bx = cx + f.radius * Math.cos(a);
  const by = cy + f.radius * Math.sin(a);
  const dir: Vec2 = [Math.cos(f.bend), Math.sin(f.bend)];
  const left: Vec2 = [-Math.sin(f.bend), Math.cos(f.bend)];
  return [bx + dir[0] * e + left[0] * s, by + dir[1] * e + left[1] * s];
}

/** 가운데 선 전체 길이. */
export function fiberLength(f: FiberShape): number {
  return f.entryLen + f.radius * f.bend + f.exitLen;
}

// ------------------------------------------------------------------------
// 벽 조각과 교점
// ------------------------------------------------------------------------

type Piece =
  | { kind: 'line'; a: Vec2; b: Vec2 }
  | { kind: 'arc'; c: Vec2; r: number; from: number; to: number };

/** 가운데 선에서 `s` 만큼 벗어난 벽 — 곧은 선 · 원호 · 곧은 선. */
function wallPieces(f: FiberShape, s: number): Piece[] {
  const arcEnd = f.entryLen + f.radius * f.bend;
  const out: Piece[] = [{ kind: 'line', a: fiberPoint(f, 0, s), b: fiberPoint(f, f.entryLen, s) }];
  if (f.bend > 0) {
    out.push({
      kind: 'arc',
      c: [f.origin[0] + f.entryLen, f.origin[1] + f.radius],
      r: f.radius - s,
      from: -Math.PI / 2,
      to: -Math.PI / 2 + f.bend,
    });
  }
  if (f.exitLen > 0) out.push({ kind: 'line', a: fiberPoint(f, arcEnd, s), b: fiberPoint(f, fiberLength(f), s) });
  return out;
}

interface Hit {
  t: number;
  p: Vec2;
  /** 단위 법선(방향은 아무쪽). */
  n: Vec2;
}

const EPS = 1e-7;

function hitPiece(p: Vec2, d: Vec2, q: Piece): Hit | null {
  if (q.kind === 'line') {
    const ex = q.b[0] - q.a[0];
    const ey = q.b[1] - q.a[1];
    const den = d[0] * ey - d[1] * ex;
    if (Math.abs(den) < 1e-12) return null;
    const wx = q.a[0] - p[0];
    const wy = q.a[1] - p[1];
    const t = (wx * ey - wy * ex) / den;
    const u = (wx * d[1] - wy * d[0]) / den;
    if (t <= EPS || u < -1e-9 || u > 1 + 1e-9) return null;
    const len = Math.hypot(ex, ey);
    return { t, p: [p[0] + d[0] * t, p[1] + d[1] * t], n: [-ey / len, ex / len] };
  }
  const ox = p[0] - q.c[0];
  const oy = p[1] - q.c[1];
  const b = ox * d[0] + oy * d[1];
  const cc = ox * ox + oy * oy - q.r * q.r;
  const disc = b * b - cc;
  if (disc < 0) return null;
  const sq = Math.sqrt(disc);
  for (const t of [-b - sq, -b + sq]) {
    if (t <= EPS) continue;
    const x = ox + d[0] * t;
    const y = oy + d[1] * t;
    let a = Math.atan2(y, x);
    while (a < q.from - 1e-9) a += 2 * Math.PI;
    if (a > q.to + 1e-9) continue;
    return { t, p: [q.c[0] + x, q.c[1] + y], n: [x / q.r, y / q.r] };
  }
  return null;
}

function nearest(p: Vec2, d: Vec2, pieces: readonly Piece[]): Hit | null {
  let best: Hit | null = null;
  for (const q of pieces) {
    const h = hitPiece(p, d, q);
    if (h && (!best || h.t < best.t)) best = h;
  }
  return best;
}

// ------------------------------------------------------------------------
// 광선 경로
// ------------------------------------------------------------------------

export interface Bounce {
  pos: Vec2;
  /** 입사각(라디안, 벽의 법선에서 잰 것). */
  incidence: number;
  /** 이 자리까지 온 경로 길이. */
  at: number;
  /** 임계각보다 작아 빛이 새어 나간 자리인가. */
  leaks: boolean;
}

export interface RayPath {
  /** 코어 안 경로 — 들머리에서 날머리(또는 새는 자리)까지. */
  points: Vec2[];
  /** 꺾인 점마다 누적 경로 길이(`points` 와 같은 길이). */
  lengths: number[];
  bounces: Bounce[];
  /** 새어 나간 빛 — 새는 자리에서 섬유 밖까지(`LEAK_LEN`). 새지 않으면 없다. */
  leak?: { from: Vec2; to: Vec2; dir: Vec2 };
  /** 코어 경로 + 새는 빛의 전체 길이. */
  total: number;
}

/** 벽에 닿는 횟수 상한 — 끝없는 되튐을 막는다. */
const MAX_BOUNCES = 80;

export function traceFiber(f: FiberShape, c: OpticalFiberConstants): RayPath {
  const core = [...wallPieces(f, c.coreHalf), ...wallPieces(f, -c.coreHalf)];
  const L = fiberLength(f);
  const cap: Piece = { kind: 'line', a: fiberPoint(f, L, c.coreHalf), b: fiberPoint(f, L, -c.coreHalf) };
  const sinCritical = c.nClad / c.nCore;

  let p: Vec2 = fiberPoint(f, 0, c.launchOffset);
  const a0 = c.launchDeg * DEG;
  let d: Vec2 = [Math.cos(a0), Math.sin(a0)];
  const points: Vec2[] = [p];
  const lengths: number[] = [0];
  const bounces: Bounce[] = [];
  let run = 0;

  for (let i = 0; i < MAX_BOUNCES; i++) {
    const wall = nearest(p, d, core);
    const end = hitPiece(p, d, cap);
    if (end && (!wall || end.t <= wall.t)) {
      run += end.t;
      points.push(end.p);
      lengths.push(run);
      return { points, lengths, bounces, total: run };
    }
    if (!wall) break;
    run += wall.t;
    points.push(wall.p);
    lengths.push(run);
    // 법선을 들어오는 쪽(코어 안)으로 돌린다 — `refract` 가 요구하는 방향.
    const n: Vec2 = d[0] * wall.n[0] + d[1] * wall.n[1] > 0 ? [-wall.n[0], -wall.n[1]] : wall.n;
    const cosI = -(d[0] * n[0] + d[1] * n[1]);
    const incidence = Math.acos(Math.max(-1, Math.min(1, cosI)));
    const leaks = Math.sin(incidence) < sinCritical;
    bounces.push({ pos: wall.p, incidence, at: run, leaks });
    if (leaks) {
      // 클래딩으로 꺾여 들어간 빛은 클래딩 밖 피복까지 곧게 간다 — 피복 굴절률을 클래딩과 같게 본다(NOTES (b)).
      const out = refract(d, n, c.nCore / c.nClad);
      const to: Vec2 = [wall.p[0] + out[0] * LEAK_LEN, wall.p[1] + out[1] * LEAK_LEN];
      return { points, lengths, bounces, leak: { from: wall.p, to, dir: out }, total: run + LEAK_LEN };
    }
    d = reflect(d, n);
    p = wall.p;
  }
  return { points, lengths, bounces, total: run };
}

/** 경로를 앞에서부터 `s` 만큼 자른다 — 빛이 나아가는 머리. */
export function cutPath(path: RayPath, s: number): { core: Vec2[]; leak?: Vec2[]; head: Vec2 } {
  const pts = path.points;
  const lens = path.lengths;
  let prev: Vec2 = pts[0] ?? [0, 0];
  let prevLen = 0;
  const core: Vec2[] = [prev];
  for (let i = 1; i < pts.length; i++) {
    const b = pts[i] ?? prev;
    const len = lens[i] ?? prevLen;
    if (s >= len) {
      core.push(b);
      prev = b;
      prevLen = len;
      continue;
    }
    const k = len > prevLen ? (s - prevLen) / (len - prevLen) : 1;
    const head: Vec2 = [prev[0] + (b[0] - prev[0]) * k, prev[1] + (b[1] - prev[1]) * k];
    core.push(head);
    return { core, head };
  }
  if (!path.leak) return { core, head: prev };
  const tail = path.total - prevLen;
  const k = tail > 0 ? Math.min(1, Math.max(0, (s - prevLen) / tail)) : 1;
  const { from, to } = path.leak;
  const head: Vec2 = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k];
  return { core, leak: [from, head], head };
}

// ------------------------------------------------------------------------
// 시간표 → 화면에 놓을 값
// ------------------------------------------------------------------------

export interface Reading {
  /** 지금 휨 반지름. 곡률(1/R)을 이어서 바꾼다 — 반지름을 곧장 섞으면 급한 쪽에서 너무 빨리 휜다. */
  radius: number;
  /** 지금 보이는 광선이 급한 휨의 것인가. */
  tight: boolean;
  /** 광선이 나아간 몫 0~1. */
  reveal: number;
  /** 광선 · 부채 선의 짙기 0~1 — 섬유가 모양을 바꾸는 동안은 비운다. */
  rayOpacity: number;
}

/**
 * 같은 시각은 언제나 같은 값이다. 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` 는 그 단계
 * 앞에서 0, 지난 뒤 1 이다.
 */
export function derive(tl: TimelineFrame, c: OpticalFiberConstants): Reading {
  const bend = tl.at('tighten') - tl.at('relax');
  const k = 1 / c.gentleRadius + (1 / c.tightRadius - 1 / c.gentleRadius) * bend;
  const tight = tl.at('tighten') >= 1 && tl.at('relax') <= 0;
  const reveal = tight ? tl.at('tight') : tl.at('gentle');
  const fading = tight ? tl.at('tightFade') : tl.at('gentleFade');
  const moving = tl.phase === 'tighten' || tl.phase === 'relax';
  return {
    radius: 1 / k,
    tight,
    reveal,
    rayOpacity: moving ? 0 : 1 - fading,
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: OpticalFiberState }): OpticalFiberState {
  return params.state;
}
