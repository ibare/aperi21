// ========================================================================
// centripetal-force — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 원 궤도 · 날아간 자취 · 바깥 방향 점선(trajectory) · 줄(constraint) ·
// 당기는 힘(vector) · 회전 중심과 공(body). 캡션은 선언의 캡션 슬롯이 그린다.
// ========================================================================

import type {
  Body,
  Constraint,
  Primitive,
  SceneGraph,
  Trajectory,
  Vec2,
  Vector,
} from '@aperi21/schema';
import {
  BALL_RADIUS,
  FADE_IN,
  FADE_OUT,
  RELEASED,
  FORCE_END,
  FORCE_HEAD,
  FORCE_START,
  PATH_LENGTH,
  PIVOT_RADIUS,
  RADIUS,
  SCENE_BOUNDS,
} from './schema';
import type { CentripetalForceState } from './state';

/** 원 궤도를 이루는 점 개수. */
const ORBIT_SEGMENTS = 96;
/** 원 궤도 굵기(화면 px). 원본 1. */
const ORBIT_WIDTH_PX = 1;
/** 바깥 방향 점선 굵기(화면 px). 원본 1.5. */
const OUTWARD_WIDTH_PX = 1.5;
/** 바깥 방향 점선의 옅기. 원본 0.9 × 페이드. */
const OUTWARD_ALPHA = 0.9;
/** 날아간 자취 굵기(화면 px). 원본 2.5. */
const TRAIL_WIDTH_PX = 2.5;
/** 날아간 자취의 옅기. 원본 0.55 × 페이드. */
const TRAIL_ALPHA = 0.55;
/** 힘 화살표 굵기(화면 px). 원본 3. */
const FORCE_WIDTH_PX = 3;

/** 실제로 가지 않는 경로(원 궤도 · 바깥 점선)는 같은 회색이다. */
const FAINT_STYLE = { colorRole: 'muted', emphasis: 'subtle' } as const;
/** 공과 공의 자취는 같은 색 — 같은 대상이다. */
const BALL_STYLE = { colorRole: 'secondary', emphasis: 'strong' } as const;
/** 강조색은 힘 화살표 한 가지 뜻에만. */
const FORCE_STYLE = { colorRole: 'accent', emphasis: 'strong' } as const;
/** 줄과 회전 중심은 먹색. */
const INK_STYLE = { colorRole: 'ink', emphasis: 'strong' } as const;

export function scene(params: { state: CentripetalForceState }): SceneGraph {
  const s = params.state;
  const out: Primitive[] = [];

  // ---- 원 궤도 ----
  const orbit: Trajectory = {
    type: 'trajectory',
    id: 'orbit',
    points: Array.from({ length: ORBIT_SEGMENTS }, (_, i): Vec2 => {
      const a = (i / ORBIT_SEGMENTS) * Math.PI * 2;
      return [RADIUS * Math.cos(a), RADIUS * Math.sin(a)];
    }),
    closed: true,
    width: ORBIT_WIDTH_PX,
    style: { ...FAINT_STYLE, lineStyle: 'dotted' },
  };
  out.push(orbit);

  // 비행이 끝난 뒤(공이 자취 끝에 닿은 뒤) 공·자취·점선이 함께 흐려진다.
  const fade = Math.min(1, (RELEASED - s.elapsed) / FADE_OUT);

  if (s.released) {
    const [px, py] = s.releasePos;

    // ---- 바깥 방향 점선 ----
    // 흔한 예상(반지름 바깥으로 튀어 나감)을 비교용으로만 흐리게 둔다. 자취와 같은 길이.
    const r = Math.hypot(px, py) || 1;
    const outward: Trajectory = {
      type: 'trajectory',
      id: 'outward',
      points: [
        [px, py],
        [px + (px / r) * PATH_LENGTH, py + (py / r) * PATH_LENGTH],
      ],
      width: OUTWARD_WIDTH_PX,
      opacity: OUTWARD_ALPHA * fade,
      style: { ...FAINT_STYLE, lineStyle: 'dashed' },
    };
    out.push(outward);

    // ---- 날아간 자취 ----
    // 놓인 자리에서 공까지. 비행 시간이 길이/속력이라 공은 점선과 같은 길이에서 멈춘다.
    // 걸음 오차로 넘치지 않게 길이를 한 번 더 자른다.
    const dx = s.pos[0] - px;
    const dy = s.pos[1] - py;
    const flown = Math.hypot(dx, dy);
    const k = flown > PATH_LENGTH ? PATH_LENGTH / flown : 1;
    const trail: Trajectory = {
      type: 'trajectory',
      id: 'trail',
      points: [
        [px, py],
        [px + dx * k, py + dy * k],
      ],
      width: TRAIL_WIDTH_PX,
      opacity: TRAIL_ALPHA * fade,
      style: BALL_STYLE,
    };
    out.push(trail);
  }

  const appear = Math.min(1, s.elapsed / FADE_IN);

  // ---- 줄 ----
  if (!s.released) {
    const string: Constraint = {
      type: 'constraint',
      id: 'string',
      subtype: 'string',
      from: [0, 0],
      to: [s.pos[0], s.pos[1]],
      opacity: appear,
      style: INK_STYLE,
    };
    out.push(string);
  }

  // ---- 회전 중심 ----
  const pivot: Body = {
    type: 'body',
    id: 'pivot',
    pos: [0, 0],
    shape: 'circle',
    size: PIVOT_RADIUS,
    glow: false,
    outline: 'none',
    style: INK_STYLE,
  };
  out.push(pivot);

  // ---- 당기는 힘 ----
  // 공에서 중심 쪽으로. 길이는 일정 — 크기가 아니라 방향이 주장이다.
  if (!s.released) {
    const len = Math.hypot(s.pos[0], s.pos[1]) || 1;
    const ux = -s.pos[0] / len;
    const uy = -s.pos[1] / len;
    const force: Vector = {
      type: 'vector',
      id: 'force',
      from: [s.pos[0] + ux * FORCE_START, s.pos[1] + uy * FORCE_START],
      delta: [ux * (FORCE_END - FORCE_START), uy * (FORCE_END - FORCE_START)],
      headSize: FORCE_HEAD,
      width: FORCE_WIDTH_PX,
      opacity: appear,
      style: FORCE_STYLE,
    };
    out.push(force);
  }

  // ---- 공 ----
  const ball: Body = {
    type: 'body',
    id: 'ball',
    pos: [s.pos[0], s.pos[1]],
    shape: 'circle',
    size: BALL_RADIUS,
    glow: false,
    outline: 'none',
    opacity: s.released ? fade : appear,
    style: BALL_STYLE,
  };
  out.push(ball);

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
  return { ...SCENE_BOUNDS };
}
