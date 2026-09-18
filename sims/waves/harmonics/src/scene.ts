// ========================================================================
// harmonics — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 줄 · 점선 틀 · 응답 곡선 · 축 ·
// 눈금은 `trajectory`, 묶인 끝의 벽은 `surface` wall, 매듭 · 진동자 · 틀 끝 · 곡선 머리는
// `body`, 마디는 `marker` pin, 글자는 `readout` 이다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 색은 뜻마다 하나다 — 줄과 응답 곡선은 같은 양(줄이 얼마나 흔들리나)이라 같은 먹색,
// 점선 틀 · 벽 · 축은 배경 정보라 muted. **강조색은 마디 한 뜻에만** 쓴다 — 반파장이 맞아
// 줄이 고리로 갈린 동안에만 켠다. 맞음 · 어긋남을 색으로 가르지 않는다 — 틀 끝이 매듭에
// 닿는지, 줄이 크게 흔들리는지가 가른다 (S-piece).
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
  displacement,
  drivePhase,
  driveRatio,
  readConstants,
  response,
  template,
  type HarmonicsConstants,
} from './physics';
import {
  DRIVER_RAIL_HALF,
  GRAPH_BASE_Y,
  GRAPH_HEIGHT,
  SCENE_BOUNDS,
  STRING_Y,
  WALL_HALF,
  text,
} from './schema';
import type { HarmonicsState } from './state';

/** 줄 · 점선 틀 표본 수 — 3배음(고리 셋)에도 고리마다 표본이 80 개쯤 들어간다. */
const STRING_SAMPLES = 240;
/** 응답 곡선 표본 간격(f₁ 단위). 봉우리 반너비(감쇠 0.1 에서 약 0.03)에 표본이 여섯 개 들어간다. */
const GRAPH_STEP = 0.005;
/** 줄 굵기 · 응답 곡선 굵기(화면 px). */
const STRING_WIDTH_PX = 2.5;
const CURVE_WIDTH_PX = 2;
/** 점선 틀 굵기(화면 px). 안내선이라 가늘다. */
const TEMPLATE_WIDTH_PX = 1.25;
/** 축 · 눈금 · 진동자 막대 굵기(화면 px). */
const AXIS_WIDTH_PX = 1;
const RAIL_WIDTH_PX = 2;
/** 틀 끝 고리 반지름(월드). 매듭에 닿으면 매듭을 감싼다. */
const TEMPLATE_END_RADIUS = 0.07;
/** 가로축 눈금 길이(월드) · 축이 곡선 밖으로 조금 더 뻗는 길이(월드). */
const TICK_LEN = 0.08;
const AXIS_OVERHANG = 0.2;
/** 글자 크기(화면 px). 눈금 · 축 이름 · 진동자 이름. */
const TICK_LABEL_PX = 13;
const AXIS_LABEL_PX = 12;
const DRIVER_LABEL_PX = 12;
/** 글자 띄움(화면 px). 눈금 글자는 축 아래로, 축 이름 · 진동자 이름은 옆으로. */
const TICK_LABEL_DROP_PX = 14;
const AXIS_LABEL_GAP_PX = 8;
const DRIVER_LABEL_GAP_PX = 10;

/** 응답 곡선 좌표 — 가로 = 진동수(0 ~ `sweepTo`, 줄과 같은 폭), 세로 = 흔들림(봉우리 = 높이 끝). */
function graphX(ratio: number, c: HarmonicsConstants): number {
  return (ratio / c.sweepTo) * c.stringLength;
}
function graphY(swing: number, c: HarmonicsConstants): number {
  return GRAPH_BASE_Y + (swing / c.peakAmplitude) * GRAPH_HEIGHT;
}

/** 줄 위 곡선 하나. x = 0(진동자)에서 x = L(매듭)까지. */
function stringCurve(fn: (x: number) => number, c: HarmonicsConstants): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i <= STRING_SAMPLES; i++) {
    const x = (c.stringLength * i) / STRING_SAMPLES;
    pts.push([x, STRING_Y + fn(x)]);
  }
  return pts;
}

export function scene(params: {
  state: HarmonicsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('harmonics: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const L = c.stringLength;
  const ratio = driveRatio(tl, c);
  const phase = drivePhase(tl, c);
  const out: Primitive[] = [];

  // ---- 묶인 끝 ----
  out.push({
    type: 'surface',
    id: 'wall',
    geometry: { kind: 'wall', from: [L, STRING_Y - WALL_HALF], to: [L, STRING_Y + WALL_HALF] },
    material: 'rough',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 진동자 막대 ----
  out.push({
    type: 'trajectory',
    id: 'driver-rail',
    points: [
      [0, STRING_Y - DRIVER_RAIL_HALF],
      [0, STRING_Y + DRIVER_RAIL_HALF],
    ],
    width: RAIL_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 점선 틀 — 이 진동수가 요구하는 모양 ----
  // 진동자에서 출발한 ± 사인꼴. 오른쪽 끝이 매듭에 닿는지가 「맞는가」 다.
  out.push({
    type: 'trajectory',
    id: 'template-upper',
    points: stringCurve((x) => template(x, ratio, c), c),
    width: TEMPLATE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'trajectory',
    id: 'template-lower',
    points: stringCurve((x) => -template(x, ratio, c), c),
    width: TEMPLATE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // ---- 줄 ----
  out.push({
    type: 'trajectory',
    id: 'string',
    points: stringCurve((x) => displacement(x, ratio, phase, c), c),
    width: STRING_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 틀 끝 — 매듭에서 얼마나 어긋났나 ----
  const miss = template(L, ratio, c);
  for (const [id, y] of [
    ['template-end-upper', STRING_Y + miss],
    ['template-end-lower', STRING_Y - miss],
  ] as const) {
    out.push({
      type: 'body',
      id,
      pos: [L, y],
      shape: 'circle',
      size: TEMPLATE_END_RADIUS,
      fill: 'none',
      outline: 'role',
      glow: false,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 매듭 · 진동자 ----
  out.push({
    type: 'body',
    id: 'knot',
    pos: [L, STRING_Y],
    shape: 'point',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'driver',
    pos: [0, STRING_Y + displacement(0, ratio, phase, c)],
    shape: 'point',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'driver-label',
    anchor: { world: [0, STRING_Y], offset: [-DRIVER_LABEL_GAP_PX, 0] },
    text: text('label.driver'),
    chip: false,
    font: 'text',
    fontSize: DRIVER_LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 마디 ----
  // 반파장이 맞아 머무는 동안에만. 고리 n 개 사이의 안쪽 마디 n − 1 개.
  for (let n = 2; n <= c.harmonicCount; n++) {
    if (tl.phase !== `hold-${n}`) continue;
    for (let j = 1; j < n; j++) {
      out.push({
        type: 'marker',
        id: `node-${j}`,
        kind: 'pin',
        pos: [(L * j) / n, STRING_Y],
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // ---- 응답 곡선의 축 ----
  const axisEnd = graphX(c.sweepTo, c) + AXIS_OVERHANG;
  out.push({
    type: 'trajectory',
    id: 'axis-x',
    points: [
      [0, GRAPH_BASE_Y],
      [axisEnd, GRAPH_BASE_Y],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'axis-y',
    points: [
      [0, GRAPH_BASE_Y],
      [0, GRAPH_BASE_Y + GRAPH_HEIGHT + AXIS_OVERHANG / 2],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-y-label',
    anchor: { world: [0, GRAPH_BASE_Y + GRAPH_HEIGHT + AXIS_OVERHANG / 2], offset: [AXIS_LABEL_GAP_PX, 0] },
    text: text('label.response'),
    chip: false,
    font: 'text',
    fontSize: AXIS_LABEL_PX,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-x-label',
    anchor: { world: [axisEnd, GRAPH_BASE_Y], offset: [AXIS_LABEL_GAP_PX, 0] },
    text: text('label.frequency'),
    chip: false,
    font: 'text',
    fontSize: AXIS_LABEL_PX,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 눈금 — 기본 진동수와 그 정수배. 숫자는 배음 차수(정수) 그대로다.
  for (let n = 1; n <= c.harmonicCount; n++) {
    const x = graphX(n, c);
    out.push({
      type: 'trajectory',
      id: `tick-${n}`,
      points: [
        [x, GRAPH_BASE_Y],
        [x, GRAPH_BASE_Y - TICK_LEN],
      ],
      width: AXIS_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `tick-label-${n}`,
      anchor: { world: [x, GRAPH_BASE_Y], offset: [0, TICK_LABEL_DROP_PX] },
      text: n === 1 ? text('label.f1') : text('label.fn'),
      vars: { n: String(n) },
      chip: false,
      font: 'text',
      fontSize: TICK_LABEL_PX,
      italic: true,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 응답 곡선 — 지나온 진동수마다 줄이 얼마나 흔들렸나 ----
  const curve: Vec2[] = [];
  for (let r = c.sweepFrom; r < ratio; r += GRAPH_STEP) curve.push([graphX(r, c), graphY(response(r, c), c)]);
  const head: Vec2 = [graphX(ratio, c), graphY(response(ratio, c), c)];
  curve.push(head);
  out.push({
    type: 'trajectory',
    id: 'response-curve',
    points: curve,
    width: CURVE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'response-head',
    pos: head,
    shape: 'point',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
