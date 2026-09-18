// ========================================================================
// diurnal-motion — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽 — 북쪽 하늘 창. 별이 지나온 원호(lineSet) · 별(particleSystem) · 북두칠성과
// 카시오페이아의 선(lineSet, 시작 자리는 옅게) · 북극성(강조색) · 지평선 아래를 가리는 땅(region).
// 오른쪽 — 흐른 시간 눈금판(sector). 바늘이 하늘과 같은 쪽으로 같은 각만큼 돈다.
// 캡션은 선언의 캡션 슬롯이 그린다.
//
// 색 — 별 · 궤적 · 글자는 역할 색이다. 밝기가 주장이 아니라 **길의 모양**이 주장이라 빛 채널을
// 쓰지 않았다(별 지도처럼 라이트에서는 짙은 점, 다크에서는 밝은 점). 강조색은 북극성 하나에만 —
// 모든 원의 가운데라는 뜻이다.
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
  BIG_DIPPER,
  BIG_DIPPER_LINES,
  CASSIOPEIA,
  CASSIOPEIA_LINES,
  CONSTELLATION_LABEL_INSET,
  DIAL,
  GROUND_LABEL_Y,
  GROUND_SIDE_X,
  POLARIS,
  SCENE_BOUNDS,
  SKY,
  SKY_TITLE_Y,
  TRAIL_STEP_DEG,
  text,
  type DiurnalMotionMessageKey,
} from './schema';
import {
  backgroundStars,
  catalogToSky,
  elapsedHours,
  horizonCurve,
  readConstants,
  skyPoint,
  starAt,
  trailOf,
  turnAngle,
  type DiurnalMotionConstants,
  type SkyStar,
} from './physics';
import type { DiurnalMotionState } from './state';

/** 선 굵기(화면 px). 위계라 배율을 따르지 않는다. */
const TRAIL_WIDTH_PX = 0.9;
const FIGURE_TRAIL_WIDTH_PX = 1.8;
const FIGURE_WIDTH_PX = 1.2;
const FRAME_WIDTH_PX = 1;
const HORIZON_WIDTH_PX = 1.6;
const DIAL_RIM_PX = 1;
const DIAL_SWEEP_PX = 2.5;
const DIAL_HAND_PX = 2;
/** 글자 크기(화면 px). */
const LABEL_FONT_PX = 13;
const SMALL_FONT_PX = 12;
/** 북극성 점 크기(화면 px). */
const POLARIS_SIZE_PX = 4;
/** 시작 자리의 별자리 선 — 지금 자리보다 옅게. */
const START_FIGURE_OPACITY = 0.5;
/** 지평선을 표본하는 각 간격(도). */
const HORIZON_STEP_DEG = 1;
/** 땅 칠 — 옅게, 그러나 아래 것을 가린다. */
const GROUND_FILL = 0.22;
/** 다이얼이 지난 각을 칠하는 채움 불투명도 — 옅게. */
const DIAL_SWEEP_FILL = 0.16;
/** 북극성 이름표를 점 위로 띄우는 거리(화면 px). */
const POLARIS_LABEL_RISE_PX = 16;

const HALF = Math.PI / 2;

/** 하늘 창 — 별 · 궤적 · 땅이 이 사각형 밖으로 나가지 않는다. */
const SKY_CLIP = { min: [SKY.minX, SKY.minY] as Vec2, max: [SKY.maxX, SKY.maxY] as Vec2 };

function onCircle(cx: number, cy: number, r: number, a: number): Vec2 {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

/** 별자리 선 — 별 자리 목록에서 선 목록으로. */
function figureLines(pos: readonly Vec2[], lines: readonly (readonly number[])[]): Vec2[][] {
  return lines.map((idx) => idx.map((i) => pos[i]!));
}

/** 별자리 이름표 자리 — 별자리 가운데에서 북극 쪽으로 당긴 자리. 이름표도 하늘과 함께 돈다. */
function labelSpot(stars: readonly SkyStar[], turn: number): Vec2 {
  let p = 0;
  let sx = 0;
  let sy = 0;
  for (const s of stars) {
    p += s.p;
    sx += Math.cos(s.h0);
    sy += Math.sin(s.h0);
  }
  const h = Math.atan2(sy, sx);
  return skyPoint(p / stars.length - CONSTELLATION_LABEL_INSET, h + turn);
}

/** 별자리 하나 — 시작 자리(옅게) · 지금 자리의 선 · 이름표. */
function constellation(
  out: Primitive[],
  id: string,
  stars: readonly SkyStar[],
  lines: readonly (readonly number[])[],
  label: DiurnalMotionMessageKey,
  turn: number,
  trailOpacity: number,
): void {
  out.push({
    type: 'lineSet',
    id: `${id}-start`,
    lines: figureLines(
      stars.map((s) => starAt(s, 0)),
      lines,
    ),
    width: FIGURE_WIDTH_PX,
    opacity: START_FIGURE_OPACITY * trailOpacity,
    clip: SKY_CLIP,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });
  out.push({
    type: 'lineSet',
    id: `${id}-now`,
    lines: figureLines(
      stars.map((s) => starAt(s, turn)),
      lines,
    ),
    width: FIGURE_WIDTH_PX,
    clip: SKY_CLIP,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });
  out.push({
    type: 'readout',
    id: `${id}-label`,
    anchor: { world: labelSpot(stars, turn) },
    text: text(label),
    chip: true,
    font: 'text',
    fontSize: SMALL_FONT_PX,
    clip: SKY_CLIP,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });
}

/** 흐른 시간 눈금판. 바늘은 위(저녁)에서 출발해 하늘과 같은 쪽(시계 반대)으로 돈다. */
function dial(out: Primitive[], turn: number, fade: number): void {
  const center: Vec2 = [DIAL.cx, DIAL.cy];
  out.push({
    type: 'sector',
    id: 'dial-face',
    center,
    radius: DIAL.R,
    from: 0,
    to: 2 * Math.PI,
    fillOpacity: 0,
    rimWidth: DIAL_RIM_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  if (turn > 0) {
    out.push({
      type: 'sector',
      id: 'dial-sweep',
      center,
      radius: DIAL.R,
      from: HALF,
      to: HALF + turn,
      fillOpacity: DIAL_SWEEP_FILL,
      rimWidth: DIAL_SWEEP_PX,
      opacity: fade,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
  }
  // 네 눈금 — 저녁(위) · 자정(왼쪽) · 새벽(아래) · 정오(오른쪽). 하늘이 도는 쪽으로 6 시간마다.
  const marks: { a: number; key: DiurnalMotionMessageKey; id: string }[] = [
    { a: HALF, key: 'label.dusk', id: 'dial-dusk' },
    { a: HALF + HALF, key: 'label.midnight', id: 'dial-midnight' },
    { a: HALF + 2 * HALF, key: 'label.dawn', id: 'dial-dawn' },
    { a: HALF + 3 * HALF, key: 'label.noon', id: 'dial-noon' },
  ];
  out.push({
    type: 'lineSet',
    id: 'dial-ticks',
    lines: marks.map((m) => [
      onCircle(DIAL.cx, DIAL.cy, DIAL.R - DIAL.tick, m.a),
      onCircle(DIAL.cx, DIAL.cy, DIAL.R, m.a),
    ]),
    width: DIAL_RIM_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  for (const m of marks) {
    out.push({
      type: 'readout',
      id: m.id,
      anchor: { world: onCircle(DIAL.cx, DIAL.cy, DIAL.R + DIAL.labelGap, m.a) },
      text: text(m.key),
      chip: false,
      font: 'text',
      fontSize: SMALL_FONT_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'trajectory',
    id: 'dial-hand',
    points: [center, onCircle(DIAL.cx, DIAL.cy, DIAL.R, HALF + turn)],
    width: DIAL_HAND_PX,
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'dial-title',
    anchor: { world: [DIAL.cx, DIAL.titleY] },
    text: text('label.elapsed'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
}

export function scene(params: {
  state: DiurnalMotionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('diurnal-motion: schema.timeline 이 선언되어야 한다');
  const c: DiurnalMotionConstants = readConstants(stage);

  const hours = elapsedHours(timeline, c);
  const turn = turnAngle(hours, c);
  // 한 바퀴를 보인 뒤 궤적을 비운다 — 별 자리는 하루 뒤 제자리라 다음 주기와 이어진다.
  const fade = 1 - timeline.at('reset');

  const background = backgroundStars(c);
  const dipper = BIG_DIPPER.map((s) => catalogToSky(s, c));
  const cassiopeia = CASSIOPEIA.map((s) => catalogToSky(s, c));
  const polaris = catalogToSky(POLARIS, c);
  const allStars = [...background, ...dipper, ...cassiopeia];

  const out: Primitive[] = [];

  // ---- 창 제목 — 관측 위도는 스테이지 상수 그대로 ----
  out.push({
    type: 'readout',
    id: 'sky-title',
    anchor: { world: [(SKY.minX + SKY.maxX) / 2, SKY_TITLE_Y] },
    text: text('label.skyTitle'),
    vars: { lat: String(c.latitude) },
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 별이 지나온 길 — 모두 북극을 가운데 둔 원호, 모두 같은 각 ----
  // 같은 대상이라 같은 색이다. 별자리 두 무리의 원호만 굵기로 앞세운다 — 흩뿌린 별의 원호는
  // 서로 이어져 온전한 원처럼 읽히지만, 한 무리의 원호 다발은 모두 같은 각에서 끊긴 것이 보인다.
  if (turn > 0 && fade > 0) {
    out.push({
      type: 'lineSet',
      id: 'trails',
      lines: [...background, polaris].map((s) => trailOf(s, turn, TRAIL_STEP_DEG)),
      width: TRAIL_WIDTH_PX,
      opacity: fade,
      clip: SKY_CLIP,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'lineSet',
      id: 'figure-trails',
      lines: [...dipper, ...cassiopeia].map((s) => trailOf(s, turn, TRAIL_STEP_DEG)),
      width: FIGURE_TRAIL_WIDTH_PX,
      opacity: fade,
      clip: SKY_CLIP,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 별자리 — 시작 자리(옅게)와 지금 자리. 모양이 그대로다 ----
  constellation(out, 'big-dipper', dipper, BIG_DIPPER_LINES, 'label.bigDipper', turn, fade);
  constellation(out, 'cassiopeia', cassiopeia, CASSIOPEIA_LINES, 'label.cassiopeia', turn, fade);

  // ---- 별 — 지금 자리 ----
  out.push({
    type: 'particleSystem',
    id: 'stars',
    positions: allStars.map((s) => starAt(s, turn)),
    sizes: allStars.map((s) => s.size),
    clip: SKY_CLIP,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 북극성 — 모든 원의 가운데. 강조색은 이것 하나에만 ----
  const polarisPos = starAt(polaris, turn);
  out.push({
    type: 'particleSystem',
    id: 'polaris',
    positions: [polarisPos],
    sizes: POLARIS_SIZE_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'polaris-label',
    anchor: { world: [0, 0], offset: [0, -POLARIS_LABEL_RISE_PX] },
    text: text('label.polaris'),
    chip: true,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 땅 — 지평선 아래로 진 별과 궤적을 가린다 ----
  const horizon = horizonCurve(c, HORIZON_STEP_DEG);
  const ground: Vec2[] = [...horizon, [SKY.maxX + 1, SKY.minY - 1], [SKY.minX - 1, SKY.minY - 1]];
  out.push({
    type: 'region',
    id: 'ground',
    points: ground,
    fillOpacity: GROUND_FILL,
    opaque: true,
    clip: SKY_CLIP,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  // 지평선 선 — region 의 굵은 변(`outline`)은 굵기를 고를 수 없어 따로 긋는다 (장부 G18).
  out.push({
    type: 'trajectory',
    id: 'horizon',
    points: horizon,
    width: HORIZON_WIDTH_PX,
    clip: SKY_CLIP,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const groundLabels: { x: number; key: DiurnalMotionMessageKey; id: string }[] = [
    { x: -GROUND_SIDE_X, key: 'label.west', id: 'ground-west' },
    { x: 0, key: 'label.north', id: 'ground-north' },
    { x: GROUND_SIDE_X, key: 'label.east', id: 'ground-east' },
  ];
  for (const g of groundLabels) {
    out.push({
      type: 'readout',
      id: g.id,
      anchor: { world: [g.x, GROUND_LABEL_Y] },
      text: text(g.key),
      chip: false,
      font: 'text',
      fontSize: LABEL_FONT_PX,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
  }

  // ---- 창틀 ----
  out.push({
    type: 'trajectory',
    id: 'sky-frame',
    points: [
      [SKY.minX, SKY.minY],
      [SKY.maxX, SKY.minY],
      [SKY.maxX, SKY.maxY],
      [SKY.minX, SKY.maxY],
    ],
    closed: true,
    width: FRAME_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 흐른 시간 ----
  dial(out, turn, fade);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
