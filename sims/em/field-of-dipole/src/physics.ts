// ========================================================================
// field-of-dipole — 순수 물리
// ========================================================================
// 점전하 둘의 3차원 쿨롱 장을 평면(두 전하를 품은 면)에서 본다.
//
//   E(p) = Σ qᵢ (p − pᵢ) / |p − pᵢ|³
//
//   전기력선 — +q 둘레에서 고른 각으로 출발해 장 방향을 따라 걷는다(2단 룽게-쿠타).
//              −q 에 닿거나 추적 사각형을 벗어나면 멈춘다.
//   축 위 세기 — 쌍극자 가운데에서 축(+x)을 따라 거리 r 인 자리의 |E|. 따로 연출한 것이
//              없다 — 위 식 그대로다. 전하 하나의 장은 1/r² 로, r0 에서 같은 세기로 맞춘다.
//
// 모두 스테이지 상수의 함수라 쌓을 것이 없다. 무거운 추적은 `initialState` 가 한 번
// 하고 상태에 둔다 (state.ts).
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  CHARGE,
  INNER_REACH,
  LINE_COUNT,
  PROBE_REACH,
  PROBE_START,
  SEPARATION,
  TRACE_BOX,
  TRACE_STEP,
} from './schema';
import type { FieldOfDipoleState } from './state';

export interface DipoleConstants {
  separation: number;
  charge: number;
  lineCount: number;
  traceStep: number;
  innerReach: number;
  probeStart: number;
  probeReach: number;
}

export function readConstants(stage: StageDef): DipoleConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    separation: c.separation ?? SEPARATION,
    charge: c.charge ?? CHARGE,
    lineCount: c.lineCount ?? LINE_COUNT,
    traceStep: c.traceStep ?? TRACE_STEP,
    innerReach: c.innerReach ?? INNER_REACH,
    probeStart: c.probeStart ?? PROBE_START,
    probeReach: c.probeReach ?? PROBE_REACH,
  };
}

// ------------------------------------------------------------------------
// 수치 계산의 정밀도 — 화면이 아니라 계산의 몫이다.
// ------------------------------------------------------------------------

/** 전하 중심에서 선을 출발시키는 반지름 · 닿았다고 보는 반지름 — 간격 d 에 대한 비. */
const START_RATIO = 0.04;
const SINK_RATIO = 0.04;
/** 한쪽 선이 걷는 최대 걸음 수. */
const MAX_TRACE_STEPS = 20000;
/** 0 으로 나누지 않게 더하는 아주 작은 거리². */
const SOFTEN = 1e-12;
/** 축 위 세기 곡선의 표본 수. */
export const CURVE_SAMPLES = 160;

// ------------------------------------------------------------------------
// 장
// ------------------------------------------------------------------------

/** 두 전하의 자리 — +q 는 왼쪽, −q 는 오른쪽. */
export function chargePositions(c: DipoleConstants): { plus: Vec2; minus: Vec2 } {
  const h = c.separation / 2;
  return { plus: [-h, 0], minus: [h, 0] };
}

/** 자리 p 의 장(쿨롱 상수는 1 로 둔다 — 세기의 절대값은 주장과 무관하다). */
export function fieldAt(p: Vec2, c: DipoleConstants): Vec2 {
  const { plus, minus } = chargePositions(c);
  let ex = 0;
  let ey = 0;
  for (const [pos, q] of [
    [plus, c.charge],
    [minus, -c.charge],
  ] as const) {
    const dx = p[0] - pos[0];
    const dy = p[1] - pos[1];
    const r2 = dx * dx + dy * dy + SOFTEN;
    const inv = q / (r2 * Math.sqrt(r2));
    ex += dx * inv;
    ey += dy * inv;
  }
  return [ex, ey];
}

/** 축 위(가운데에서 +x 쪽으로 거리 r)의 쌍극자 장 세기. */
export function dipoleAxisStrength(r: number, c: DipoleConstants): number {
  const [ex, ey] = fieldAt([r, 0], c);
  return Math.hypot(ex, ey);
}

// ------------------------------------------------------------------------
// 전기력선
// ------------------------------------------------------------------------

export interface FieldLine {
  readonly points: readonly Vec2[];
  /** 두 전하 사이를 건너는 선인가 — 축에서 가장 멀리 벗어난 거리가 `innerReach` 이하. */
  readonly inner: boolean;
}

function unitField(p: Vec2, c: DipoleConstants): Vec2 {
  const [ex, ey] = fieldAt(p, c);
  const m = Math.hypot(ex, ey) || 1;
  return [ex / m, ey / m];
}

/** +q 둘레에서 고른 각으로 출발한 선들. 축에 대해 위아래가 대칭이 되게 반 칸 비켜 둔다. */
export function traceFieldLines(c: DipoleConstants): FieldLine[] {
  const { plus, minus } = chargePositions(c);
  const startR = c.separation * START_RATIO;
  const sinkR = c.separation * SINK_RATIO;
  const h = c.traceStep;
  const lines: FieldLine[] = [];
  for (let i = 0; i < c.lineCount; i++) {
    const a = (2 * Math.PI * (i + 0.5)) / c.lineCount;
    let p: Vec2 = [plus[0] + startR * Math.cos(a), plus[1] + startR * Math.sin(a)];
    const pts: Vec2[] = [plus, p];
    let reach = 0;
    for (let s = 0; s < MAX_TRACE_STEPS; s++) {
      const k1 = unitField(p, c);
      const mid: Vec2 = [p[0] + 0.5 * h * k1[0], p[1] + 0.5 * h * k1[1]];
      const k2 = unitField(mid, c);
      p = [p[0] + h * k2[0], p[1] + h * k2[1]];
      pts.push(p);
      reach = Math.max(reach, Math.abs(p[1]));
      if (Math.hypot(p[0] - minus[0], p[1] - minus[1]) < sinkR) {
        pts.push(minus);
        break;
      }
      if (p[0] < TRACE_BOX.minX || p[0] > TRACE_BOX.maxX || p[1] < TRACE_BOX.minY || p[1] > TRACE_BOX.maxY) {
        break;
      }
    }
    lines.push({ points: pts, inner: reach <= c.innerReach });
  }
  return lines;
}

// ------------------------------------------------------------------------
// 축 위 세기 곡선
// ------------------------------------------------------------------------

export interface StrengthSample {
  /** 쌍극자 가운데에서 잰 거리. */
  readonly r: number;
  /** 전하 하나의 장 — r0 에서 1. */
  readonly single: number;
  /** 쌍극자의 장 — r0 에서 1. */
  readonly dipole: number;
}

/** r0 에서 (배수)·r0 까지 고른 간격의 표본. 두 장 모두 r0 에서의 세기로 나눈다. */
export function strengthCurve(c: DipoleConstants): StrengthSample[] {
  const r0 = c.probeStart;
  const r1 = r0 * c.probeReach;
  const e0 = dipoleAxisStrength(r0, c);
  const out: StrengthSample[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const r = r0 + ((r1 - r0) * i) / CURVE_SAMPLES;
    out.push({ r, single: (r0 * r0) / (r * r), dipole: dipoleAxisStrength(r, c) / e0 });
  }
  return out;
}

/** 거리 r 에서의 두 세기 — 표본 사이는 식으로 바로 센다(같은 식이다). */
export function strengthAt(r: number, c: DipoleConstants): { single: number; dipole: number } {
  const r0 = c.probeStart;
  return {
    single: (r0 * r0) / (r * r),
    dipole: dipoleAxisStrength(r, c) / dipoleAxisStrength(r0, c),
  };
}

// ------------------------------------------------------------------------
// 한 걸음 — 쌓을 것이 없다
// ------------------------------------------------------------------------

export function step(params: { state: FieldOfDipoleState }): FieldOfDipoleState {
  return params.state;
}
