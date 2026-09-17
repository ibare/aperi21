// ========================================================================
// pulley-system — 순수 기하
// ========================================================================
// 원본 `geometry()` 를 그대로 옮겼다. 좌표는 원본 논리 px(패널 안, y 아래)이고 월드로
// 옮기는 것은 scene 의 일이다.
//
// 줄은 한쪽 끝(묶인 끝)에서 손까지 선분·호의 목록이다. 줄은 늘어나지 않으므로 묶인
// 끝에서 잰 길이가 곧 줄의 재료 좌표다 — 무늬와 도르래 회전각이 여기서 나온다.
// ========================================================================

import type { TimelineFrame } from '@aperi21/schema';
import {
  CEIL_Y,
  FIX_CY,
  HAND_GAP,
  HOOK,
  LOAD_TOP0,
  PPM,
  R,
} from './schema';
import type { PulleySystemState } from './state';

export interface LineSeg {
  kind: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  len: number;
}

export interface ArcSeg {
  kind: 'arc';
  cx: number;
  cy: number;
  /** 캔버스 각(y 아래 기준, 시계 방향이 +). */
  a0: number;
  a1: number;
  len: number;
  /** 이 호가 감는 도르래. */
  sheave: Sheave;
}

export type RopeSeg = LineSeg | ArcSeg;

export interface Sheave {
  x: number;
  y: number;
  /** 위로 감아 넘는 도르래(고정)면 true, 아래로 감는(움직) 도르래면 false. */
  over: boolean;
  /** 묶인 끝에서 이 도르래에 줄이 닿기 시작하는 곳까지의 길이. */
  contactS: number;
}

export interface PanelGeometry {
  segs: RopeSeg[];
  fixed: Sheave[];
  moving: Sheave[];
  loadTop: number;
  /** 움직도르래 중심 높이. */
  ym: number;
  exitX: number;
  exitY: number;
  hand0: number;
  handX: number;
  pulledM: number;
  riseM: number;
}

function line(x1: number, y1: number, x2: number, y2: number): LineSeg {
  return { kind: 'line', x1, y1, x2, y2, len: Math.hypot(x2 - x1, y2 - y1) };
}

function arc(cx: number, cy: number, a0: number, a1: number, sheave: Sheave): ArcSeg {
  return { kind: 'arc', cx, cy, a0, a1, len: Math.abs(a1 - a0) * R, sheave };
}

function sheave(x: number, y: number, over: boolean): Sheave {
  return { x, y, over, contactS: 0 };
}

/** 가닥 수 n 인 장치가 짐을 riseM 만큼 올렸을 때의 기하. 원본 `geometry(p, riseM)`. */
export function geometry(n: 1 | 2 | 4, riseM: number): PanelGeometry {
  const risePx = riseM * PPM;
  const loadTop = LOAD_TOP0 - risePx;
  const ym = loadTop - HOOK;
  const segs: RopeSeg[] = [];
  const fixed: Sheave[] = [];
  const moving: Sheave[] = [];
  let exitX: number;
  if (n === 1) {
    const fx = 60;
    const f = sheave(fx, FIX_CY, true);
    fixed.push(f);
    segs.push(line(fx - R, loadTop, fx - R, FIX_CY));
    segs.push(arc(fx, FIX_CY, Math.PI, 1.5 * Math.PI, f));
    exitX = fx;
  } else if (n === 2) {
    const mx = 50;
    const fx = 76;
    const m = sheave(mx, ym, false);
    const f = sheave(fx, FIX_CY, true);
    moving.push(m);
    fixed.push(f);
    segs.push(line(mx - R, CEIL_Y, mx - R, ym));
    segs.push(arc(mx, ym, Math.PI, 0, m));
    segs.push(line(mx + R, ym, mx + R, FIX_CY));
    segs.push(arc(fx, FIX_CY, Math.PI, 1.5 * Math.PI, f));
    exitX = fx;
  } else {
    const m1 = 45;
    const f1 = 71;
    const m2 = 97;
    const f2 = 123;
    const sm1 = sheave(m1, ym, false);
    const sm2 = sheave(m2, ym, false);
    const sf1 = sheave(f1, FIX_CY, true);
    const sf2 = sheave(f2, FIX_CY, true);
    moving.push(sm1, sm2);
    fixed.push(sf1, sf2);
    segs.push(line(m1 - R, CEIL_Y, m1 - R, ym));
    segs.push(arc(m1, ym, Math.PI, 0, sm1));
    segs.push(line(m1 + R, ym, m1 + R, FIX_CY));
    segs.push(arc(f1, FIX_CY, Math.PI, 2 * Math.PI, sf1));
    segs.push(line(f1 + R, FIX_CY, f1 + R, ym));
    segs.push(arc(m2, ym, Math.PI, 0, sm2));
    segs.push(line(m2 + R, ym, m2 + R, FIX_CY));
    segs.push(arc(f2, FIX_CY, Math.PI, 1.5 * Math.PI, sf2));
    exitX = f2;
  }
  const exitY = FIX_CY - R;
  const hand0 = exitX + HAND_GAP;
  // 줄은 늘지 않으므로 받치는 가닥이 짧아진 만큼 손 쪽으로 나온다.
  const pulledM = n * riseM;
  const handX = hand0 + pulledM * PPM;
  segs.push(line(exitX, exitY, handX, exitY));

  // 각 도르래에 줄이 닿기 시작하는 곳까지의 길이 → 회전각 계산에 쓴다.
  let s = 0;
  for (const seg of segs) {
    if (seg.kind === 'arc') seg.sheave.contactS = s;
    s += seg.len;
  }
  return { segs, fixed, moving, loadTop, ym, exitX, exitY, hand0, handX, pulledM, riseM };
}

/**
 * 도르래 회전각(캔버스 각, 시계 방향 +). 닿는 곳까지의 길이가 줄어든 만큼 줄이 도르래
 * 위를 손 쪽으로 지나갔다. `base` 는 올리기 전 같은 도르래.
 */
export function sheaveAngle(now: Sheave, base: Sheave): number {
  const travel = base.contactS - now.contactS;
  return ((now.over ? 1 : -1) * travel) / R;
}

/** 원본 오르내림 곡선 `(1 − cos πx) / 2`. */
function cosineEase(x: number): number {
  return (1 - Math.cos(Math.PI * x)) / 2;
}

/**
 * 짐이 오른 높이(m). 오르기 단계 동안 0 → rise, 멈춤 동안 rise, 내리기 동안 rise → 0.
 *
 * 단계 경계를 가르지 않는다 — 오르기 진행도에서 내리기 진행도를 뺀다. 오르는 동안
 * 내리기 진행도는 0 이고, 내리는 동안 오르기 진행도는 1 이다.
 */
export function riseAt(tl: TimelineFrame, riseM: number): number {
  return riseM * (cosineEase(tl.at('rise')) - cosineEase(tl.at('lower')));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: PulleySystemState }): PulleySystemState {
  return params.state;
}
