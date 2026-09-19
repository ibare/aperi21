// ========================================================================
// uniform-field — 순수 물리
// ========================================================================
// 두 판을 옆에서 본 2차원 그림이다. 판은 **도체**다 — 위 판 전위 +V/2, 아래 판 −V/2.
// 판마다 얇은 선분 여러 개로 자르고(끝으로 갈수록 촘촘한 코사인 간격), 선분마다 고른
// 선전하 λⱼ 를 두어 판 위 모든 선분 가운데의 전위가 판 전위와 같아지도록 푼다
// (모멘트법). 끝 쪽 선분에 전하가 몰리는 도체의 분포가 그대로 나온다.
//
// 선분 x ∈ [x1, x2], 높이 y0, 밀도 λ 인 선전하가 점 (x, y) 에 만드는 장과 전위
// (비례 상수 생략, a = x − x1, b = x − x2, h = y − y0):
//
//   Ex = λ/2 · ln( (a² + h²) / (b² + h²) )
//   Ey = λ · ( atan(a/h) − atan(b/h) )
//   φ  = −λ/2 · ( F(a) − F(b) ),   F(u) = u·ln(u² + h²) − 2u + 2h·atan(u/h)
//
// 장의 세기는 판 사이 한가운데가 V/d 가 되게 맞춘다. 판 사이 넓은 곳은 그 값에 머물고,
// 판 끝 밖에서만 휘고 약해진다(가장자리 효과).
//
// 풀이와 장선 추적은 스테이지 상수에서 한 번만 한다 — 매 프레임 풀기에는 무겁다.
// `initialState` 가 결과를 state 에 담고(장부 G189), 시험 전하의 힘만 매 프레임 센다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  EXIT_POINT,
  FORCE_SCALE,
  GAP,
  LINE_COUNT,
  PLATE_LENGTH,
  PLATE_THICKNESS,
  PROBE_MOVED,
  PROBE_RADIUS,
  PROBE_START,
  TIP_SEEDS,
  TIP_SEED_STEP,
  VOLTAGE,
} from './schema';
import type { UniformFieldState } from './state';

// ------------------------------------------------------------------------
// 추적의 정밀도 — 표현의 정밀도라 스테이지 상수에 두지 않는다.
// ------------------------------------------------------------------------

/** 장선 추적 걸음(월드). */
const TRACE_STEP = 0.025;
/** 장선 하나의 최대 걸음 수. 판 끝 밖으로 크게 도는 선도 담는다. */
const TRACE_MAX_STEPS = 1400;
/** 이 상자를 벗어나면 추적을 멈춘다(월드). 그리는 것은 `clip` 이 자른다. */
const TRACE_LIMIT_X = 7.5;
const TRACE_LIMIT_Y = 3;
/** 판 끝 바깥 장선의 씨앗을 판 면에서 띄우는 거리(월드). 판 선 위에서는 장이 끊긴다. */
const SEED_LIFT = 0.07;
/** 판 선 위(h = 0)에서 atan 이 나누지 않게 하는 작은 높이. */
const H_EPS = 1e-9;
/** 도체 판 하나를 자르는 선분 수. 풀이의 정밀도라 스테이지 상수에 두지 않는다. */
const PLATE_SEGMENTS = 40;

export interface UniformFieldConstants {
  /** 두 판 사이 전압(V) · 판 간격(월드). */
  voltage: number;
  gap: number;
  /** 판 길이 · 그림 두께(월드). */
  plateLength: number;
  plateThickness: number;
  /** 장 세기(V/월드) → 힘 화살표 길이 배율. */
  forceScale: number;
  /** + 판 안쪽 면 장선 수 · 판 끝마다 바깥 면 장선 수와 그 간격. */
  lineCount: number;
  tipSeeds: number;
  tipSeedStep: number;
  /** 시험 전하 그림 반지름(월드). */
  probeRadius: number;
  /** 시험 전하마다 처음 자리 · 옮긴 자리. 마지막 전하가 밖으로 나간다. */
  starts: readonly Vec2[];
  moved: readonly Vec2[];
  /** 밖으로 나간 전하가 닿는 자리. */
  exit: Vec2;
}

/**
 * 스테이지 상수를 기본값과 함께 읽는다. 전하 자리 목록의 **길이**는 기본값 목록에서
 * 온다 — 스테이지 상수가 수 하나씩뿐이라 목록 길이를 선언할 수 없다 (장부 G105).
 */
export function readConstants(stage: StageDef): UniformFieldConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const spots = (prefix: string, defaults: readonly (readonly [number, number])[]): Vec2[] =>
    defaults.map(([x, y], i) => [c[`${prefix}${i}x`] ?? x, c[`${prefix}${i}y`] ?? y] as const);
  return {
    voltage: c.voltage ?? VOLTAGE,
    gap: c.gap ?? GAP,
    plateLength: c.plateLength ?? PLATE_LENGTH,
    plateThickness: c.plateThickness ?? PLATE_THICKNESS,
    forceScale: c.forceScale ?? FORCE_SCALE,
    lineCount: c.lineCount ?? LINE_COUNT,
    tipSeeds: c.tipSeeds ?? TIP_SEEDS,
    tipSeedStep: c.tipSeedStep ?? TIP_SEED_STEP,
    probeRadius: c.probeRadius ?? PROBE_RADIUS,
    starts: spots('start', PROBE_START),
    moved: spots('moved', PROBE_MOVED),
    exit: [c.exitX ?? EXIT_POINT[0], c.exitY ?? EXIT_POINT[1]],
  };
}

// ------------------------------------------------------------------------
// 장 — 도체 판 풀이
// ------------------------------------------------------------------------

/** 판 위 선분 하나와 그 위의 고른 선전하. */
export interface ChargedSegment {
  x1: number;
  x2: number;
  y: number;
  lambda: number;
}

/** 풀어 낸 두 판 — 선분 전하들과, 한가운데 장을 V/d 로 맞추는 배율. */
export interface SolvedPlates {
  segments: ChargedSegment[];
  norm: number;
}

function safeH(raw: number): number {
  return Math.abs(raw) < H_EPS ? (raw < 0 ? -H_EPS : H_EPS) : raw;
}

/** 선분 선전하 하나의 장(비례 상수 생략). */
function segmentField(pos: Vec2, s: ChargedSegment): Vec2 {
  const a = pos[0] - s.x1;
  const b = pos[0] - s.x2;
  const h = safeH(pos[1] - s.y);
  const ex = (s.lambda / 2) * Math.log((a * a + h * h) / (b * b + h * h));
  const ey = s.lambda * (Math.atan(a / h) - Math.atan(b / h));
  return [ex, ey];
}

/** 전위 핵의 부정적분 F(u). h → 0 에서는 atan 항이 사라진다. */
function potentialAntiderivative(u: number, h: number): number {
  const r2 = u * u + h * h;
  const log = r2 > 0 ? u * Math.log(r2) : 0;
  const arc = Math.abs(h) < H_EPS ? 0 : 2 * h * Math.atan(u / h);
  return log - 2 * u + arc;
}

/** 단위 밀도 선분이 점에 만드는 전위(비례 상수 생략). */
function segmentPotential(pos: Vec2, x1: number, x2: number, y: number): number {
  const h = pos[1] - y;
  return -0.5 * (potentialAntiderivative(pos[0] - x1, h) - potentialAntiderivative(pos[0] - x2, h));
}

/** 가우스 소거(부분 피벗). 크기가 작아(판 둘 × 선분 수) 직접 푼다. */
function solveLinear(m: number[][], rhs: number[]): number[] {
  const n = rhs.length;
  const a = m.map((row, i) => [...row, rhs[i]!]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(a[r]![col]!) > Math.abs(a[pivot]![col]!)) pivot = r;
    [a[col], a[pivot]] = [a[pivot]!, a[col]!];
    const p = a[col]!;
    for (let r = col + 1; r < n; r++) {
      const row = a[r]!;
      const f = row[col]! / p[col]!;
      for (let k = col; k <= n; k++) row[k] = row[k]! - f * p[k]!;
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    const row = a[r]!;
    let acc = row[n]!;
    for (let k = r + 1; k < n; k++) acc -= row[k]! * x[k]!;
    x[r] = acc / row[r]!;
  }
  return x;
}

/**
 * 두 도체 판(위 +V/2, 아래 −V/2)의 전하 분포를 푼다. 선분 가운데마다 전위가 판 전위와
 * 같다는 식을 세워 λⱼ 를 얻는다. 전위 비례 상수는 장 배율(`norm`)에 흡수된다.
 */
export function solvePlates(c: UniformFieldConstants): SolvedPlates {
  const half = c.plateLength / 2;
  const edges: number[] = [];
  for (let k = 0; k <= PLATE_SEGMENTS; k++) edges.push(-half * Math.cos((Math.PI * k) / PLATE_SEGMENTS));
  const shells: { x1: number; x2: number; y: number; v: number }[] = [];
  for (const [y, v] of [[c.gap / 2, 1], [-c.gap / 2, -1]] as const) {
    for (let k = 0; k < PLATE_SEGMENTS; k++) shells.push({ x1: edges[k]!, x2: edges[k + 1]!, y, v });
  }
  const matrix = shells.map((si) => {
    const mid: Vec2 = [(si.x1 + si.x2) / 2, si.y];
    return shells.map((sj) => segmentPotential(mid, sj.x1, sj.x2, sj.y));
  });
  const lambdas = solveLinear(matrix, shells.map((s) => s.v));
  const segments = shells.map((s, i) => ({ x1: s.x1, x2: s.x2, y: s.y, lambda: lambdas[i]! }));
  const center = rawField([0, 0], segments);
  return { segments, norm: c.voltage / c.gap / Math.hypot(center[0], center[1]) };
}

/** 선분 전하들의 장 — 비례 상수 생략. */
function rawField(pos: Vec2, segments: readonly ChargedSegment[]): Vec2 {
  let ex = 0;
  let ey = 0;
  for (const s of segments) {
    const e = segmentField(pos, s);
    ex += e[0];
    ey += e[1];
  }
  return [ex, ey];
}

/** 한 자리의 장(V/월드). 판 사이 한가운데의 세기가 V/d 다. */
export function fieldAt(pos: Vec2, plates: SolvedPlates): Vec2 {
  const e = rawField(pos, plates.segments);
  return [e[0] * plates.norm, e[1] * plates.norm];
}

/** 단위 시험 전하가 그 자리에서 받는 힘 화살표(월드 delta) = 배율 × 장. 상한이 없다. */
export function forceArrow(pos: Vec2, plates: SolvedPlates, c: UniformFieldConstants): Vec2 {
  const e = fieldAt(pos, plates);
  return [e[0] * c.forceScale, e[1] * c.forceScale];
}

/** 판 사이 한가운데의 힘 화살표 — 가장자리 밖 전하 곁에 점선으로 두어 견준다. */
export function insideArrow(plates: SolvedPlates, c: UniformFieldConstants): Vec2 {
  return forceArrow([0, 0], plates, c);
}

// ------------------------------------------------------------------------
// 장선
// ------------------------------------------------------------------------

/** 한 걸음 사이에 높이 `y` 의 판을 가로질렀는가. */
function crossesPlate(p: Vec2, q: Vec2, y: number, c: UniformFieldConstants): boolean {
  if ((p[1] - y) * (q[1] - y) > 0) return false;
  const t = (p[1] - y) / (p[1] - q[1] || 1);
  const x = p[0] + (q[0] - p[0]) * t;
  return Math.abs(x) <= c.plateLength / 2;
}

/** 두 점을 잇는 선이 높이 `y` 와 만나는 점. */
function onPlate(p: Vec2, q: Vec2, y: number): Vec2 {
  const t = (p[1] - y) / (p[1] - q[1] || 1);
  return [p[0] + (q[0] - p[0]) * t, y];
}

/**
 * 씨앗에서 장 방향(`sense` 1) 또는 거꾸로(−1) 높이 `plateY` 의 판에 닿거나 상자를 벗어날
 * 때까지 추적한다(중점법).
 */
function trace(
  seed: Vec2,
  segments: readonly ChargedSegment[],
  c: UniformFieldConstants,
  sense: 1 | -1,
  plateY: number,
): Vec2[] {
  const pts: Vec2[] = [seed];
  let p = seed;
  for (let k = 0; k < TRACE_MAX_STEPS; k++) {
    const e1 = rawField(p, segments);
    const n1 = (Math.hypot(e1[0], e1[1]) || 1) * sense;
    const mid: Vec2 = [p[0] + (e1[0] / n1) * TRACE_STEP * 0.5, p[1] + (e1[1] / n1) * TRACE_STEP * 0.5];
    const e2 = rawField(mid, segments);
    const n2 = (Math.hypot(e2[0], e2[1]) || 1) * sense;
    const q: Vec2 = [p[0] + (e2[0] / n2) * TRACE_STEP, p[1] + (e2[1] / n2) * TRACE_STEP];
    // 반걸음(중점)이 이미 판을 넘었으면 그 너머의 장이 되돌려 보내 제자리에서 떤다 —
    // 판을 넘는 걸음은 판 위의 점에서 끝낸다.
    const ahead = crossesPlate(p, mid, plateY, c) ? mid : crossesPlate(p, q, plateY, c) ? q : null;
    if (ahead) {
      pts.push(onPlate(p, ahead, plateY));
      break;
    }
    pts.push(q);
    if (Math.abs(q[0]) > TRACE_LIMIT_X || Math.abs(q[1]) > TRACE_LIMIT_Y) break;
    p = q;
  }
  return pts;
}

/**
 * 장선 — 두 판 사이 가운데 높이에 고른 간격으로 심어 위(+ 판)로 거슬러, 아래(− 판)로
 * 따라 추적한 가닥과, 판 끝마다 + 판 바깥 면에 심은 가닥. 가운데에 심어야 위아래가
 * 대칭으로 나온다 — 판 면에 심으면 끝 쪽 가닥이 한쪽으로 쏠려 비틀려 보인다.
 * 안쪽 가닥은 판 사이에서 곧고, 양 끝 가닥과 바깥 가닥만 밖으로 부푼다.
 */
export function fieldLines(plates: SolvedPlates, c: UniformFieldConstants): Vec2[][] {
  const half = c.plateLength / 2;
  const top = c.gap / 2;
  const lines: Vec2[][] = [];
  const pitch = c.plateLength / c.lineCount;
  for (let i = 0; i < c.lineCount; i++) {
    const seed: Vec2 = [-half + (i + 0.5) * pitch, 0];
    const up = trace(seed, plates.segments, c, -1, top).reverse();
    const down = trace(seed, plates.segments, c, 1, -top);
    lines.push([...up, ...down.slice(1)]);
  }
  for (let k = 0; k < c.tipSeeds; k++) {
    const x = half - (k + 0.5) * c.tipSeedStep;
    lines.push(trace([x, top + SEED_LIFT], plates.segments, c, 1, -top));
    lines.push(trace([-x, top + SEED_LIFT], plates.segments, c, 1, -top));
  }
  return lines;
}

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 시험 전하가 보이는 정도 0~1 — 놓이는 동안 나타나고, 마지막 단계에서 사라진다. */
export function probeOpacity(tl: TimelineFrame): number {
  return tl.at('place') * (1 - tl.at('clear'));
}

/** 밖으로 나가는 전하의 번호 — 목록의 마지막. */
export function exitingProbe(c: UniformFieldConstants): number {
  return c.starts.length - 1;
}

function lerp(a: Vec2, b: Vec2, s: number): Vec2 {
  return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
}

/**
 * 시험 전하 i 의 지금 자리. `move` 동안 처음 자리 → 옮긴 자리, 마지막 전하는 `exit`
 * 동안 옮긴 자리 → 판 끝 밖으로 곧게 간다.
 */
export function probeAt(i: number, tl: TimelineFrame, c: UniformFieldConstants): Vec2 {
  const start = c.starts[i]!;
  const moved = c.moved[i] ?? start;
  const p = lerp(start, moved, tl.at('move'));
  if (i !== exitingProbe(c)) return p;
  return lerp(p, c.exit, tl.at('exit'));
}

/** 판 안 화살표 점선(견줌)이 보이는 정도 — 전하가 나가기 시작하면서 나타난다. */
export function compareOpacity(tl: TimelineFrame): number {
  return tl.at('exit') * (1 - tl.at('clear'));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: UniformFieldState }): UniformFieldState {
  return params.state;
}
