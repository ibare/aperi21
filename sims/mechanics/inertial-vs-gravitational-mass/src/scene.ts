// ========================================================================
// inertial-vs-gravitational-mass — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 칸 이름(readout) · 저울 기둥 · 수평 기준선 · 저울대 · 매단 줄 · 접시(trajectory) · 받침대 ·
// 얼음판(region) · 받침점(body circle) · 물체 · 추(body rect) · 놓은 자리(trace tick) ·
// 용수철(constraint spring). 자유 렌더는 쓰지 않는다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 월드 단위 = 원본 px, y 는 위 (schema.ts 「배치」).
// ========================================================================

import type { Body, Primitive, SceneGraph, Trajectory, Vec2 } from '@aperi21/schema';
import {
  ARM,
  BASE_HALF,
  BASE_Y,
  GAP,
  HANGER_HALF,
  ICE_MID,
  ICE_THICK,
  ICE_X0,
  ICE_X1,
  ICE_Y,
  LEVEL_OVERHANG,
  MID_TICK_BOTTOM,
  MID_TICK_TOP,
  OBJECTS,
  PANEL_LABEL_FONT,
  PANEL_LABEL_X,
  PANEL_LABEL_Y,
  PAN_HALF,
  PAN_LIFT,
  PIVOT,
  PIVOT_R,
  SCENE_BOUNDS,
  SPRING_COILS,
  SPRING_LIFT,
  STRING,
  SUPPORT_GAP,
  SUPPORT_HALF,
  WEIGHT_BOX,
  text,
  type ObjectDef,
} from './schema';
import type { InertialVsGravitationalMassState } from './state';

// ------------------------------------------------------------------------
// 색 — 원본 팔레트를 색 역할로. 강조색은 쓰지 않는다 (원본 NOTES (c)).
// 옅은 회색 · 옅은 파랑은 역할 색을 바탕 위에 **빛의 양**으로 얹어 옮긴다.
// ------------------------------------------------------------------------

/** 칸 이름 · 기둥 · 놓은 자리 · 용수철 — 원본의 중간 회색들. */
const SOFT = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 수평 기준선 · 받침대 — 원본의 옅은 회색. */
const FAINT_LUMINANCE = 0.3;
/** 저울대 · 접시 · 매단 줄 — 원본의 짙은 먹. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 추 — 원본의 밝은 회색. 두 칸에서 같은 색이다. */
const WEIGHT_LUMINANCE = 0.5;
/** 얼음 — 원본의 아주 옅은 파랑 띠와 그보다 짙은 윗선. */
const ICE = { colorRole: 'secondary', emphasis: 'strong' } as const;
const ICE_FILL_LUMINANCE = 0.12;
const ICE_EDGE_LUMINANCE = 0.35;

/** 굵기(화면 px) — 원본 그대로. */
const COLUMN_WIDTH_PX = 4;
const BEAM_WIDTH_PX = 4;
const HANGER_WIDTH_PX = 1;
const PAN_WIDTH_PX = 3;
const LEVEL_WIDTH_PX = 1;
const ICE_EDGE_WIDTH_PX = 1.5;
const MID_TICK_WIDTH_PX = 1.5;

function line(id: string, points: readonly Vec2[], width: number, style: Trajectory['style'], extra: Partial<Trajectory> = {}): Trajectory {
  return { type: 'trajectory', id, points, width, style, ...extra };
}

/** 물체 하나 — 아랫변 가운데 `(cx, bottom)` 에 놓는다. 두 칸에서 같은 모양 · 같은 색. */
function objectBody(id: string, o: ObjectDef, cx: number, bottom: number): Body {
  return {
    type: 'body',
    id,
    pos: [cx, bottom + o.size[1] / 2],
    shape: 'rect',
    size: o.size,
    outline: 'none',
    style: INK,
    luminance: o.luminance,
  };
}

/** 추 n 개를 아랫변 가운데 `(cx, bottom)` 에서 위로 쌓는다. 칸 사이 1 px 틈. 원본 drawWeights. */
function weights(id: string, n: number, cx: number, bottom: number): Body[] {
  const [w, h] = WEIGHT_BOX;
  const out: Body[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      type: 'body',
      id: `${id}-${i}`,
      pos: [cx, bottom + h * i + 1 + (h - 1) / 2],
      shape: 'rect',
      size: [w, h - 1],
      outline: 'none',
      style: SOFT,
      luminance: WEIGHT_LUMINANCE,
    });
  }
  return out;
}

export function scene(params: { state: InertialVsGravitationalMassState }): SceneGraph {
  const { state } = params;
  const o = OBJECTS[state.shownObj];
  const out: Primitive[] = [];

  // ---- 칸 이름 ----
  out.push(
    {
      type: 'readout',
      id: 'label-balance',
      anchor: { world: [PANEL_LABEL_X[0], PANEL_LABEL_Y] },
      text: text('label.balance'),
      chip: false,
      align: 'left',
      font: 'text',
      fontSize: PANEL_LABEL_FONT,
      style: SOFT,
    },
    {
      type: 'readout',
      id: 'label-ice',
      anchor: { world: [PANEL_LABEL_X[1], PANEL_LABEL_Y] },
      text: text('label.ice'),
      chip: false,
      align: 'left',
      font: 'text',
      fontSize: PANEL_LABEL_FONT,
      style: SOFT,
    },
  );

  // ---------------- 저울 ----------------
  const [px, py] = PIVOT;
  const c = Math.cos(state.theta);
  const s = Math.sin(state.theta);
  // 양수 각이면 물체 쪽(왼쪽)이 내려간다. 월드 y 가 위라 원본 화면식과 부호가 반대다.
  const left: Vec2 = [px - ARM * c, py - ARM * s];
  const right: Vec2 = [px + ARM * c, py + ARM * s];
  const panL: Vec2 = [left[0], left[1] - STRING];
  const panR: Vec2 = [right[0], right[1] - STRING];

  out.push(line('column', [[px, py], [px, BASE_Y]], COLUMN_WIDTH_PX, SOFT));
  out.push(line('base', [[px - BASE_HALF, BASE_Y], [px + BASE_HALF, BASE_Y]], COLUMN_WIDTH_PX, SOFT));

  // 수평 판정의 기준 — 받침점 높이의 점선.
  out.push(
    line(
      'level-line',
      [
        [px - ARM - LEVEL_OVERHANG, py],
        [px + ARM + LEVEL_OVERHANG, py],
      ],
      LEVEL_WIDTH_PX,
      { ...SOFT, lineStyle: 'dashed' },
      { luminance: FAINT_LUMINANCE },
    ),
  );

  // 받침대 — 놓기 전에만. 놓는 순간 얼음 위 용수철과 함께 사라진다.
  if (!state.released) {
    const top = py - STRING - SUPPORT_GAP;
    for (const [tag, end] of [['left', left], ['right', right]] as const) {
      out.push({
        type: 'region',
        id: `support-${tag}`,
        points: [
          [end[0] - SUPPORT_HALF, top],
          [end[0] + SUPPORT_HALF, top],
          [end[0] + SUPPORT_HALF, BASE_Y],
          [end[0] - SUPPORT_HALF, BASE_Y],
        ],
        fillOpacity: 1,
        style: SOFT,
        luminance: FAINT_LUMINANCE,
      });
    }
  }

  // 저울대 · 받침점 · 매단 줄 · 접시.
  out.push(line('beam', [left, right], BEAM_WIDTH_PX, INK));
  out.push({
    type: 'body',
    id: 'pivot',
    pos: [px, py],
    shape: 'circle',
    size: PIVOT_R,
    outline: 'none',
    glow: false,
    style: INK,
  });
  for (const [tag, end, pan] of [['left', left, panL], ['right', right, panR]] as const) {
    out.push(line(`hanger-${tag}-a`, [end, [pan[0] - HANGER_HALF, pan[1]]], HANGER_WIDTH_PX, INK));
    out.push(line(`hanger-${tag}-b`, [end, [pan[0] + HANGER_HALF, pan[1]]], HANGER_WIDTH_PX, INK));
    out.push(line(`pan-${tag}`, [[pan[0] - PAN_HALF, pan[1]], [pan[0] + PAN_HALF, pan[1]]], PAN_WIDTH_PX, INK));
  }

  out.push(objectBody('balance-object', o, panL[0], panL[1] + PAN_LIFT));
  out.push(...weights('balance-weight', state.n, panR[0], panR[1] + PAN_LIFT));

  // ---------------- 얼음 ----------------
  out.push({
    type: 'region',
    id: 'ice',
    points: [
      [ICE_X0, ICE_Y],
      [ICE_X1, ICE_Y],
      [ICE_X1, ICE_Y - ICE_THICK],
      [ICE_X0, ICE_Y - ICE_THICK],
    ],
    fillOpacity: 1,
    style: ICE,
    luminance: ICE_FILL_LUMINANCE,
  });
  out.push(line('ice-edge', [[ICE_X0, ICE_Y], [ICE_X1, ICE_Y]], ICE_EDGE_WIDTH_PX, ICE, { luminance: ICE_EDGE_LUMINANCE }));

  // 놓은 자리 — 양쪽 이동 거리를 견주는 기준.
  out.push({
    type: 'trace',
    id: 'release-mark',
    marks: [{ pos: [ICE_MID, ICE_Y - (MID_TICK_TOP + MID_TICK_BOTTOM) / 2] }],
    shape: 'tick',
    size: MID_TICK_BOTTOM - MID_TICK_TOP,
    direction: [0, 1],
    width: MID_TICK_WIDTH_PX,
    style: SOFT,
  });

  const objRight = ICE_MID - GAP / 2 + state.objX;
  const wLeft = ICE_MID + GAP / 2 + state.wX;

  // 용수철 — 놓기 전에만 둘 사이에 눌려 있다 (질량은 무시).
  if (!state.released) {
    out.push({
      type: 'constraint',
      id: 'spring',
      subtype: 'spring',
      from: [objRight, ICE_Y + SPRING_LIFT],
      to: [wLeft, ICE_Y + SPRING_LIFT],
      coils: SPRING_COILS,
      style: SOFT,
    });
  }

  out.push(objectBody('ice-object', o, objRight - o.size[0] / 2, ICE_Y));
  out.push(...weights('ice-weight', state.n, wLeft + WEIGHT_BOX[0] / 2, ICE_Y));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
  return { ...SCENE_BOUNDS };
}
