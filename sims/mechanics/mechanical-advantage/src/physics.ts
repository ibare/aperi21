// ========================================================================
// mechanical-advantage — 순수 기하
// ========================================================================
// 올린 정도 p(0~1) 하나에서 세 칸의 자리를 계산한다. 그리지 않는다.
// ========================================================================

import type { TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BAND_FADE_RATE,
  BAND_OFFSET,
  BOX_S,
  FORCE_PER_N,
  INCLINE_ARROW_GAP,
  INCLINE_HAND_BACK,
  LEVER_ARROW_GAP,
  LEVER_BOX_LIFT,
  LEVER_D0,
  LEVER_HAND_LIFT,
  LEVER_L1,
  LEVER_L2,
  LEVER_PIVOT_DX,
  LIFT_ARROW_GAP,
  LIFT_ROPE,
  RISE,
  TOOLS,
  WEIGHT_N,
} from './schema';
import type { MechanicalAdvantageState } from './state';

export const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];
export const scale = (a: Vec2, k: number): Vec2 => [a[0] * k, a[1] * k];

/** 지레 띠를 호로 긋는 마디 수. */
const ARC_SEGMENTS = 24;

/**
 * 시간표에서 올린 정도와 띠의 진하기.
 *
 * - `p` — 올리는 동안 0 → 1(이징은 선언), 멈추는 동안 1, 내려놓는 동안 1 → 0.
 * - `fade` — 내려놓는 단계의 앞 1/1.6 동안 1 → 0 (smoothstep). 원본은 되돌림보다
 *   빨리 옅어진다.
 */
export function progress(tl: TimelineFrame): { p: number; fade: number } {
  const p = tl.at('lift') * (1 - tl.at('return'));
  const s = tl.start('return');
  const fade = 1 - tl.span(s, s + tl.duration('return') / BAND_FADE_RATE, 'smooth');
  return { p, fade };
}

/** 도구의 손의 힘(N)과 지금까지 민 거리(m). */
export function reading(ratio: number, p: number): { force: number; distance: number } {
  return { force: WEIGHT_N / ratio, distance: RISE * ratio * p };
}

/** 손의 힘 화살표 길이(월드). 세 칸이 같은 축척이다. */
export function forceLength(ratio: number): number {
  return (WEIGHT_N / ratio) * FORCE_PER_N;
}

/** 민 거리 띠 — 점들(출발 → 지금)과 출발점 눈금의 방향(띠에 수직). */
export interface Band {
  points: Vec2[];
  tickDir: Vec2;
}

export interface Pose {
  /** 상자 가운데. */
  boxCenter: Vec2;
  /** 상자 기울기(라디안, 반시계). */
  boxAngle: number;
  hand: Vec2;
  /** 손의 힘 화살표 꼬리와 크기. */
  arrowFrom: Vec2;
  arrowDelta: Vec2;
  band: Band;
}

/** 상자 밑면 가운데와 기울기에서 상자 가운데. */
function centerOf(bottom: Vec2, angle: number): Vec2 {
  return add(bottom, [-Math.sin(angle) * (BOX_S / 2), Math.cos(angle) * (BOX_S / 2)]);
}

// ---- 1. 그대로 들기 ----

export function liftPose(p: number): Pose & { ropeFrom: Vec2 } {
  const cx = TOOLS[0].cx;
  const boxY = RISE * p;
  const hand: Vec2 = [cx, boxY + BOX_S + LIFT_ROPE];
  const hand0: Vec2 = [cx, BOX_S + LIFT_ROPE];
  const len = forceLength(TOOLS[0].ratio);
  return {
    boxCenter: [cx, boxY + BOX_S / 2],
    boxAngle: 0,
    hand,
    ropeFrom: [cx, boxY + BOX_S],
    arrowFrom: [cx, hand[1] + LIFT_ARROW_GAP],
    arrowDelta: [0, len],
    // 손이 지나온 세로 길 바로 오른쪽.
    band: {
      points: [add(hand0, [BAND_OFFSET, 0]), add(hand, [BAND_OFFSET, 0])],
      tickDir: [1, 0],
    },
  };
}

// ---- 2. 지레 ----

export interface LeverPose extends Pose {
  pivot: Vec2;
  boxEnd: Vec2;
  handEnd: Vec2;
}

export function leverPose(p: number): LeverPose {
  const cx = TOOLS[1].cx;
  const pivot: Vec2 = [cx - LEVER_PIVOT_DX, LEVER_D0];
  // 막대의 기울기 — 상자 끝이 받침점보다 낮은 정도 / 짧은 팔. 올리면 줄어 음수가 된다.
  const sinOf = (q: number): number => (LEVER_D0 - RISE * q) / LEVER_L1;
  const s = sinOf(p);
  const c = Math.sqrt(1 - s * s);
  const boxEnd: Vec2 = [pivot[0] - LEVER_L1 * c, pivot[1] - LEVER_L1 * s];
  const handEnd: Vec2 = [pivot[0] + LEVER_L2 * c, pivot[1] + LEVER_L2 * s];
  const hand = add(handEnd, [0, LEVER_HAND_LIFT]);
  const len = forceLength(TOOLS[1].ratio);

  // 손은 받침점(손을 올린 만큼 위로)을 중심으로 긴 팔 반지름의 호를 돈다. 띠는 그
  // 호의 바깥쪽에 붙어 출발점에서 지금 손까지 자란다.
  const center = add(pivot, [0, LEVER_HAND_LIFT]);
  const r = LEVER_L2 + BAND_OFFSET;
  const points: Vec2[] = [];
  for (let i = 0; i <= ARC_SEGMENTS; i++) {
    const si = sinOf((p * i) / ARC_SEGMENTS);
    points.push(add(center, [r * Math.sqrt(1 - si * si), r * si]));
  }
  const s0 = sinOf(0);

  return {
    pivot,
    boxEnd,
    handEnd,
    // 상자는 기울지 않고 막대 끝에 얹힌다 (원본).
    boxCenter: add(boxEnd, [0, LEVER_BOX_LIFT + BOX_S / 2]),
    boxAngle: 0,
    hand,
    arrowFrom: add(handEnd, [0, LEVER_ARROW_GAP + len]),
    arrowDelta: [0, -len],
    band: { points, tickDir: [Math.sqrt(1 - s0 * s0), s0] },
  };
}

// ---- 3. 빗면 ----

export interface InclinePose extends Pose {
  foot: Vec2;
  top: Vec2;
}

export function inclinePose(p: number): InclinePose {
  const cx = TOOLS[2].cx;
  const length = RISE * TOOLS[2].ratio; // 2.0 m
  const run = Math.sqrt(length * length - RISE * RISE);
  const foot: Vec2 = [cx - run / 2, 0];
  const top: Vec2 = [cx + run / 2, RISE];
  const u: Vec2 = [run / length, RISE / length];
  const n: Vec2 = [-u[1], u[0]];
  const slope = Math.atan2(u[1], u[0]);
  const at = (s: number, off: number): Vec2 => add(foot, add(scale(u, s), scale(n, off)));

  const sPos = length * p;

  // 상자 밑면 가운데가 비탈 꼭대기에 닿는 것이 "다 올렸다" 다. 그 자리에서 비탈 각
  // 그대로면 앞 절반이 받침대 위 허공에 뜬다. 앞 모서리가 꼭대기를 넘어서는 마지막
  // 반 칸 동안 **꼭대기를 축으로** 눕혀, 다 올린 상자가 받침대 위에 앉게 한다
  // (NOTES (a) 3). 올라간 높이는 그대로 0.5 m 다.
  const tipStart = length - BOX_S / 2;
  let bottom: Vec2;
  let angle: number;
  if (sPos <= tipStart) {
    bottom = at(sPos, 0);
    angle = slope;
  } else {
    const k = (sPos - tipStart) / (BOX_S / 2);
    angle = slope * (1 - k);
    bottom = add(top, scale([Math.cos(angle), Math.sin(angle)], sPos - length));
  }

  // 손 · 화살표 · 띠는 비탈 방향 그대로 — 민 거리는 비탈을 따라 잰다.
  const handS = sPos - INCLINE_HAND_BACK;
  const hand = at(handS, BOX_S / 2);
  const len = forceLength(TOOLS[2].ratio);
  return {
    foot,
    top,
    boxCenter: centerOf(bottom, angle),
    boxAngle: angle,
    hand,
    arrowFrom: at(handS - INCLINE_ARROW_GAP - len, BOX_S / 2),
    arrowDelta: scale(u, len),
    band: {
      points: [
        at(-INCLINE_HAND_BACK, BOX_S / 2 + BAND_OFFSET),
        at(handS, BOX_S / 2 + BAND_OFFSET),
      ],
      tickDir: n,
    },
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: MechanicalAdvantageState }): MechanicalAdvantageState {
  return params.state;
}
