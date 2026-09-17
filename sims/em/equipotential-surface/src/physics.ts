// ========================================================================
// equipotential-surface — 순수 계산
// ========================================================================
// DOM · 캔버스 · 색을 모른다 (S-sim). 식과 상수는 원본(index.html) 그대로다.
//
// 3차원 지형은 조각이 계산한다 — 투영 · 깊이 판정 · 기울기 음영을 원본 px 격자에 구워
// **밝기 값 배열**로 넘기고, 칠하는 것은 `scalarField` 다. 곡면을 그리는 어휘가 없어서다
// (NOTES.md 「어휘 부족」 새 부족). 색이 아니라 밝기 비(0~1)만 만든다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import {
  DEPTH_TOLERANCE,
  DOMAIN,
  DRAG,
  EPS,
  LEVELS,
  LIFT,
  LIGHT,
  MAP,
  MAP_CONTOUR_GRID,
  MAP_GRID,
  MESH,
  P3,
  RAMP,
  STAGE,
  SURFACE_W,
  TEST,
  V0,
} from './schema';
import type { DragHandle, EquipotentialSurfaceState } from './state';

export interface Charge {
  readonly x: number;
  readonly y: number;
  readonly q: number;
}

/** 경로 위 한 점. `map` · `p3` 는 월드 좌표(지도 · 지형 위). */
export interface PathPoint {
  readonly x: number;
  readonly y: number;
  readonly s: number;
  readonly h: number;
  readonly map: Vec2;
  readonly p3: Vec2;
  readonly vis: boolean;
}

/** 경로가 등전위선과 만나는 곳. `px` 는 원본 지도 px(y 아래), `ux`·`uy` 는 물리 좌표의 장 방향. */
export interface Crossing {
  readonly s: number;
  readonly px: number;
  readonly py: number;
  readonly ux: number;
  readonly uy: number;
}

export interface TestPath {
  readonly pts: readonly PathPoint[];
  readonly cross: readonly Crossing[];
  /** 경로 길이. */
  readonly L: number;
  readonly off: number;
}

/** 배치에서 파생된 모든 것. */
export interface Terrain {
  /** 지형 밝기 격자 — `SURFACE_W × STAGE.height`, 행 우선, 첫 행이 위. */
  readonly surfaceValues: readonly number[];
  /** 지형 깊이 버퍼 — 곡면 위 점의 가려짐 판정. */
  readonly zbuf: Float32Array;
  /** 지도 밝기 격자 — `MAP_GRID`. */
  readonly mapValues: readonly number[];
  /** 등전위선 선분(월드) — 지형 위(보이는 것만) · 지도. */
  readonly surfaceContours: readonly (readonly Vec2[])[];
  readonly mapContours: readonly (readonly Vec2[])[];
  /** 지형 위 원천 전하 — 보일 때만 그린다. `pos` 는 월드. */
  readonly surfaceCharges: readonly { readonly pos: Vec2; readonly q: number; readonly visible: boolean }[];
  /** 시험 전하 경로 여섯. 너무 짧으면 null. */
  readonly paths: readonly (TestPath | null)[];
}

// ------------------------------------------------------------------------
// 좌표
// ------------------------------------------------------------------------

/** 원본 px(y 아래) → 월드(y 위). */
export function toWorld(px: number, py: number): Vec2 {
  return [px, STAGE.height - py];
}

const X_SPAN = DOMAIN.xMax - DOMAIN.xMin;
const Y_SPAN = DOMAIN.yMax - DOMAIN.yMin;

/** 물리 좌표 → 지도 px. */
export function toMap(x: number, y: number): [number, number] {
  return [MAP.x + ((x - DOMAIN.xMin) / X_SPAN) * MAP.w, MAP.y + ((DOMAIN.yMax - y) / Y_SPAN) * MAP.h];
}

/** 물리 좌표 → 지도 위 월드 자리. */
export function mapWorld(x: number, y: number): Vec2 {
  const [px, py] = toMap(x, y);
  return toWorld(px, py);
}

function fromMapWorld(p: Vec2): { x: number; y: number } {
  const px = p[0];
  const py = STAGE.height - p[1];
  return {
    x: DOMAIN.xMin + ((px - MAP.x) / MAP.w) * X_SPAN,
    y: DOMAIN.yMax - ((py - MAP.y) / MAP.h) * Y_SPAN,
  };
}

const C_YAW = Math.cos(P3.yaw);
const S_YAW = Math.sin(P3.yaw);
const C_EL = Math.cos(P3.el);
const S_EL = Math.sin(P3.el);

/** 3차원 투영 — [px, py, 깊이]. 원본 `proj`. */
export function proj(x: number, y: number, h: number): [number, number, number] {
  const xr = x * C_YAW - y * S_YAW;
  const yr = x * S_YAW + y * C_YAW;
  const z = h * P3.hs;
  return [P3.cx + P3.s * xr, P3.cy - P3.s * (yr * S_EL + z * C_EL), yr * C_EL - z * S_EL];
}

// ------------------------------------------------------------------------
// 장
// ------------------------------------------------------------------------

export function potential(charges: readonly Charge[], x: number, y: number): number {
  let v = 0;
  for (const c of charges) {
    const dx = x - c.x;
    const dy = y - c.y;
    v += c.q / Math.sqrt(dx * dx + dy * dy + EPS * EPS);
  }
  return v;
}

export function height(charges: readonly Charge[], x: number, y: number): number {
  return Math.tanh(potential(charges, x, y) / V0);
}

export function field(charges: readonly Charge[], x: number, y: number): [number, number] {
  let ex = 0;
  let ey = 0;
  for (const c of charges) {
    const dx = x - c.x;
    const dy = y - c.y;
    const r2 = dx * dx + dy * dy + EPS * EPS;
    const k = c.q / (r2 * Math.sqrt(r2));
    ex += k * dx;
    ey += k * dy;
  }
  return [ex, ey];
}

// ------------------------------------------------------------------------
// 명암 — 높이 → 밝기 값
// ------------------------------------------------------------------------

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

const PAPER_LINEAR = srgbToLinear(RAMP.paper);

/**
 * 높이 · 음영 → `scalarField` 값(0 = 바탕, 1 = 가장 짙음).
 *
 * 원본은 청회색 명암(`rampRGB`)을 칠했다. 여기서는 그 밝기가 원본 페이지 바탕에 대해 갖는
 * **빛의 양 비**를 값으로 넘긴다 — `scalarField` 가 바탕과 역할색을 선형광으로 섞으므로,
 * 바탕 → 먹 사이에서 원본과 같은 비의 밝기가 나온다.
 */
export function shadeValue(h: number, shade: number): number {
  const u = (h + 1) / 2;
  const b = (RAMP.dark + (RAMP.bright - RAMP.dark) * u) * shade;
  return Math.max(0, Math.min(1, 1 - srgbToLinear(b) / PAPER_LINEAR));
}

// ------------------------------------------------------------------------
// 등고선 (마칭 스퀘어) — 원본 `march`
// ------------------------------------------------------------------------

function march(
  nx: number,
  ny: number,
  xAt: (i: number) => number,
  yAt: (j: number) => number,
  val: Float32Array,
  level: number,
  emit: (x1: number, y1: number, x2: number, y2: number) => void,
): void {
  const ex = [0, 0, 0, 0];
  const ey = [0, 0, 0, 0];
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const v0 = val[j * nx + i]!;
      const v1 = val[j * nx + i + 1]!;
      const v2 = val[(j + 1) * nx + i + 1]!;
      const v3 = val[(j + 1) * nx + i]!;
      const b0 = v0 >= level;
      const b1 = v1 >= level;
      const b2 = v2 >= level;
      const b3 = v3 >= level;
      if (b0 === b1 && b1 === b2 && b2 === b3) continue;
      let n = 0;
      const x0 = xAt(i);
      const x1 = xAt(i + 1);
      const y0 = yAt(j);
      const y1 = yAt(j + 1);
      if (b0 !== b1) { const f = (level - v0) / (v1 - v0); ex[n] = x0 + (x1 - x0) * f; ey[n] = y0; n++; }
      if (b1 !== b2) { const f = (level - v1) / (v2 - v1); ex[n] = x1; ey[n] = y0 + (y1 - y0) * f; n++; }
      if (b2 !== b3) { const f = (level - v2) / (v3 - v2); ex[n] = x1 + (x0 - x1) * f; ey[n] = y1; n++; }
      if (b3 !== b0) { const f = (level - v3) / (v0 - v3); ex[n] = x0; ey[n] = y1 + (y0 - y1) * f; n++; }
      if (n >= 2) emit(ex[0]!, ey[0]!, ex[1]!, ey[1]!);
      if (n === 4) emit(ex[2]!, ey[2]!, ex[3]!, ey[3]!);
    }
  }
}

// ------------------------------------------------------------------------
// 깊이 판정 — 원본 `rastTri` · `visible3`
// ------------------------------------------------------------------------

type P = readonly [number, number, number];

/** 삼각형을 깊이 버퍼에 굽는다. 더 가까우면 그 칸의 밝기 값도 함께 쓴다. */
function rastTri(zbuf: Float32Array, shadeBuf: Float32Array, a: P, b: P, c: P, value: number): void {
  const W = SURFACE_W;
  const H = STAGE.height;
  const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
  const maxX = Math.min(W - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
  const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
  const maxY = Math.min(H - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
  const den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
  if (Math.abs(den) < 1e-9) return;
  for (let y = minY; y <= maxY; y++) {
    const py = y + 0.5;
    for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5;
      const w1 = ((b[1] - c[1]) * (px - c[0]) + (c[0] - b[0]) * (py - c[1])) / den;
      const w2 = ((c[1] - a[1]) * (px - c[0]) + (a[0] - c[0]) * (py - c[1])) / den;
      const w3 = 1 - w1 - w2;
      if (w1 < -1e-3 || w2 < -1e-3 || w3 < -1e-3) continue;
      const d = w1 * a[2] + w2 * b[2] + w3 * c[2];
      const idx = y * W + x;
      if (d < zbuf[idx]!) {
        zbuf[idx] = d;
        shadeBuf[idx] = value;
      }
    }
  }
}

/** 곡면 위 점이 곡면에 가려지지 않는가. */
export function visible3(zbuf: Float32Array, x: number, y: number, h: number): boolean {
  const p = proj(x, y, h);
  const px = Math.floor(p[0]);
  const py = Math.floor(p[1]);
  if (px < 0 || py < 0 || px >= SURFACE_W || py >= STAGE.height) return true;
  return p[2] <= zbuf[py * SURFACE_W + px]! + DEPTH_TOLERANCE;
}

// ------------------------------------------------------------------------
// 시험 전하 경로 — 원본 `trace`
// ------------------------------------------------------------------------

function trace(charges: readonly Charge[], x0: number, y0: number): { x: number; y: number; s: number; h: number }[] {
  let x = x0;
  let y = y0;
  const pts = [{ x, y, s: 0, h: height(charges, x, y) }];
  let s = 0;
  for (let n = 0; n < TEST.maxSteps; n++) {
    let [ex, ey] = field(charges, x, y);
    let m = Math.hypot(ex, ey);
    if (m < 1e-6) break;
    const hx = x + (0.5 * TEST.ds * ex) / m;
    const hy = y + (0.5 * TEST.ds * ey) / m;
    [ex, ey] = field(charges, hx, hy);
    m = Math.hypot(ex, ey);
    if (m < 1e-6) break;
    x += (TEST.ds * ex) / m;
    y += (TEST.ds * ey) / m;
    s += TEST.ds;
    if (x < DOMAIN.xMin || x > DOMAIN.xMax || y < DOMAIN.yMin || y > DOMAIN.yMax) break;
    pts.push({ x, y, s, h: height(charges, x, y) });
    let sink = false;
    for (const c of charges) if (c.q < 0 && Math.hypot(x - c.x, y - c.y) < TEST.sinkR) sink = true;
    if (sink) break;
  }
  return pts;
}

// ------------------------------------------------------------------------
// 배치 → 파생 전부 — 원본 `rebuild`
// ------------------------------------------------------------------------

export function buildTerrain(charges: readonly Charge[]): Terrain {
  // ---- 지도 밝기 ----
  const { cols, rows } = MAP_GRID;
  const mapValues: number[] = new Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    const y = DOMAIN.yMax - ((j + 0.5) / rows) * Y_SPAN;
    for (let i = 0; i < cols; i++) {
      const x = DOMAIN.xMin + ((i + 0.5) / cols) * X_SPAN;
      mapValues[j * cols + i] = shadeValue(height(charges, x, y), 1);
    }
  }

  // ---- 지도 등전위선 ----
  const { nx: NX, ny: NY } = MAP_CONTOUR_GRID;
  const gx = (i: number): number => DOMAIN.xMin + (i / (NX - 1)) * X_SPAN;
  const gy = (j: number): number => DOMAIN.yMin + (j / (NY - 1)) * Y_SPAN;
  const gv = new Float32Array(NX * NY);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) gv[j * NX + i] = height(charges, gx(i), gy(j));
  const mapContours: Vec2[][] = [];
  for (let k = 0; k < LEVELS.count; k++) {
    march(NX, NY, gx, gy, gv, LEVELS.min + k * LEVELS.step, (x1, y1, x2, y2) => {
      mapContours.push([mapWorld(x1, y1), mapWorld(x2, y2)]);
    });
  }

  // ---- 지형 격자 · 깊이 · 밝기 ----
  const { mx: MX, my: MY } = MESH;
  const mx = (i: number): number => DOMAIN.xMin + (i / MX) * X_SPAN;
  const my = (j: number): number => DOMAIN.yMin + (j / MY) * Y_SPAN;
  const nh = new Float32Array((MX + 1) * (MY + 1));
  const np: P[] = [];
  for (let j = 0; j <= MY; j++) {
    for (let i = 0; i <= MX; i++) {
      const h = height(charges, mx(i), my(j));
      nh[j * (MX + 1) + i] = h;
      np.push(proj(mx(i), my(j), h));
    }
  }
  const [lx, ly, lz] = LIGHT.dir;
  const ln = Math.hypot(lx, ly, lz);
  const dx = X_SPAN / MX;
  const dy = Y_SPAN / MY;
  const zbuf = new Float32Array(SURFACE_W * STAGE.height).fill(Infinity);
  const shadeBuf = new Float32Array(SURFACE_W * STAGE.height);
  for (let j = 0; j < MY; j++) {
    for (let i = 0; i < MX; i++) {
      const a = j * (MX + 1) + i;
      const b = a + 1;
      const c = a + MX + 2;
      const d = a + MX + 1;
      const h00 = nh[a]!;
      const h10 = nh[b]!;
      const h11 = nh[c]!;
      const h01 = nh[d]!;
      const gxv = (((h10 + h11) - (h00 + h01)) / (2 * dx)) * P3.hs;
      const gyv = (((h01 + h11) - (h00 + h10)) / (2 * dy)) * P3.hs;
      const nn = Math.hypot(gxv, gyv, 1);
      const dot = (-gxv * lx - gyv * ly + lz) / (nn * ln);
      const shade = LIGHT.base + LIGHT.gain * Math.max(0, dot);
      const value = shadeValue((h00 + h10 + h11 + h01) / 4, shade);
      rastTri(zbuf, shadeBuf, np[a]!, np[b]!, np[c]!, value);
      rastTri(zbuf, shadeBuf, np[a]!, np[c]!, np[d]!, value);
    }
  }

  // ---- 지형 위 등전위선 (보이는 것만) ----
  const surfaceContours: Vec2[][] = [];
  for (let k = 0; k < LEVELS.count; k++) {
    const lv = LEVELS.min + k * LEVELS.step;
    march(MX + 1, MY + 1, mx, my, nh, lv, (x1, y1, x2, y2) => {
      if (!visible3(zbuf, (x1 + x2) / 2, (y1 + y2) / 2, lv)) return;
      const p1 = proj(x1, y1, lv + LIFT.contour);
      const p2 = proj(x2, y2, lv + LIFT.contour);
      surfaceContours.push([toWorld(p1[0], p1[1]), toWorld(p2[0], p2[1])]);
    });
  }

  // ---- 지형 위 원천 전하 ----
  const surfaceCharges = charges.map((c) => {
    const h = height(charges, c.x, c.y);
    const p = proj(c.x, c.y, h);
    return { pos: toWorld(p[0], p[1]), q: c.q, visible: visible3(zbuf, c.x, c.y, h) };
  });

  // ---- 시험 전하 경로 ----
  const src = charges.find((c) => c.q > 0)!;
  const paths: (TestPath | null)[] = [];
  const N = TEST.offsets.length;
  for (let i = 0; i < N; i++) {
    const ang = (2 * Math.PI * (i + 0.5)) / N + TEST.startTwist;
    const raw = trace(charges, src.x + TEST.startR * Math.cos(ang), src.y + TEST.startR * Math.sin(ang));
    if (raw.length < 3) {
      paths.push(null);
      continue;
    }
    const pts: PathPoint[] = raw.map((p) => {
      const p3 = proj(p.x, p.y, p.h + LIFT.path);
      return { ...p, map: mapWorld(p.x, p.y), p3: toWorld(p3[0], p3[1]), vis: visible3(zbuf, p.x, p.y, p.h) };
    });
    // 등전위선과 만나는 곳
    const cross: Crossing[] = [];
    for (let n = 1; n < pts.length; n++) {
      const A = pts[n - 1]!;
      const B = pts[n]!;
      const hi = Math.max(A.h, B.h);
      const lo = Math.min(A.h, B.h);
      const k0 = Math.ceil((lo - LEVELS.min) / LEVELS.step - 1e-9);
      const k1 = Math.floor((hi - LEVELS.min) / LEVELS.step + 1e-9);
      for (let k = Math.max(0, k0); k <= Math.min(LEVELS.count - 1, k1); k++) {
        const lv = LEVELS.min + k * LEVELS.step;
        if (hi === lo) continue;
        const f = (A.h - lv) / (A.h - B.h);
        if (f < 0 || f > 1) continue;
        const x = A.x + (B.x - A.x) * f;
        const y = A.y + (B.y - A.y) * f;
        const [ex, ey] = field(charges, x, y);
        const m = Math.hypot(ex, ey) || 1;
        const [px, py] = toMap(x, y);
        cross.push({ s: A.s + (B.s - A.s) * f, px, py, ux: ex / m, uy: ey / m });
      }
    }
    paths.push({ pts, cross, L: pts[pts.length - 1]!.s, off: TEST.offsets[i]! });
  }

  return {
    surfaceValues: Array.from(shadeBuf),
    zbuf,
    mapValues,
    surfaceContours,
    mapContours,
    surfaceCharges,
    paths,
  };
}

// ------------------------------------------------------------------------
// 시각 → 시험 전하 자리 — 원본 `stateOf` · `headOf`
// ------------------------------------------------------------------------

/** 경로 위 이동 거리와 흐려짐. 내려가는 동안 1, 끝에 닿으면 `pause` 초 동안 0 으로. */
export function progressOf(path: TestPath, t: number): { s: number; alpha: number } {
  const travel = path.L / TEST.speed;
  const cycle = travel + TEST.pause;
  const tau = (((t + path.off) % cycle) + cycle) % cycle;
  const s = Math.min(tau, travel) * TEST.speed;
  const alpha = tau <= travel ? 1 : Math.max(0, 1 - (tau - travel) / TEST.pause);
  return { s, alpha };
}

export interface Head {
  /** 지나온 마지막 표본 번호. */
  readonly k: number;
  readonly map: Vec2;
  readonly p3: Vec2;
  readonly vis: boolean;
}

export function headOf(terrain: Terrain, path: TestPath, s: number): Head {
  const pts = path.pts;
  const k = Math.min(pts.length - 2, Math.floor(s / TEST.ds));
  const A = pts[k]!;
  const B = pts[k + 1]!;
  const f = Math.max(0, Math.min(1, (s - A.s) / TEST.ds));
  const x = A.x + (B.x - A.x) * f;
  const y = A.y + (B.y - A.y) * f;
  const h = A.h + (B.h - A.h) * f;
  const p3 = proj(x, y, h + LIFT.path);
  return { k, map: mapWorld(x, y), p3: toWorld(p3[0], p3[1]), vis: visible3(terrain.zbuf, x, y, h) };
}

// ------------------------------------------------------------------------
// 한 걸음 — 시계와 끌기
// ------------------------------------------------------------------------

/** 잡힌 손잡이 자리에서 전하의 새 자리. 다른 전하에 너무 가까우면 옮기지 않는다 (원본 그대로). */
function dragged(handle: DragHandle, self: Charge, other: Charge): Charge {
  if (!handle.held) return self;
  const p = fromMapWorld(handle.pos);
  const x = Math.max(DOMAIN.xMin + DRAG.margin, Math.min(DOMAIN.xMax - DRAG.margin, p.x));
  const y = Math.max(DOMAIN.yMin + DRAG.margin, Math.min(DOMAIN.yMax - DRAG.margin, p.y));
  if (Math.hypot(x - other.x, y - other.y) < DRAG.minApart) return self;
  if (x === self.x && y === self.y) return self;
  return { x, y, q: self.q };
}

export function step(params: { state: EquipotentialSurfaceState; dt: number }): EquipotentialSurfaceState {
  const { state, dt } = params;
  const [plus0, minus0] = state.charges;
  const plus = dragged(state.drag.plus, plus0, minus0);
  const minus = dragged(state.drag.minus, minus0, plus);
  const moved = plus !== plus0 || minus !== minus0;
  const charges: readonly [Charge, Charge] = moved ? [plus, minus] : state.charges;

  // 놓여 있는 손잡이는 전하 자리를 따라간다.
  const follow = (h: DragHandle, c: Charge): DragHandle => (h.held ? h : { pos: mapWorld(c.x, c.y), held: false });

  return {
    t: state.t + dt,
    charges,
    terrain: moved ? buildTerrain(charges) : state.terrain,
    drag: { plus: follow(state.drag.plus, plus), minus: follow(state.drag.minus, minus) },
  };
}
