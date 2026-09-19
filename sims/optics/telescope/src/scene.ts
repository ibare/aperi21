// ========================================================================
// telescope — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 두 렌즈는 `region` 이다. plugin `opticalElement` 는 두께가 고정이라(장부 G219) 접안렌즈를
//   바꿔 끼울 때 부푼 정도가 달라지는 것을 그리지 못한다. 줄기 경로는 `physics.ts` 가 이상적인
//   얇은 렌즈로 계산한다.
// - 줄기는 `ray`(plugin 강조색 하나) — 빛 한 가지 뜻이다.
// - 두 각은 같은 반지름의 `sector` 둘이다. 꼭짓점은 가운데 줄기가 광축을 지나는 두 자리다.
//   같은 색이다 — 같은 종류의 양(각)이라 색으로 가르지 않고, 크기와 나가는 호 안의
//   θ 칸 눈금(`trajectory`)으로 견준다 (S-piece).
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
import { geometry, markLong, markShort, rayHeights, rayPath, readConstants, swapShare, tickAngles } from './physics';
import {
  ARC_LABEL_GAP,
  ARC_RADIUS,
  AXIS_FROM_X,
  AXIS_TO_X,
  EYE_CENTER_HALF_LONG,
  EYE_CENTER_HALF_SHORT,
  EYE_EDGE_HALF,
  EYE_HALF,
  FOCAL_DIM_Y,
  FOCAL_PLANE_BOTTOM,
  FOCAL_PLANE_TOP,
  FOCUS_DOT_RADIUS,
  GAP_DIM_Y,
  LENS_LABEL_GAP,
  OBJECTIVE_CENTER_HALF,
  OBJECTIVE_EDGE_HALF,
  OBJECTIVE_HALF,
  RAY_PAST_ARC,
  SCENE_BOUNDS,
  TICK_LENGTH,
  text,
} from './schema';
import type { TelescopeState } from './state';

/** 광축 · 공통 초점면 보조선 굵기(화면 px). 재는 기준선이라 줄기보다 가늘다. */
const GUIDE_WIDTH_PX = 1;
/** θ 칸 눈금 굵기(화면 px). */
const TICK_WIDTH_PX = 1.5;
/** 렌즈 유리 채움 짙기. 지나가는 줄기가 비쳐 보이는 정도. */
const LENS_FILL = 0.22;
/** 각 호 채움 짙기. 아래 줄기가 비쳐 보이는 정도. */
const ARC_FILL = 0.2;
/** 각 호 테두리 굵기(화면 px). */
const ARC_RIM_PX = 2;
/** 렌즈 윤곽 한쪽 면을 자르는 마디 수. */
const LENS_SAMPLES = 18;
/** 렌즈 · 초점면 이름표 글자 크기(화면 px). */
const NAME_PX = 13;
/** 호 이름표(`θ` · `5θ`) 글자 크기(화면 px). */
const ARC_LABEL_PX = 15;
/** 치수선 값 글자 크기(화면 px). */
const VALUE_PX = 12;
/** 치수선 값 글자가 치수선 위로 뜬 거리(화면 px). */
const VALUE_RAISE_PX = 9;
/** 들어오는 호 이름표 `θ` 가 호 끝 아래로 내려간 거리(화면 px). 광축 선과 겹치지 않게. */
const THETA_DROP_PX = 13;

/** 대물렌즈 반두께 — 가운데가 두껍고 가장자리로 갈수록 얇다. */
function objectiveHalf(y: number): number {
  return OBJECTIVE_EDGE_HALF + (OBJECTIVE_CENTER_HALF - OBJECTIVE_EDGE_HALF) * (1 - (y / OBJECTIVE_HALF) ** 2);
}

/** 접안렌즈 반두께 — 가운데 반두께 `center` 에서 가장자리로 얇아진다. */
function eyeHalf(center: number): (y: number) => number {
  return (y) => EYE_EDGE_HALF + (center - EYE_EDGE_HALF) * (1 - (y / EYE_HALF) ** 2);
}

/** 렌즈 윤곽 다각형 — 가운데 x = cx, 반높이 `halfH`. 오른쪽 면을 위에서 아래로, 왼쪽 면을 아래에서 위로. */
function lensOutline(cx: number, halfH: number, half: (y: number) => number): Vec2[] {
  const right: Vec2[] = [];
  const left: Vec2[] = [];
  for (let i = 0; i <= LENS_SAMPLES; i++) {
    const y = halfH - (2 * halfH * i) / LENS_SAMPLES;
    right.push([cx + half(y), y]);
  }
  for (let i = 0; i <= LENS_SAMPLES; i++) {
    const y = -halfH + (2 * halfH * i) / LENS_SAMPLES;
    left.push([cx - half(y), y]);
  }
  return [...right, ...left];
}

/** 닫힌 다각형의 모든 변. */
function allEdges(points: readonly Vec2[]): (readonly [number, number])[] {
  return points.map((_, i) => [i, (i + 1) % points.length] as const);
}

/** 중심 `c` 에서 각 `a`(라디안) 방향으로 `r` 떨어진 점. */
function polar(c: Vec2, r: number, a: number): Vec2 {
  return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
}

export function scene(params: {
  state: TelescopeState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('telescope: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  const share = swapShare(timeline);
  const g = geometry(c, share);
  const longShade = markLong(timeline);
  const shortShade = markShort(timeline);
  const exitPoint: Vec2 = [g.exitX, 0];

  const guides: Primitive[] = [];
  const arcs: Primitive[] = [];
  const lenses: Primitive[] = [];
  const rays: Primitive[] = [];
  const ticks: Primitive[] = [];
  const marks: Primitive[] = [];
  const labels: Primitive[] = [];

  // ---- 광축 · 공통 초점면 ----
  guides.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [AXIS_FROM_X, 0],
      [AXIS_TO_X, 0],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  guides.push({
    type: 'trajectory',
    id: 'focal-plane',
    points: [
      [g.fo, FOCAL_PLANE_BOTTOM],
      [g.fo, FOCAL_PLANE_TOP],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  labels.push({
    type: 'readout',
    id: 'name-focus',
    anchor: { world: [g.fo, FOCAL_PLANE_TOP + LENS_LABEL_GAP] },
    text: text('label.focus'),
    chip: false,
    font: 'text',
    fontSize: NAME_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 두 각 호 ----
  // 들어오는 호 — 대물렌즈 가운데에서 왼쪽 광축과 들어오는 가운데 줄기 사이.
  arcs.push({
    type: 'sector',
    id: 'arc-in',
    center: [0, 0],
    radius: ARC_RADIUS,
    from: Math.PI,
    to: Math.PI + g.theta,
    fillOpacity: ARC_FILL,
    rimWidth: ARC_RIM_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  labels.push({
    type: 'readout',
    id: 'label-arc-in',
    anchor: { world: polar([0, 0], ARC_RADIUS, Math.PI + g.theta), offset: [0, THETA_DROP_PX] },
    text: text('label.theta'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: ARC_LABEL_PX,
    align: 'center',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 나가는 호 — 가운데 줄기가 광축을 다시 지나는 자리에서 오른쪽 광축과 그 줄기 사이.
  // 줄기는 아래로 기운다. 나간 다발이 호 가장자리를 가운데 두고 양쪽으로 걸친다.
  arcs.push({
    type: 'sector',
    id: 'arc-out',
    center: exitPoint,
    radius: ARC_RADIUS,
    from: 0,
    to: -g.phi,
    fillOpacity: ARC_FILL,
    rimWidth: ARC_RIM_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  // θ 칸 눈금 — 들어오는 기울기의 몇 배인지 칸으로 센다. 줄기 위에 긋는다.
  for (const [i, a] of tickAngles(g).entries()) {
    ticks.push({
      type: 'trajectory',
      id: `tick-${i}`,
      points: [
        polar(exitPoint, ARC_RADIUS - TICK_LENGTH / 2, -a),
        polar(exitPoint, ARC_RADIUS + TICK_LENGTH / 2, -a),
      ],
      width: TICK_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  // 이름표는 호 바깥 가운데 각에 — 나간 다발은 호 가장자리에 걸쳐 있어 가운데 각은 비어 있다.
  const multipleAt = polar(exitPoint, ARC_RADIUS + ARC_LABEL_GAP, -g.phi / 2);
  const multiples: readonly { id: string; m: number; shade: number }[] = [
    { id: 'long', m: c.shownMagLong, shade: longShade },
    { id: 'short', m: c.shownMagShort, shade: shortShade },
  ];
  for (const mm of multiples) {
    if (mm.shade <= 0) continue;
    labels.push({
      type: 'readout',
      id: `label-arc-out-${mm.id}`,
      anchor: { world: multipleAt },
      text: text('label.multiple'),
      vars: { m: String(mm.m) },
      chip: false,
      font: 'text',
      italic: true,
      fontSize: ARC_LABEL_PX,
      align: 'center',
      opacity: mm.shade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 렌즈 ----
  const objective = lensOutline(0, OBJECTIVE_HALF, objectiveHalf);
  lenses.push({
    type: 'region',
    id: 'objective',
    points: objective,
    fillOpacity: LENS_FILL,
    outline: allEdges(objective),
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const eyeCenterHalf = EYE_CENTER_HALF_LONG + (EYE_CENTER_HALF_SHORT - EYE_CENTER_HALF_LONG) * share;
  const eyepiece = lensOutline(g.eyeX, EYE_HALF, eyeHalf(eyeCenterHalf));
  lenses.push({
    type: 'region',
    id: 'eyepiece',
    points: eyepiece,
    fillOpacity: LENS_FILL,
    outline: allEdges(eyepiece),
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  labels.push({
    type: 'readout',
    id: 'name-objective',
    anchor: { world: [0, OBJECTIVE_HALF + LENS_LABEL_GAP] },
    text: text('label.objective'),
    chip: false,
    font: 'text',
    fontSize: NAME_PX,
    align: 'center',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  labels.push({
    type: 'readout',
    id: 'name-eyepiece',
    anchor: { world: [g.eyeX, -EYE_HALF - LENS_LABEL_GAP] },
    text: text('label.eyepiece'),
    chip: false,
    font: 'text',
    fontSize: NAME_PX,
    align: 'center',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 줄기 · 초점 ----
  const rayEndX = g.exitX + ARC_RADIUS + RAY_PAST_ARC;
  for (const [i, h] of rayHeights(c).entries()) {
    rays.push({ type: 'ray', id: `ray-${i}`, segments: rayPath(g, h, rayEndX), showArrow: true });
  }
  marks.push({
    type: 'body',
    id: 'focus',
    shape: 'circle',
    pos: g.focus,
    size: FOCUS_DOT_RADIUS,
    fill: 'solid',
    outline: 'role',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 치수선 — 대물 초점 거리 · 접안 초점 거리 · 간격 ----
  const dims: readonly { id: string; from: Vec2; to: Vec2 }[] = [
    { id: 'dim-objective', from: [0, FOCAL_DIM_Y], to: [g.fo, FOCAL_DIM_Y] },
    { id: 'dim-eyepiece', from: [g.fo, FOCAL_DIM_Y], to: [g.eyeX, FOCAL_DIM_Y] },
    { id: 'dim-gap', from: [0, GAP_DIM_Y], to: [g.eyeX, GAP_DIM_Y] },
  ];
  for (const d of dims) {
    marks.push({ type: 'dimension', id: d.id, from: d.from, to: d.to });
  }
  // 값 글자 — 정박값이다. 대물은 늘, 접안 · 간격은 그 접안이 끼워져 있을 때만 짙다.
  const values: readonly { id: string; at: Vec2; v: number; shade: number }[] = [
    { id: 'objective', at: [g.fo / 2, FOCAL_DIM_Y], v: c.shownFocalObjectiveCm, shade: 1 },
    { id: 'eye-long', at: [(g.fo + g.eyeX) / 2, FOCAL_DIM_Y], v: c.shownFocalEyeLongCm, shade: longShade },
    { id: 'eye-short', at: [(g.fo + g.eyeX) / 2, FOCAL_DIM_Y], v: c.shownFocalEyeShortCm, shade: shortShade },
    { id: 'gap-long', at: [g.eyeX / 2, GAP_DIM_Y], v: c.shownGapLongCm, shade: longShade },
    { id: 'gap-short', at: [g.eyeX / 2, GAP_DIM_Y], v: c.shownGapShortCm, shade: shortShade },
  ];
  for (const v of values) {
    if (v.shade <= 0) continue;
    labels.push({
      type: 'readout',
      id: `value-${v.id}`,
      anchor: { world: v.at, offset: [0, -VALUE_RAISE_PX] },
      text: text('label.cm'),
      vars: { v: String(v.v) },
      chip: false,
      font: 'mono',
      fontSize: VALUE_PX,
      align: 'center',
      opacity: v.shade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return [...guides, ...arcs, ...lenses, ...rays, ...ticks, ...marks, ...labels];
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
