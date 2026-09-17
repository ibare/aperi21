// ========================================================================
// tangential-normal-acceleration — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 왼쪽 판: 길(trajectory) · 속도 화살(vector) · 두 몫과 합(vector) · 평행사변형
// 보조선(trajectory 점선) · 물체(body) · 몫 이름(readout).
// 오른쪽 판: 판 이름(readout) · 같은 길이 원(trajectory 점) · 화살 끝 자취(trajectory
// 꼬리 페이드) · 모은 속도 화살(vector + body) · 같은 두 몫과 합.
// 캡션은 선언의 캡션 슬롯이 그린다 — 여기서 내지 않는다.
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
import { layout, partsAt, sampleAt, sampleCount, sampleIndex, type Sample } from './physics';
import {
  CANVAS_H,
  CANVAS_W,
  HODO,
  HODO_TITLE_Y,
  PX_PER_UNIT,
  SCENE_BOUNDS,
  TABLE_FPS,
  TAIL_SECONDS,
  text,
} from './schema';
import type { TangentialNormalAccelerationState } from './state';

// ---- 원본 index.html 의 그리기 치수 (px) ----
/** 속도 화살 굵기·머리. */
const VELOCITY_WIDTH = 3;
const VELOCITY_HEAD = 12;
/** 두 몫 화살 굵기·머리. */
const PART_WIDTH = 3.5;
const PART_HEAD = 11;
/** 전체 가속도 화살 굵기·머리. */
const TOTAL_WIDTH = 1.5;
const TOTAL_HEAD = 8;
/** 평행사변형 보조선 · 같은 길이 원 굵기. */
const GUIDE_WIDTH = 1;
/** 길 굵기. */
const PATH_WIDTH = 2;
/** 길의 옅음 — 원본은 배경에 가까운 옅은 회색이라 muted subtle 을 한 번 더 흐린다. */
const PATH_OPACITY = 0.55;
/** 화살 끝 자취 굵기와 가장 진한 곳의 불투명도. */
const TAIL_WIDTH = 2;
const TAIL_OPACITY = 0.5;
/** 물체 반지름 · 모음판 원점 반지름. */
const BODY_RADIUS = 7;
const ORIGIN_RADIUS = 3.5;
/** 뒤를 향한 속력 몫을 속도 화살에서 비켜 그리는 거리. */
const BACKWARD_OFFSET = 7;
/** 한 몫뿐일 때는 합을 그리지 않는다 — 이 길이(px) 아래를 없는 몫으로 본다. */
const PART_MIN = 1;
/** 이름을 붙이는 몫의 최소 길이(px). */
const LABEL_MIN = 6;
/** 속력 몫 이름: 화살 끝에서 앞(뒤)으로 · 옆으로 비키는 거리. 방향 몫 이름: 옆으로. */
const SPEED_LABEL_ALONG = 22;
const SPEED_LABEL_SIDE = 14;
const TURN_LABEL_SIDE = 16;
/** 그림 안 글자 크기. */
const LABEL_FONT = 13;
/** 길을 그릴 때 건너뛰는 칸 · 자취를 찍는 칸 간격. */
const PATH_STRIDE = 2;
const TAIL_STRIDE = 2;
/** 같은 길이 원을 이루는 점 수. */
const RING_SEGMENTS = 96;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const GUIDE = { colorRole: 'muted', emphasis: 'medium' } as const;
const SPEED = { colorRole: 'accent', emphasis: 'strong' } as const;
const TURN = { colorRole: 'secondary', emphasis: 'strong' } as const;

// ---- 원본 px(y 아래) → 월드(y 위) ----
function world(px: number, py: number): Vec2 {
  return [(px - CANVAS_W / 2) / PX_PER_UNIT, (CANVAS_H / 2 - py) / PX_PER_UNIT];
}
function worldDelta(dx: number, dy: number): Vec2 {
  return [dx / PX_PER_UNIT, -dy / PX_PER_UNIT];
}
/** 화면 px 치수를 월드 길이로 — 머리 크기처럼 배율을 따라가는 치수. */
function unit(px: number): number {
  return px / PX_PER_UNIT;
}

function arrow(
  id: string,
  fromPx: readonly [number, number],
  dPx: readonly [number, number],
  style: Vector['style'],
  width: number,
  head: number,
): Vector {
  return {
    type: 'vector',
    id,
    from: world(fromPx[0], fromPx[1]),
    delta: worldDelta(dPx[0], dPx[1]),
    style,
    width,
    headSize: unit(head),
  };
}

/**
 * 가속도 두 몫을 속도 화살 끝에 붙인다 — 속력 몫은 화살을 늘이고/줄이고, 방향 몫은 옆으로
 * 민다. 두 몫이 모두 있을 때만 합과 평행사변형을 둔다. 원본 `parts()` 그대로.
 */
function parts(
  out: Primitive[],
  prefix: string,
  tip: readonly [number, number],
  s: Sample,
  aT: number,
  aN: number,
  labels: boolean,
): void {
  const { accelScale: as } = layout();
  const ux = Math.cos(s.h);
  const uy = Math.sin(s.h);
  const nx = -uy; // 도는 쪽(원본 화면에서 시계 방향)
  const ny = ux;
  const tx = ux * aT * as;
  const ty = uy * aT * as;
  const qx = nx * aN * as;
  const qy = ny * aN * as;
  const [px, py] = tip;

  if (Math.abs(aT) * as >= PART_MIN && aN * as >= PART_MIN) {
    const guide: Trajectory = {
      type: 'trajectory',
      id: `${prefix}-parallelogram`,
      points: [world(px + tx, py + ty), world(px + tx + qx, py + ty + qy), world(px + qx, py + qy)],
      width: GUIDE_WIDTH,
      style: { ...GUIDE, lineStyle: 'dashed' },
    };
    out.push(guide);
    out.push(arrow(`${prefix}-total`, tip, [tx + qx, ty + qy], GUIDE, TOTAL_WIDTH, TOTAL_HEAD));
  }

  // 뒤를 향하면 속도 화살 위에 겹치므로 도는 쪽 반대편으로 조금 비켜 그린다 (길이·방향은 그대로).
  const off = aT < 0 ? BACKWARD_OFFSET : 0;
  out.push(arrow(`${prefix}-speed`, [px - nx * off, py - ny * off], [tx, ty], SPEED, PART_WIDTH, PART_HEAD));
  if (labels && Math.abs(aT) * as > LABEL_MIN) {
    const sgn = Math.sign(aT);
    const label: Readout = {
      type: 'readout',
      id: `${prefix}-speed-label`,
      anchor: {
        world: world(px + tx, py + ty),
        // offset 은 화면 px(y 아래) — 원본 좌표와 같은 방향이다.
        offset: [
          ux * SPEED_LABEL_ALONG * sgn - nx * (SPEED_LABEL_SIDE + off),
          uy * SPEED_LABEL_ALONG * sgn - ny * (SPEED_LABEL_SIDE + off),
        ],
      },
      text: text('label.speedPart'),
      chip: false,
      align: 'center',
      font: 'text',
      fontSize: LABEL_FONT,
      style: SPEED,
    };
    out.push(label);
  }

  out.push(arrow(`${prefix}-turn`, tip, [qx, qy], TURN, PART_WIDTH, PART_HEAD));
  if (labels && aN * as > LABEL_MIN) {
    const label: Readout = {
      type: 'readout',
      id: `${prefix}-turn-label`,
      anchor: { world: world(px + qx, py + qy), offset: [nx * TURN_LABEL_SIDE, ny * TURN_LABEL_SIDE] },
      text: text('label.turnPart'),
      chip: false,
      align: 'center',
      font: 'text',
      fontSize: LABEL_FONT,
      style: TURN,
    };
    out.push(label);
  }
}

function dot(id: string, px: number, py: number, radius: number): Body {
  return {
    type: 'body',
    id,
    pos: world(px, py),
    shape: 'circle',
    size: unit(radius),
    style: INK,
    outline: 'none',
    glow: false,
  };
}

export function scene(params: {
  state: TangentialNormalAccelerationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('tangential-normal-acceleration: schema.timeline 이 선언되어야 한다');
  const L = layout();
  const s = sampleAt(tl.u);
  const { aT, aN } = partsAt(tl, s.v);
  const toPx = (m: Sample): [number, number] => [L.ox + L.fit * m.x, L.oy + L.fit * m.y];
  const out: Primitive[] = [];

  // ----- 왼쪽: 길 위의 물체 -----
  const n = sampleCount();
  const pathPts: Vec2[] = [];
  for (let j = 0; j < n; j += PATH_STRIDE) {
    const [x, y] = toPx(sampleIndex(j));
    pathPts.push(world(x, y));
  }
  out.push({
    type: 'trajectory',
    id: 'path',
    points: pathPts,
    closed: true,
    width: PATH_WIDTH,
    opacity: PATH_OPACITY,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });

  const [bx, by] = toPx(s);
  const vx = Math.cos(s.h) * s.v * L.velocityScale;
  const vy = Math.sin(s.h) * s.v * L.velocityScale;
  out.push(arrow('velocity', [bx, by], [vx, vy], INK, VELOCITY_WIDTH, VELOCITY_HEAD));
  parts(out, 'track', [bx + vx, by + vy], s, aT, aN, true);
  out.push(dot('body', bx, by, BODY_RADIUS));

  // ----- 오른쪽: 속도 화살만 한 점에 모은 판 -----
  out.push({
    type: 'readout',
    id: 'hodograph-title',
    // 원본은 윗변을 y=6 에 맞췄다. readout 은 가운데 높이에 놓이므로 글자 반만큼 내린다.
    anchor: { world: world(HODO.cx, HODO_TITLE_Y + LABEL_FONT / 2) },
    text: text('label.hodograph'),
    chip: false,
    align: 'center',
    font: 'text',
    fontSize: LABEL_FONT,
    style: GUIDE,
  });

  const r = s.v * L.hodoScale;
  out.push({
    type: 'trajectory',
    id: 'same-length-ring',
    points: Array.from({ length: RING_SEGMENTS }, (_, i) => {
      const a = (i / RING_SEGMENTS) * Math.PI * 2;
      return world(HODO.cx + Math.cos(a) * r, HODO.cy + Math.sin(a) * r);
    }),
    closed: true,
    width: GUIDE_WIDTH,
    style: { ...GUIDE, lineStyle: 'dotted' },
  });

  // 지나온 2.5 초의 화살 끝. 표의 지난 칸을 읽으므로 도착한 순간부터 꼬리가 있다.
  const tailFrames = Math.round(TAIL_SECONDS * TABLE_FPS);
  const tailPts: Vec2[] = [];
  for (let k = tailFrames; k >= 0; k -= TAIL_STRIDE) {
    const m = sampleAt(tl.u - k / TABLE_FPS);
    tailPts.push(world(HODO.cx + Math.cos(m.h) * m.v * L.hodoScale, HODO.cy + Math.sin(m.h) * m.v * L.hodoScale));
  }
  out.push({
    type: 'trajectory',
    id: 'tip-tail',
    points: tailPts,
    width: TAIL_WIDTH,
    opacity: TAIL_OPACITY,
    style: { ...INK, fade: 'tail' },
  });

  const hx = Math.cos(s.h) * r;
  const hy = Math.sin(s.h) * r;
  out.push(arrow('hodograph-velocity', [HODO.cx, HODO.cy], [hx, hy], INK, VELOCITY_WIDTH, VELOCITY_HEAD));
  out.push(dot('hodograph-origin', HODO.cx, HODO.cy, ORIGIN_RADIUS));
  parts(out, 'hodograph', [HODO.cx + hx, HODO.cy + hy], s, aT, aN, false);

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
  return { ...SCENE_BOUNDS };
}
