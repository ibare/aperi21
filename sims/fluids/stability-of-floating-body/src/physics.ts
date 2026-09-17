// ========================================================================
// stability-of-floating-body — 순수 물리
// ========================================================================
// 원본 index.html 의 `worldPoly` · `clipBelow` · `areaCentroid` · `pose` · `buildTable` ·
// `stepHull` 을 그대로 옮겼다. 부심은 그려 넣은 점이 아니라 **잠긴 모양에서 계산한 도심**이다 —
// 공식(메타센터 반지름)으로 바로 놓으면 큰 기울기에서 틀리고 "모양이 바뀌어서 옮겨 간다" 는
// 인과가 사라진다 (원본 NOTES (d)).
// ========================================================================

import type { Vec2 } from '@aperi21/schema';

import {
  HULLS,
  NARROW_PHRASES,
  PHYS,
  WIDE_PHRASES,
  type CaptionCase,
  type NarrowPhrase,
  type WidePhrase,
} from './schema';
import type { HullState, StabilityOfFloatingBodyState } from './state';

/** 치수 — 폭 · 높이 · 무게중심 높이(배 밑바닥에서). */
export interface HullDims {
  w: number;
  h: number;
  zg: number;
}

export function dimsOf(index: number, zg: number): HullDims {
  const d = HULLS[index]!;
  return { w: d.w, h: d.h, zg };
}

/** 수면이 y = 0 인 세계 좌표의 자세. 원본 `pose` 의 반환. */
export interface Pose {
  /** 무게중심 높이(세계 y). */
  gy: number;
  /** 선체 네 꼭짓점 — 밑 왼쪽 · 밑 오른쪽 · 위 오른쪽 · 위 왼쪽. 배 중심 x = 0. */
  poly: readonly Vec2[];
  /** 수면 아래로 잘린 잠긴 단면. */
  sub: readonly Vec2[];
  /** 부심(잠긴 단면의 도심). */
  B: Vec2;
  /** 부심의 수평 위치 = 무게선과 부력선의 간격(m). 기울기가 음일 때 양이면 되세우는 쪽. */
  arm: number;
}

/** 몸체 좌표(무게중심 원점, 위가 +y) → 세계 좌표. */
function worldPoly(d: HullDims, th: number, gy: number): Vec2[] {
  const c = Math.cos(th);
  const s = Math.sin(th);
  const body: Vec2[] = [
    [-d.w / 2, -d.zg],
    [d.w / 2, -d.zg],
    [d.w / 2, d.h - d.zg],
    [-d.w / 2, d.h - d.zg],
  ];
  return body.map(([x, y]) => [c * x - s * y, gy + s * x + c * y] as Vec2);
}

/** 다각형을 수면(y = 0) 아래로 자른다. */
function clipBelow(pts: readonly Vec2[]): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]!;
    const b = pts[(i + 1) % pts.length]!;
    const ain = a[1] <= 0;
    const bin = b[1] <= 0;
    if (ain) out.push(a);
    if (ain !== bin) {
      const k = a[1] / (a[1] - b[1]);
      out.push([a[0] + (b[0] - a[0]) * k, 0]);
    }
  }
  return out;
}

function areaCentroid(pts: readonly Vec2[]): { A: number; x: number; y: number } {
  let A = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]!;
    const b = pts[(i + 1) % pts.length]!;
    const cr = a[0] * b[1] - b[0] * a[1];
    A += cr;
    cx += (a[0] + b[0]) * cr;
    cy += (a[1] + b[1]) * cr;
  }
  A /= 2;
  if (Math.abs(A) < 1e-9) return { A: 0, x: 0, y: 0 };
  return { A: Math.abs(A), x: cx / (6 * A), y: cy / (6 * A) };
}

/** 기울기 th 에서 잠긴 넓이가 똑바로 섰을 때와 같도록 무게중심 높이를 맞춘다(상하는 준정적). */
export function pose(d: HullDims, th: number): Pose {
  const A0 = d.w * PHYS.draft;
  let lo = -3;
  let hi = 3;
  let gy = 0;
  for (let i = 0; i < 40; i++) {
    gy = (lo + hi) / 2;
    const sub = areaCentroid(clipBelow(worldPoly(d, th, gy)));
    if (sub.A > A0) lo = gy;
    else hi = gy;
  }
  const poly = worldPoly(d, th, gy);
  const sub = clipBelow(poly);
  const B = areaCentroid(sub);
  return { gy, poly, sub, B: [B.x, B.y], arm: B.x };
}

/** 무게중심 둘레 회전 반지름의 제곱. */
function k2(d: HullDims): number {
  const off = d.zg - d.h / 2;
  return (d.w * d.w + d.h * d.h) / 12 + off * off;
}

/** 기울기별로 되세우는 쪽인가를 표로 — 캡션이 화면과 어긋나지 않게 하는 근거. */
function stabilityTable(d: HullDims): { stableUpright: boolean; lollDeg: number } {
  const restore: number[] = [];
  for (let deg = 0; deg <= 170; deg += 0.5) {
    restore.push(pose(d, (-deg * Math.PI) / 180).arm);
  }
  const stableUpright = restore[2]! > 0; // 1°
  let lollDeg = 0;
  if (!stableUpright) {
    for (let i = 3; i < restore.length; i++) {
      if (restore[i - 1]! <= 0 && restore[i]! > 0) {
        lollDeg = i * 0.5;
        break;
      }
    }
  }
  return { stableUpright, lollDeg };
}

/** 같은 8° 기울기에서 막 놓인 배. */
export function hullAtRelease(index: number, zg: number): HullState {
  return {
    th: PHYS.heel0,
    om: 0,
    trail: [],
    ticks: 0,
    ...stabilityTable(dimsOf(index, zg)),
    pastLoll: false,
    phaseB: false,
    settled: false,
  };
}

/** 한 걸음(1/60 초). 원본 `stepHull`. */
function stepHull(h: HullState, d: HullDims, dt: number): HullState {
  const hs = (dt * PHYS.timeScale) / PHYS.substeps;
  let { th, om } = h;
  for (let i = 0; i < PHYS.substeps; i++) {
    const p = pose(d, th);
    const alpha = (PHYS.g * p.arm) / k2(d) - PHYS.damp * om;
    om += alpha * hs;
    th += om * hs;
  }
  const deg = (Math.abs(th) * 180) / Math.PI;
  // 넘어가는 배의 단계: 균형각을 지났는가 → 바깥으로 가던 기울기가 처음 되돌아섰는가.
  const lollRef = h.lollDeg > 0 ? h.lollDeg : 20;
  const pastLoll = h.pastLoll || (!h.stableUpright && deg >= lollRef);
  const phaseB = h.phaseB || (!h.stableUpright && pastLoll && th * om <= 0);
  const settled = h.stableUpright && deg < 0.8 && Math.abs(om) < 0.02;

  // 부심 자취 — 몸체 좌표로 쌓는다(배와 함께 돈다).
  let trail = h.trail;
  if (h.ticks % PHYS.trailEvery === 0) {
    const q = pose(d, th);
    const c = Math.cos(-th);
    const s = Math.sin(-th);
    const bx = q.B[0];
    const by = q.B[1] - q.gy;
    const next = trail.length >= PHYS.trailMax ? trail.slice(1) : trail.slice();
    next.push([c * bx - s * by, s * bx + c * by]);
    trail = next;
  }
  return { ...h, th, om, trail, ticks: h.ticks + 1, pastLoll, phaseB, settled };
}

function widePhrase(h: HullState): WidePhrase {
  return h.settled ? 'Upright' : 'Restoring';
}

function narrowPhrase(h: HullState): NarrowPhrase {
  if (h.stableUpright) return h.settled ? 'Upright' : 'Restoring';
  // 원본에 없던 갈래 — 옆으로 누운 자리(90°)를 넘으면 뒤집힌 것이다. 균형각이 없는 높이(표가
  // 170° 까지 되세우는 쪽을 찾지 못함)에서는 "너머로 왔지만" 이 참이 아니므로 그 단계로 넘기지 않는다.
  if (Math.abs(h.th) >= Math.PI / 2) return 'Capsize';
  if (h.lollDeg === 0) return 'Short';
  if (h.phaseB) return 'Sway';
  if (h.pastLoll) return 'Overshoot';
  return 'Short';
}

/**
 * 캡션 조합마다 지금 참인가. 넓은 배는 이 조작 범위(0.35–1.10 m)에서 늘 똑바로 선 자세가
 * 안정하므로 두 문구 중 하나다 — 그래도 표가 불안정을 말하면 좁은 배와 같은 규칙으로 고른다.
 */
export function captionFlags(hulls: readonly HullState[]): Record<CaptionCase, boolean> {
  const wide = hulls[0]!;
  const w: WidePhrase = wide.stableUpright ? widePhrase(wide) : 'Restoring';
  const n = narrowPhrase(hulls[1]!);
  const flags = {} as Record<CaptionCase, boolean>;
  for (const a of WIDE_PHRASES) {
    for (const b of NARROW_PHRASES) flags[`w${a}N${b}`] = a === w && b === n;
  }
  return flags;
}

export function step(params: {
  state: StabilityOfFloatingBodyState;
  dt: number;
}): StabilityOfFloatingBodyState {
  const { state, dt } = params;
  let hulls = state.hulls;

  // 조작값이 바뀌면 — 자취를 비우고 기울기별 표를 다시 만든다. 자세는 그대로 둔다(원본 `setZg`).
  let zgApplied = state.zgApplied;
  if (state.zg !== zgApplied) {
    zgApplied = state.zg;
    hulls = hulls.map((h, i) => ({
      ...h,
      trail: [],
      ...stabilityTable(dimsOf(i, zgApplied)),
      pastLoll: false,
      phaseB: false,
    }));
  }

  let acc = state.acc + dt;
  let steps = state.steps;
  let n = 0;
  const perCycle = Math.round(PHYS.cycle / PHYS.dt);
  // 1/60 을 더해 온 부동소수 오차로 한 걸음을 놓치지 않게 아주 작은 여유를 둔다.
  while (acc >= PHYS.dt - 1e-9 && n < PHYS.maxSteps) {
    acc -= PHYS.dt;
    n++;
    // 이 걸음이 끝나는 시각이 새 주기에 들면 같은 기울기에서 다시 놓는다(원본 `loop.step`).
    if (Math.floor((steps + 1) / perCycle) !== Math.floor(steps / perCycle)) {
      hulls = hulls.map((_, i) => hullAtRelease(i, zgApplied));
    }
    hulls = hulls.map((h, i) => stepHull(h, dimsOf(i, zgApplied), PHYS.dt));
    steps++;
  }
  if (n === PHYS.maxSteps) acc = Math.min(acc, PHYS.dt);

  if (hulls === state.hulls && zgApplied === state.zgApplied) {
    return { ...state, acc: Math.max(0, acc) };
  }
  return {
    ...state,
    zgApplied,
    hulls,
    steps,
    acc: Math.max(0, acc),
    cap: captionFlags(hulls),
  };
}
