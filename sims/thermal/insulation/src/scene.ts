// ========================================================================
// insulation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
//   감쌈            region(U 자)      — 천은 사선 결, 스티로폼은 두꺼운 채움. 맨 컵은 없다
//   컵 · 물         region(U 자 · 사각) — 세 컵이 같다. 다른 것은 감쌈뿐
//   온도 막대       region 셋         — 관 바탕(opaque) · 채움(높이 = 온도) · 관 둘레
//   빠져나가는 열   body(circle)      — 알갱이. 빠져나간 열의 몫이 문턱을 넘을 때 하나씩 떠난다
//   컵 이름         readout           — 감쌈의 재료
//   온도-시간 곡선  trajectory 셋     — 막대와 **같은 눈금**. 셋이 같은 색이고 높이가 가른다
//   바깥 온도       trajectory(점선)  — 곡선이 다가가는 바닥
//   같은 시간       trajectory(점선)  — 멈춘 뒤 세 곡선 끝을 한 세로줄로 꿴다
//   축 · 눈금 글자  lineSet + readout
//   캡션            BundleSchema.caption 슬롯
//
// ---- 색은 뜻마다 하나다 ----
//   accent  온도의 높이 — 세 막대가 같은 색이다. 뜨거움 · 차가움을 두 색으로 가르지 않는다
//   primary 빠져나가는 열 — 알갱이
//   ink     재어 그린 곡선 — 세 곡선이 같은 색이다. 자리(높이)와 끝의 이름이 가른다
//   muted   물건과 자 — 컵 · 물 · 감쌈 · 관 둘레 · 축 · 글자
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
  coolSpan,
  coolTime,
  departTime,
  grainClock,
  grainOpacity,
  hash01,
  rateOf,
  readConstants,
  sceneOpacity,
  tempAt,
  WRAPS,
  type InsulationConstants,
  type WrapId,
} from './physics';
import {
  CUP_HEIGHT,
  CUP_INNER_HALF,
  CUP_WALL,
  CUP_X,
  GRAIN_EXIT,
  GRAIN_R,
  GRAIN_RISE,
  GRAIN_Y_MAX,
  GRAIN_Y_MIN,
  GRAPH_X0,
  GRAPH_X1,
  NAME_Y,
  SCALE_BOTTOM,
  SCALE_TOP,
  SCENE_BOUNDS,
  TEMP_LABEL_Y,
  TUBE_WIDTH,
  WATER_TOP,
  WRAP_CLOTH,
  WRAP_FOAM,
  text,
  type InsulationMessageKey,
} from './schema';
import type { InsulationState } from './state';

/** 곡선 굵기(화면 px). 이 그림에서 가장 굵은 선이다. */
const CURVE_WIDTH = 2.5;
/** 축 · 관 둘레 굵기(화면 px). 자라서 가늘다. */
const AXIS_WIDTH = 1;
/** 바깥 온도 · 같은 시간 점선 굵기(화면 px). */
const GUIDE_WIDTH = 1.5;
/** 곡선 한 줄의 표본 수 (장부 G28 — 곡선 어휘가 없어 점으로 표본한다). */
const CURVE_SAMPLES = 90;
/** 곡선 머리 점의 반지름(월드). */
const HEAD_R = 0.06;
/** 온도 막대 채움의 짙기. 다크에서도 높이가 또렷해야 한다. */
const TUBE_FILL = 0.85;
/** 관 바탕의 옅기 — 물 색을 가려 빈 관이 비어 보이게 한다. */
const TUBE_BG = 0.06;
/** 물의 옅기. 물건이라 옅다 — 막대 · 알갱이가 그 위에서 읽혀야 한다. */
const WATER_FILL = 0.22;
/** 컵 벽의 짙기. */
const CUP_FILL = 0.8;
/** 천 감쌈 · 스티로폼 감쌈의 짙기. 천은 사선 결이 가르고, 스티로폼은 두께가 가른다. */
const CLOTH_FILL = 0.55;
const FOAM_FILL = 0.3;
/** 온도 글자 · 컵 이름 글자 크기(화면 px). */
const TEMP_LABEL_PX = 14;
const NAME_PX = 13;
/** 눈금 · 축 기호 · 곡선 끝 이름 글자 크기(화면 px). */
const AXIS_LABEL_PX = 12;
/** 눈금 글자를 축에서 띄우는 거리(화면 px). */
const LABEL_GAP = 6;
/** 축 기호(T · t)를 축 끝에서 띄우는 거리(화면 px). */
const AXIS_SYMBOL_GAP = 12;
/** 눈금 짧은 선의 길이(월드). */
const TICK_LEN = 0.08;
/** 감쌈이 컵 테두리보다 낮게 멈추는 거리(월드). 천은 컵을 두르되 테두리까지 올라오지 않는다. */
const CLOTH_TOP_DROP = 0.2;

const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const CUP = { colorRole: 'muted', emphasis: 'strong' } as const;
const WATER = { colorRole: 'muted', emphasis: 'medium' } as const;
const WRAP = { colorRole: 'muted', emphasis: 'strong' } as const;
const HEAT_LEVEL = { colorRole: 'accent', emphasis: 'strong' } as const;
const HEAT_FLOW = { colorRole: 'primary', emphasis: 'strong' } as const;
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;

/** 감쌈마다의 이름 키 · 두께. */
const NAME_KEY: Record<WrapId, InsulationMessageKey> = {
  bare: 'label.bare',
  cloth: 'label.cloth',
  foam: 'label.foam',
};
const WRAP_THICK: Record<WrapId, number> = { bare: 0, cloth: WRAP_CLOTH, foam: WRAP_FOAM };

/** 온도(℃) → 막대 · 곡선이 함께 쓰는 높이(월드 y). */
function yOf(temp: number, c: InsulationConstants): number {
  const f = (temp - c.axisMin) / (c.axisMax - c.axisMin);
  return SCALE_BOTTOM + f * (SCALE_TOP - SCALE_BOTTOM);
}

/** 식기 시작한 뒤 시간(초) → 곡선 판의 x. */
function xOfTime(s: number, span: number): number {
  return GRAPH_X0 + (Math.min(s, span) / span) * (GRAPH_X1 - GRAPH_X0);
}

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

/**
 * U 자 — 가운데 `cx`, 안쪽 반폭 `inner`, 두께 `thick`, 안쪽 바닥 `floor`, 위 끝 `top`.
 * 벽 · 감쌈이 모두 이 꼴이다(위가 열린 그릇).
 */
function cupShape(cx: number, inner: number, thick: number, floor: number, top: number): Vec2[] {
  const o = inner + thick;
  return [
    [cx - o, top],
    [cx - o, floor - thick],
    [cx + o, floor - thick],
    [cx + o, top],
    [cx + inner, top],
    [cx + inner, floor],
    [cx - inner, floor],
    [cx - inner, top],
  ];
}

/** 눈금 · 축 기호 글자의 선택지. 문안을 주지 않으면 온도 글자(`{t} ℃`)다. */
interface LabelOpts {
  text?: LocalizedText;
  vars?: Record<string, string>;
  font?: 'text' | 'mono';
  italic?: boolean;
}

export function scene(params: {
  state: InsulationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('insulation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(tl);
  const out: Primitive[] = [];

  const s = coolTime(tl);
  const span = coolSpan(tl);
  const clock = grainClock(tl);
  // 담기만 하고 아직 식기 전 — 처음 온도 글자를 보이는 때다.
  const poured = tl.at('pour') < 1;
  // 같은 시간이 다 지나 멈춘 그림 — `late` 가 끝난 뒤다.
  const settled = tl.at('late') >= 1;

  const label = (
    id: string,
    at: Vec2,
    offset: Vec2,
    align: 'left' | 'center' | 'right',
    size: number,
    body: LabelOpts,
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
      fontSize: size,
      align,
      opacity: alpha,
      style: MUTED,
    });
  };

  WRAPS.forEach((id, i) => {
    const cx = CUP_X[i]!;
    const k = rateOf(id, c);
    const thick = WRAP_THICK[id];
    const outer = CUP_INNER_HALF + CUP_WALL + thick;

    // ---- 감쌈 ----
    // 컵 바깥을 두른다. 천은 사선 결, 스티로폼은 두꺼운 채움이다 — 색이 아니라 결과 두께가
    // 재료를 가른다 (S-piece).
    if (id !== 'bare') {
      const top = id === 'cloth' ? CUP_HEIGHT - CLOTH_TOP_DROP : CUP_HEIGHT;
      out.push({
        type: 'region',
        id: `wrap-${id}`,
        points: cupShape(cx, CUP_INNER_HALF + CUP_WALL, thick, 0, top),
        fill: id === 'cloth' ? 'hatch' : 'solid',
        fillOpacity: id === 'cloth' ? CLOTH_FILL : FOAM_FILL,
        opaque: true,
        opacity: alpha,
        style: WRAP,
      });
    }

    // ---- 컵 벽 · 물 ----
    out.push({
      type: 'region',
      id: `cup-${id}`,
      points: cupShape(cx, CUP_INNER_HALF, CUP_WALL, CUP_WALL, CUP_HEIGHT),
      fillOpacity: CUP_FILL,
      opacity: alpha,
      style: CUP,
    });
    out.push({
      type: 'region',
      id: `water-${id}`,
      points: rect(cx - CUP_INNER_HALF, CUP_WALL, cx + CUP_INNER_HALF, WATER_TOP),
      fillOpacity: WATER_FILL,
      opacity: alpha,
      style: WATER,
    });

    // ---- 온도 막대 ----
    // 관 바탕을 먼저 깔아 물 색을 가리고, 채움 높이가 곧 지금 물 온도다. 세 막대가 같은 색 —
    // 얼마나 식었는지는 높이가 말한다.
    const x0 = cx - TUBE_WIDTH / 2;
    const x1 = cx + TUBE_WIDTH / 2;
    out.push({
      type: 'region',
      id: `tube-bg-${id}`,
      points: rect(x0, SCALE_BOTTOM, x1, SCALE_TOP),
      opaque: true,
      fillOpacity: TUBE_BG,
      opacity: alpha,
      style: MUTED,
    });
    out.push({
      type: 'region',
      id: `tube-fill-${id}`,
      points: rect(x0, SCALE_BOTTOM, x1, yOf(tempAt(k, s, c), c)),
      fillOpacity: TUBE_FILL,
      opacity: alpha,
      style: HEAT_LEVEL,
    });
    out.push({
      type: 'region',
      id: `tube-rim-${id}`,
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

    // ---- 빠져나가는 열 알갱이 ----
    // 알갱이 n 은 빠져나간 열의 몫이 (n + ½)/packets 를 넘는 순간 물 안에서 떠나 벽(과 감쌈)을
    // 건너 바깥 공기로 나간다. 통과율이 큰 맨 컵에서는 줄지어, 스티로폼에서는 드물게 떠난다.
    // 같은 시간이 다 지난 뒤로는 새로 떠나는 것이 없고, 이미 떠난 것만 제 길을 마저 간다.
    for (let n = 0; n < c.packets; n++) {
      const depart = departTime(n, k, c);
      if (!(depart <= span)) break;
      const p = (clock - depart) / c.grainTravel;
      if (p < 0 || p >= 1) continue;
      const side = hash01(c.seed, n + i * c.packets, 0) < 0.5 ? -1 : 1;
      const ax = cx + side * hash01(c.seed, n + i * c.packets, 1) * (CUP_INNER_HALF - TUBE_WIDTH);
      const ay = GRAIN_Y_MIN + hash01(c.seed, n + i * c.packets, 2) * (GRAIN_Y_MAX - GRAIN_Y_MIN);
      const bx = cx + side * (outer + GRAIN_EXIT);
      const by = ay + GRAIN_RISE;
      out.push({
        type: 'body',
        id: `grain-${id}-${n}`,
        shape: 'circle',
        size: GRAIN_R,
        pos: [ax + (bx - ax) * p, ay + (by - ay) * p],
        glow: false,
        opacity: alpha * grainOpacity(p, c),
        style: HEAT_FLOW,
      });
    }

    // ---- 처음 온도 글자 · 컵 이름 ----
    // 온도 글자는 선언한 처음 온도만 쓴다 — 식는 동안의 지금 온도를 반올림해 띄우지 않는다
    // (S-piece 유효숫자). 그 동안은 막대 높이가 말한다.
    if (poured) {
      out.push({
        type: 'readout',
        id: `temp-${id}`,
        anchor: { world: [cx, TEMP_LABEL_Y] },
        text: text('label.temp'),
        vars: { t: state.startText },
        chip: false,
        font: 'mono',
        weight: 'bold',
        fontSize: TEMP_LABEL_PX,
        opacity: alpha,
        style: INK,
      });
    }
    label(`name-${id}`, [cx, NAME_Y], [0, 0], 'center', NAME_PX, {
      text: text(NAME_KEY[id]),
      font: 'text',
    });
  });

  // ---- 곡선 판: 축 · 눈금 ----
  const yLow = yOf(c.axisMin, c);
  const yStart = yOf(c.tStart, c);
  const yOut = yOf(c.tOutside, c);
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
        [GRAPH_X0 - TICK_LEN, yStart],
        [GRAPH_X0, yStart],
      ],
      [
        [GRAPH_X0 - TICK_LEN, yOut],
        [GRAPH_X0, yOut],
      ],
    ],
    width: AXIS_WIDTH,
    opacity: alpha,
    style: MUTED,
  });
  label('tick-start', [GRAPH_X0 - TICK_LEN, yStart], [-LABEL_GAP, 0], 'right', AXIS_LABEL_PX, {
    vars: { t: state.startText },
  });
  label('tick-outside', [GRAPH_X0 - TICK_LEN, yOut], [-LABEL_GAP, 0], 'right', AXIS_LABEL_PX, {
    vars: { t: state.outsideText },
  });
  label('axis-temp', [GRAPH_X0, SCALE_TOP], [0, -AXIS_SYMBOL_GAP], 'center', AXIS_LABEL_PX, {
    text: text('label.axisTemp'),
    font: 'text',
    italic: true,
  });
  label('axis-time', [GRAPH_X1, yLow], [0, AXIS_SYMBOL_GAP], 'center', AXIS_LABEL_PX, {
    text: text('label.axisTime'),
    font: 'text',
    italic: true,
  });

  // ---- 바깥 온도 ----
  // 곡선이 다가가는 바닥. 세 컵이 같은 바깥에 놓였다는 것이 한 줄로 보인다.
  out.push({
    type: 'trajectory',
    id: 'outside-line',
    points: [
      [GRAPH_X0, yOut],
      [GRAPH_X1, yOut],
    ],
    width: GUIDE_WIDTH,
    opacity: alpha,
    style: { ...MUTED, lineStyle: 'dashed' },
  });
  label('outside-label', [GRAPH_X1, yOut], [LABEL_GAP, 0], 'left', AXIS_LABEL_PX, {
    text: text('label.outside'),
    vars: { t: state.outsideText },
    font: 'text',
  });

  // ---- 같은 시간 ----
  // 멈춘 뒤 한 세로줄이 세 곡선 끝을 함께 꿴다 — 같은 시각에서 서로 다른 높이다.
  const heads: { id: WrapId; y: number }[] = WRAPS.map((id) => ({
    id,
    y: yOf(tempAt(rateOf(id, c), s, c), c),
  }));
  if (settled) {
    const top = Math.max(...heads.map((h) => h.y));
    out.push({
      type: 'trajectory',
      id: 'same-time-line',
      points: [
        [GRAPH_X1, yLow],
        [GRAPH_X1, top],
      ],
      width: GUIDE_WIDTH,
      opacity: alpha,
      style: { ...MUTED, lineStyle: 'dashed' },
    });
  }

  // ---- 온도-시간 곡선 셋 ----
  // 식기 시작한 순간부터 지금까지. 옆 막대와 같은 높이다 — 가장 낮은 곡선이 가장 낮은 막대다.
  for (const h of heads) {
    const k = rateOf(h.id, c);
    if (s > 0) {
      const pts: Vec2[] = [];
      for (let j = 0; j <= CURVE_SAMPLES; j++) {
        const sj = (s * j) / CURVE_SAMPLES;
        pts.push([xOfTime(sj, span), yOf(tempAt(k, sj, c), c)]);
      }
      out.push({
        type: 'trajectory',
        id: `curve-${h.id}`,
        points: pts,
        width: CURVE_WIDTH,
        opacity: alpha,
        style: INK,
      });
    }
    out.push({
      type: 'body',
      id: `curve-head-${h.id}`,
      shape: 'circle',
      size: HEAD_R,
      pos: [xOfTime(s, span), h.y],
      glow: false,
      opacity: alpha,
      style: INK,
    });
    // 곡선 끝 이름 — 멈춘 뒤에만. 식는 동안에는 세 머리가 가까워 이름이 겹친다.
    if (settled) {
      label(`curve-name-${h.id}`, [GRAPH_X1, h.y], [LABEL_GAP, 0], 'left', AXIS_LABEL_PX, {
        text: text(NAME_KEY[h.id]),
        font: 'text',
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
