// ========================================================================
// wheatstone-bridge — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 아래에서 위로 —
//   브리지: 도선(lineSet) → 전지 두 판(lineSet) → 저항 넷(circuitElement, 선언만) →
//           가변 표시 화살표(vector) → 마디 점(particleSystem)
//   검류계: 둘레 · 눈금(lineSet) → 불평형 부채꼴(sector) → 바늘(lineSet) → 축 점(body) →
//           전류 화살표(vector)
//   판:     축과 창 두 끝 눈금(lineSet) → C · D 높이 표식(lineSet) → 둘의 차이 막대(lineSet)
//   이름표(readout) — 맨 위
//
// 검류계는 `scale` dial 로 두지 않고 조립했다 — dial 은 지금 값 글자를 `toFixed` 로 늘 쓰고 270° 판이다(G144).
// 이 조각의 계기가 말할 것은 수가 아니라 「바늘이 0 에 선다」 하나다.
//
// 색은 뜻마다 하나다 — 도선 · 소자 · 축 · 바늘 · 높이 표식은 먹색, **강조색은 「C 와 D 의 전위가
// 어긋나 있다」 한 뜻** — 판의 차이 막대와 검류계의 0 → 바늘 부채꼴. 평형에서 둘 다 사라진다.
// 전류 방향은 색이 아니라 화살표의 위 · 아래로 가른다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LocalizedText,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { arrowLength, needleTilt, r3Now, readConstants, solveBridge } from './physics';
import {
  BATTERY_LONG_HALF,
  BATTERY_PLATE_GAP,
  BATTERY_SHORT_HALF,
  BATTERY_X,
  GALV_R,
  GALV_Y,
  LOOP_BOTTOM,
  PANEL_AXIS_X,
  PANEL_C_X0,
  PANEL_C_X1,
  PANEL_D_X0,
  PANEL_D_X1,
  PANEL_Y0,
  PANEL_Y1,
  RESISTOR_HALF,
  SCENE_BOUNDS,
  X_LEFT_R,
  X_MID,
  X_P,
  X_Q,
  X_RIGHT_R,
  Y_BOTTOM,
  Y_TOP,
  text,
} from './schema';
import type { WheatstoneBridgeState } from './state';

/** 도선 굵기(화면 px). */
const WIRE_PX = 2;
/** 전지 두 판의 굵기(화면 px). 짧은 판(−)을 더 굵게 긋는 관례를 따른다. */
const BATTERY_LONG_PX = 2.5;
const BATTERY_SHORT_PX = 4.5;
/** 마디 점 반지름(화면 px). */
const NODE_DOT_PX = 4;
/** 가변 표시 화살표 — 저항 가운데에서 꼬리까지 · 머리까지의 월드 벡터, 굵기(화면 px). */
const VARIABLE_TAIL: Vec2 = [-0.85, -0.3];
const VARIABLE_HEAD: Vec2 = [0.65, 0.4];
const VARIABLE_PX = 1.8;

/** 검류계 — 둘레를 긋는 꺾은선 마디 수 · 둘레 굵기(화면 px). */
const GALV_SEGMENTS = 48;
const GALV_RIM_PX = 2;
/** 눈금 — 0 에서 끝까지의 칸 수, 눈금 안 · 밖 반지름 비율, 0 눈금 안 반지름 비율, 굵기(화면 px). */
const GALV_TICK_STEPS = 3;
const GALV_TICK_IN = 0.8;
const GALV_TICK_OUT = 0.93;
const GALV_ZERO_TICK_IN = 0.7;
const GALV_TICK_PX = 1.2;
/** 바늘 길이 비율 · 굵기(화면 px), 불평형 부채꼴 반지름 비율. */
const NEEDLE_FRAC = 0.78;
const NEEDLE_PX = 2.5;
const SECTOR_FRAC = 0.62;
/** `G` 각인을 원 가운데에서 내리는 거리(반지름 비율). */
const GALV_MARK_DROP = 0.45;
/** 전류 화살표 — 원 오른쪽 가장자리에서 띄운 거리(월드) · 굵기(화면 px) · 이보다 짧으면 두지 않는 길이(월드). */
const CURRENT_GAP = 0.35;
const CURRENT_PX = 2.5;
const CURRENT_MIN_LEN = 0.02;
const CURRENT_TAG_GAP = 0.16;

/** 판 — 축 굵기 · 높이 표식 굵기 · 차이 막대 굵기(화면 px), 축을 위로 내미는 길이 · 창 끝 눈금 반 길이(월드). */
const AXIS_PX = 1.5;
const LEVEL_PX = 3;
const GAP_BAR_PX = 5;
const AXIS_OVERHANG = 0.3;
const AXIS_TICK_HALF = 0.1;
/** 두 높이의 어긋남이 이보다 짧으면 막대를 두지 않는다(월드) — 길이 0 막대의 둥근 끝이 점으로 남지 않게. */
const GAP_MIN_LEN = 1e-6;

/** 이름표 글자 크기(화면 px) · 대상에서 띄우는 거리(월드). */
const LABEL_PX = 13;
const TAG_PX = 14;
const SIGN_PX = 15;
const MARK_PX = 16;
const R_TAG_RISE = 0.36;
const R_VALUE_DROP = 0.45;
const NODE_TAG_GAP = 0.3;
const SIGN_GAP = 0.26;
const SIGN_RISE = 0.22;
const BATTERY_VALUE_DROP = 0.72;
const PANEL_LABEL_GAP = 0.14;
const PANEL_TAG_RISE = 0.22;
const PANEL_TITLE_RISE = 0.3;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;

export function scene(params: {
  state: WheatstoneBridgeState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('wheatstone-bridge: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const r3 = r3Now(tl, c);
  const sol = solveBridge(r3, c);
  const out: Primitive[] = [];

  // ================= 브리지 =================

  // ---- 도선 — 두 가지, 두 끝 세로, 검류계 두 다리, 전지 고리(두 판 사이는 비운다) ----
  const lx0 = X_LEFT_R - RESISTOR_HALF;
  const lx1 = X_LEFT_R + RESISTOR_HALF;
  const rx0 = X_RIGHT_R - RESISTOR_HALF;
  const rx1 = X_RIGHT_R + RESISTOR_HALF;
  const plusX = BATTERY_X - BATTERY_PLATE_GAP / 2;
  const minusX = BATTERY_X + BATTERY_PLATE_GAP / 2;
  const branch = (y: number): Vec2[][] => [
    [
      [X_P, y],
      [lx0, y],
    ],
    [
      [lx1, y],
      [rx0, y],
    ],
    [
      [rx1, y],
      [X_Q, y],
    ],
  ];
  out.push({
    type: 'lineSet',
    id: 'wires',
    lines: [
      ...branch(Y_TOP),
      ...branch(Y_BOTTOM),
      [
        [X_P, Y_TOP],
        [X_P, Y_BOTTOM],
        [X_P, LOOP_BOTTOM],
        [plusX, LOOP_BOTTOM],
      ],
      [
        [minusX, LOOP_BOTTOM],
        [X_Q, LOOP_BOTTOM],
        [X_Q, Y_BOTTOM],
        [X_Q, Y_TOP],
      ],
      [
        [X_MID, Y_TOP],
        [X_MID, GALV_Y + GALV_R],
      ],
      [
        [X_MID, GALV_Y - GALV_R],
        [X_MID, Y_BOTTOM],
      ],
    ],
    width: WIRE_PX,
    style: INK,
  });

  // ---- 전지 — 두 판(G178). + 극(긴 판)이 P 쪽이다 ----
  out.push({
    type: 'lineSet',
    id: 'battery-plus',
    lines: [
      [
        [plusX, LOOP_BOTTOM - BATTERY_LONG_HALF],
        [plusX, LOOP_BOTTOM + BATTERY_LONG_HALF],
      ],
    ],
    width: BATTERY_LONG_PX,
    style: INK,
  });
  out.push({
    type: 'lineSet',
    id: 'battery-minus',
    lines: [
      [
        [minusX, LOOP_BOTTOM - BATTERY_SHORT_HALF],
        [minusX, LOOP_BOTTOM + BATTERY_SHORT_HALF],
      ],
    ],
    width: BATTERY_SHORT_PX,
    style: INK,
  });
  out.push(signLabel('battery-plus-sign', [plusX - SIGN_GAP, LOOP_BOTTOM + SIGN_RISE], text('label.plus')));
  out.push(signLabel('battery-minus-sign', [minusX + SIGN_GAP, LOOP_BOTTOM + SIGN_RISE], text('label.minus')));
  out.push(valueLabel('battery-value', [BATTERY_X, LOOP_BOTTOM - BATTERY_VALUE_DROP], text('label.volt'), { v: String(c.emf) }));

  // ---- 저항 넷 — 비율 가지 R₁ · R₂ 는 값 글자를 선언값 그대로(plugin 기호), R₃ · Rₓ 는 값 글자 없이 ----
  const resistor = (id: string, x: number, y: number, value?: number): Primitive => ({
    type: 'circuitElement',
    id,
    subtype: 'resistor',
    pos: [x, y],
    rotation: 0,
    ...(value !== undefined ? { value, unit: 'Ω' } : {}),
  });
  out.push(resistor('resistor-r1', X_LEFT_R, Y_TOP, c.r1));
  out.push(resistor('resistor-r2', X_RIGHT_R, Y_TOP, c.r2));
  out.push(resistor('resistor-r3', X_LEFT_R, Y_BOTTOM));
  out.push(resistor('resistor-rx', X_RIGHT_R, Y_BOTTOM));

  // ---- 가변 표시 — R₃ 를 비스듬히 꿰뚫는 화살표 ----
  out.push({
    type: 'vector',
    id: 'r3-variable',
    from: [X_LEFT_R + VARIABLE_TAIL[0], Y_BOTTOM + VARIABLE_TAIL[1]],
    delta: [VARIABLE_HEAD[0] - VARIABLE_TAIL[0], VARIABLE_HEAD[1] - VARIABLE_TAIL[1]],
    width: VARIABLE_PX,
    style: INK,
  });

  // ---- 마디 점 — 두 끝(P · Q)의 갈림과 가운데 C · D ----
  out.push({
    type: 'particleSystem',
    id: 'nodes',
    positions: [
      [X_P, Y_TOP],
      [X_P, Y_BOTTOM],
      [X_Q, Y_TOP],
      [X_Q, Y_BOTTOM],
      [X_MID, Y_TOP],
      [X_MID, Y_BOTTOM],
    ],
    sizes: NODE_DOT_PX,
    style: INK,
  });

  // ================= 검류계 =================

  const gc: Vec2 = [X_MID, GALV_Y];
  const polar = (a: number, r: number): Vec2 => [gc[0] + r * Math.cos(a), gc[1] + r * Math.sin(a)];
  const up = Math.PI / 2;
  const maxTilt = (c.needleMaxDeg * Math.PI) / 180;

  const rim: Vec2[] = Array.from({ length: GALV_SEGMENTS + 1 }, (_, k) => polar((k / GALV_SEGMENTS) * Math.PI * 2, GALV_R));
  const ticks: Vec2[][] = [];
  for (let j = -GALV_TICK_STEPS; j <= GALV_TICK_STEPS; j++) {
    const a = up + (j / GALV_TICK_STEPS) * maxTilt;
    const inner = j === 0 ? GALV_ZERO_TICK_IN : GALV_TICK_IN;
    ticks.push([polar(a, GALV_R * inner), polar(a, GALV_R * GALV_TICK_OUT)]);
  }
  out.push({ type: 'lineSet', id: 'galv-rim', lines: [rim], width: GALV_RIM_PX, style: INK });
  out.push({ type: 'lineSet', id: 'galv-ticks', lines: ticks, width: GALV_TICK_PX, style: { colorRole: 'muted', emphasis: 'strong' } });

  // 0 에서 바늘까지 — 불평형의 크기. 평형에서 폭 0 이라 그려지지 않는다.
  const tilt = needleTilt(sol.iG, c);
  out.push({
    type: 'sector',
    id: 'galv-offset',
    center: gc,
    radius: GALV_R * SECTOR_FRAC,
    from: up,
    to: up - tilt,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: 'galv-needle',
    lines: [[gc, polar(up - tilt, GALV_R * NEEDLE_FRAC)]],
    width: NEEDLE_PX,
    style: INK,
  });
  out.push({ type: 'body', id: 'galv-pivot', pos: gc, shape: 'point', style: INK });
  out.push({
    type: 'readout',
    id: 'galv-mark',
    anchor: { world: [gc[0], gc[1] - GALV_R * GALV_MARK_DROP] },
    text: text('label.galvanometer'),
    chip: false,
    fontSize: MARK_PX,
    weight: 'bold',
    align: 'center',
    style: INK,
  });

  // ---- 검류계 전류 — 관례 전류 방향(D → C 면 위). 길이는 크기, 평형에서 사라진다 ----
  const len = arrowLength(sol.iG, c);
  if (len >= CURRENT_MIN_LEN) {
    const dir = sol.iG > 0 ? 1 : -1;
    const ax = gc[0] + GALV_R + CURRENT_GAP;
    out.push({
      type: 'vector',
      id: 'galv-current',
      from: [ax, gc[1] - (dir * len) / 2],
      delta: [0, dir * len],
      width: CURRENT_PX,
      style: INK,
    });
    out.push(tagLabel('galv-current-tag', [ax + CURRENT_TAG_GAP, gc[1]], text('label.current'), 'left'));
  }

  // ================= 전위 판 =================
  // 세로가 전위 — 스테이지 상수로 선언한 창(`panelVMin` ~ `panelVMax`)을 판 높이 전체로 편다.
  // C · D 두 마디의 높이를 나란히 세운다.

  const gy = (v: number): number => PANEL_Y0 + ((v - c.panelVMin) / (c.panelVMax - c.panelVMin)) * (PANEL_Y1 - PANEL_Y0);
  const yC = gy(sol.vC);
  const yD = gy(sol.vD);
  out.push({
    type: 'lineSet',
    id: 'panel-axis',
    lines: [
      [
        [PANEL_AXIS_X, PANEL_Y1 + AXIS_OVERHANG],
        [PANEL_AXIS_X, PANEL_Y0],
      ],
      [
        [PANEL_AXIS_X - AXIS_TICK_HALF, PANEL_Y0],
        [PANEL_AXIS_X + AXIS_TICK_HALF, PANEL_Y0],
      ],
      [
        [PANEL_AXIS_X - AXIS_TICK_HALF, PANEL_Y1],
        [PANEL_AXIS_X + AXIS_TICK_HALF, PANEL_Y1],
      ],
    ],
    width: AXIS_PX,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });
  out.push({
    type: 'lineSet',
    id: 'panel-levels',
    lines: [
      [
        [PANEL_C_X0, yC],
        [PANEL_C_X1, yC],
      ],
      [
        [PANEL_D_X0, yD],
        [PANEL_D_X1, yD],
      ],
    ],
    width: LEVEL_PX,
    style: INK,
  });
  // 두 높이의 어긋남 — 두 표식 사이에 세운 막대. 같아지면 두지 않는다.
  if (Math.abs(yD - yC) >= GAP_MIN_LEN) {
    const gapX = (PANEL_C_X1 + PANEL_D_X0) / 2;
    out.push({
      type: 'lineSet',
      id: 'panel-gap',
      lines: [
        [
          [gapX, yC],
          [gapX, yD],
        ],
      ],
      width: GAP_BAR_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ================= 이름표 =================

  out.push(tagLabel('tag-r1', [X_LEFT_R, Y_TOP + R_TAG_RISE], text('label.r1'), 'center'));
  out.push(tagLabel('tag-r2', [X_RIGHT_R, Y_TOP + R_TAG_RISE], text('label.r2'), 'center'));
  out.push(tagLabel('tag-r3', [X_LEFT_R, Y_BOTTOM + R_TAG_RISE], text('label.r3'), 'center'));
  out.push(tagLabel('tag-rx', [X_RIGHT_R, Y_BOTTOM + R_TAG_RISE], text('label.rx'), 'center'));
  // R₃ 는 지금 선 격자 값, Rₓ 는 평형에서만 선언값을 드러낸다 — 그 전에는 모르는 값이다.
  out.push(valueLabel('value-r3', [X_LEFT_R, Y_BOTTOM - R_VALUE_DROP], text('label.ohm'), { r: String(r3) }));
  out.push(
    tl.phase === 'hold-balance'
      ? valueLabel('value-rx', [X_RIGHT_R, Y_BOTTOM - R_VALUE_DROP], text('label.ohm'), { r: String(c.rx) })
      : valueLabel('value-rx', [X_RIGHT_R, Y_BOTTOM - R_VALUE_DROP], text('label.unknownValue')),
  );
  out.push(tagLabel('tag-c', [X_MID + NODE_TAG_GAP, Y_TOP + NODE_TAG_GAP], text('label.nodeC'), 'left'));
  out.push(tagLabel('tag-d', [X_MID + NODE_TAG_GAP, Y_BOTTOM - NODE_TAG_GAP], text('label.nodeD'), 'left'));

  out.push(valueLabel('panel-min', [PANEL_AXIS_X - PANEL_LABEL_GAP, PANEL_Y0], text('label.volt'), { v: String(c.panelVMin) }, 'right'));
  out.push(valueLabel('panel-max', [PANEL_AXIS_X - PANEL_LABEL_GAP, PANEL_Y1], text('label.volt'), { v: String(c.panelVMax) }, 'right'));
  out.push(tagLabel('panel-tag-c', [(PANEL_C_X0 + PANEL_C_X1) / 2, yC + PANEL_TAG_RISE], text('label.nodeC'), 'center'));
  out.push(tagLabel('panel-tag-d', [(PANEL_D_X0 + PANEL_D_X1) / 2, yD + PANEL_TAG_RISE], text('label.nodeD'), 'center'));
  out.push({
    type: 'readout',
    id: 'panel-title',
    anchor: { world: [PANEL_AXIS_X, PANEL_Y1 + AXIS_OVERHANG + PANEL_TITLE_RISE] },
    text: text('label.potential'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}

/** 값 글자 — 선언값(또는 선언한 격자 값)을 그대로 문안에 끼운다. 계산해 줄이지 않는다. */
function valueLabel(
  id: string,
  at: Vec2,
  label: LocalizedText,
  vars?: Record<string, string>,
  align: 'left' | 'center' | 'right' = 'center',
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    ...(vars ? { vars } : {}),
    chip: false,
    fontSize: LABEL_PX,
    align,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

function tagLabel(id: string, at: Vec2, label: LocalizedText, align: 'left' | 'center' | 'right'): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    fontSize: TAG_PX,
    italic: true,
    align,
    style: INK,
  };
}

function signLabel(id: string, at: Vec2, label: LocalizedText): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    fontSize: SIGN_PX,
    weight: 'bold',
    align: 'center',
    style: INK,
  };
}
