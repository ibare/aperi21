// ========================================================================
// thermal-equilibrium — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
//   두 덩이          body(rect)       — 같은 크기 · 같은 색. 다른 것은 처음 온도뿐
//   온도 막대        region 셋        — 관 바탕(opaque) · 채움(높이 = 온도) · 관 둘레
//   건너가는 열      body(circle)     — 알갱이. 건너간 열의 몫이 문턱을 넘을 때 하나씩 떠난다
//   열 화살표        vector           — 길이 · 굵기가 온도 차에 비례해 가늘어진다
//   온도-시간 곡선   trajectory 둘    — 막대와 **같은 눈금**. 위가 뜨거운 덩이, 아래가 찬 덩이
//   만난 온도        trajectory(점선) — 멈춘 뒤 두 막대 끝과 두 곡선 끝을 한 줄로 잇는다
//   축 · 눈금 글자   lineSet + readout
//   캡션             BundleSchema.caption 슬롯
//
// ---- 색은 뜻마다 하나다 ----
//   accent  온도의 높이 — 두 막대가 같은 색이다. 뜨거움 · 차가움을 두 색으로 가르지 않는다
//           (높이와 온도 글자가 가른다, S-piece)
//   primary 건너가는 열 — 알갱이와 화살표
//   ink     재어 그린 곡선 — 두 곡선이 같은 색이다. 자리(위 · 아래)가 가른다
//   muted   물건과 자 — 덩이 · 관 둘레 · 축 · 글자
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
import {
  contactTime,
  departTime,
  diffRatio,
  graphSpan,
  hash01,
  meetTemp,
  readConstants,
  sceneOpacity,
  tempsAt,
  type ThermalEquilibriumConstants,
} from './physics';
import {
  ARROW_Y,
  BLOCK_BOTTOM,
  BLOCK_SIZE,
  GAP,
  GRAPH_X0,
  GRAPH_X1,
  INTERFACE_X,
  PACKET_MARGIN,
  PACKET_R,
  PACKET_Y_MAX,
  PACKET_Y_MIN,
  SCALE_BOTTOM,
  SCALE_TOP,
  SCENE_BOUNDS,
  TEMP_LABEL_Y,
  TUBE_INSET,
  TUBE_WIDTH,
  text,
} from './schema';
import type { ThermalEquilibriumState } from './state';

/** 곡선 굵기(화면 px). 이 그림에서 가장 굵은 선이다. */
const CURVE_WIDTH = 2.5;
/** 축 · 관 둘레 굵기(화면 px). 자라서 가늘다. */
const AXIS_WIDTH = 1;
/** 만난 온도 점선 굵기(화면 px). */
const MEET_WIDTH = 1.5;
/** 곡선 한 줄의 표본 수 (장부 G28 — 곡선 어휘가 없어 점으로 표본한다). */
const CURVE_SAMPLES = 90;
/** 곡선 머리 점의 반지름(월드). */
const HEAD_R = 0.06;
/** 온도 막대 채움의 짙기. 다크에서도 높이가 또렷해야 한다. */
const TUBE_FILL = 0.85;
/** 관 바탕의 옅기 — 덩이 색을 가려 빈 관이 비어 보이게 한다. */
const TUBE_BG = 0.06;
/** 덩이 채움의 짙기(`emphasis`)와 불투명도. 물건이라 옅다. */
const BLOCK_OPACITY = 0.9;
/** 온도 글자 크기(화면 px). */
const TEMP_LABEL_PX = 14;
/** 눈금 · 축 기호 글자 크기(화면 px). */
const AXIS_LABEL_PX = 12;
/** 눈금 글자를 축에서 띄우는 거리(화면 px). */
const LABEL_GAP = 6;
/** 축 기호(T · t)를 축 끝에서 띄우는 거리(화면 px). */
const AXIS_SYMBOL_GAP = 12;
/** 눈금 짧은 선의 길이(월드). */
const TICK_LEN = 0.08;

const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const BLOCK = { colorRole: 'muted', emphasis: 'subtle' } as const;
const HEAT_LEVEL = { colorRole: 'accent', emphasis: 'strong' } as const;
const HEAT_FLOW = { colorRole: 'primary', emphasis: 'strong' } as const;
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;

/** 온도(℃) → 막대 · 곡선이 함께 쓰는 높이(월드 y). */
function yOf(temp: number, c: ThermalEquilibriumConstants): number {
  const f = (temp - c.axisMin) / (c.axisMax - c.axisMin);
  return SCALE_BOTTOM + f * (SCALE_TOP - SCALE_BOTTOM);
}

/** 맞붙은 뒤 시간(초) → 곡선 판의 x. */
function xOfTime(s: number, span: number): number {
  return GRAPH_X0 + (Math.min(s, span) / span) * (GRAPH_X1 - GRAPH_X0);
}

/** 눈금 · 축 기호 글자의 선택지. 문안을 주지 않으면 온도 글자(`{t} ℃`)다. */
interface AxisLabelOpts {
  text?: LocalizedText;
  vars?: Record<string, string>;
  font?: 'text' | 'mono';
  italic?: boolean;
}

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

/** 덩이 하나의 자리. `side` −1 이 뜨거운 덩이(왼쪽), +1 이 찬 덩이(오른쪽). */
interface BlockBox {
  id: 'hot' | 'cold';
  left: number;
  right: number;
  /** 온도 관의 중심 x — 덩이 바깥 모서리 쪽에 둔다. 가운데는 알갱이가 지나는 자리다. */
  tubeX: number;
}

function blockBox(id: BlockBox['id'], shift: number): BlockBox {
  const [w] = BLOCK_SIZE;
  if (id === 'hot') {
    const right = INTERFACE_X - shift;
    return { id, left: right - w, right, tubeX: right - w + TUBE_INSET };
  }
  const left = INTERFACE_X + shift;
  return { id, left, right: left + w, tubeX: left + w - TUBE_INSET };
}

export function scene(params: {
  state: ThermalEquilibriumState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('thermal-equilibrium: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(tl);
  const out: Primitive[] = [];

  // 맞붙은 뒤 흐른 시간 · 지금 두 온도. 맞붙기 전(s = 0)에는 처음 온도 그대로다.
  const s = contactTime(tl);
  const temps = tempsAt(s, c);
  const touching = tl.at('touch') >= 1;
  // 흐름이 끝나 한 온도에서 멈춘 그림 — `slow` 단계가 끝난 뒤다.
  const settled = tl.at('slow') >= 1;

  // 떨어져 있던 두 덩이가 맞닿은 면으로 다가간다.
  const shift = (GAP / 2) * (1 - tl.at('touch'));
  const boxes = [blockBox('hot', shift), blockBox('cold', shift)];
  const tempOf = (b: BlockBox): number => (b.id === 'hot' ? temps.hot : temps.cold);

  // ---- 덩이 ----
  for (const b of boxes) {
    out.push({
      type: 'body',
      id: `block-${b.id}`,
      shape: 'rect',
      pos: [(b.left + b.right) / 2, BLOCK_BOTTOM + BLOCK_SIZE[1] / 2],
      size: BLOCK_SIZE,
      opacity: alpha * BLOCK_OPACITY,
      style: BLOCK,
    });
  }

  // ---- 온도 막대 ----
  // 관 바탕을 먼저 깔아 덩이 색을 가리고, 채움 높이가 곧 온도다. 두 막대가 같은 색 —
  // 뜨거움 · 차가움은 높이가 말한다.
  for (const b of boxes) {
    const x0 = b.tubeX - TUBE_WIDTH / 2;
    const x1 = b.tubeX + TUBE_WIDTH / 2;
    out.push({
      type: 'region',
      id: `tube-bg-${b.id}`,
      points: rect(x0, SCALE_BOTTOM, x1, SCALE_TOP),
      opaque: true,
      fillOpacity: TUBE_BG,
      opacity: alpha,
      style: MUTED,
    });
    out.push({
      type: 'region',
      id: `tube-fill-${b.id}`,
      points: rect(x0, SCALE_BOTTOM, x1, yOf(tempOf(b), c)),
      fillOpacity: TUBE_FILL,
      opacity: alpha,
      style: HEAT_LEVEL,
    });
    out.push({
      type: 'region',
      id: `tube-rim-${b.id}`,
      points: rect(x0, SCALE_BOTTOM, x1, SCALE_TOP),
      fillOpacity: 0,
      outline: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ],
      opacity: alpha,
      style: MUTED,
    });
  }

  // ---- 건너가는 열 알갱이 ----
  // 알갱이 n 은 건너간 열의 몫이 (n + ½)/packets 를 넘는 순간 뜨거운 덩이 안에서 떠나
  // 맞닿은 면을 건너 찬 덩이 안으로 들어간다. 흐름이 굵을 때는 줄지어 가고, 차가
  // 줄면 드물어지고, 멈춘 뒤에는 하나도 없다.
  if (touching) {
    const [hot, cold] = boxes as [BlockBox, BlockBox];
    const fromX0 = hot.tubeX + TUBE_WIDTH / 2 + PACKET_MARGIN;
    const fromX1 = INTERFACE_X - PACKET_MARGIN;
    const toX0 = INTERFACE_X + PACKET_MARGIN;
    const toX1 = cold.tubeX - TUBE_WIDTH / 2 - PACKET_MARGIN;
    for (let n = 0; n < c.packets; n++) {
      const depart = departTime(n, c);
      const p = (s - depart) / c.packetTravel;
      if (p < 0 || p >= 1) continue;
      const ax = fromX0 + hash01(c.seed, n, 0) * (fromX1 - fromX0);
      const bx = toX0 + hash01(c.seed, n, 1) * (toX1 - toX0);
      const ay = PACKET_Y_MIN + hash01(c.seed, n, 2) * (PACKET_Y_MAX - PACKET_Y_MIN);
      const by = PACKET_Y_MIN + hash01(c.seed, n, 3) * (PACKET_Y_MAX - PACKET_Y_MIN);
      out.push({
        type: 'body',
        id: `packet-${n}`,
        shape: 'circle',
        size: PACKET_R,
        pos: [ax + (bx - ax) * p, ay + (by - ay) * p],
        glow: false,
        opacity: alpha,
        style: HEAT_FLOW,
      });
    }
  }

  // ---- 열 화살표 ----
  // 맞닿은 면 위에서 뜨거운 쪽 → 찬 쪽. 길이와 굵기가 온도 차에 비례해 함께 줄고,
  // 차가 처음의 `arrowMinRatio` 밑으로 내려가면 거둔다.
  const ratio = diffRatio(s, c);
  if (touching && ratio >= c.arrowMinRatio) {
    const len = c.arrowLen * ratio;
    out.push({
      type: 'vector',
      id: 'heat-arrow',
      from: [INTERFACE_X - len / 2, ARROW_Y],
      delta: [len, 0],
      width: c.arrowWidth * ratio,
      label: text('label.heat'),
      labelSide: 'ccw',
      opacity: alpha,
      style: HEAT_FLOW,
    });
  }

  // ---- 덩이 온도 글자 ----
  // 선언한 값만 쓴다 — 맞붙기 전에는 두 처음 온도, 멈춘 뒤에는 만난 온도. 흐르는 동안은
  // 막대 높이가 말하고 글자를 두지 않는다 (지금 온도를 반올림해 띄우지 않는다, S-piece).
  const labelText = (b: BlockBox): string | undefined => {
    if (!touching) return b.id === 'hot' ? state.hotText : state.coldText;
    if (settled) return state.meetText;
    return undefined;
  };
  for (const b of boxes) {
    const t = labelText(b);
    if (t === undefined) continue;
    out.push({
      type: 'readout',
      id: `temp-${b.id}`,
      anchor: { world: [(b.left + b.right) / 2, TEMP_LABEL_Y] },
      text: text('label.temp'),
      vars: { t },
      chip: false,
      font: 'mono',
      weight: 'bold',
      fontSize: TEMP_LABEL_PX,
      opacity: alpha,
      style: INK,
    });
  }

  // ---- 곡선 판: 축 · 눈금 ----
  const span = graphSpan(tl);
  const yLow = yOf(c.axisMin, c);
  out.push({
    type: 'lineSet',
    id: 'graph-axes',
    lines: [
      [
        [GRAPH_X0, SCALE_TOP],
        [GRAPH_X0, yLow],
        [GRAPH_X1, yLow],
      ],
      [
        [GRAPH_X0 - TICK_LEN, yOf(c.tHot, c)],
        [GRAPH_X0, yOf(c.tHot, c)],
      ],
      [
        [GRAPH_X0 - TICK_LEN, yOf(c.tCold, c)],
        [GRAPH_X0, yOf(c.tCold, c)],
      ],
    ],
    width: AXIS_WIDTH,
    opacity: alpha,
    style: MUTED,
  });
  const axisLabel = (
    id: string,
    at: Vec2,
    offset: Vec2,
    align: 'left' | 'center' | 'right',
    body: AxisLabelOpts,
  ): void => {
    out.push({
      type: 'readout',
      id,
      anchor: { world: at, offset },
      text: body.text ?? text('label.temp'),
      vars: body.vars,
      chip: false,
      font: body.font ?? 'mono',
      italic: body.italic,
      fontSize: AXIS_LABEL_PX,
      align,
      opacity: alpha,
      style: MUTED,
    });
  };
  axisLabel('tick-hot', [GRAPH_X0 - TICK_LEN, yOf(c.tHot, c)], [-LABEL_GAP, 0], 'right', {
    vars: { t: state.hotText },
  });
  axisLabel('tick-cold', [GRAPH_X0 - TICK_LEN, yOf(c.tCold, c)], [-LABEL_GAP, 0], 'right', {
    vars: { t: state.coldText },
  });
  axisLabel('axis-temp', [GRAPH_X0, SCALE_TOP], [0, -AXIS_SYMBOL_GAP], 'center', {
    text: text('label.axisTemp'),
    font: 'text',
    italic: true,
  });
  axisLabel('axis-time', [GRAPH_X1, yLow], [AXIS_SYMBOL_GAP, 0], 'center', {
    text: text('label.axisTime'),
    font: 'text',
    italic: true,
  });

  // ---- 만난 온도 ----
  // 멈춘 뒤 한 줄의 점선이 두 막대 끝과 두 곡선 끝을 함께 지난다 — 막대와 곡선이 같은
  // 눈금을 쓰기 때문에 한 줄로 이을 수 있다.
  if (settled) {
    const yMeet = yOf(meetTemp(c), c);
    out.push({
      type: 'trajectory',
      id: 'meet-line',
      points: [
        [boxes[0]!.tubeX - TUBE_WIDTH, yMeet],
        [GRAPH_X1, yMeet],
      ],
      width: MEET_WIDTH,
      opacity: alpha,
      style: { ...MUTED, lineStyle: 'dashed' },
    });
    axisLabel('tick-meet', [GRAPH_X1, yMeet], [LABEL_GAP, 0], 'left', {
      vars: { t: state.meetText },
    });
  }

  // ---- 온도-시간 곡선 두 줄 ----
  // 맞붙은 순간부터 지금까지. 위가 뜨거운 덩이, 아래가 찬 덩이 — 옆 막대와 같은 높이다.
  const upto = Math.min(s, span);
  for (const id of ['hot', 'cold'] as const) {
    const pts: Vec2[] = [];
    for (let i = 0; i <= CURVE_SAMPLES; i++) {
      const si = (upto * i) / CURVE_SAMPLES;
      const tt = tempsAt(si, c);
      pts.push([xOfTime(si, span), yOf(id === 'hot' ? tt.hot : tt.cold, c)]);
    }
    if (upto > 0) {
      out.push({
        type: 'trajectory',
        id: `curve-${id}`,
        points: pts,
        width: CURVE_WIDTH,
        opacity: alpha,
        style: INK,
      });
    }
    const head = pts[pts.length - 1]!;
    out.push({
      type: 'body',
      id: `curve-head-${id}`,
      shape: 'circle',
      size: HEAD_R,
      pos: head,
      glow: false,
      opacity: alpha,
      style: INK,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
