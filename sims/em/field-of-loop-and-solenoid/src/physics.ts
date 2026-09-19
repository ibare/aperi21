// ========================================================================
// field-of-loop-and-solenoid — 순수 물리
// ========================================================================
// 원형 고리 하나의 자기장은 완전 타원 적분 K · E 로 정확히 쓸 수 있다. 고리 여러 개의
// 장은 그 합이다 — 따로 연출한 것이 없다. 단면 좌표는 월드 x 가 고리 축, 월드 y 가
// 축에서 잰 거리(부호 있음)다. 위 도선(y > 0)은 전류가 화면 밖으로(⊙), 아래 도선은
// 안으로(⊗) 흐르고, 그러면 고리 속의 장은 +x 를 향한다.
//
//   장선  — 가운데 단면(x = 0)에서 축부터 축 방향 장을 더해 가며 `fluxStep` 이 찰
//           때마다 씨앗을 두고 장을 따라 긋는다. 장이 셀수록 씨앗이 촘촘하다.
//   화살표 — 격자 자리마다 장 × `arrowScale`, 길이 상한 `arrowMax`.
//
// 모두 스테이지 상수의 함수라 쌓을 것이 없다. 세 배치의 기하는 `initialState` 가
// 한 번 만들어 상태에 둔다 (state.ts).
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  ARROW_CLEAR,
  ARROW_MAX,
  ARROW_ROW_INNER,
  ARROW_ROW_OUTER,
  ARROW_SCALE,
  ARROW_SPAN,
  ARROW_STEP,
  FLUX_STEP,
  LOOP_CURRENT,
  LOOP_RADIUS,
  LOOP_SPACING,
  LOOP_TILT,
  LOOPS_FEW,
  LOOPS_MANY,
  LOOPS_ONE,
  SEED_REACH,
  TRACE_BOX,
  TRACE_STEP,
  WIRE_MARK,
} from './schema';
import type { FieldOfLoopAndSolenoidState } from './state';

export interface LoopConstants {
  loopRadius: number;
  loopCurrent: number;
  loopSpacing: number;
  loopsOne: number;
  loopsFew: number;
  loopsMany: number;
  fluxStep: number;
  seedReach: number;
  traceStep: number;
  arrowScale: number;
  arrowMax: number;
  arrowStep: number;
  arrowSpan: number;
  arrowRowInner: number;
  arrowRowOuter: number;
  arrowClear: number;
  loopTilt: number;
  wireMark: number;
}

export function readConstants(stage: StageDef): LoopConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    loopRadius: c.loopRadius ?? LOOP_RADIUS,
    loopCurrent: c.loopCurrent ?? LOOP_CURRENT,
    loopSpacing: c.loopSpacing ?? LOOP_SPACING,
    loopsOne: c.loopsOne ?? LOOPS_ONE,
    loopsFew: c.loopsFew ?? LOOPS_FEW,
    loopsMany: c.loopsMany ?? LOOPS_MANY,
    fluxStep: c.fluxStep ?? FLUX_STEP,
    seedReach: c.seedReach ?? SEED_REACH,
    traceStep: c.traceStep ?? TRACE_STEP,
    arrowScale: c.arrowScale ?? ARROW_SCALE,
    arrowMax: c.arrowMax ?? ARROW_MAX,
    arrowStep: c.arrowStep ?? ARROW_STEP,
    arrowSpan: c.arrowSpan ?? ARROW_SPAN,
    arrowRowInner: c.arrowRowInner ?? ARROW_ROW_INNER,
    arrowRowOuter: c.arrowRowOuter ?? ARROW_ROW_OUTER,
    arrowClear: c.arrowClear ?? ARROW_CLEAR,
    loopTilt: c.loopTilt ?? LOOP_TILT,
    wireMark: c.wireMark ?? WIRE_MARK,
  };
}

// ------------------------------------------------------------------------
// 수치 계산의 정밀도 — 화면이 아니라 계산의 몫이다.
// ------------------------------------------------------------------------

/** AGM 반복을 멈추는 차이. */
const AGM_EPS = 1e-12;
/** 이보다 축에 가까우면 지름 방향 장을 0 으로 둔다(축 위에서는 대칭으로 0). */
const AXIS_EPS = 1e-9;
/** 씨앗 자리를 찾을 때 가운데 단면을 나누는 칸 수. */
const SEED_SAMPLES = 600;
/** 장선 한쪽 방향으로 걷는 최대 걸음 수. */
const MAX_TRACE_STEPS = 3000;
/** 제자리로 돌아왔다고 보는 거리(걸음 몇 배)와, 그 판정을 시작하기 전에 걸어야 할 걸음 수. */
const CLOSE_STEPS = 1.5;
const MIN_LOOP_STEPS = 20;
/** 격자 칸 수를 셀 때 나눗셈의 부동소수 잡음을 덮는 몫. */
const GRID_EPS = 1e-9;

// ------------------------------------------------------------------------
// 고리의 장
// ------------------------------------------------------------------------

/** 제1 · 제2종 완전 타원 적분 K(m), E(m) — 산술 기하 평균(AGM). m = k². */
export function ellipticKE(m: number): { K: number; E: number } {
  let a = 1;
  let b = Math.sqrt(1 - m);
  let c = Math.sqrt(m);
  let pow = 0.5;
  let sum = pow * c * c;
  for (let i = 0; i < 40 && Math.abs(c) > AGM_EPS; i++) {
    const an = (a + b) / 2;
    const bn = Math.sqrt(a * b);
    c = (a - b) / 2;
    pow *= 2;
    sum += pow * c * c;
    a = an;
    b = bn;
  }
  const K = Math.PI / (2 * a);
  return { K, E: K * (1 - sum) };
}

/**
 * 반지름 `a`, 축 위 자리 `x0` 인 고리 하나가 (x, ρ ≥ 0) 에 만드는 장 [축 방향, 지름 방향].
 * 단위는 μ₀I/2π = `current`.
 */
export function loopField(x: number, rho: number, x0: number, a: number, current: number): Vec2 {
  const dz = x - x0;
  const alpha2 = (a - rho) * (a - rho) + dz * dz;
  const beta2 = (a + rho) * (a + rho) + dz * dz;
  const beta = Math.sqrt(beta2);
  const m = 1 - alpha2 / beta2;
  const { K, E } = ellipticKE(m);
  const bAxis = (current / beta) * (K + ((a * a - rho * rho - dz * dz) / alpha2) * E);
  const bRadial =
    rho < AXIS_EPS ? 0 : ((current * dz) / (rho * beta)) * (((a * a + rho * rho + dz * dz) / alpha2) * E - K);
  return [bAxis, bRadial];
}

/** 고리들이 단면 자리 `p` 에 만드는 장(월드 좌표 성분). y < 0 은 거울상이다. */
export function fieldAt(p: Vec2, loops: readonly number[], c: LoopConstants): Vec2 {
  const rho = Math.abs(p[1]);
  let bx = 0;
  let br = 0;
  for (const x0 of loops) {
    const [ax, ar] = loopField(p[0], rho, x0, c.loopRadius, c.loopCurrent);
    bx += ax;
    br += ar;
  }
  return [bx, p[1] < 0 ? -br : br];
}

/** 고리 `count` 개를 가운데(x = 0)에 맞춰 `loopSpacing` 간격으로 놓은 축 위 자리. */
export function loopPositions(count: number, c: LoopConstants): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push((i - (count - 1) / 2) * c.loopSpacing);
  return out;
}

// ------------------------------------------------------------------------
// 장선
// ------------------------------------------------------------------------

function unitField(p: Vec2, loops: readonly number[], c: LoopConstants, sign: number): Vec2 {
  const [bx, by] = fieldAt(p, loops, c);
  const n = Math.hypot(bx, by);
  if (n === 0) return [0, 0];
  return [(sign * bx) / n, (sign * by) / n];
}

function inBox(p: Vec2): boolean {
  return p[0] >= TRACE_BOX.minX && p[0] <= TRACE_BOX.maxX && p[1] >= TRACE_BOX.minY && p[1] <= TRACE_BOX.maxY;
}

/** 한 방향으로 걷는다(RK4, 걸음 길이 고정). 제자리로 돌아오면 `closed`. */
function walk(seed: Vec2, loops: readonly number[], c: LoopConstants, sign: number): { pts: Vec2[]; closed: boolean } {
  const h = c.traceStep;
  const pts: Vec2[] = [seed];
  let p = seed;
  for (let i = 0; i < MAX_TRACE_STEPS; i++) {
    const k1 = unitField(p, loops, c, sign);
    const k2 = unitField([p[0] + (h / 2) * k1[0], p[1] + (h / 2) * k1[1]], loops, c, sign);
    const k3 = unitField([p[0] + (h / 2) * k2[0], p[1] + (h / 2) * k2[1]], loops, c, sign);
    const k4 = unitField([p[0] + h * k3[0], p[1] + h * k3[1]], loops, c, sign);
    const next: Vec2 = [
      p[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      p[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    ];
    pts.push(next);
    p = next;
    if (!inBox(p)) return { pts, closed: false };
    if (i > MIN_LOOP_STEPS && Math.hypot(p[0] - seed[0], p[1] - seed[1]) < h * CLOSE_STEPS) {
      pts.push(seed);
      return { pts, closed: true };
    }
  }
  return { pts, closed: false };
}

/** 씨앗 하나를 지나는 장선 한 가닥. 닫히지 않으면 양쪽으로 걸어 잇는다. */
export function traceLine(seed: Vec2, loops: readonly number[], c: LoopConstants): Vec2[] {
  const forward = walk(seed, loops, c, 1);
  if (forward.closed) return forward.pts;
  const backward = walk(seed, loops, c, -1);
  return [...backward.pts.slice(1).reverse(), ...forward.pts];
}

/**
 * 가운데 단면(x = 0) 위 씨앗 자리 ρ (축 0 포함). 축에서부터 축 방향 장을 더한 값이
 * `fluxStep` 의 배수가 되는 자리마다 하나 — 장이 센 배치일수록 씨앗이 촘촘하다.
 *
 * 단면 그림에서 선의 간격이 그 자리 장 세기에 반비례하게 하는 2차원 규약이다(NOTES (b)).
 */
export function seedRadii(loops: readonly number[], c: LoopConstants): number[] {
  const reach = c.seedReach * c.loopRadius;
  const dr = reach / SEED_SAMPLES;
  const out: number[] = [0];
  let acc = 0;
  let next = c.fluxStep;
  let prev = fieldAt([0, 0], loops, c)[0];
  for (let i = 1; i <= SEED_SAMPLES; i++) {
    const r = i * dr;
    const cur = fieldAt([0, r], loops, c)[0];
    const inc = ((prev + cur) / 2) * dr;
    while (acc + inc >= next && inc > 0) {
      out.push(r - dr + ((next - acc) / inc) * dr);
      next += c.fluxStep;
    }
    acc += inc;
    prev = cur;
  }
  return out;
}

// ------------------------------------------------------------------------
// 배치 하나의 기하
// ------------------------------------------------------------------------

/** 한 배치(고리 수)가 화면에 내는 것 — 고리 자리 · 장선 · 격자 자리마다의 장. */
export interface LoopConfig {
  /** 고리들의 축 위 자리. */
  readonly loops: readonly number[];
  /** 장선(위 · 아래 거울상 포함). */
  readonly lines: readonly (readonly Vec2[])[];
  /** `arrowGrid` 자리마다의 장(상한 전). 배치 사이를 진행도로 섞는다 — 장은 전류에 비례해 겹친다. */
  readonly field: readonly Vec2[];
}

/**
 * 화살표 격자 자리. 안쪽 줄(축 · ±`arrowRowInner`)과 바깥 줄(±`arrowRowOuter`), 가로는
 * −`arrowSpan` … `arrowSpan` 을 `arrowStep` 간격. 어느 배치의 도선이든 `arrowClear` 보다
 * 가까운 자리는 뺀다 — 모든 배치가 같은 격자를 써야 진행도로 섞을 수 있다.
 */
export function arrowGrid(c: LoopConstants, allLoops: readonly number[]): Vec2[] {
  const rows = [0, c.arrowRowInner, -c.arrowRowInner, c.arrowRowOuter, -c.arrowRowOuter];
  const cols = Math.floor(c.arrowSpan / c.arrowStep + GRID_EPS);
  const out: Vec2[] = [];
  for (const y of rows) {
    for (let i = -cols; i <= cols; i++) {
      const x = i * c.arrowStep;
      const nearWire = allLoops.some(
        (x0) => Math.hypot(x - x0, Math.abs(y) - c.loopRadius) < c.arrowClear,
      );
      if (!nearWire) out.push([x, y]);
    }
  }
  return out;
}

export function deriveConfig(count: number, grid: readonly Vec2[], c: LoopConstants): LoopConfig {
  const loops = loopPositions(count, c);
  const lines: Vec2[][] = [];
  for (const r of seedRadii(loops, c)) {
    const line = traceLine([0, r], loops, c);
    lines.push(line);
    if (r > 0) lines.push(line.map(([x, y]) => [x, -y] as Vec2));
  }
  const field = grid.map((p) => fieldAt(p, loops, c));
  return { loops, lines, field };
}

/** 격자 자리 `p` 의 장을 화살표로 — 가운데를 자리에 맞추고 길이는 `arrowMax` 에서 자른다. */
export function arrowAt(p: Vec2, b: Vec2, c: LoopConstants): { from: Vec2; delta: Vec2 } {
  let dx = b[0] * c.arrowScale;
  let dy = b[1] * c.arrowScale;
  const len = Math.hypot(dx, dy);
  if (len > c.arrowMax) {
    dx *= c.arrowMax / len;
    dy *= c.arrowMax / len;
  }
  return { from: [p[0] - dx / 2, p[1] - dy / 2], delta: [dx, dy] };
}

/** 모든 것이 스테이지 상수와 시간표의 함수다. 쌓을 것이 없다 (S-sim). */
export function step(params: { state: FieldOfLoopAndSolenoidState }): FieldOfLoopAndSolenoidState {
  return params.state;
}
