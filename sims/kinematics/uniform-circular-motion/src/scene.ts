// ========================================================================
// uniform-circular-motion — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 궤도(trajectory) · 속도와 잔상(vector) · 물체와 꼬리 점(body) · 안내글(readout).
// 잔상의 옅기는 `opacity`, 지금과 과거의 차이는 `width` 로 선언한다. 캡션은 선언의
// 캡션 슬롯이 그린다 — 여기서 내지 않는다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { position, stampsAt, theta, velocity } from './physics';
import {
  BODY_RADIUS,
  FAN_CENTER,
  HEAD_SIZE,
  IN_PLACE_STAMP_FACTOR,
  NOTE_POS,
  PIVOT_RADIUS,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { UniformCircularMotionState } from './state';

/** 궤도 원을 이루는 점 개수. */
const ORBIT_SEGMENTS = 96;
/** 궤도 선 굵기(화면 px). 원본 1.5. */
const ORBIT_WIDTH_PX = 1.5;
/** 궤도 선의 옅음. 원본은 옅은 회색이라 muted · subtle 을 한 번 더 흐린다. */
const ORBIT_OPACITY = 0.7;
/** 화살표 굵기(화면 px). 원본 — 지금 3, 잔상 2. */
const NOW_WIDTH_PX = 3;
const STAMP_WIDTH_PX = 2;
/** 안내글 글자 크기. 원본 13 px. */
const NOTE_FONT_PX = 13;

/** 강조색은 속도 화살표 한 가지 뜻에만 — 왼쪽·오른쪽, 지금·잔상 모두 같다. */
const VELOCITY_STYLE = { colorRole: 'accent', emphasis: 'strong' } as const;
/** 원본의 물체·꼬리 점은 번짐 없는 먹색 채움 원이다. */
const INK_STYLE = { colorRole: 'ink', emphasis: 'strong' } as const;

function arrow(id: string, from: Vec2, delta: Vec2, opacity: number, width: number): Vector {
  return { type: 'vector', id, from, delta, headSize: HEAD_SIZE, style: VELOCITY_STYLE, opacity, width };
}

function dot(id: string, pos: Vec2, size: number): Body {
  return { type: 'body', id, pos, shape: 'circle', size, style: INK_STYLE, glow: false, outline: 'none' };
}

export function scene(params: {
  state: UniformCircularMotionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('uniform-circular-motion: schema.timeline 이 선언되어야 한다');
  const t = tl.t;
  const th = theta(t);
  const p = position(th);
  const v = velocity(th);
  const stamps = stampsAt(t);
  const out: Primitive[] = [];

  // ---- 원 궤도 ----
  const orbit: Trajectory = {
    type: 'trajectory',
    id: 'orbit',
    points: Array.from({ length: ORBIT_SEGMENTS }, (_, i) => position((i / ORBIT_SEGMENTS) * Math.PI * 2)),
    closed: true,
    width: ORBIT_WIDTH_PX,
    opacity: ORBIT_OPACITY,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(orbit);

  // ---- 지나온 자리의 속도 화살표 ----
  for (const s of stamps) {
    out.push(arrow(`stamp-${s.k}`, position(s.th), velocity(s.th), s.alpha * IN_PLACE_STAMP_FACTOR, STAMP_WIDTH_PX));
  }

  // ---- 물체의 속도 화살표 · 물체 ----
  out.push(arrow('velocity', p, v, 1, NOW_WIDTH_PX));
  out.push(dot('body', p, BODY_RADIUS));

  // ---- 한 점에 모은 지난 속도 화살표 ----
  for (const s of stamps) {
    out.push(arrow(`fan-stamp-${s.k}`, FAN_CENTER, velocity(s.th), s.alpha, STAMP_WIDTH_PX));
  }

  // ---- 한 점에 모은 지금 속도 화살표 · 꼬리 점 ----
  out.push(arrow('fan-velocity', FAN_CENTER, v, 1, NOW_WIDTH_PX));
  out.push(dot('fan-pivot', FAN_CENTER, PIVOT_RADIUS));

  // ---- 모은 곳 안내글 ----
  const note: Readout = {
    type: 'readout',
    id: 'gathered-note',
    anchor: { world: NOTE_POS },
    text: text('label.gathered'),
    chip: false,
    align: 'center',
    font: 'text',
    fontSize: NOTE_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(note);

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
  return { ...SCENE_BOUNDS };
}
