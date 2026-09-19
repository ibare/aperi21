// ========================================================================
// greenhouse-effect — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
//   지표 띠 · 층 띠    region           — 층은 빗금(hatch). 층이 들어오는 동안 떠오른다
//   물결 줄기          lineSet          — 햇빛은 짧은 간격, 적외선은 긴 간격. 색이 아니라 간격이 가른다
//   방향 화살촉        vector           — 물결 끝마다 짧게. 올라가는지 내려오는지
//   들어옴 막대        region ×2        — 햇빛 몫(민 면) 위에 층이 돌려보낸 몫(빗금)을 쌓는다
//   나감 막대          region           — σTs⁴. 지표 온도를 따라 오른다
//   맞춤선             trajectory(점선) — 들어옴 막대 윗면을 나감 막대 위로 늘인다
//   온도 판            lineSet · trajectory · body · readout — 255 K 평평 → 층 넣음 → 288 K 로 올라 선다
//   캡션               BundleSchema.caption 슬롯
//
// ---- 색 · 결은 뜻마다 하나다 ----
//   accent  지표가 내보내는 복사 — 나감 막대와 그 이름표. 온도를 따라 움직이는 것은 이것 하나다
//   ink     물결 · 온도 곡선 · 출발/층 이름표. 햇빛과 적외선을 색으로 가르지 않는다 (적외선에 색을 짓지 않는다)
//   muted   물건 · 자 — 지표 · 층 · 들어옴 막대 · 축
//   빗금    층에서 온 것 — 층 띠와, 들어옴 막대 가운데 층이 돌려보낸 몫
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
  absorbedSun,
  backRadiation,
  bareTemp,
  emitted,
  layeredTemp,
  readConstants,
  waveLine,
  warmPath,
  type GreenhouseEffectConstants,
} from './physics';
import {
  BAR_W,
  GRAPH_X0,
  GRAPH_X1,
  GRAPH_Y0,
  GRAPH_Y1,
  GROUND_BOTTOM,
  GROUND_TOP,
  IN_X,
  LAYER_Y0,
  LAYER_Y1,
  OUT_X,
  RE_XS,
  SCENE_BOUNDS,
  SECTION_X0,
  SECTION_X1,
  SKY_TOP,
  SUN_XS,
  UP_XS,
  text,
} from './schema';
import type { GreenhouseEffectState } from './state';

/** 곡선 굵기(화면 px). 이 그림에서 가장 굵은 선이다. */
const CURVE_WIDTH = 2.5;
/** 물결 · 화살촉 굵기(화면 px). */
const WAVE_WIDTH = 1.6;
/** 축 굵기(화면 px). */
const AXIS_WIDTH = 1;
/** 맞춤선 · 새 온도 점선 굵기(화면 px). */
const GUIDE_WIDTH = 1.5;
/** 곡선 한 줄의 표본 수 — 데워지는 구간을 이만큼의 고정 걸음으로 푼다. */
const CURVE_SAMPLES = 160;
/** 물결 한 간격당 표본 수. */
const SAMPLES_PER_WAVE = 12;
/** 물결 끝 화살촉 — 곧은 몸 길이와 머리 크기(월드). */
const ARROW_LEN = 0.26;
const ARROW_HEAD = 0.12;
/** 곡선 머리 점의 반지름(월드). */
const HEAD_R = 0.06;
/** 채움 짙기. 지표 · 층 · 들어옴 · 나감. 다크에서도 높이가 또렷해야 한다. */
const GROUND_FILL = 0.55;
const LAYER_FILL = 0.4;
const IN_FILL = 0.7;
const OUT_FILL = 0.85;
/** 맞춤선이 나감 막대 바깥으로 삐져나가는 길이(월드). */
const GUIDE_OVERHANG = 0.12;
/** 막대 · 시간축 이름표를 바닥선 아래로 띄우는 거리(화면 px). */
const TAG_GAP = 10;
/** 하늘 위 이름표를 물결 끝에서 띄우는 거리(화면 px). */
const SKY_LABEL_GAP = 10;
/** 층 이름표를 층 띠 위로 띄우는 거리(화면 px). 두 줄이라 한 줄 반쯤. */
const LAYER_LABEL_GAP = 18;
/** 층 이름표 줄바꿈 폭(화면 px). 두 물결 묶음 사이 틈에 든다. */
const LAYER_LABEL_WRAP = 104;
/** 글자 크기(화면 px). */
const TAG_PX = 11;
const SECTION_LABEL_PX = 12;
const AXIS_LABEL_PX = 12;
/** 눈금 글자를 축에서 띄우는 거리(화면 px). */
const LABEL_GAP = 6;
/** 축 기호(T · t)를 축 끝에서 띄우는 거리(화면 px). */
const AXIS_SYMBOL_GAP = 12;
/** 눈금 짧은 선의 길이(월드). */
const TICK_LEN = 0.08;

const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const THING = { colorRole: 'muted', emphasis: 'medium' } as const;
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
function yOf(temp: number, c: GreenhouseEffectConstants): number {
  const f = (temp - c.axisMin) / (c.axisMax - c.axisMin);
  return GRAPH_Y0 + f * (GRAPH_Y1 - GRAPH_Y0);
}

/** 두 물결 묶음 사이 틈의 가운데 x — 층 · 지표 이름표 자리. */
function gapX(): number {
  const left = RE_XS[0] ?? SECTION_X0;
  const right = SUN_XS[1] ?? SECTION_X1;
  return (left + right) / 2;
}

export function scene(params: {
  state: GreenhouseEffectState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('greenhouse-effect: schema.timeline 이 선언되어야 한다');
  const { state } = params;
  const c = readConstants(params.stage);
  const out: Primitive[] = [];

  // 단계 진행도 — 경계는 선언이 안다 (S-piece).
  const keep = 1 - tl.at('fade');
  const grow = tl.at('appear');
  const layerIn = tl.at('layer');
  const layerShown = layerIn * keep;
  const meet = tl.at('meet') * keep;

  // 온도 판이 담는 화면 시간 — 주기 처음부터 다 선 그림을 읽는 단계 끝까지.
  const span = tl.end('hold');
  const warmAt = tl.start('warm');
  const s = Math.min(span, tl.u);
  const t0 = bareTemp(c);
  const warm = s > warmAt ? warmPath(c, s - warmAt, span - warmAt, CURVE_SAMPLES) : [];
  const temp = warm.length > 0 ? warm[warm.length - 1]![1] : t0;

  // ---- 단면: 지표 · 층 ----
  out.push({
    type: 'region',
    id: 'ground',
    points: rect(SECTION_X0, GROUND_BOTTOM, SECTION_X1, GROUND_TOP),
    fillOpacity: GROUND_FILL,
    opaque: true,
    style: THING,
  });
  out.push({
    type: 'readout',
    id: 'ground-label',
    anchor: { world: [gapX(), (GROUND_TOP + GROUND_BOTTOM) / 2] },
    text: text('label.ground'),
    chip: false,
    font: 'text',
    weight: 'bold',
    fontSize: SECTION_LABEL_PX,
    align: 'center',
    style: INK,
  });
  if (layerShown > 0) {
    out.push({
      type: 'region',
      id: 'layer',
      points: rect(SECTION_X0, LAYER_Y0, SECTION_X1, LAYER_Y1),
      fillOpacity: LAYER_FILL,
      fill: 'hatch',
      opacity: layerShown,
      style: MUTED,
    });
    out.push({
      type: 'readout',
      id: 'layer-label',
      anchor: { world: [gapX(), LAYER_Y1], offset: [0, -LAYER_LABEL_GAP] },
      text: text('label.layer'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: SECTION_LABEL_PX,
      align: 'center',
      wrapWidth: LAYER_LABEL_WRAP,
      opacity: layerShown,
      style: INK,
    });
  }

  // ---- 단면: 물결 줄기 ----
  // 짧은 간격 = 햇빛, 긴 간격 = 적외선. 끝마다 짧은 화살촉이 방향을 준다.
  const lines: Vec2[][] = [];
  const opacities: number[] = [];
  const arrows: { id: string; from: Vec2; delta: Vec2; opacity: number }[] = [];
  const wave = (x: number, y0: number, y1: number, origin: number, wl: number, a: number): void => {
    if (a <= 0) return;
    lines.push(waveLine(x, y0, y1, origin, wl, c.waveAmp, c.rippleSpeed, tl.t, SAMPLES_PER_WAVE));
    opacities.push(a);
  };
  const arrow = (id: string, x: number, yEnd: number, dir: 1 | -1, a: number): void => {
    if (a <= 0) return;
    arrows.push({ id, from: [x, yEnd - dir * ARROW_LEN], delta: [0, dir * ARROW_LEN], opacity: a });
  };
  // 층이 먹지 않고 지나보내는 몫 — 층이 없으면 전부, 다 들어오면 1 − ε. 옅기로 보인다.
  const leak = 1 - layerShown * c.emissivity;
  SUN_XS.forEach((x, g) => {
    // 햇빛 — 층을 그대로 지나 지표에 닿는다.
    wave(x, SKY_TOP, GROUND_TOP + ARROW_LEN, SKY_TOP, c.sunWaveLength, 1);
    arrow(`sun-arrow-${g}`, x, GROUND_TOP, -1, 1);
  });
  UP_XS.forEach((x, g) => {
    // 지표에서 올라가는 적외선 — 층 아래까지는 늘 있고, 층 위로 새는 몫은 층이 들어오면 옅어진다.
    wave(x, GROUND_TOP, LAYER_Y0 - ARROW_LEN, GROUND_TOP, c.irWaveLength, 1);
    arrow(`up-arrow-${g}`, x, LAYER_Y0, 1, 1);
    wave(x, LAYER_Y0, SKY_TOP - ARROW_LEN, GROUND_TOP, c.irWaveLength, leak);
    arrow(`leak-arrow-${g}`, x, SKY_TOP, 1, leak);
  });
  RE_XS.forEach((x, g) => {
    // 층이 먹은 적외선을 위아래로 다시 낸다.
    wave(x, LAYER_Y1, SKY_TOP - ARROW_LEN, LAYER_Y1, c.irWaveLength, layerShown);
    arrow(`re-up-arrow-${g}`, x, SKY_TOP, 1, layerShown);
    wave(x, LAYER_Y0, GROUND_TOP + ARROW_LEN, LAYER_Y0, c.irWaveLength, layerShown);
    arrow(`re-down-arrow-${g}`, x, GROUND_TOP, -1, layerShown);
  });
  out.push({
    type: 'lineSet',
    id: 'waves',
    lines,
    opacities,
    width: WAVE_WIDTH,
    style: INK,
  });
  for (const a of arrows) {
    out.push({
      type: 'vector',
      id: a.id,
      from: a.from,
      delta: a.delta,
      headSize: ARROW_HEAD,
      width: WAVE_WIDTH,
      opacity: a.opacity,
      style: INK,
    });
  }
  // 하늘 위 이름표 — 왼쪽 묶음의 햇빛, 오른쪽 묶음의 적외선.
  const skyLabel = (id: string, x: number | undefined, t: LocalizedText): void => {
    if (x === undefined) return;
    out.push({
      type: 'readout',
      id,
      anchor: { world: [x, SKY_TOP], offset: [0, -SKY_LABEL_GAP] },
      text: t,
      chip: false,
      font: 'text',
      fontSize: SECTION_LABEL_PX,
      align: 'center',
      style: INK,
    });
  };
  skyLabel('sun-label', SUN_XS[0], text('label.sun'));
  skyLabel('ir-label', UP_XS[1], text('label.infrared'));

  // ---- 지표의 들어옴 · 나감 막대 ----
  const alpha = grow * keep;
  if (alpha > 0) {
    const hSun = absorbedSun(c) * c.barScale * grow;
    const hBack = backRadiation(c, temp, layerIn) * c.barScale * grow;
    const hOut = emitted(c, temp) * c.barScale * grow;
    const inTop = GROUND_TOP + hSun + hBack;

    out.push({
      type: 'region',
      id: 'in-bar-sun',
      points: rect(IN_X - BAR_W / 2, GROUND_TOP, IN_X + BAR_W / 2, GROUND_TOP + hSun),
      fillOpacity: IN_FILL,
      opaque: true,
      opacity: keep,
      style: MUTED,
    });
    if (hBack > 0) {
      out.push({
        type: 'region',
        id: 'in-bar-back',
        points: rect(IN_X - BAR_W / 2, GROUND_TOP + hSun, IN_X + BAR_W / 2, inTop),
        fillOpacity: IN_FILL,
        fill: 'hatch',
        opaque: true,
        opacity: keep,
        style: MUTED,
      });
    }
    out.push({
      type: 'region',
      id: 'out-bar',
      points: rect(OUT_X - BAR_W / 2, GROUND_TOP, OUT_X + BAR_W / 2, GROUND_TOP + hOut),
      fillOpacity: OUT_FILL,
      opaque: true,
      opacity: keep,
      style: OUT,
    });
    out.push({
      type: 'trajectory',
      id: 'level',
      points: [
        [IN_X - BAR_W / 2, inTop],
        [OUT_X + BAR_W / 2 + GUIDE_OVERHANG, inTop],
      ],
      width: GUIDE_WIDTH,
      opacity: alpha,
      style: { ...MUTED, lineStyle: 'dashed' },
    });
    out.push({
      type: 'readout',
      id: 'tag-in',
      anchor: { world: [IN_X, GROUND_TOP], offset: [0, TAG_GAP] },
      text: text('label.tagIn'),
      chip: false,
      font: 'text',
      fontSize: TAG_PX,
      opacity: alpha,
      style: MUTED,
    });
    out.push({
      type: 'readout',
      id: 'tag-out',
      anchor: { world: [OUT_X, GROUND_TOP], offset: [0, TAG_GAP] },
      text: text('label.tagOut'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: TAG_PX,
      opacity: alpha,
      style: OUT,
    });
  }

  // ---- 온도 판 ----
  const xOfTime = (si: number): number => GRAPH_X0 + (si / span) * (GRAPH_X1 - GRAPH_X0);
  const yStart = yOf(t0, c);
  const xLayer = xOfTime(tl.start('layer'));
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

  out.push({
    type: 'lineSet',
    id: 'graph-axes',
    lines: [
      [
        [GRAPH_X0, GRAPH_Y1],
        [GRAPH_X0, GRAPH_Y0],
        [GRAPH_X1, GRAPH_Y0],
      ],
      [
        [GRAPH_X0 - TICK_LEN, yStart],
        [GRAPH_X0, yStart],
      ],
      // 층 넣음 눈금은 축 위로 — 아래 이름표를 뚫지 않게.
      [
        [xLayer, GRAPH_Y0],
        [xLayer, GRAPH_Y0 + TICK_LEN],
      ],
    ],
    width: AXIS_WIDTH,
    style: MUTED,
  });
  axisLabel('tick-start', [GRAPH_X0 - TICK_LEN, yStart], [-LABEL_GAP, 0], 'right', {
    text: text('label.kelvin'),
    vars: { t: state.tStartText },
    font: 'mono',
    opacity: 1,
  });
  axisLabel('tick-layer', [xLayer, GRAPH_Y0], [0, TAG_GAP], 'center', {
    text: text('label.layerMark'),
    font: 'text',
    opacity: 1,
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

  if (meet > 0) {
    const yEq = yOf(layeredTemp(c), c);
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

  // 지표 온도 곡선 — 층이 없는 동안 평평, 층이 들어온 뒤 올라 새 자리에 선다.
  const pts: Vec2[] = [[xOfTime(0), yStart]];
  if (warm.length === 0) {
    pts.push([xOfTime(s), yStart]);
  } else {
    for (const [si, T] of warm) pts.push([xOfTime(warmAt + si), yOf(T, c)]);
  }
  out.push({
    type: 'trajectory',
    id: 'curve',
    points: pts,
    width: CURVE_WIDTH,
    opacity: keep,
    style: INK,
  });
  out.push({
    type: 'body',
    id: 'curve-head',
    shape: 'circle',
    size: HEAD_R,
    pos: pts[pts.length - 1]!,
    glow: false,
    opacity: keep,
    style: INK,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
