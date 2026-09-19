// ========================================================================
// poynting-vector — 순수 물리
// ========================================================================
// 회로 평면(xy) 한 장 위의 계산이다. DOM · 캔버스 · 시간을 모른다.
//
// - 전기장 E — 평면 2차원 라플라스 풀이. 두 도선은 등전위(위 V, 아래 0), 전지 틈과
//   저항 몸통에서는 전위가 세로로 고르게 바뀐다. 먼 경계는 V/2. 3차원 도선 둘레의 장을
//   평면 판으로 근사한 것이다(NOTES b).
// - 자기장 B — 네 변 전류의 비오-사바르. 평면 위에서는 면에 수직인 성분 B_z 만 남는다.
// - 포인팅 벡터 S = E × B / μ₀ = (B_z E_y, −B_z E_x) / μ₀ — 평면 안에 누운다.
//   E 에 수직이므로 S 의 흐름선은 **등전위선**이다. 흐름선은 이 방향을 적분해 뽑는다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import type { PoyntingVectorState } from './state';
import {
  ARROW_MAX,
  BATTERY_GAP_HALF,
  CURRENT,
  DOT_GAP,
  DOT_SPEED,
  E_ARROW_SCALE,
  INNER_LINES,
  LOOP_HALF_WIDTH,
  OUTER_LEVEL_STEP,
  OUTER_LINES,
  PROBE_REACH,
  RESISTOR_HALF,
  S_ARROW_SCALE,
  STATION_COUNT,
  STATION_SPACING,
  VOLTAGE,
  WIRE_Y,
} from './schema';

// ------------------------------------------------------------------------
// 스테이지 상수
// ------------------------------------------------------------------------

export interface PoyntingConstants {
  /** 전지 전압(V). E 의 크기가 이것을 따라간다. */
  voltage: number;
  /** 회로 전류(A). B 의 크기가 이것을 따라간다. */
  current: number;
  /** 도선 높이(± 월드). 두 도선 사이가 2 × 이 값. */
  wireY: number;
  /** 전지 · 저항이 선 자리(± 월드 x). */
  loopHalfWidth: number;
  /** 전지 두 판 사이 틈의 반(월드). 전위가 여기서 뛴다. */
  batteryGapHalf: number;
  /** 저항 몸통의 반 길이(월드). 전위가 여기서 고르게 떨어진다. */
  resistorHalf: number;
  /** 관찰 자리 기둥 수 · 기둥 간격(월드). 가운데 기둥이 x = 0 이다. */
  stationCount: number;
  stationSpacing: number;
  /** 관찰 자리가 도선에서 떨어진 거리(월드) = B 고리 반지름. */
  probeReach: number;
  /** 도선 사이 흐름선 수 · 바깥 흐름선 수(위 · 아래 각각). */
  innerLines: number;
  outerLines: number;
  /** 바깥 흐름선 전위 간격(V 에 대한 비). 도선 전위(0 · 1)에서 이만큼씩 안으로 들어간 등전위선을 탄다. */
  outerLevelStep: number;
  /** 표시 배율 — E(V/m) · S(W/m²) → 화살표 길이(월드). */
  eArrowScale: number;
  sArrowScale: number;
  /** 화살표 길이 상한(월드). 걸리면 비례가 끊긴다(NOTES b). */
  arrowMax: number;
  /** 에너지 알갱이가 흐름선을 따라가는 속력(월드/초) · 알갱이 간격(월드). */
  dotSpeed: number;
  dotGap: number;
}

export function readConstants(stage: StageDef): PoyntingConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    voltage: c.voltage ?? VOLTAGE,
    current: c.current ?? CURRENT,
    wireY: c.wireY ?? WIRE_Y,
    loopHalfWidth: c.loopHalfWidth ?? LOOP_HALF_WIDTH,
    batteryGapHalf: c.batteryGapHalf ?? BATTERY_GAP_HALF,
    resistorHalf: c.resistorHalf ?? RESISTOR_HALF,
    stationCount: Math.max(1, Math.round(c.stationCount ?? STATION_COUNT)),
    stationSpacing: c.stationSpacing ?? STATION_SPACING,
    probeReach: c.probeReach ?? PROBE_REACH,
    innerLines: Math.max(1, Math.round(c.innerLines ?? INNER_LINES)),
    outerLines: Math.max(0, Math.round(c.outerLines ?? OUTER_LINES)),
    outerLevelStep: c.outerLevelStep ?? OUTER_LEVEL_STEP,
    eArrowScale: c.eArrowScale ?? E_ARROW_SCALE,
    sArrowScale: c.sArrowScale ?? S_ARROW_SCALE,
    arrowMax: c.arrowMax ?? ARROW_MAX,
    dotSpeed: c.dotSpeed ?? DOT_SPEED,
    dotGap: c.dotGap ?? DOT_GAP,
  };
}

// ------------------------------------------------------------------------
// 계산 격자 — 조각의 수치 풀이 해상도라 선언이 아니다
// ------------------------------------------------------------------------

/** 격자 간격(월드). 도선 높이 · 전지 · 저항 자리가 이 간격의 배수여야 경계가 칸에 맞는다. */
const GRID_H = 0.1;
/** 계산 영역의 반폭 · 반높이(월드). 먼 경계(V/2)를 회로에서 충분히 떨어뜨린다. */
const DOMAIN_HALF_X = 8;
const DOMAIN_HALF_Y = 6.5;
/** 과완화 계수 · 반복 수. 초기 상태에서 한 번만 푼다. */
const SOR_OMEGA = 1.92;
const SOR_ITERATIONS = 900;

/** 진공 투자율(T·m/A). */
const MU0 = 4e-7 * Math.PI;

/** 흐름선 적분 걸음(월드) · 최대 걸음 수. */
const STREAM_STEP = 0.02;
const STREAM_MAX_STEPS = 2400;
/** 흐름선 씨앗을 전지 틈에서 떼어 놓는 거리(월드). 틈 위에서는 기울기가 한쪽으로만 잡힌다. */
const SEED_OFFSET = 0.06;
/** 흐름선을 저항에 닿았다고 보는 거리(월드). */
const SINK_REACH = 0.06;
/** 흐름선 표본 간격(월드) — 선언에 넘기는 점 수를 줄인다. */
const STREAM_SAMPLE = 0.08;

export interface PotentialGrid {
  cols: number;
  rows: number;
  x0: number;
  y0: number;
  h: number;
  phi: Float64Array;
}

/** 경계 전위 — 도선 · 전지 틈 · 저항 위 칸이면 그 값, 아니면 NaN(자유 칸). */
function fixedPotential(x: number, y: number, c: PoyntingConstants): number {
  const eps = GRID_H * 0.5;
  const V = c.voltage;
  const W = c.loopHalfWidth;
  const H = c.wireY;
  const onX = (x0: number): boolean => Math.abs(x - x0) < eps;
  const onY = (y0: number): boolean => Math.abs(y - y0) < eps;
  const withinX = x >= -W - eps && x <= W + eps;
  const withinY = y >= -H - eps && y <= H + eps;
  if (onY(H) && withinX) return V;
  if (onY(-H) && withinX) return 0;
  // 전지 변 — 위 리드(V) · 틈(고르게) · 아래 리드(0)
  if (onX(-W) && withinY) return ramp(y, c.batteryGapHalf, V);
  // 저항 변 — 위 리드(V) · 몸통(고르게) · 아래 리드(0)
  if (onX(W) && withinY) return ramp(y, c.resistorHalf, V);
  return Number.NaN;
}

/** 세로 한 변의 전위 — |y| ≤ half 에서 0 → V 로 고르게, 그 위는 V, 아래는 0. */
function ramp(y: number, half: number, V: number): number {
  if (y >= half) return V;
  if (y <= -half) return 0;
  return (V * (y + half)) / (2 * half);
}

/** 회로 평면의 전위를 푼다. 같은 상수는 언제나 같은 격자를 낸다. */
export function solvePotential(c: PoyntingConstants): PotentialGrid {
  const h = GRID_H;
  const cols = Math.round((2 * DOMAIN_HALF_X) / h) + 1;
  const rows = Math.round((2 * DOMAIN_HALF_Y) / h) + 1;
  const x0 = -DOMAIN_HALF_X;
  const y0 = -DOMAIN_HALF_Y;
  const n = cols * rows;
  const phi = new Float64Array(n);
  const fixed = new Uint8Array(n);
  const far = c.voltage / 2;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      const edge = i === 0 || j === 0 || i === cols - 1 || j === rows - 1;
      const v = fixedPotential(x0 + i * h, y0 + j * h, c);
      if (!Number.isNaN(v)) {
        phi[k] = v;
        fixed[k] = 1;
      } else if (edge) {
        phi[k] = far;
        fixed[k] = 1;
      } else {
        phi[k] = far;
      }
    }
  }
  for (let it = 0; it < SOR_ITERATIONS; it++) {
    for (let j = 1; j < rows - 1; j++) {
      for (let i = 1; i < cols - 1; i++) {
        const k = j * cols + i;
        if (fixed[k]) continue;
        const avg = 0.25 * (phi[k - 1]! + phi[k + 1]! + phi[k - cols]! + phi[k + cols]!);
        phi[k] = phi[k]! + SOR_OMEGA * (avg - phi[k]!);
      }
    }
  }
  return { cols, rows, x0, y0, h, phi };
}

function phiAt(g: PotentialGrid, x: number, y: number): number {
  const fx = Math.min(Math.max((x - g.x0) / g.h, 0), g.cols - 1.000001);
  const fy = Math.min(Math.max((y - g.y0) / g.h, 0), g.rows - 1.000001);
  const i = Math.floor(fx);
  const j = Math.floor(fy);
  const tx = fx - i;
  const ty = fy - j;
  const k = j * g.cols + i;
  const a = g.phi[k]!;
  const b = g.phi[k + 1]!;
  const cc = g.phi[k + g.cols]!;
  const d = g.phi[k + g.cols + 1]!;
  return (a * (1 - tx) + b * tx) * (1 - ty) + (cc * (1 - tx) + d * tx) * ty;
}

/** 전기장 E = −∇φ (V/m, 월드 1 = 1 m). 가운데 차분. */
export function electricField(g: PotentialGrid, p: Vec2): Vec2 {
  const d = g.h;
  const ex = -(phiAt(g, p[0] + d, p[1]) - phiAt(g, p[0] - d, p[1])) / (2 * d);
  const ey = -(phiAt(g, p[0], p[1] + d) - phiAt(g, p[0], p[1] - d)) / (2 * d);
  return [ex, ey];
}

// ------------------------------------------------------------------------
// 자기장 — 네 변 전류의 비오-사바르 (면에 수직인 성분)
// ------------------------------------------------------------------------

/** 회로 네 변. 전류는 시계 방향 — 위 도선 오른쪽, 저항 아래, 아래 도선 왼쪽, 전지 위. */
function loopSegments(c: PoyntingConstants): readonly [Vec2, Vec2][] {
  const W = c.loopHalfWidth;
  const H = c.wireY;
  return [
    [[-W, H], [W, H]],
    [[W, H], [W, -H]],
    [[W, -H], [-W, -H]],
    [[-W, -H], [-W, H]],
  ];
}

/** 곧은 도선 토막 A→B 가 평면 위 점 P 에 만드는 B_z(T). +z 가 화면 밖(⊙). */
function segmentBz(a: Vec2, b: Vec2, p: Vec2, current: number): number {
  const lx = b[0] - a[0];
  const ly = b[1] - a[1];
  const len = Math.hypot(lx, ly);
  const ux = lx / len;
  const uy = ly / len;
  const rx = p[0] - a[0];
  const ry = p[1] - a[1];
  const along = ux * rx + uy * ry;
  const perp = ux * ry - uy * rx; // (u × r)_z — 부호 있는 수직 거리
  if (Math.abs(perp) < 1e-9) return 0;
  const toA = Math.hypot(rx, ry);
  const toB = Math.hypot(p[0] - b[0], p[1] - b[1]);
  return ((MU0 * current) / (4 * Math.PI * perp)) * ((len - along) / toB + along / toA);
}

export function magneticFieldZ(c: PoyntingConstants, p: Vec2): number {
  let bz = 0;
  for (const [a, b] of loopSegments(c)) bz += segmentBz(a, b, p, c.current);
  return bz;
}

/** 포인팅 벡터 S = E × B / μ₀ (W/m²). 평면 안의 두 성분. */
export function poynting(e: Vec2, bz: number): Vec2 {
  return [(bz * e[1]) / MU0, (-bz * e[0]) / MU0];
}

// ------------------------------------------------------------------------
// 관찰 자리 — 기둥마다 두 도선의 안쪽 · 바깥쪽 (도선을 감는 B 고리가 면을 뚫는 자리)
// ------------------------------------------------------------------------

export interface Probe {
  pos: Vec2;
  /** 화살표 끝까지의 변위(월드) — 표시 배율과 상한을 건 뒤. */
  e: Vec2;
  s: Vec2;
  /** B 가 화면 밖(⊙)이면 true, 안(⊗)이면 false. */
  bOut: boolean;
  /** 두 도선 사이 자리인가. 바깥 자리는 B 표식만 둔다 — E · S 화살표가 표식보다 짧다(NOTES b). */
  inner: boolean;
  /** 이름표(E · B · S)를 다는 한 자리 — 가운데 기둥, 위 도선의 안쪽. */
  named: boolean;
}

function scaled(v: Vec2, scale: number, max: number): Vec2 {
  const x = v[0] * scale;
  const y = v[1] * scale;
  const len = Math.hypot(x, y);
  if (len <= max || len === 0) return [x, y];
  return [(x * max) / len, (y * max) / len];
}

/** 기둥 x 자리들 — 가운데 기둥이 0 이 되게 늘어놓는다. */
export function stationXs(c: PoyntingConstants): number[] {
  const xs: number[] = [];
  for (let k = 0; k < c.stationCount; k++) xs.push((k - (c.stationCount - 1) / 2) * c.stationSpacing);
  return xs;
}

export function probes(g: PotentialGrid, c: PoyntingConstants): Probe[] {
  const out: Probe[] = [];
  const xs = stationXs(c);
  const mid = Math.floor(xs.length / 2);
  const H = c.wireY;
  const r = c.probeReach;
  const rows = [H + r, H - r, -H + r, -H - r];
  xs.forEach((x, k) => {
    for (const y of rows) {
      const pos: Vec2 = [x, y];
      const e = electricField(g, pos);
      const bz = magneticFieldZ(c, pos);
      out.push({
        pos,
        e: scaled(e, c.eArrowScale, c.arrowMax),
        s: scaled(poynting(e, bz), c.sArrowScale, c.arrowMax),
        bOut: bz > 0,
        inner: Math.abs(y) < H,
        named: k === mid && y === H - r,
      });
    }
  });
  return out;
}

// ------------------------------------------------------------------------
// 흐름선 — S 방향 적분 (= 등전위선)
// ------------------------------------------------------------------------

function streamDir(g: PotentialGrid, c: PoyntingConstants, p: Vec2): Vec2 | null {
  const s = poynting(electricField(g, p), magneticFieldZ(c, p));
  const len = Math.hypot(s[0], s[1]);
  if (len === 0 || !Number.isFinite(len)) return null;
  return [s[0] / len, s[1] / len];
}

/** 저항 몸통에 닿았는가 — 왼쪽(고리 안) · 오른쪽(고리 밖) 어느 쪽에서든. */
function reachedSink(c: PoyntingConstants, p: Vec2): boolean {
  return Math.abs(p[0] - c.loopHalfWidth) < SINK_REACH && Math.abs(p[1]) <= c.resistorHalf + SINK_REACH;
}

function trace(g: PotentialGrid, c: PoyntingConstants, seed: Vec2): Vec2[] | null {
  const pts: Vec2[] = [seed];
  let p = seed;
  let since = 0;
  for (let n = 0; n < STREAM_MAX_STEPS; n++) {
    const d1 = streamDir(g, c, p);
    if (!d1) return null;
    const m: Vec2 = [p[0] + (d1[0] * STREAM_STEP) / 2, p[1] + (d1[1] * STREAM_STEP) / 2];
    const d2 = streamDir(g, c, m);
    if (!d2) return null;
    p = [p[0] + d2[0] * STREAM_STEP, p[1] + d2[1] * STREAM_STEP];
    since += STREAM_STEP;
    if (since >= STREAM_SAMPLE) {
      pts.push(p);
      since = 0;
    }
    if (reachedSink(c, p)) {
      pts.push([c.loopHalfWidth, p[1]]);
      return pts;
    }
    if (Math.abs(p[0]) > DOMAIN_HALF_X - 0.5 || Math.abs(p[1]) > DOMAIN_HALF_Y - 0.5) return null;
  }
  return null;
}

/**
 * 전지 틈에서 나와 저항으로 들어가는 흐름선들.
 * 도선 사이는 틈 안 전위를 고르게 나눈 자리에서, 바깥은 도선 전위 쪽으로 붙은 자리에서 씨앗을 뿌린다.
 */
export function streamlines(g: PotentialGrid, c: PoyntingConstants): Vec2[][] {
  const W = c.loopHalfWidth;
  const gap = c.batteryGapHalf;
  const lines: Vec2[][] = [];
  // 전위 비 ℓ(0~1) 인 틈 위 높이.
  const yOf = (level: number): number => -gap + 2 * gap * level;
  for (let k = 1; k <= c.innerLines; k++) {
    const line = trace(g, c, [-W + SEED_OFFSET, yOf(k / (c.innerLines + 1))]);
    if (line) lines.push(line);
  }
  for (let k = 1; k <= c.outerLines; k++) {
    for (const level of [1 - k * c.outerLevelStep, k * c.outerLevelStep]) {
      const line = trace(g, c, [-W - SEED_OFFSET, yOf(level)]);
      if (line) lines.push(line);
    }
  }
  return lines;
}

// ------------------------------------------------------------------------
// 흐름선 위 알갱이 — 시각의 함수
// ------------------------------------------------------------------------

export function cumulative(line: readonly Vec2[]): number[] {
  const acc = [0];
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1]!;
    const b = line[i]!;
    acc.push(acc[i - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  return acc;
}

export function pointAt(line: readonly Vec2[], acc: readonly number[], s: number): Vec2 {
  let i = 1;
  while (i < acc.length - 1 && acc[i]! < s) i++;
  const s0 = acc[i - 1]!;
  const s1 = acc[i]!;
  const t = s1 > s0 ? (s - s0) / (s1 - s0) : 0;
  const a = line[i - 1]!;
  const b = line[i]!;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** 시각 t 에 흐름선 위에 있는 알갱이 자리들. 간격 `dotGap`, 속력 `dotSpeed`. */
export function dotsOn(line: readonly Vec2[], acc: readonly number[], t: number, c: PoyntingConstants): Vec2[] {
  const total = acc[acc.length - 1]!;
  const out: Vec2[] = [];
  if (total <= 0) return out;
  const shift = (((t * c.dotSpeed) % c.dotGap) + c.dotGap) % c.dotGap;
  for (let s = shift; s < total; s += c.dotGap) out.push(pointAt(line, acc, s));
  return out;
}

/** 상태에 쌓는 것이 없다 — 모든 움직임이 시각의 함수다. */
export function step(params: { state: PoyntingVectorState }): PoyntingVectorState {
  return params.state;
}
