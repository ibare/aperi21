// ========================================================================
// shell-theorem — 순수 물리 · 배치
// ========================================================================
// 껍질 밖(r > R): 껍질 전체가 중심에 모인 것처럼 당긴다 — 세기 ∝ 1 / r², 방향은 중심 쪽.
// 껍질 안(r < R): 시험 질량을 꼭짓점으로 한 쌍둥이 원뿔(입체각 dΩ)이 껍질을 두 조각으로
//   오려 낸다. 거리 d 인 조각의 넓이는 d² dΩ / cosθ (θ: 원뿔 축과 그 자리 껍질 법선의 각),
//   당김은 σ · 넓이 / d² = σ dΩ / cosθ — **거리가 지워진다.** 현의 양 끝에서 θ 는 같으므로
//   두 조각의 당김은 크기가 같고 방향이 반대다. 모든 방향이 이렇게 짝지어져 합이 0 이다.
//
// 모든 것이 시각의 함수다 — 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  CONE_HALF_ANGLE_DEG,
  CONE_START_DEG,
  CONE_TURN_RATE,
  EXIT_X,
  MASS_RADIUS,
  OUTSIDE_ARROW_SCALE,
  P1_X,
  P1_Y,
  P2_X,
  P2_Y,
  PATH_Y,
  PIECE_ARROW_SCALE,
  PIECE_SAMPLES,
  RIM_GAP,
  SHELL_RADIUS,
  START_X,
} from './schema';
import type { ShellTheoremState } from './state';

const DEG = Math.PI / 180;

export interface ShellTheoremConstants {
  /** 껍질 반지름(월드). */
  shellRadius: number;
  /** 껍질 밖 당김 화살표 배율(길이 = 배율 / r²). */
  outsideArrowScale: number;
  /** 껍질 안 조각 하나의 당김 화살표 배율(길이 = 배율 / cosθ). */
  pieceArrowScale: number;
  /** 원뿔 반각 · 처음 축 방향(라디안) · 도는 빠르기(라디안/초). */
  coneHalfAngle: number;
  coneStart: number;
  coneTurnRate: number;
  /** 출발점 · 껍질 바로 밖 멈춤 자리 · 안의 두 자리 · 나가는 끝(월드). */
  start: Vec2;
  rimStop: Vec2;
  p1: Vec2;
  p2: Vec2;
  exit: Vec2;
  /** 시험 질량 반지름(월드). */
  massRadius: number;
}

export function readConstants(stage: StageDef): ShellTheoremConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const shellRadius = c.shellRadius ?? SHELL_RADIUS;
  const pathY = c.pathY ?? PATH_Y;
  const rimGap = c.rimGap ?? RIM_GAP;
  const p2: Vec2 = [c.p2X ?? P2_X, c.p2Y ?? P2_Y];
  // 들어오는 길(높이 pathY) 위에서 껍질 바깥 반지름 R + 틈 인 자리.
  const rimR = shellRadius + rimGap;
  const rimX = Math.sqrt(Math.max(0, rimR * rimR - pathY * pathY));
  return {
    shellRadius,
    outsideArrowScale: c.outsideArrowScale ?? OUTSIDE_ARROW_SCALE,
    pieceArrowScale: c.pieceArrowScale ?? PIECE_ARROW_SCALE,
    coneHalfAngle: (c.coneHalfAngleDeg ?? CONE_HALF_ANGLE_DEG) * DEG,
    coneStart: (c.coneStartDeg ?? CONE_START_DEG) * DEG,
    coneTurnRate: (c.coneTurnRate ?? CONE_TURN_RATE) * DEG,
    start: [c.startX ?? START_X, pathY],
    rimStop: [rimX, pathY],
    p1: [c.p1X ?? P1_X, c.p1Y ?? P1_Y],
    p2,
    exit: [c.exitX ?? EXIT_X, p2[1]],
    massRadius: c.massRadius ?? MASS_RADIUS,
  };
}

function lerp(a: Vec2, b: Vec2, s: number): Vec2 {
  return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
}

/**
 * 시험 질량의 지금 자리. 단계 진행도(`at`)는 앞 단계에서 0, 뒤 단계에서 1 이므로 구간을
 * 차례로 섞으면 단계 분기 없이 한 줄로 이어진다.
 */
export function massAt(tl: TimelineFrame, c: ShellTheoremConstants): Vec2 {
  let p = lerp(c.start, c.rimStop, tl.at('approach'));
  p = lerp(p, c.p1, tl.at('enter'));
  p = lerp(p, c.p2, tl.at('wander'));
  p = lerp(p, c.exit, tl.at('exit'));
  return p;
}

/** 시험 질량이 보이는 정도 0~1 — 첫 단계에서 나타나고, 마지막 단계에서 사라진다. */
export function massOpacity(tl: TimelineFrame): number {
  return tl.at('appear') * (1 - tl.at('fade'));
}

/** 원뿔이 보이는 정도 0~1 — 펼쳐지고, 걷힌다. */
export function coneOpacity(tl: TimelineFrame): number {
  return tl.at('open') * (1 - tl.at('close'));
}

/** 원뿔 축의 지금 방향(라디안). 펼쳐지기 시작한 때부터 걷힐 때까지 한 빠르기로 돈다. */
export function coneAxis(tl: TimelineFrame, c: ShellTheoremConstants): number {
  const from = tl.start('open');
  const to = tl.end('close');
  const s = Math.min(Math.max(tl.u, from), to) - from;
  return c.coneStart + c.coneTurnRate * s;
}

/**
 * 껍질 밖 당김(월드 delta). 껍질 전체가 중심에 모인 것과 같다 — 중심 쪽, 길이 = 배율 / r².
 * **껍질 안이면 0 이다.** 이것이 이 그림의 주장이다.
 */
export function outsidePull(pos: Vec2, c: ShellTheoremConstants): Vec2 {
  const r = Math.hypot(pos[0], pos[1]);
  if (r <= c.shellRadius) return [0, 0];
  const len = c.outsideArrowScale / (r * r);
  return [(-pos[0] / r) * len, (-pos[1] / r) * len];
}

/** 안의 점 `p` 에서 방향 `a` 로 뻗은 반직선이 껍질을 뚫는 자리. */
export function hitShell(p: Vec2, a: number, R: number): Vec2 {
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const pu = p[0] * ux + p[1] * uy;
  const pp = p[0] * p[0] + p[1] * p[1];
  const t = -pu + Math.sqrt(Math.max(0, pu * pu - pp + R * R));
  return [p[0] + ux * t, p[1] + uy * t];
}

export interface ConePiece {
  /** 쐐기(단면의 원뿔) — 꼭짓점 p 와 껍질 위 호. */
  wedge: Vec2[];
  /** 오려 낸 껍질 조각(호). */
  arc: Vec2[];
  /** 이 조각이 시험 질량을 당기는 화살표(월드 delta) — 조각 쪽을 향한다. */
  pull: Vec2;
}

/**
 * 원뿔 축 방향 `a` 쪽 조각 하나. 반대쪽 조각은 `a + π` 로 부른다.
 *
 * 당김 길이 = 배율 / cosθ. cosθ = √(R² − h²) / R, h 는 중심에서 원뿔 축(현)까지의 거리다 —
 * 현의 양 끝에서 같으므로 두 조각이 **늘 같은 길이**를 받는다. 조각까지의 거리는 식에 없다.
 */
export function conePiece(p: Vec2, a: number, c: ShellTheoremConstants): ConePiece {
  const R = c.shellRadius;
  const arc: Vec2[] = [];
  for (let k = 0; k <= PIECE_SAMPLES; k++) {
    const ang = a - c.coneHalfAngle + (2 * c.coneHalfAngle * k) / PIECE_SAMPLES;
    arc.push(hitShell(p, ang, R));
  }
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const h = p[0] * uy - p[1] * ux;
  const cos = Math.sqrt(Math.max(1e-6, R * R - h * h)) / R;
  const len = c.pieceArrowScale / cos;
  return { wedge: [p, ...arc], arc, pull: [ux * len, uy * len] };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ShellTheoremState }): ShellTheoremState {
  return params.state;
}
