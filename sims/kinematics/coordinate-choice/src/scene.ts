// ========================================================================
// coordinate-choice — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 빗면(region + trajectory) · 축(vector + readout) · 투영선(trajectory 점선) ·
// 발자국(trace tick) · 그림자(body circle) · 물체(body rect) 가 모두 표준 어휘다.
// 같은 운동을 두 패널에 놓는 것은 한 월드에 가로로 420 px 떨어뜨려 두 번 선언한다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  AXIS_HEAD_PX,
  AXIS_LABEL_FONT_PX,
  AXIS_WIDTH_PX,
  BLOCK_PX,
  CANVAS_H_PX,
  GUIDE_ALPHA,
  GUIDE_WIDTH_PX,
  PANEL_OFFSET_PX,
  PX_PER_M,
  SCENE_BOUNDS,
  SHADOW_R_PX,
  SLOPE_EDGE_WIDTH_PX,
  SLOPE_THICK_PX,
  STAMP_ALPHA,
  STAMP_SPAN_PX,
  STAMP_WIDTH_PX,
  THETA,
  text,
  type CoordinateChoiceMessageKey,
} from './schema';
import {
  BOT,
  LEFT_AXES,
  LX_AXIS_Y,
  LY_AXIS_X,
  N_UP,
  RIGHT_AXES,
  RX0,
  RY_BASE,
  TOP,
  U,
  add,
  alongAt,
  blockCenter,
  stampTimes,
  type AxisDef,
  type PxPoint,
} from './physics';
import type { CoordinateChoiceState } from './state';

/** 원본 캔버스 좌표(패널 안) → 월드(m, y 위). 나눗셈은 여기 한 곳에만 둔다. */
function w(p: PxPoint, ox: number): Vec2 {
  return [(p.x + ox) / PX_PER_M, (CANVAS_H_PX - p.y) / PX_PER_M];
}

/** 캔버스 방향 → 월드 방향 (y 만 뒤집는다). */
function wd(d: PxPoint): Vec2 {
  return [d.x, -d.y];
}

const PANELS = [
  { id: 'left', ox: 0, axes: LEFT_AXES },
  { id: 'right', ox: PANEL_OFFSET_PX, axes: RIGHT_AXES },
] as const;

/** 축 하나 — 화살표와 기울임 이름. */
function axis(
  id: string,
  from: PxPoint,
  to: PxPoint,
  labelAt: PxPoint,
  label: CoordinateChoiceMessageKey,
  ox: number,
): Primitive[] {
  const a = w(from, ox);
  const b = w(to, ox);
  return [
    {
      type: 'vector',
      id: `axis-${id}`,
      from: a,
      delta: [b[0] - a[0], b[1] - a[1]],
      headSize: AXIS_HEAD_PX / PX_PER_M,
      width: AXIS_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
    {
      type: 'readout',
      id: `axis-${id}-label`,
      anchor: { world: w(labelAt, ox) },
      text: text(label),
      chip: false,
      align: 'center',
      font: 'text',
      italic: true,
      fontSize: AXIS_LABEL_FONT_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
  ];
}

export function scene(params: {
  state: CoordinateChoiceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl } = params;
  if (!tl) throw new Error('coordinate-choice: schema.timeline 이 선언되어야 한다');

  // 출발 뒤 흐른 시간 — 미끄럼 단계 안에서만 자라고 멈춘 뒤에는 끝값에 선다.
  const tau = tl.at('slide') * tl.duration('slide');
  // 흐려짐 — 마지막 단계 동안 1 → 0.
  const alpha = 1 - tl.at('fade');
  const cur = blockCenter(alongAt(tau));
  const stamps = stampTimes(tau).map((ts) => blockCenter(alongAt(ts)));

  const out: Primitive[] = [];

  // ---- 빗면 — 두 패널에 똑같이 ----
  for (const { id, ox } of PANELS) {
    out.push({
      type: 'region',
      id: `slope-${id}`,
      points: [
        w(TOP, ox),
        w(BOT, ox),
        w(add(BOT, N_UP, -SLOPE_THICK_PX), ox),
        w(add(TOP, N_UP, -SLOPE_THICK_PX), ox),
      ],
      fillOpacity: 0.16,
      style: { colorRole: 'muted', emphasis: 'medium' },
    });
    const edge: Trajectory = {
      type: 'trajectory',
      id: `slope-edge-${id}`,
      points: [w(TOP, ox), w(BOT, ox)],
      width: SLOPE_EDGE_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'medium' },
    };
    out.push(edge);
  }

  // ---- 수평·수직 축 (왼쪽) ----
  out.push(
    ...axis('x', { x: LY_AXIS_X - 10, y: LX_AXIS_Y }, { x: 405, y: LX_AXIS_Y }, { x: 405, y: LX_AXIS_Y + 16 }, 'label.axisX', 0),
    ...axis('y', { x: LY_AXIS_X, y: LX_AXIS_Y + 10 }, { x: LY_AXIS_X, y: 30 }, { x: LY_AXIS_X + 14, y: 32 }, 'label.axisY', 0),
  );

  // ---- 빗면 축 (오른쪽) ----
  const ox = PANEL_OFFSET_PX;
  const a1 = add(RX0, U, 350);
  const b1 = add(RY_BASE, N_UP, 120);
  out.push(
    ...axis('xp', add(RX0, U, -25), a1, { x: a1.x - 14, y: a1.y + 16 }, 'label.axisXp', ox),
    ...axis('yp', add(RY_BASE, N_UP, -10), b1, { x: b1.x + 14, y: b1.y + 4 }, 'label.axisYp', ox),
  );

  // ---- 투영선 ----
  // 물체·투영선·그림자·발자국은 모두 같은 대상(물체의 위치)이라 한 색이다.
  for (const { ox: px, axes } of PANELS) {
    for (const ax of axes) {
      out.push({
        type: 'trajectory',
        id: `guide-${ax.id}`,
        points: [w(cur, px), w(ax.project(cur), px)],
        width: GUIDE_WIDTH_PX,
        opacity: GUIDE_ALPHA * alpha,
        style: { colorRole: 'primary', emphasis: 'strong', lineStyle: 'dashed' },
      });
    }
  }

  // ---- 시간 발자국 ----
  // 축 **옆**에 세운다(원본은 축 위). 겹친 발자국이 그림자 점에 가리지 않게 —
  // schema.ts `STAMP_SPAN_PX` 와 NOTES (a).
  const mid = (STAMP_SPAN_PX.from + STAMP_SPAN_PX.to) / 2;
  const len = STAMP_SPAN_PX.to - STAMP_SPAN_PX.from;
  const stampTrace = (ax: AxisDef, px: number): Trace => ({
    type: 'trace',
    id: `stamps-${ax.id}`,
    marks: stamps.map((p) => ({ pos: w(add(ax.project(p), ax.outward, mid), px) })),
    shape: 'tick',
    size: len / PX_PER_M,
    direction: wd(ax.outward),
    width: STAMP_WIDTH_PX,
    opacity: STAMP_ALPHA * alpha,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  for (const { ox: px, axes } of PANELS) for (const ax of axes) out.push(stampTrace(ax, px));

  // ---- 그림자 ----
  for (const { ox: px, axes } of PANELS) {
    for (const ax of axes) {
      const shadow: Body = {
        type: 'body',
        id: `shadow-${ax.id}`,
        pos: w(ax.project(cur), px),
        shape: 'circle',
        size: SHADOW_R_PX / PX_PER_M,
        glow: false,
        outline: 'none',
        opacity: alpha,
        style: { colorRole: 'primary', emphasis: 'strong' },
      };
      out.push(shadow);
    }
  }

  // ---- 물체 — 두 패널에서 위치가 같다 ----
  for (const { id, ox: px } of PANELS) {
    const block: Body = {
      type: 'body',
      id: `block-${id}`,
      pos: w(cur, px),
      shape: 'rect',
      size: [BLOCK_PX / PX_PER_M, BLOCK_PX / PX_PER_M],
      // 캔버스(y 아래)에서 +θ 로 돌린 것은 월드(y 위)에서 −θ 다.
      orientation: -THETA,
      outline: 'none',
      opacity: alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    };
    out.push(block);
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
