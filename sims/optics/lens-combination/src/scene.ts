// ========================================================================
// lens-combination — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 렌즈 셋(L₁ · 볼록 L₂ · 오목 L₂)은 `region` 이다. plugin `opticalElement` 는 두께가
//   고정이고 `lens-concave` 가 볼록 모양으로 그려진다(장부 G219 · G224) — G224 는 이후 엔진에서 고쳤다(2026-09-19), 이 조각은 region 그림을 그대로 둔다. 줄기 추적에는
//   맞닿은 두 렌즈를 대신하는 얇은 렌즈 하나(합성 초점 거리)를 선언만 만들어 `traceRay` 에
//   넘기고 화면에는 올리지 않는다.
// - 줄기는 `ray`(plugin 강조색 하나) — 빛 한 가지 뜻이다. 조합을 색으로 가르지 않는다.
//   가르는 것은 붙은 렌즈의 모양과 줄기가 꺾이는 가파름이다 (S-piece).
// - 굴절력 막대는 `region` 칸이다. 볼록 칸은 위로 쌓이고, 오목 칸은 같은 색의 해칭으로
//   L₁ 칸 꼭대기에서 아래로 덮여 깎인 몫을 보인다 — 색이 아니라 결로 가른다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  OpticalElement,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { traceRay } from '@aperi21/plugin-optics';
import {
  attachConcave,
  attachTwo,
  clipByX,
  comboFocalCm,
  postReach,
  powerOf,
  rayCombo,
  rayOffsets,
  readConstants,
  shownFocusCm,
  shownPowerD,
} from './physics';
import {
  AXIS_FROM_X,
  AXIS_TO_X,
  BAR_BASE_Y,
  BAR_NAME_DROP,
  BAR_TAG_GAP,
  BAR_VALUE_GAP,
  BAR_WIDTH,
  BAR_X,
  CONCAVE_CENTER_HALF,
  CONCAVE_EDGE_HALF,
  CONVEX_CENTER_HALF,
  CONVEX_EDGE_HALF,
  DIMENSION_Y,
  FOCUS_DOT_RADIUS,
  LENS_DROP,
  LENS_HALF,
  LENS_LABEL_GAP,
  LENS_LABEL_SPREAD,
  RAY_OVERSHOOT,
  RAY_START_X,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { LensCombinationState } from './state';

/** 광축 · 막대 바닥 보조선 굵기(화면 px). 재는 기준선이라 줄기보다 가늘다. */
const AXIS_WIDTH_PX = 1;
/** 막대 꼭대기 표지선 굵기(화면 px). 지금 합이 어디인지 못박는다. */
const NET_TICK_WIDTH_PX = 2;
/** 막대 꼭대기 표지선이 막대 좌우로 삐져나온 길이(월드). */
const NET_TICK_OVERHANG = 0.08;
/** 막대 바닥 보조선이 막대 좌우로 삐져나온 길이(월드). */
const BASE_OVERHANG = 0.14;
/** 렌즈 유리 채움 짙기. 지나가는 줄기가 비쳐 보이는 정도. */
const LENS_FILL = 0.22;
/** 막대 칸 채움 짙기. */
const BAR_FILL = 0.5;
/** 빈 고리(L₁ 하나일 때의 초점 자리)의 짙기. 지금 초점보다 물러나 있다. */
const GHOST_OPACITY = 0.8;
/** 렌즈 윤곽 한쪽 면을 자르는 마디 수. */
const LENS_SAMPLES = 18;
/** 렌즈 이름표 글자 크기(화면 px). */
const LENS_LABEL_PX = 13;
/** 막대 칸 이름표 글자 크기(화면 px). */
const BAR_TAG_PX = 12;
/** 막대 값 글자 크기(화면 px). */
const BAR_VALUE_PX = 14;
/** 막대 이름 글자 크기(화면 px). */
const BAR_NAME_PX = 12;
/** `traceRay` 가 렌즈 뒤로 뻗는 길이(월드). 줄 끝보다 넉넉하면 된다 — 뒤는 x 로 자른다. */
const TRACE_LENGTH = 30;

/** 볼록 렌즈 반두께 — 가운데가 두껍고 가장자리로 갈수록 얇다. */
function convexHalf(y: number): number {
  return CONVEX_EDGE_HALF + (CONVEX_CENTER_HALF - CONVEX_EDGE_HALF) * (1 - (y / LENS_HALF) ** 2);
}

/** 오목 렌즈 반두께 — 가운데가 얇고 가장자리로 갈수록 두껍다. */
function concaveHalf(y: number): number {
  return CONCAVE_CENTER_HALF + (CONCAVE_EDGE_HALF - CONCAVE_CENTER_HALF) * (y / LENS_HALF) ** 2;
}

/** 렌즈 윤곽 다각형 — 가운데 (cx, cy), 오른쪽 면을 위에서 아래로, 왼쪽 면을 아래에서 위로. */
function lensOutline(cx: number, cy: number, half: (y: number) => number): Vec2[] {
  const right: Vec2[] = [];
  const left: Vec2[] = [];
  for (let i = 0; i <= LENS_SAMPLES; i++) {
    const y = LENS_HALF - (2 * LENS_HALF * i) / LENS_SAMPLES;
    right.push([cx + half(y), cy + y]);
  }
  for (let i = 0; i <= LENS_SAMPLES; i++) {
    const y = -LENS_HALF + (2 * LENS_HALF * i) / LENS_SAMPLES;
    left.push([cx - half(y), cy + y]);
  }
  return [...right, ...left];
}

/** 닫힌 다각형의 모든 변. */
function allEdges(points: readonly Vec2[]): (readonly [number, number])[] {
  return points.map((_, i) => [i, (i + 1) % points.length] as const);
}

/** 가로 [x0, x1] · 세로 [y0, y1] 사각형. */
function rect(x0: number, x1: number, y0: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

export function scene(params: {
  state: LensCombinationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('lens-combination: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  const guides: Primitive[] = [];
  const bars: Primitive[] = [];
  const lenses: Primitive[] = [];
  const rays: Primitive[] = [];
  const marks: Primitive[] = [];
  const labels: Primitive[] = [];

  const two = attachTwo(timeline);
  const concave = attachConcave(timeline);

  // ---- 광축 ----
  guides.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [AXIS_FROM_X, 0],
      [AXIS_TO_X, 0],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // ---- 렌즈 ----
  // L₁ 은 오른쪽 면 가운데가 x = 0 에 닿는다. 붙는 렌즈는 그 오른쪽에 맞닿는다.
  const lensOneX = -CONVEX_CENTER_HALF;
  const lensTwoX = CONVEX_CENTER_HALF;
  // 오목 렌즈는 가장자리가 두꺼우므로 가장자리끼리 닿게 둔다 — 가운데는 거의 닿는다.
  const concaveX = CONVEX_EDGE_HALF - CONVEX_CENTER_HALF + CONCAVE_EDGE_HALF;

  const lensOne = lensOutline(lensOneX, 0, convexHalf);
  lenses.push({
    type: 'region',
    id: 'lens-one',
    points: lensOne,
    fillOpacity: LENS_FILL,
    outline: allEdges(lensOne),
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  labels.push({
    type: 'readout',
    id: 'name-lens-one',
    anchor: { world: [-LENS_LABEL_SPREAD, LENS_HALF + LENS_LABEL_GAP] },
    text: text('label.lensOne'),
    chip: false,
    font: 'text',
    fontSize: LENS_LABEL_PX,
    align: 'center',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  const incoming: readonly { id: string; x: number; share: number; half: (y: number) => number }[] = [
    { id: 'two', x: lensTwoX, share: two, half: convexHalf },
    { id: 'concave', x: concaveX, share: concave, half: concaveHalf },
  ];
  for (const lens of incoming) {
    if (lens.share <= 0) continue;
    const lift = LENS_DROP * (1 - lens.share);
    const outline = lensOutline(lens.x, lift, lens.half);
    lenses.push({
      type: 'region',
      id: `lens-${lens.id}`,
      points: outline,
      fillOpacity: LENS_FILL,
      outline: allEdges(outline),
      opacity: lens.share,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    labels.push({
      type: 'readout',
      id: `name-lens-${lens.id}`,
      anchor: { world: [LENS_LABEL_SPREAD, lift + LENS_HALF + LENS_LABEL_GAP] },
      text: text('label.lensTwo'),
      chip: false,
      font: 'text',
      fontSize: LENS_LABEL_PX,
      align: 'center',
      opacity: lens.share,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 줄기 ----
  // 맞닿은 두 렌즈는 굴절력이 더해진 얇은 렌즈 하나처럼 꺾는다. 그 렌즈를 x = 0 에 두고 쏜다.
  const combo = rayCombo(timeline);
  const focalWorld = comboFocalCm(c, combo) / c.cmPerUnit;
  const endX = focalWorld + RAY_OVERSHOOT;
  const frontX = postReach(timeline) * endX;
  const element: OpticalElement = {
    type: 'opticalElement',
    id: 'combined-lens',
    subtype: 'lens-thin',
    pos: [0, 0],
    orientation: 0,
    size: LENS_HALF * 2,
    focalLength: focalWorld,
  };
  for (const [i, off] of rayOffsets(c).entries()) {
    const traced = traceRay([RAY_START_X, off], [1, 0], [element], {
      maxBounces: 1,
      maxLength: TRACE_LENGTH,
    });
    const shown = clipByX(traced.segments, RAY_START_X, frontX);
    if (shown.length >= 2) {
      rays.push({ type: 'ray', id: `ray-${i}`, segments: shown, showArrow: true });
    }
  }

  // ---- 초점 · 치수선 ----
  // 줄기 앞머리가 초점을 지나 끝에 닿는 동안 짙어진다 — 줄기가 모인 뒤에 뜬다.
  const shade = Math.min(1, Math.max(0, (frontX - focalWorld) / RAY_OVERSHOOT));
  if (shade > 0) {
    marks.push({
      type: 'body',
      id: 'focus',
      shape: 'circle',
      pos: [focalWorld, 0],
      size: FOCUS_DOT_RADIUS,
      fill: 'solid',
      outline: 'role',
      glow: false,
      opacity: shade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    marks.push({
      type: 'dimension',
      id: 'focus-distance',
      from: [0, DIMENSION_Y],
      to: [focalWorld, DIMENSION_Y],
      text: text('label.focusCm'),
      vars: { f: String(shownFocusCm(c, combo)) },
      opacity: shade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    // L₁ 하나일 때의 초점 자리 — 붙인 조합에서만 빈 고리로 남긴다.
    if (combo !== 'one') {
      marks.push({
        type: 'body',
        id: 'focus-one-ghost',
        shape: 'circle',
        pos: [c.focalOneCm / c.cmPerUnit, 0],
        size: FOCUS_DOT_RADIUS,
        fill: 'none',
        outline: 'role',
        glow: false,
        opacity: GHOST_OPACITY * shade,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // ---- 굴절력 막대 ----
  const scale = c.unitPerDioptre;
  const pOne = powerOf(c.focalOneCm);
  const pTwo = powerOf(c.focalSameCm) * two;
  // 오목은 음수 — 깎는 높이는 그 크기다.
  const pCut = -powerOf(c.focalConcaveCm) * concave;
  const x0 = BAR_X;
  const x1 = BAR_X + BAR_WIDTH;
  const topOne = BAR_BASE_Y + pOne * scale;
  const topTwo = topOne + pTwo * scale;
  const net = topTwo - pCut * scale;

  guides.push({
    type: 'trajectory',
    id: 'bar-base',
    points: [
      [x0 - BASE_OVERHANG, BAR_BASE_Y],
      [x1 + BASE_OVERHANG, BAR_BASE_Y],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  const blockOne = rect(x0, x1, BAR_BASE_Y, topOne);
  bars.push({
    type: 'region',
    id: 'bar-one',
    points: blockOne,
    fillOpacity: BAR_FILL,
    outline: allEdges(blockOne),
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  labels.push({
    type: 'readout',
    id: 'tag-bar-one',
    // 오목 칸이 덮은 몫을 빼고 남은 L₁ 칸의 가운데 — 깎는 칸의 이름표와 붙지 않는다.
    anchor: { world: [x0 - BAR_TAG_GAP, (BAR_BASE_Y + Math.min(topOne, net)) / 2] },
    text: text('label.lensOne'),
    chip: false,
    font: 'text',
    fontSize: BAR_TAG_PX,
    align: 'center',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  if (two > 0) {
    const blockTwo = rect(x0, x1, topOne, topTwo);
    bars.push({
      type: 'region',
      id: 'bar-two',
      points: blockTwo,
      fillOpacity: BAR_FILL,
      outline: allEdges(blockTwo),
      opacity: two,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
    labels.push({
      type: 'readout',
      id: 'tag-bar-two',
      anchor: { world: [x0 - BAR_TAG_GAP, (topOne + topTwo) / 2] },
      text: text('label.lensTwo'),
      chip: false,
      font: 'text',
      fontSize: BAR_TAG_PX,
      align: 'center',
      opacity: two,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  if (concave > 0) {
    // L₁ 칸 꼭대기에서 아래로 덮는 해칭 — 깎여 나간 몫이다.
    const blockCut = rect(x0, x1, net, topTwo);
    bars.push({
      type: 'region',
      id: 'bar-concave',
      points: blockCut,
      fill: 'hatch',
      fillOpacity: BAR_FILL,
      outline: allEdges(blockCut),
      opacity: concave,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
    labels.push({
      type: 'readout',
      id: 'tag-bar-concave',
      anchor: { world: [x0 - BAR_TAG_GAP, (net + topTwo) / 2] },
      text: text('label.lensTwo'),
      chip: false,
      font: 'text',
      fontSize: BAR_TAG_PX,
      align: 'center',
      opacity: concave,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 지금 합의 자리 — 꼭대기 표지선과 값 글자. 값 글자는 조합마다 정박값이고 붙음 몫으로 엇갈린다.
  marks.push({
    type: 'trajectory',
    id: 'bar-net',
    points: [
      [x0 - NET_TICK_OVERHANG, net],
      [x1 + NET_TICK_OVERHANG, net],
    ],
    width: NET_TICK_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  // 값 글자는 줄기를 추적하는 조합의 정박값 하나다. 초점 · 치수선과 함께 줄기가 모인 뒤에 뜬다 —
  // 막대가 자라는 동안 두 값을 엇갈려 띄우면 글자가 겹쳐 뭉개진다.
  if (shade > 0) {
    labels.push({
      type: 'readout',
      id: 'value-bar',
      anchor: { world: [x1 + BAR_VALUE_GAP, net] },
      text: text('label.powerD'),
      vars: { p: String(shownPowerD(c, combo)) },
      chip: false,
      font: 'mono',
      fontSize: BAR_VALUE_PX,
      align: 'center',
      opacity: shade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  labels.push({
    type: 'readout',
    id: 'name-bar',
    anchor: { world: [(x0 + x1) / 2, BAR_BASE_Y - BAR_NAME_DROP] },
    text: text('label.power'),
    chip: false,
    font: 'text',
    fontSize: BAR_NAME_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return [...guides, ...bars, ...lenses, ...rays, ...marks, ...labels];
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
