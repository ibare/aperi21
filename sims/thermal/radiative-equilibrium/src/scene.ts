// ========================================================================
// radiative-equilibrium — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
//   행성 둘          body(circle)     — 같은 크기 · 같은 색. 다른 것은 출발 온도 글자뿐
//   들어옴 막대      region           — 흡수한 햇빛. 두 행성에 같고 움직이지 않는다
//   나감 막대        region           — σT⁴. 온도를 따라 줄거나 는다
//   맞춤선           trajectory(점선) — 들어옴 막대 윗면을 나감 막대 위로 늘인다. 둘의 차이가 이 선과의 틈이다
//   온도 곡선 둘     trajectory       — 오른쪽 판. 두 출발점에서 한 값으로 모인다
//   만난 온도        trajectory(점선) + readout — 모인 뒤 떠오른다
//   축 · 눈금 글자   lineSet + readout
//   캡션             BundleSchema.caption 슬롯
//
// ---- 색은 뜻마다 하나다 ----
//   accent  나가는 복사 — 나감 막대와 그 이름표. 온도를 따라 움직이는 것은 이것 하나다
//   ink     재어 그린 온도 곡선 — 두 곡선이 같은 색이다. 자리(위 · 아래)와 출발 글자가 가른다
//   muted   물건 · 들어옴 막대 · 자 — 행성 · 들어옴 막대 · 축 · 글자
// 찬 · 뜨거운 행성을 파랑 · 빨강으로 가르지 않는다 (S-piece).
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
  absorbed,
  emitted,
  equilibriumTemp,
  readConstants,
  tempPath,
  type RadiativeEquilibriumConstants,
} from './physics';
import {
  BAR_OFFSET,
  BAR_W,
  BASE_Y,
  GRAPH_X0,
  GRAPH_X1,
  GRAPH_Y0,
  GRAPH_Y1,
  PLANET_R,
  PLANET_XS,
  PLANET_Y,
  SCENE_BOUNDS,
  START_Y,
  text,
} from './schema';
import type { RadiativeEquilibriumState } from './state';

/** 곡선 굵기(화면 px). 이 그림에서 가장 굵은 선이다. */
const CURVE_WIDTH = 2.5;
/** 축 굵기(화면 px). 자라서 가늘다. */
const AXIS_WIDTH = 1;
/** 맞춤선 · 만난 온도 점선 굵기(화면 px). */
const GUIDE_WIDTH = 1.5;
/** 곡선 한 줄의 표본 수 — 판 전체 시간을 이만큼의 고정 걸음으로 푼다. */
const CURVE_SAMPLES = 160;
/** 곡선 머리 점의 반지름(월드). */
const HEAD_R = 0.06;
/** 들어옴 · 나감 막대의 채움 짙기. 다크에서도 높이가 또렷해야 한다. */
const IN_FILL = 0.7;
const OUT_FILL = 0.85;
/** 맞춤선이 나감 막대 바깥으로 삐져나가는 길이(월드). 막대 윗면과 선이 구분되게. */
const GUIDE_OVERHANG = 0.12;
/** 막대 이름표를 바닥선 아래로 띄우는 거리(화면 px). 막대가 움직여도 이름표는 제자리다. */
const TAG_GAP = 10;
/** 출발 글자 · 이름표 · 눈금 글자 크기(화면 px). */
const START_PX = 13;
const TAG_PX = 11;
const AXIS_LABEL_PX = 12;
/** 눈금 글자를 축에서 띄우는 거리(화면 px). */
const LABEL_GAP = 6;
/** 축 기호(T · t)를 축 끝에서 띄우는 거리(화면 px). */
const AXIS_SYMBOL_GAP = 12;
/** 눈금 짧은 선의 길이(월드). */
const TICK_LEN = 0.08;

const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const PLANET = { colorRole: 'muted', emphasis: 'medium' } as const;
const OUT = { colorRole: 'accent', emphasis: 'strong' } as const;
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

/** 온도(K) → 온도 판의 높이(월드 y). */
function yOf(temp: number, c: RadiativeEquilibriumConstants): number {
  const f = (temp - c.axisMin) / (c.axisMax - c.axisMin);
  return GRAPH_Y0 + f * (GRAPH_Y1 - GRAPH_Y0);
}

/** 곡선 판이 담는 화면 시간(초) — 온도가 움직이는 단계부터 다 모인 그림을 읽는 단계 끝까지. */
function graphSpan(tl: TimelineFrame): number {
  return tl.duration('settle') + tl.duration('meet') + tl.duration('hold');
}

export function scene(params: {
  state: RadiativeEquilibriumState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('radiative-equilibrium: schema.timeline 이 선언되어야 한다');
  const { state } = params;
  const c = readConstants(params.stage);
  const out: Primitive[] = [];

  // 단계 진행도 — 경계는 선언이 안다 (S-piece).
  const keep = 1 - tl.at('fade');
  const grow = tl.at('appear');
  const meet = tl.at('meet') * keep;
  const span = graphSpan(tl);
  // 온도가 움직이기 시작한 뒤 흐른 화면 시간. 판 끝에서 멈춘다.
  const s = Math.min(span, Math.max(0, tl.u - tl.start('settle')));

  const starts = [c.tCold, c.tHot];
  const startTexts = [state.tColdText, state.tHotText];
  const paths = starts.map((t0) => tempPath(c, t0, s, span, CURVE_SAMPLES));
  const inH = absorbed(c) * c.barScale;

  const xOfTime = (si: number): number => GRAPH_X0 + (si / span) * (GRAPH_X1 - GRAPH_X0);

  const axisLabel = (
    id: string,
    at: Vec2,
    offset: Vec2,
    align: 'left' | 'center' | 'right',
    body: { text: LocalizedText; vars?: Record<string, string>; font: 'text' | 'mono'; italic?: boolean; opacity: number },
  ): void => {
    out.push({
      type: 'readout',
      id,
      anchor: { world: at, offset },
      text: body.text,
      vars: body.vars,
      chip: false,
      font: body.font,
      italic: body.italic,
      fontSize: AXIS_LABEL_PX,
      align,
      opacity: body.opacity,
      style: MUTED,
    });
  };

  // ---- 행성 둘 ----
  PLANET_XS.forEach((cx, i) => {
    const path = paths[i];
    const startText = startTexts[i];
    if (!path || startText === undefined) return;
    const temp = path[path.length - 1]![1];
    const inX = cx - BAR_OFFSET;
    const outX = cx + BAR_OFFSET;

    out.push({
      type: 'body',
      id: `planet-${i}`,
      pos: [cx, PLANET_Y],
      shape: 'circle',
      size: PLANET_R,
      glow: false,
      style: PLANET,
    });
    out.push({
      type: 'readout',
      id: `start-${i}`,
      anchor: { world: [cx, START_Y] },
      text: text('label.start'),
      vars: { t: startText },
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: START_PX,
      style: INK,
    });

    const alpha = grow * keep;
    if (alpha <= 0) return;

    // 들어옴 막대 — 두 행성에 같고 움직이지 않는다.
    const hIn = inH * grow;
    out.push({
      type: 'region',
      id: `in-bar-${i}`,
      points: rect(inX - BAR_W / 2, BASE_Y, inX + BAR_W / 2, BASE_Y + hIn),
      fillOpacity: IN_FILL,
      opaque: true,
      opacity: keep,
      style: MUTED,
    });
    out.push({
      type: 'readout',
      id: `tag-in-${i}`,
      anchor: { world: [inX, BASE_Y], offset: [0, TAG_GAP] },
      text: text('label.tagIn'),
      chip: false,
      font: 'text',
      fontSize: TAG_PX,
      opacity: alpha,
      style: MUTED,
    });

    // 나감 막대 — 지금 온도의 σT⁴. 같은 바닥 · 같은 배율.
    const hOut = emitted(c, temp) * c.barScale * grow;
    out.push({
      type: 'region',
      id: `out-bar-${i}`,
      points: rect(outX - BAR_W / 2, BASE_Y, outX + BAR_W / 2, BASE_Y + hOut),
      fillOpacity: OUT_FILL,
      opaque: true,
      opacity: keep,
      style: OUT,
    });
    out.push({
      type: 'readout',
      id: `tag-out-${i}`,
      anchor: { world: [outX, BASE_Y], offset: [0, TAG_GAP] },
      text: text('label.tagOut'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: TAG_PX,
      opacity: alpha,
      style: OUT,
    });

    // 맞춤선 — 들어옴 막대 윗면을 나감 막대 위로 늘인다. 나감 막대 윗면과 이 선의 틈이 차이다.
    out.push({
      type: 'trajectory',
      id: `level-${i}`,
      points: [
        [inX - BAR_W / 2, BASE_Y + hIn],
        [outX + BAR_W / 2 + GUIDE_OVERHANG, BASE_Y + hIn],
      ],
      width: GUIDE_WIDTH,
      opacity: alpha,
      style: { ...MUTED, lineStyle: 'dashed' },
    });
  });

  // ---- 온도 판: 축 · 출발 눈금 ----
  out.push({
    type: 'lineSet',
    id: 'graph-axes',
    lines: [
      [
        [GRAPH_X0, GRAPH_Y1],
        [GRAPH_X0, GRAPH_Y0],
        [GRAPH_X1, GRAPH_Y0],
      ],
      ...starts.map((t0): Vec2[] => [
        [GRAPH_X0 - TICK_LEN, yOf(t0, c)],
        [GRAPH_X0, yOf(t0, c)],
      ]),
    ],
    width: AXIS_WIDTH,
    style: MUTED,
  });
  starts.forEach((t0, i) => {
    axisLabel(`tick-start-${i}`, [GRAPH_X0 - TICK_LEN, yOf(t0, c)], [-LABEL_GAP, 0], 'right', {
      text: text('label.kelvin'),
      vars: { t: startTexts[i] ?? '' },
      font: 'mono',
      opacity: 1,
    });
  });
  axisLabel('axis-temp', [GRAPH_X0, GRAPH_Y1], [0, -AXIS_SYMBOL_GAP], 'center', {
    text: text('label.axisTemp'),
    font: 'text',
    italic: true,
    opacity: 1,
  });
  axisLabel('axis-time', [GRAPH_X1, GRAPH_Y0], [AXIS_SYMBOL_GAP, 0], 'center', {
    text: text('label.axisTime'),
    font: 'text',
    italic: true,
    opacity: 1,
  });

  // ---- 만난 온도 ----
  if (meet > 0) {
    const yEq = yOf(equilibriumTemp(c), c);
    out.push({
      type: 'trajectory',
      id: 'eq-line',
      points: [
        [GRAPH_X0, yEq],
        [GRAPH_X1, yEq],
      ],
      width: GUIDE_WIDTH,
      opacity: meet,
      style: { ...MUTED, lineStyle: 'dashed' },
    });
    axisLabel('tick-eq', [GRAPH_X1, yEq], [LABEL_GAP, 0], 'left', {
      text: text('label.kelvin'),
      vars: { t: state.tEqText },
      font: 'mono',
      opacity: meet,
    });
  }

  // ---- 온도 곡선 둘 ----
  // 두 출발점에서 지금까지. 흐려지는 단계에서 함께 흐려진다.
  paths.forEach((path, i) => {
    const pts = path.map(([si, temp]): Vec2 => [xOfTime(si), yOf(temp, c)]);
    if (pts.length > 1) {
      out.push({
        type: 'trajectory',
        id: `curve-${i}`,
        points: pts,
        width: CURVE_WIDTH,
        opacity: keep,
        style: INK,
      });
    }
    out.push({
      type: 'body',
      id: `curve-head-${i}`,
      shape: 'circle',
      size: HEAD_R,
      pos: pts[pts.length - 1]!,
      glow: false,
      opacity: keep,
      style: INK,
    });
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
