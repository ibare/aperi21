// ========================================================================
// magnetic-field-lines — 순수 물리
// ========================================================================
// 장 — 고르게 자화된 막대자석은 **윗면 · 아랫면을 도는 표면 전류**와 같은 장을 만든다
// (자화 M 이 +x 이면 윗면에는 종이 밖으로, 아랫면에는 종이 안으로 흐르는 전류 판).
// 2차원에서 전류 판 하나의 장은 닫힌 꼴이 있다 — 판이 x₁ ~ x₂, 높이 y₀ 일 때 dy = y − y₀,
//   Bx = −[atan((x − x₁)/dy) − atan((x − x₂)/dy)]
//   By = ½ · ln(((x − x₁)² + dy²) / ((x − x₂)² + dy²))
// 윗판에서 아랫판을 빼면 막대 하나의 장이다. 자석 속에서는 S → N(+x), 바깥에서는 N 에서
// 나와 S 로 휘어 든다. 전류가 만드는 장이라 발산이 없고, 그래서 **선이 끊기지 않고 닫힌다.**
//
// 자석을 잘라 떼어 놓으면 두 반쪽이 같은 방향으로 자화된 짧은 막대 둘이다 — 두 장을 더한다.
// 잘린 면에 새 N · S 가 생기는 것은 따로 넣지 않는다. 장을 더하면 저절로 그렇게 나온다.
//
// 자기력선은 자속 함수 A 를 고른 간격으로 나눈 값마다 한 가닥이다. 왼쪽 반쪽 가운데 세로선의
// 자석 속에서 그 값이 나는 자리를 씨앗으로 RK4 로 따라가, 제자리로 돌아오면 닫는다.
// 모든 것이 (스테이지 상수, 틈)의 함수라 쌓는 상태가 없다 — 같은 시각은 언제나 같은 화면이다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  CUT_GAP,
  LINE_BOUNDS,
  LINES_PER_SIDE,
  MAGNET_LENGTH,
  MAGNET_WIDTH,
  OUTER_REACH,
  TRACED_LINE,
  TRACED_LINE_CUT,
} from './schema';
import type { MagneticFieldLinesState } from './state';

/** 선을 따라가는 한 걸음(월드). 자석 폭의 몇 분의 일이면 모서리 곁에서도 선이 매끈하다. */
const TRACE_STEP = 0.02;
/** 한 선을 따라가는 최대 걸음 수. 넘으면 닫히지 않은 것으로 보고 버린다. */
const MAX_STEPS = 4000;
/** 제자리로 돌아왔다고 보기 전에 적어도 지나야 하는 길이(월드). 출발 직후를 닫힘으로 읽지 않는다. */
const MIN_LOOP_LENGTH = 1;
/** 장이 0 에 가까운 자리에서 방향을 정하지 않는 문턱. */
const FIELD_EPSILON = 1e-12;
/** 판 높이와 같은 자리에서 0 으로 나누지 않게 비키는 거리. */
const SHEET_EPSILON = 1e-9;
/** 씨앗 높이를 찾는 이분법 횟수. 자석 폭을 2⁴⁰ 으로 나눈 만큼까지 좁힌다. */
const SEED_BISECTIONS = 40;

export interface MagneticFieldLinesConstants {
  /** 막대자석 길이 · 폭(월드). N극이 오른쪽(+x)이다. */
  magnetLength: number;
  magnetWidth: number;
  /** 잘라 떼어 놓았을 때 두 반쪽 사이의 틈(월드). */
  cutGap: number;
  /** 자석 위 · 아래 각각에 둘 선 수. */
  linesPerSide: number;
  /** 가장 바깥 선이 자석 위 가운데 세로선을 지나는 높이(월드). 이 안에 선을 고른 자속 간격으로 둔다. */
  outerReach: number;
  /** 온 자석에서 점이 따라가는 선 — 자석에 붙은 선부터 바깥으로 센 번호(0 부터). */
  tracedLine: number;
  /** 잘린 뒤 왼쪽 반쪽에서 점이 따라가는 선의 번호. */
  tracedLineCut: number;
}

export function readConstants(stage: StageDef): MagneticFieldLinesConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    magnetLength: c.magnetLength ?? MAGNET_LENGTH,
    magnetWidth: c.magnetWidth ?? MAGNET_WIDTH,
    cutGap: c.cutGap ?? CUT_GAP,
    linesPerSide: Math.max(1, Math.round(c.linesPerSide ?? LINES_PER_SIDE)),
    outerReach: c.outerReach ?? OUTER_REACH,
    tracedLine: Math.max(0, Math.round(c.tracedLine ?? TRACED_LINE)),
    tracedLineCut: Math.max(0, Math.round(c.tracedLineCut ?? TRACED_LINE_CUT)),
  };
}

// ------------------------------------------------------------------------
// 자석 — 틈이 0 이면 온 자석 하나와 같다
// ------------------------------------------------------------------------

export interface MagnetPiece {
  /** 가운데 x(월드). y 는 0. */
  cx: number;
  /** 길이의 절반 · 폭의 절반. */
  halfLength: number;
  halfWidth: number;
}

/** 틈 `gap` 만큼 떼어 놓은 두 반쪽. 틈이 0 이면 둘이 맞붙어 온 자석이다. */
export function magnetPieces(c: MagneticFieldLinesConstants, gap: number): [MagnetPiece, MagnetPiece] {
  const quarter = c.magnetLength / 4;
  const halfWidth = c.magnetWidth / 2;
  return [
    { cx: -(quarter + gap / 2), halfLength: quarter, halfWidth },
    { cx: quarter + gap / 2, halfLength: quarter, halfWidth },
  ];
}

function insidePiece(m: MagnetPiece, p: Vec2): boolean {
  return Math.abs(p[0] - m.cx) <= m.halfLength && Math.abs(p[1]) <= m.halfWidth;
}

function insideAny(pieces: readonly MagnetPiece[], p: Vec2): boolean {
  return pieces.some((m) => insidePiece(m, p));
}

/** 높이 y₀, x₁ ~ x₂ 의 전류 판(종이 밖으로)이 (x, y) 에 만드는 장. 세기는 상대값이다. */
function sheetField(x: number, y: number, x1: number, x2: number, y0: number): Vec2 {
  let dy = y - y0;
  if (Math.abs(dy) < SHEET_EPSILON) dy = dy < 0 ? -SHEET_EPSILON : SHEET_EPSILON;
  const bx = -(Math.atan((x - x1) / dy) - Math.atan((x - x2) / dy));
  const by = 0.5 * Math.log(((x - x1) ** 2 + dy * dy) / ((x - x2) ** 2 + dy * dy));
  return [bx, by];
}

/** 한 자리의 자기장 [Bx, By] — 조각들의 윗판(+) · 아랫판(−)을 더한다. */
export function fieldAt(pieces: readonly MagnetPiece[], p: Vec2): Vec2 {
  let bx = 0;
  let by = 0;
  for (const m of pieces) {
    const x1 = m.cx - m.halfLength;
    const x2 = m.cx + m.halfLength;
    const top = sheetField(p[0], p[1], x1, x2, m.halfWidth);
    const bottom = sheetField(p[0], p[1], x1, x2, -m.halfWidth);
    bx += top[0] - bottom[0];
    by += top[1] - bottom[1];
  }
  return [bx, by];
}

/** 적분 ∫ ½·ln(u² + d²) du 의 한 원시함수. */
function halfLogIntegral(u: number, d: number): number {
  const r2 = u * u + d * d;
  const logTerm = r2 > 0 ? 0.5 * u * Math.log(r2) : 0;
  const atanTerm = d !== 0 ? d * Math.atan(u / d) : 0;
  return logTerm - u + atanTerm;
}

/**
 * 자속 함수(벡터 퍼텐셜의 z 성분) A. 자기력선은 A 가 같은 값인 곡선이다 — 두 선 사이의 A 차가
 * 그 사이를 지나는 자속이므로, A 를 고른 간격으로 나눠 선을 고르면 **선이 빽빽한 곳이 센 곳**이 된다.
 * `∂A/∂y = Bx`, `∂A/∂x = −By` 로 `fieldAt` 과 짝이 맞는다.
 */
export function fluxAt(pieces: readonly MagnetPiece[], p: Vec2): number {
  let a = 0;
  for (const m of pieces) {
    const x1 = m.cx - m.halfLength;
    const x2 = m.cx + m.halfLength;
    for (const [y0, sign] of [
      [m.halfWidth, 1],
      [-m.halfWidth, -1],
    ] as const) {
      const d = p[1] - y0;
      a += sign * -(halfLogIntegral(p[0] - x1, d) - halfLogIntegral(p[0] - x2, d));
    }
  }
  return a;
}

function direction(pieces: readonly MagnetPiece[], p: Vec2): Vec2 {
  const [bx, by] = fieldAt(pieces, p);
  const b = Math.hypot(bx, by);
  if (b < FIELD_EPSILON) return [0, 0];
  return [bx / b, by / b];
}

// ------------------------------------------------------------------------
// 선 추적
// ------------------------------------------------------------------------

/** 자석 틀(x = 자석을 따라, y = 가로질러)에서 선 자리 밖인가. */
function outOfBounds(p: Vec2): boolean {
  return Math.abs(p[0]) > LINE_BOUNDS.along || Math.abs(p[1]) > LINE_BOUNDS.across;
}

/**
 * 씨앗점에서 장을 따라가 제자리로 돌아온 닫힌 선. 선이 선 자리(`LINE_BOUNDS`) 밖으로 나가거나
 * 걸음이 다하면 `null` — 닫힌 것을 확인하지 못한 선은 그리지 않는다.
 *
 * 씨앗은 자석 속이라 장이 +x 로 흐른다. 한 바퀴 돌아 씨앗의 세로선을 +x 쪽으로 다시 건너면 닫힌다.
 */
function traceLoop(pieces: readonly MagnetPiece[], seed: Vec2): Vec2[] | null {
  const pts: Vec2[] = [seed];
  let p = seed;
  let travelled = 0;
  const h = TRACE_STEP;
  for (let i = 0; i < MAX_STEPS; i++) {
    const k1 = direction(pieces, p);
    const k2 = direction(pieces, [p[0] + (h / 2) * k1[0], p[1] + (h / 2) * k1[1]]);
    const k3 = direction(pieces, [p[0] + (h / 2) * k2[0], p[1] + (h / 2) * k2[1]]);
    const k4 = direction(pieces, [p[0] + h * k3[0], p[1] + h * k3[1]]);
    const next: Vec2 = [
      p[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      p[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    ];
    travelled += Math.hypot(next[0] - p[0], next[1] - p[1]);
    if (outOfBounds(next)) return null;
    // 씨앗의 세로선을 +x 로 건넜고, 씨앗과 같은 자석 속이면 한 바퀴 돈 것이다.
    if (travelled > MIN_LOOP_LENGTH && p[0] < seed[0] && next[0] >= seed[0] && insideAny(pieces, next)) {
      return pts;
    }
    pts.push(next);
    p = next;
  }
  return null;
}

/** 닫힌 선 한 가닥. 점은 장의 방향 순서이고, 첫 점이 **자석에서 나오는 자리**다. */
export interface FieldLoop {
  points: Vec2[];
  /** 점마다 첫 점에서부터 잰 길이(월드). 닫는 마지막 구간은 `length` 에 들어 있다. */
  arc: number[];
  /** 한 바퀴 길이(월드). */
  length: number;
  /** 바깥 구간이 끝나고 자석으로 들어가는 자리의 길이(월드). 그 앞이 바깥, 뒤가 자석 속이다. */
  entryArc: number;
}

/** 첫 점을 자석에서 나오는 자리로 옮기고 길이를 잰다. */
function orient(pieces: readonly MagnetPiece[], loop: readonly Vec2[]): FieldLoop | null {
  const n = loop.length;
  const inside = loop.map((q) => insideAny(pieces, q));
  // 자석 속 → 바깥으로 넘어가는 첫 자리.
  let exit = -1;
  for (let i = 0; i < n; i++) {
    if (inside[i] && !inside[(i + 1) % n]) {
      exit = (i + 1) % n;
      break;
    }
  }
  if (exit < 0) return null;
  const points = [...loop.slice(exit), ...loop.slice(0, exit)];
  const isIn = [...inside.slice(exit), ...inside.slice(0, exit)];
  const arc: number[] = [0];
  for (let i = 1; i < n; i++) {
    arc.push(item(arc, i - 1) + dist(item(points, i - 1), item(points, i)));
  }
  const length = item(arc, n - 1) + dist(item(points, n - 1), item(points, 0));
  // 바깥 구간 다음에 처음 자석 속으로 들어가는 자리.
  let entry = n - 1;
  for (let i = 1; i < n; i++) {
    if (isIn[i]) {
      entry = i;
      break;
    }
  }
  return { points, arc, length, entryArc: item(arc, entry) };
}

function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

/** 범위 안임을 아는 자리의 원소. 범위 밖이면 계산이 틀린 것이라 던진다 — 조용히 틀리지 않는다. */
function item<T>(xs: readonly T[], i: number): T {
  const v = xs[i];
  if (v === undefined) throw new Error(`magnetic-field-lines: index ${i} out of ${xs.length}`);
  return v;
}

function mirrorX(loop: readonly Vec2[]): Vec2[] {
  // x 로 뒤집으면 장의 방향이 거꾸로 따라가므로 순서도 뒤집는다.
  return loop.map((q): Vec2 => [-q[0], q[1]]).reverse();
}

function mirrorY(loop: readonly Vec2[]): Vec2[] {
  return loop.map((q): Vec2 => [q[0], -q[1]]);
}

export interface FieldPicture {
  pieces: [MagnetPiece, MagnetPiece];
  /** 그릴 닫힌 선 전부. */
  loops: FieldLoop[];
  /**
   * 자석 위쪽 선들을 자석에 붙은 것부터 바깥으로 센 번호대로. 점이 따라가는 선을 번호로 고른다.
   * 선 자리를 벗어나 닫힘을 확인하지 못한 번호는 `null` 이다.
   */
  upper: (FieldLoop | null)[];
}

/** 왼쪽 반쪽 가운데 세로선의 자석 속(0 ≤ y ≤ 반폭)에서 A = level 인 높이. A 는 거기서 y 로 늘어난다. */
function seedHeight(pieces: readonly [MagnetPiece, MagnetPiece], level: number): number | null {
  const m = pieces[0];
  let lo = 0;
  let hi = m.halfWidth;
  if (level <= fluxAt(pieces, [m.cx, lo]) || level >= fluxAt(pieces, [m.cx, hi])) return null;
  for (let i = 0; i < SEED_BISECTIONS; i++) {
    const mid = (lo + hi) / 2;
    if (fluxAt(pieces, [m.cx, mid]) < level) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * 틈 `gap` 일 때의 자기력선 그림.
 *
 * 선은 자속 함수 A 를 고른 간격으로 나눈 값마다 한 가닥이다 — 가장 바깥 선이 자석 위 가운데
 * 세로선(x = 0)을 `outerReach` 높이에서 지나고, 가장 안쪽 선이 왼쪽 반쪽 윗면에 붙는다. 그래서
 * 선 사이마다 지나는 자속이 같고, 선이 빽빽한 곳이 장이 센 곳이다. 씨앗은 그 값이 왼쪽 반쪽
 * 가운데 세로선의 자석 속에서 나는 자리이고, 거기서 장을 따라 한 바퀴 돈다. 윗쪽 선만 따라가고
 * 아랫쪽은 거울상이다. 가운데(x = 0)를 넘지 않는 선은 오른쪽 반쪽의 거울상을 더한다.
 *
 * 틈이 바뀌면 A 의 범위가 바뀌어 선이 이어서 옮겨 간다 — 틈을 벌리는 동안 선이 튀지 않는다.
 */
export function fieldPicture(c: MagneticFieldLinesConstants, gap: number): FieldPicture {
  const pieces = magnetPieces(c, gap);
  const left = pieces[0];
  const outer = fluxAt(pieces, [0, c.outerReach]);
  const inner = fluxAt(pieces, [left.cx, left.halfWidth]);
  const loops: FieldLoop[] = [];
  const upper: (FieldLoop | null)[] = [];
  for (let i = 0; i < c.linesPerSide; i++) {
    const level = inner - ((inner - outer) * (i + 0.5)) / c.linesPerSide;
    const y = seedHeight(pieces, level);
    const top = y === null ? null : traceLoop(pieces, [left.cx, y]);
    upper.push(top ? orient(pieces, top) : null);
    if (!top) continue;
    const crossesMiddle = top.some((q) => q[0] > 0);
    const family: Vec2[][] = crossesMiddle ? [top] : [top, mirrorX(top)];
    for (const raw of family) {
      for (const loop of [raw, mirrorY(raw)]) {
        const o = orient(pieces, loop);
        if (o) loops.push(o);
      }
    }
  }
  return { pieces, loops, upper };
}

/** 선 위 길이 `s`(월드)의 자리와 그 자리의 진행 방향. */
export function pointAt(loop: FieldLoop, s: number): { pos: Vec2; dir: Vec2 } {
  const n = loop.points.length;
  const ss = ((s % loop.length) + loop.length) % loop.length;
  let i = 0;
  while (i < n - 1 && item(loop.arc, i + 1) < ss) i++;
  const a = item(loop.points, i);
  const b = item(loop.points, (i + 1) % n);
  const segStart = item(loop.arc, i);
  const segEnd = i + 1 < n ? item(loop.arc, i + 1) : loop.length;
  const f = segEnd > segStart ? (ss - segStart) / (segEnd - segStart) : 0;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const d = Math.hypot(dx, dy) || 1;
  return { pos: [a[0] + f * dx, a[1] + f * dy], dir: [dx / d, dy / d] };
}

/** 선의 첫 점에서 길이 `s`(월드)까지의 점들. 점이 지나온 자취를 긋는 데 쓴다. */
export function pathUpTo(loop: FieldLoop, s: number): Vec2[] {
  const out: Vec2[] = [];
  const n = loop.points.length;
  for (let i = 0; i < n && item(loop.arc, i) < s; i++) out.push(item(loop.points, i));
  out.push(pointAt(loop, Math.min(s, loop.length)).pos);
  return out;
}

/** 상태가 시계뿐인 조각이다 — 모든 것이 시간표 시각의 함수라 항등이다. */
export function step(params: { state: MagneticFieldLinesState }): MagneticFieldLinesState {
  return params.state;
}
