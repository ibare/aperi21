// ========================================================================
// gausss-law — 순수 물리 · 배치
// ========================================================================
// 점전하가 원점에 있다. 전기력선은 전하에서 곧게 뻗는 반직선 N 가닥이다(점전하 하나의
// 장은 방사형이라 선이 곧다). 닫힌 곡선을 따라 돌며 선이 곡선을 뚫는 자리를 찾고,
// 선이 곡선 **밖으로** 나가면 +1, **안으로** 들어오면 −1 로 센다.
//
// 3D 의 닫힌 면 대신 그 2D 단면(닫힌 곡선)을 쓴다. 평면 안에 고르게 뻗은 선에서도 「감싸면
// 알짜 N, 감싸지 않으면 0」 은 그대로 선다 — 반직선이 닫힌 곡선을 뚫는 알짜 횟수는 출발점이
// 곡선 안이면 1, 밖이면 0 이기 때문이다(NOTES (b)).
//
// 교차는 표본한 곡선의 변마다 「반직선의 어느 쪽에 있나」 가 바뀌는지로 찾는다 — 꼭짓점이
// 선 위에 떨어져도 두 번 세지 않는다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  BIG_RADIUS,
  CHARGE,
  FIELD_REACH,
  FOLD_LOBES,
  FOLD_PHASE_DEG,
  FOLD_RX,
  FOLD_RY,
  FOLD_SWIRL,
  FOLD_WAVE,
  FOLD_X,
  FOLD_Y,
  LINE_OFFSET_DEG,
  LINES_PER_CHARGE,
  OUTSIDE_RX,
  OUTSIDE_RY,
  OUTSIDE_X,
  OUTSIDE_Y,
  SMALL_RADIUS,
  START_ANGLE_DEG,
} from './schema';
import type { GausssLawState } from './state';

/** 곡선 하나를 표본하는 점 수. 접힌 고리의 굽이도 매끈하다. */
const LOOP_SAMPLES = 480;

const DEG = Math.PI / 180;

/** 곡선 모양 — 자리 = 중심 + (rx · ρ cos φ, ry · ρ sin φ), ρ = 1 + wave cos(lobes s + phase), φ = s + swirl sin(lobes s). */
export interface LoopShape {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  wave: number;
  swirl: number;
  lobes: number;
  /** 굽이 위상(라디안). */
  phase: number;
}

export interface GausssLawConstants {
  /** 전기력선 가닥 수 = 전하량 × 단위 전하당 가닥 수(정수로 반올림, 최소 1). */
  lines: number;
  /** 첫 가닥의 방위각(라디안). */
  lineOffset: number;
  reach: number;
  /** 세기 시작하는 매개 각(라디안). */
  startAngle: number;
  small: LoopShape;
  fold: LoopShape;
  big: LoopShape;
  outside: LoopShape;
}

export function readConstants(stage: StageDef): GausssLawConstants {
  const c = stage.constants ?? {};
  const small = c.smallRadius ?? SMALL_RADIUS;
  const big = c.bigRadius ?? BIG_RADIUS;
  const lobes = Math.max(1, Math.round(c.foldLobes ?? FOLD_LOBES));
  const phase = (c.foldPhaseDeg ?? FOLD_PHASE_DEG) * DEG;
  return {
    lines: Math.max(
      1,
      Math.round(Math.abs(c.charge ?? CHARGE) * (c.linesPerCharge ?? LINES_PER_CHARGE)),
    ),
    lineOffset: (c.lineOffsetDeg ?? LINE_OFFSET_DEG) * DEG,
    reach: c.fieldReach ?? FIELD_REACH,
    startAngle: (c.startAngleDeg ?? START_ANGLE_DEG) * DEG,
    // 원 셋도 접힌 고리와 굽이 수 · 위상을 같이 둔다 — 굽이 깊이 · 휘감김이 0 이면 굽이 수 · 위상은
    // 모양에 들어가지 않고, 모양 사이를 섞을 때 튀지 않는다.
    small: { cx: 0, cy: 0, rx: small, ry: small, wave: 0, swirl: 0, lobes, phase },
    fold: {
      cx: c.foldX ?? FOLD_X,
      cy: c.foldY ?? FOLD_Y,
      rx: c.foldRx ?? FOLD_RX,
      ry: c.foldRy ?? FOLD_RY,
      wave: c.foldWave ?? FOLD_WAVE,
      swirl: c.foldSwirl ?? FOLD_SWIRL,
      lobes,
      phase,
    },
    big: { cx: 0, cy: 0, rx: big, ry: big, wave: 0, swirl: 0, lobes, phase },
    outside: {
      cx: c.outsideX ?? OUTSIDE_X,
      cy: c.outsideY ?? OUTSIDE_Y,
      rx: c.outsideRx ?? OUTSIDE_RX,
      ry: c.outsideRy ?? OUTSIDE_RY,
      wave: 0,
      swirl: 0,
      lobes,
      phase,
    },
  };
}

/** 곡선 넷의 이름. 시간표 단계 id 가 `count-<이름>` · `read-<이름>` · `morph-<이름>` 이다. */
export const LOOP_IDS = ['small', 'fold', 'big', 'outside'] as const;
export type LoopId = (typeof LOOP_IDS)[number];

export function loopShape(id: LoopId, c: GausssLawConstants): LoopShape {
  return c[id];
}

/** 두 모양을 f(0~1) 만큼 섞는다. 곡선이 모양 사이를 넘어가는 동안 쓴다. */
export function mixShape(a: LoopShape, b: LoopShape, f: number): LoopShape {
  const m = (x: number, y: number): number => x + (y - x) * f;
  return {
    cx: m(a.cx, b.cx),
    cy: m(a.cy, b.cy),
    rx: m(a.rx, b.rx),
    ry: m(a.ry, b.ry),
    wave: m(a.wave, b.wave),
    swirl: m(a.swirl, b.swirl),
    lobes: b.lobes,
    phase: b.phase,
  };
}

/** 표본한 닫힌 곡선 — 점 · 누적 길이. 첫 점과 끝 점이 같고, 반시계로 돈다. */
export interface SampledLoop {
  points: Vec2[];
  lengths: number[];
  total: number;
}

export function sampleLoop(shape: LoopShape, c: GausssLawConstants): SampledLoop {
  const points: Vec2[] = [];
  for (let i = 0; i <= LOOP_SAMPLES; i++) {
    const s = c.startAngle + (2 * Math.PI * i) / LOOP_SAMPLES;
    const rho = 1 + shape.wave * Math.cos(shape.lobes * s + shape.phase);
    const phi = s + shape.swirl * Math.sin(shape.lobes * s);
    points.push([
      shape.cx + shape.rx * rho * Math.cos(phi),
      shape.cy + shape.ry * rho * Math.sin(phi),
    ]);
  }
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    lengths.push(lengths[i - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  return { points, lengths, total: lengths[lengths.length - 1]! };
}

/** 가닥 k 의 방향(단위). */
export function lineDirection(k: number, c: GausssLawConstants): Vec2 {
  const a = c.lineOffset + (2 * Math.PI * k) / c.lines;
  return [Math.cos(a), Math.sin(a)];
}

/** 곡선 위 한 교차 — 자리 · 곡선을 따라 잰 길이 비율 · 나감(+1)/들어옴(−1). */
export interface Crossing {
  pos: Vec2;
  /** 첫 점부터 이 교차까지 곡선 길이의 비율 0~1. 도는 점이 여기 닿으면 센다. */
  at: number;
  sign: 1 | -1;
  line: number;
}

/**
 * 곡선을 뚫는 모든 교차를 곡선을 따라 만나는 순서로 돌려준다.
 *
 * 곡선은 반시계로 돌므로 바깥 법선이 (dy, −dx) 다. 선의 방향과 바깥 법선이 같은 쪽이면 나감.
 */
export function crossings(loop: SampledLoop, c: GausssLawConstants): Crossing[] {
  const out: Crossing[] = [];
  for (let k = 0; k < c.lines; k++) {
    const [dx, dy] = lineDirection(k, c);
    for (let i = 1; i < loop.points.length; i++) {
      const a = loop.points[i - 1]!;
      const b = loop.points[i]!;
      // 반직선의 왼쪽(+) · 오른쪽(−). 쪽이 바뀌는 변만 선이 지나는 후보다.
      const sa = dx * a[1] - dy * a[0];
      const sb = dx * b[1] - dy * b[0];
      if (sa > 0 === sb > 0) continue;
      const u = sa / (sa - sb);
      const pos: Vec2 = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
      const along = pos[0] * dx + pos[1] * dy;
      // 반직선의 뒤쪽(반대 방향) · 선이 닿지 않는 먼 곳은 교차가 아니다.
      if (along <= 0 || along >= c.reach) continue;
      const ex = b[0] - a[0];
      const ey = b[1] - a[1];
      const outward = ey * dx - ex * dy > 0;
      const l0 = loop.lengths[i - 1]!;
      const l1 = loop.lengths[i]!;
      out.push({
        pos,
        at: (l0 + (l1 - l0) * u) / loop.total,
        sign: outward ? 1 : -1,
        line: k,
      });
    }
  }
  return out.sort((p, q) => p.at - q.at);
}

/** 길이 비율 f(0~1) 자리의 점. 도는 빠르기가 고르다. */
export function walkAt(loop: SampledLoop, f: number): { pos: Vec2; index: number } {
  const target = Math.min(1, Math.max(0, f)) * loop.total;
  let i = 1;
  while (i < loop.lengths.length - 1 && loop.lengths[i]! < target) i++;
  const a = loop.points[i - 1]!;
  const b = loop.points[i]!;
  const l0 = loop.lengths[i - 1]!;
  const seg = loop.lengths[i]! - l0;
  const u = seg > 0 ? (target - l0) / seg : 0;
  return { pos: [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], index: i };
}

/** 첫 점부터 f 까지의 점들. 돌아온 쪽을 굵게 긋는 데 쓴다. */
export function walkedPoints(loop: SampledLoop, f: number): Vec2[] {
  const w = walkAt(loop, f);
  return [...loop.points.slice(0, w.index), w.pos];
}

/** f 까지 센 알짜와, 그동안 올랐던 가장 높은 셈. */
export function tallyAt(list: readonly Crossing[], f: number): { net: number; peak: number } {
  let net = 0;
  let peak = 0;
  for (const x of list) {
    if (x.at > f) break;
    net += x.sign;
    peak = Math.max(peak, net);
  }
  return { net, peak };
}

/** 쌓는 상태가 없다 — 모든 것이 시각과 스테이지 상수의 함수다. */
export function step(params: { state: GausssLawState }): GausssLawState {
  return params.state;
}
