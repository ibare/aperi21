// ========================================================================
// potential-divider — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 아래에서 위로 —
//   회로: 전지 고리 도선(lineSet) → 전지 두 판(lineSet) → 저항선(굵은 lineSet) → 두 끝 점 →
//         전압계 도선(lineSet) → 전압계(scale dial) → 접점 탐침(vector)
//   판:   축(lineSet) → 전지 전압 높이 안내선(trajectory 점선) → 전위 경사(lineSet) →
//         접점 자리의 V₁ 나머지(lineSet) · V₂ 막대(lineSet) → 접점 점(particleSystem)
//   이름표(readout) — 맨 위
//
// 색은 뜻마다 하나다 — 도선 · 저항선 · 축 · 경사는 먹색, 접점(탐침과 판 위 점)은 primary
// (둘이 같은 것이다), **강조색은 「꺼내는 전압 V₂」 한 뜻** — 전압계의 0 에서 바늘까지 부채꼴과
// 판의 V₂ 막대. 나머지 V₁ 은 색이 아니라 옅은 회색 막대로 둔다.
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
import { contactFraction, potentialAlong, readConstants, tappedVolts } from './physics';
import {
  BATTERY_LONG_HALF,
  BATTERY_PLATE_GAP,
  BATTERY_SHORT_HALF,
  BATTERY_X,
  GRAPH_WIDTH,
  GRAPH_X0,
  GRAPH_Y0,
  LOOP_BOTTOM,
  METER_R,
  METER_X,
  METER_Y,
  PROBE_LEN,
  PROBE_LIFT,
  SCENE_BOUNDS,
  WIRE_X0,
  WIRE_X1,
  WIRE_Y,
  text,
} from './schema';
import type { PotentialDividerState } from './state';

/** 도선 굵기 · 저항선 굵기(화면 px). 저항선은 도선보다 굵게 그어 「이것이 저항」 임을 모양으로 가른다. */
const LEAD_PX = 2;
const RESISTANCE_WIRE_PX = 6;
/** 전지 두 판의 굵기(화면 px). 짧은 판(−)을 더 굵게 긋는 관례를 따른다. */
const BATTERY_LONG_PX = 2.5;
const BATTERY_SHORT_PX = 4.5;
/** 저항선 두 끝 점 · 접점 점 반지름(화면 px). */
const END_DOT_PX = 4;
const CONTACT_DOT_PX = 5.5;
/** 접점 탐침 화살표 굵기(화면 px). */
const PROBE_PX = 3;

/** 판 — 축 굵기(화면 px) · 세로축을 판 원점 왼쪽으로 띄우는 거리 · 축을 판 끝 너머로 내미는 길이(월드). */
const AXIS_PX = 1.5;
const AXIS_PAD = 0.3;
const AXIS_OVERHANG = 0.3;
/** 가로축 위 접점 자리 눈금의 반 길이(월드). */
const CONTACT_TICK_HALF = 0.1;
/** 전위 경사 · V₁ 나머지 · V₂ 막대 · 전지 전압 안내선 굵기(화면 px). */
const RAMP_PX = 2.5;
const V1_BAR_PX = 3;
const V2_BAR_PX = 6;
const GUIDE_PX = 1;

/** 이름표 글자 크기(화면 px) · 대상에서 띄우는 거리(월드). */
const LABEL_PX = 13;
const TAG_PX = 14;
const SIGN_PX = 15;
const END_TAG_GAP = 0.2;
const END_TAG_RISE = 0.2;
const R_TAG_DROP = 0.36;
const SIGN_GAP = 0.26;
const SIGN_RISE = 0.22;
const BATTERY_VALUE_DROP = 0.55;
const METER_SIGN_GAP = 0.22;
/** 전압계 + 표식을 세운 도선 가운데에서 올리는 거리(월드) — 가로 도선에 닿지 않게. */
const METER_PLUS_RISE = 0.08;
const BAR_TAG_GAP = 0.22;
const GRAPH_LABEL_GAP = 0.14;
const GRAPH_TAG_DROP = 0.3;
const GRAPH_AXIS_NAME_DROP = 0.72;
const GRAPH_TITLE_RISE = 0.3;

export function scene(params: {
  state: PotentialDividerState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('potential-divider: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const v2 = tappedVolts(tl, c);
  const f = contactFraction(v2, c);
  const out: Primitive[] = [];

  const wireLen = WIRE_X1 - WIRE_X0;
  /** 선 위 몫 → 회로의 x · 판의 x. */
  const wx = (s: number): number => WIRE_X0 + s * wireLen;
  const gx = (s: number): number => GRAPH_X0 + s * GRAPH_WIDTH;
  const gy = (v: number): number => GRAPH_Y0 + v * c.voltHeight;
  const xc = wx(f);

  // ================= 회로 =================

  // ---- 전지 고리 — B 에서 아래로, 전지를 지나 A 로 올라간다. 전지 두 판 사이는 비운다 ----
  const minusX = BATTERY_X - BATTERY_PLATE_GAP / 2;
  const plusX = BATTERY_X + BATTERY_PLATE_GAP / 2;
  out.push({
    type: 'lineSet',
    id: 'battery-loop',
    lines: [
      [
        [WIRE_X0, WIRE_Y],
        [WIRE_X0, LOOP_BOTTOM],
        [minusX, LOOP_BOTTOM],
      ],
      [
        [plusX, LOOP_BOTTOM],
        [WIRE_X1, LOOP_BOTTOM],
        [WIRE_X1, WIRE_Y],
      ],
    ],
    width: LEAD_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 전지 — 두 판(G178). + 극(긴 판)이 A 쪽이다 ----
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
    style: { colorRole: 'ink', emphasis: 'strong' },
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
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push(signLabel('battery-plus-sign', [plusX + SIGN_GAP, LOOP_BOTTOM + SIGN_RISE], text('label.plus'), 'center'));
  out.push(signLabel('battery-minus-sign', [minusX - SIGN_GAP, LOOP_BOTTOM + SIGN_RISE], text('label.minus'), 'center'));
  out.push(voltLabel('battery-value', [BATTERY_X, LOOP_BOTTOM - BATTERY_VALUE_DROP], c.volts, 'center'));

  // ---- 저항선 — 굵기가 고른 한 줄. 저항은 길이에 비례한다 ----
  out.push({
    type: 'lineSet',
    id: 'resistance-wire',
    lines: [
      [
        [WIRE_X0, WIRE_Y],
        [WIRE_X1, WIRE_Y],
      ],
    ],
    width: RESISTANCE_WIRE_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'particleSystem',
    id: 'wire-ends',
    positions: [
      [WIRE_X0, WIRE_Y],
      [WIRE_X1, WIRE_Y],
    ],
    sizes: END_DOT_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push(tagLabel('end-b', [WIRE_X0 - END_TAG_GAP, WIRE_Y + END_TAG_RISE], text('label.endB'), 'right'));
  out.push(tagLabel('end-a', [WIRE_X1 + END_TAG_GAP, WIRE_Y + END_TAG_RISE], text('label.endA'), 'left'));

  // ---- 접점이 가른 두 몫 — R₂(B ~ 접점) · R₁(접점 ~ A). 이름표가 접점을 따라 옮겨 간다 ----
  out.push(tagLabel('tag-r2', [(WIRE_X0 + xc) / 2, WIRE_Y - R_TAG_DROP], text('label.r2'), 'center'));
  out.push(tagLabel('tag-r1', [(xc + WIRE_X1) / 2, WIRE_Y - R_TAG_DROP], text('label.r1'), 'center'));

  // ---- 전압계 도선 — − 단자는 B 에, + 단자는 접점 탐침에 ----
  const meterLeft: Vec2 = [METER_X - METER_R, METER_Y];
  const meterBottom: Vec2 = [METER_X, METER_Y - METER_R];
  const probeTail: Vec2 = [xc, WIRE_Y + PROBE_LIFT + PROBE_LEN];
  out.push({
    type: 'lineSet',
    id: 'meter-leads',
    lines: [
      [[WIRE_X0, WIRE_Y], [WIRE_X0, METER_Y], meterLeft],
      // 눈금판 아래로 곧게 내렸다가 접점까지 가로로 — 접점이 어디 있든 도선이 눈금판 · 표식을 지나지 않는다.
      [meterBottom, [METER_X, probeTail[1]], probeTail],
    ],
    width: LEAD_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 전압계 — B 와 접점 사이 전압 V₂. 0 에서 바늘까지 부채꼴이 강조색(V₂ 한 뜻) ----
  const ticks: number[] = [];
  for (let k = 0; k * c.meterTick <= c.volts; k++) ticks.push(k * c.meterTick);
  out.push({
    type: 'scale',
    id: 'meter',
    shape: 'dial',
    pos: [METER_X, METER_Y],
    size: METER_R,
    range: [0, c.volts],
    value: v2,
    origin: 0,
    showDelta: false,
    tickAt: ticks,
    labelAt: [0, c.volts],
    unit: text('label.unit'),
    digits: c.meterDigits,
    label: text('label.v2'),
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push(signLabel('meter-minus-sign', [meterLeft[0] - METER_SIGN_GAP, meterLeft[1] + METER_SIGN_GAP], text('label.minus'), 'center'));
  // + 표식은 세운 도선 옆, 가로 도선이 뻗는 반대쪽.
  const plusSide = xc >= METER_X ? -1 : 1;
  out.push(
    signLabel(
      'meter-plus-sign',
      [meterBottom[0] + plusSide * METER_SIGN_GAP, (meterBottom[1] + probeTail[1]) / 2 + METER_PLUS_RISE],
      text('label.plus'),
      'center',
    ),
  );

  // ---- 접점 탐침 — 선 위를 밀려 다니는 화살촉 ----
  out.push({
    type: 'vector',
    id: 'probe',
    from: probeTail,
    delta: [0, -PROBE_LEN],
    width: PROBE_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ================= 전위 판 =================
  // 가로는 저항선 위 자리(B 에서 A 로), 세로는 그 자리의 전위. 저항선을 그대로 옆으로 옮겨 놓은 것이다.

  const top = gy(c.volts);
  const axisX = GRAPH_X0 - AXIS_PAD;
  const endX = gx(1);
  const cx = gx(f);
  const cy = gy(potentialAlong(f, c));

  out.push({
    type: 'lineSet',
    id: 'graph-axes',
    lines: [
      [
        [axisX, top + AXIS_OVERHANG],
        [axisX, GRAPH_Y0],
        [endX + AXIS_OVERHANG, GRAPH_Y0],
      ],
      [
        [cx, GRAPH_Y0 - CONTACT_TICK_HALF],
        [cx, GRAPH_Y0 + CONTACT_TICK_HALF],
      ],
    ],
    width: AXIS_PX,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });

  // ---- 전지 전압 높이 — A 의 전위. 나머지 V₁ 이 여기까지 찬다 ----
  out.push({
    type: 'trajectory',
    id: 'graph-full',
    points: [
      [axisX, top],
      [endX, top],
    ],
    width: GUIDE_PX,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  });

  // ---- 전위 경사 — B 에서 A 로 고르게 오른다 ----
  out.push({
    type: 'lineSet',
    id: 'graph-ramp',
    lines: [
      [
        [gx(0), gy(0)],
        [endX, top],
      ],
    ],
    width: RAMP_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 접점 자리에서 갈린 두 몫 — 아래 V₂(강조) · 위 V₁(옅게) ----
  out.push({
    type: 'lineSet',
    id: 'graph-v1',
    lines: [
      [
        [cx, cy],
        [cx, top],
      ],
    ],
    width: V1_BAR_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: 'graph-v2',
    lines: [
      [
        [cx, GRAPH_Y0],
        [cx, cy],
      ],
    ],
    width: V2_BAR_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'particleSystem',
    id: 'graph-contact',
    positions: [[cx, cy]],
    sizes: CONTACT_DOT_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push(tagLabel('graph-tag-v2', [cx + BAR_TAG_GAP, (GRAPH_Y0 + cy) / 2], text('label.v2'), 'left'));
  out.push(tagLabel('graph-tag-v1', [cx - BAR_TAG_GAP, (cy + top) / 2], text('label.v1'), 'right'));

  // ---- 판 이름표 — 축 끝 전위, 가로축 두 끝, 축 이름 ----
  out.push(voltLabel('graph-zero', [axisX - GRAPH_LABEL_GAP, GRAPH_Y0], 0, 'right'));
  out.push(voltLabel('graph-top', [axisX - GRAPH_LABEL_GAP, top], c.volts, 'right'));
  out.push(tagLabel('graph-end-b', [gx(0), GRAPH_Y0 - GRAPH_TAG_DROP], text('label.endB'), 'center'));
  out.push(tagLabel('graph-end-a', [endX, GRAPH_Y0 - GRAPH_TAG_DROP], text('label.endA'), 'center'));
  out.push(nameLabel('graph-position', [gx(0.5), GRAPH_Y0 - GRAPH_AXIS_NAME_DROP], text('label.position'), 'center'));
  out.push(nameLabel('graph-potential', [axisX, top + AXIS_OVERHANG + GRAPH_TITLE_RISE], text('label.potential'), 'center'));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}

/** 전압 글자 — 선언값을 그대로 `{v} V` 에 끼운다. 계산해 줄이지 않는다. */
function voltLabel(id: string, at: Vec2, volts: number, align: 'left' | 'center' | 'right'): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: text('label.volt'),
    vars: { v: String(volts) },
    chip: false,
    fontSize: LABEL_PX,
    align,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

function nameLabel(id: string, at: Vec2, label: LocalizedText, align: 'left' | 'center' | 'right'): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    font: 'text',
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
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

function signLabel(id: string, at: Vec2, label: LocalizedText, align: 'left' | 'center' | 'right'): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    fontSize: SIGN_PX,
    weight: 'bold',
    align,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}
