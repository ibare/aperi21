// ========================================================================
// energy-in-capacitor — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 판(body rect) · 전하
// 표식(lineSet) · 미는 힘(vector) · 축과 V–Q 직선 · 점선 직사각형(trajectory) ·
// 몫마다의 일 띠(region) · 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 판 · 판 위 전하 · V–Q 직선은 먹색, 지금 옮기는 몫은 primary,
// 미는 힘은 secondary, **강조색은 「쌓인 일(에너지)」 한 뜻에만**(띠와 ½QV 이름표).
// 축 · 점선 직사각형 · 값 이름표는 배경 정보라 muted.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  contentOpacity,
  finalCharge,
  readCharging,
  readConstants,
  voltageAt,
  type EnergyInCapacitorConstants,
} from './physics';
import {
  AXIS_OVERHANG,
  FORCE_X,
  GRAPH_H,
  GRAPH_W,
  GRAPH_X0,
  GRAPH_Y0,
  MARK_INSET,
  PLATE_BOTTOM_Y,
  PLATE_LEFT,
  PLATE_LENGTH,
  PLATE_THICKNESS,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { EnergyInCapacitorState } from './state';

/** 전하 표식 +/− 의 반 길이(월드 단위) · 획 굵기(화면 px). */
const MARK_HALF = 0.1;
const MARK_WIDTH_PX = 2.2;
/** 축 굵기 · V–Q 직선 굵기 · 점선 직사각형 굵기 · 세로축 눈금 굵기(화면 px). */
const AXIS_WIDTH_PX = 1.5;
const LINE_WIDTH_PX = 2.5;
const RECT_WIDTH_PX = 1.5;
const TICK_WIDTH_PX = 1.5;
/** 세로축 눈금의 반 길이(월드 단위). */
const TICK_HALF = 0.09;
/** 띠의 채움 짙기. 겹쳐 쌓이지 않으니 한 톤이다 — 다크 바탕에서도 직선과 갈려야 한다. */
const STRIP_FILL = 0.5;
/** 이름표 글자 크기(화면 px) · ½QV · QV 넓이 이름표 크기. */
const LABEL_PX = 13;
const AREA_LABEL_PX = 15;
/** 이름표를 대상에서 띄우는 거리(월드 단위). */
const AXIS_LABEL_GAP = 0.28;
const VOLTAGE_LABEL_GAP = 0.2;
const CAP_LABEL_GAP = 0.3;
const CHUNK_LABEL_GAP = 0.2;
/** 넓이 이름표가 놓이는 자리 — 그래프 안 비율(가로 Q 비, 세로 V 비). */
const HALF_LABEL_AT: Vec2 = [0.68, 0.27];
const RECT_LABEL_AT: Vec2 = [0.22, 0.8];

/** 그래프 안 Q(μC) · V(V)를 월드 자리로. 축 끝이 다 옮긴 Q 와 끝 전압이다. */
function graphPoint(q: number, v: number, c: EnergyInCapacitorConstants): Vec2 {
  return [GRAPH_X0 + (q / finalCharge(c)) * GRAPH_W, GRAPH_Y0 + (v / c.finalVoltage) * GRAPH_H];
}

/** `+` 한 개의 두 획. */
function plusStrokes(x: number, y: number): Vec2[][] {
  return [
    [
      [x - MARK_HALF, y],
      [x + MARK_HALF, y],
    ],
    [
      [x, y - MARK_HALF],
      [x, y + MARK_HALF],
    ],
  ];
}

/** `−` 한 개의 한 획. */
function minusStroke(x: number, y: number): Vec2[] {
  return [
    [x - MARK_HALF, y],
    [x + MARK_HALF, y],
  ];
}

export function scene(params: {
  state: EnergyInCapacitorState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('energy-in-capacitor: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const r = readCharging(timeline, c);
  const alpha = contentOpacity(timeline);
  const out: Primitive[] = [];

  const qMax = finalCharge(c);
  const dq = qMax / c.chunks;
  const bottomInner = PLATE_BOTTOM_Y;
  const topInner = PLATE_BOTTOM_Y + c.plateGap;
  const plusY = topInner - MARK_INSET;
  const minusY = bottomInner + MARK_INSET;
  /** 몫 i 의 표식이 판 위에 놓이는 가로 자리 — 판을 몫 수만큼 칸으로 나눈 가운데. */
  const slotX = (i: number): number => PLATE_LEFT + ((i + 0.5) * PLATE_LENGTH) / c.chunks;

  // ================= 왼쪽 — 옆에서 본 두 판 =================

  for (const [id, y] of [
    ['plate-top', topInner + PLATE_THICKNESS / 2],
    ['plate-bottom', bottomInner - PLATE_THICKNESS / 2],
  ] as const) {
    out.push({
      type: 'body',
      id,
      pos: [PLATE_LEFT + PLATE_LENGTH / 2, y],
      shape: 'rect',
      size: [PLATE_LENGTH, PLATE_THICKNESS],
      outline: 'none',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'readout',
    id: 'capacitance-label',
    anchor: { world: [PLATE_LEFT - CAP_LABEL_GAP, (topInner + bottomInner) / 2] },
    text: text('label.capacitance'),
    vars: { c: String(c.capacitance) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 판 위 전하. 위 판에는 도착한 몫마다 +, 아래 판에는 떠난 몫마다 − (옮기는 중인 몫이
  // 남긴 − 도 이미 있다). 자리는 몫 번호로 고정이라 표식이 늘어도 튀지 않는다.
  const left = r.arrived + (r.carrying === undefined ? 0 : 1);
  const plusLines: Vec2[][] = [];
  const minusLines: Vec2[][] = [];
  for (let i = 0; i < r.arrived; i++) plusLines.push(...plusStrokes(slotX(i), plusY));
  for (let i = 0; i < left; i++) minusLines.push(minusStroke(slotX(i), minusY));
  if (plusLines.length > 0) {
    out.push({
      type: 'lineSet',
      id: 'charge-plus',
      lines: plusLines,
      width: MARK_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  if (minusLines.length > 0) {
    out.push({
      type: 'lineSet',
      id: 'charge-minus',
      lines: minusLines,
      width: MARK_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 지금 옮기는 몫. 제 칸의 아래 판에서 위 판으로 곧게 올라간다.
  if (r.carrying !== undefined) {
    const x = slotX(r.carrying);
    const y = minusY + (plusY - minusY) * r.lift;
    out.push({
      type: 'lineSet',
      id: 'chunk',
      lines: plusStrokes(x, y),
      width: MARK_WIDTH_PX,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'chunk-label',
      anchor: { world: [x + MARK_HALF + CHUNK_LABEL_GAP, y] },
      text: text('label.chunk'),
      chip: false,
      fontSize: LABEL_PX,
      italic: true,
      align: 'left',
      style: { colorRole: 'primary', emphasis: 'strong' },
    });

    // 미는 힘. 한 몫을 옮기는 동안 일정하고, 몫이 바뀔 때마다 길어진다 — 판 사이 장이
    // 쌓인 전하만큼 세졌기 때문이다. 몫에 붙이면 위 판에 부딪치므로 판 옆에 세운다.
    const len = r.pushVoltage * c.forceArrowPerVolt;
    const mid = (topInner + bottomInner) / 2;
    out.push({
      type: 'vector',
      id: 'push',
      from: [FORCE_X, mid - len / 2],
      delta: [0, len],
      label: text('label.force'),
      labelSide: 'cw',
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }

  // ================= 오른쪽 — V–Q 그래프 =================

  // 몫마다 든 일. 윗변이 직선인 띠라서 넓이가 곧 그 몫에 든 일이다(physics 머리글).
  // 옮기는 중인 몫의 띠는 올라간 만큼 세로로 자란다 — 일정한 힘 × 올라간 거리.
  const strips = r.arrived + (r.carrying === undefined ? 0 : 1);
  for (let i = 0; i < strips; i++) {
    const grow = i === r.carrying ? r.lift : 1;
    if (grow <= 0) continue;
    const q0 = i * dq;
    const q1 = (i + 1) * dq;
    const [x0, yBase] = graphPoint(q0, 0, c);
    const [x1] = graphPoint(q1, 0, c);
    const y0 = GRAPH_Y0 + (graphPoint(q0, voltageAt(q0, c), c)[1] - GRAPH_Y0) * grow;
    const y1 = GRAPH_Y0 + (graphPoint(q1, voltageAt(q1, c), c)[1] - GRAPH_Y0) * grow;
    out.push({
      type: 'region',
      id: `strip-${i}`,
      points: [
        [x0, yBase],
        [x1, yBase],
        [x1, y1],
        [x0, y0],
      ],
      fillOpacity: STRIP_FILL,
      // 띠 사이의 금 — 옆 변만 굵게 긋는다. 윗변은 V–Q 직선이 맡는다.
      outline: [
        [1, 2],
        [3, 0],
      ],
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 축. 이름은 축 끝에.
  const origin = graphPoint(0, 0, c);
  out.push({
    type: 'trajectory',
    id: 'axes',
    points: [
      [origin[0], origin[1] + GRAPH_H + AXIS_OVERHANG],
      origin,
      [origin[0] + GRAPH_W + AXIS_OVERHANG, origin[1]],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-q',
    anchor: { world: [origin[0] + GRAPH_W + AXIS_OVERHANG, origin[1] - AXIS_LABEL_GAP] },
    text: text('label.axisQ'),
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-v',
    anchor: { world: [origin[0] - AXIS_LABEL_GAP, origin[1] + GRAPH_H + AXIS_OVERHANG] },
    text: text('label.axisV'),
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 끝 전압 눈금. 값은 스테이지 상수 그대로다.
  const top = graphPoint(0, c.finalVoltage, c);
  out.push({
    type: 'lineSet',
    id: 'voltage-tick',
    lines: [
      [
        [top[0] - TICK_HALF, top[1]],
        [top[0] + TICK_HALF, top[1]],
      ],
    ],
    width: TICK_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'voltage-label',
    anchor: { world: [top[0] - VOLTAGE_LABEL_GAP, top[1]] },
    text: text('label.voltage'),
    vars: { v: String(c.finalVoltage) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 점선 직사각형 — 끝 전압 그대로 전부 옮겼을 때의 일. 떠오른 뒤 흐려짐까지 남는다.
  const rectShown = timeline.at('rect-in') * alpha;
  const corner = graphPoint(qMax, c.finalVoltage, c);
  if (rectShown > 0) {
    out.push({
      type: 'trajectory',
      id: 'rect-qv',
      points: [top, corner, graphPoint(qMax, 0, c)],
      width: RECT_WIDTH_PX,
      opacity: rectShown,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
    out.push({
      type: 'readout',
      id: 'rect-label',
      anchor: {
        world: graphPoint(qMax * RECT_LABEL_AT[0], c.finalVoltage * RECT_LABEL_AT[1], c),
      },
      text: text('label.rect'),
      chip: false,
      fontSize: AREA_LABEL_PX,
      italic: true,
      align: 'center',
      opacity: rectShown,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // V–Q 직선. 처음부터 끝까지 그려 둔다 — 판 전압이 전하에 비례한다는 것은 미리 정해진
  // 것이고, 쌓이는 것은 그 아래 넓이다. 띠 위에 긋는다(drawOrder: 'scene').
  out.push({
    type: 'trajectory',
    id: 'vq-line',
    points: [origin, corner],
    width: LINE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ½QV — 직사각형과 견주는 단계부터. 삼각형 안에.
  if (timeline.u >= timeline.start('half')) {
    out.push({
      type: 'readout',
      id: 'half-label',
      anchor: {
        world: graphPoint(qMax * HALF_LABEL_AT[0], c.finalVoltage * HALF_LABEL_AT[1], c),
      },
      text: text('label.half'),
      // 강조색 띠 위의 강조색 글자라 바탕 칩을 깐다 — 없으면 다크에서 띠에 묻힌다.
      chip: true,
      fontSize: AREA_LABEL_PX,
      italic: true,
      weight: 'bold',
      align: 'center',
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
