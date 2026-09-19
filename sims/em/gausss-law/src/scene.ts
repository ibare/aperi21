// ========================================================================
// gausss-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 전기력선은 `lineSet` 과 끝의 `vector`
// 촉, 닫힌 곡선 · 돌아온 쪽 · 들어옴 고리 · 기준선은 `trajectory`, 전하 · 도는 점 · 나감 점은
// `body`, 전하의 + 는 바탕색 `region`, 기준선 이름표는 `readout` 이다.
//
// 색은 뜻마다 하나다 — 전하 · 곡선 · 작은 그림은 먹색(`ink`), 전기력선은 `primary`, 기준선은
// 배경 정보라 `muted`. **강조색은 「센 교차」 한 가지 뜻에만** 쓴다 — 곡선 위의 교차 표식과
// 기둥의 점이 같은 것(센 하나)이다. 나감과 들어옴은 색이 아니라 모양으로 가른다 — 채운 점이
// 나감, 속 빈 고리가 들어옴이다 (S-piece).
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
  crossings,
  lineDirection,
  LOOP_IDS,
  loopShape,
  mixShape,
  readConstants,
  sampleLoop,
  tallyAt,
  walkAt,
  walkedPoints,
  type Crossing,
  type GausssLawConstants,
  type LoopShape,
  type SampledLoop,
} from './physics';
import {
  COLUMN_BASE_Y,
  COLUMN_FIRST_X,
  COLUMN_GAP,
  COLUMN_HEIGHT,
  DOT_PITCH,
  MINI_SCALE,
  MINI_Y,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { GausssLawState } from './state';

/** 전하 원의 반지름(월드), + 의 팔 반길이 · 굵기(월드). */
const CHARGE_RADIUS = 0.17;
const PLUS_ARM = 0.1;
const PLUS_STROKE = 0.035;

/** 전기력선 굵기(화면 px) · 짙기, 끝 촉의 길이(월드). */
const LINE_WIDTH_PX = 1.4;
const LINE_OPACITY = 0.75;
const HEAD_LENGTH = 0.22;

/** 곡선 — 모양이 바뀌는 중 · 다 센 뒤의 굵기, 도는 중 앞쪽(아직 안 돈 쪽)의 굵기 · 짙기, 돌아온 쪽의 굵기(화면 px). */
const LOOP_WIDTH_PX = 2.2;
const AHEAD_WIDTH_PX = 1.4;
const AHEAD_OPACITY = 0.45;
const WALKED_WIDTH_PX = 2.8;
/** 도는 점의 반지름(월드). */
const WALKER_RADIUS = 0.07;

/** 교차 표식 · 기둥 점의 반지름(월드)과 들어옴 고리의 굵기(화면 px) · 고리를 이루는 꼭짓점 수. */
const MARK_RADIUS = 0.085;
const RING_WIDTH_PX = 2;
const RING_SEGMENTS = 24;
/** 기둥에서 빠진 자리(들어옴이 지운 점)의 짙기. */
const GHOST_OPACITY = 0.7;

/** 기준선(0 · N)이 기둥 바깥으로 나가는 길이(월드) · 굵기(화면 px) · 이름표를 선 왼끝에서 띄우는 거리(월드). */
const RULE_OVERHANG = 0.28;
const RULE_WIDTH_PX = 1.2;
const RULE_LABEL_GAP = 0.18;
/** 기준선 이름표 글자 크기(화면 px). */
const SYMBOL_PX = 14;
/** 작은 그림의 선 굵기(화면 px) · 지금 세지 않는 곡선의 짙기. */
const MINI_WIDTH_PX = 1.2;
const MINI_IDLE_OPACITY = 0.45;

function ring(center: Vec2, radius: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < RING_SEGMENTS; i++) {
    const a = (i * 2 * Math.PI) / RING_SEGMENTS;
    pts.push([center[0] + radius * Math.cos(a), center[1] + radius * Math.sin(a)]);
  }
  return pts;
}

function rect(cx: number, cy: number, w: number, h: number): Vec2[] {
  return [
    [cx - w / 2, cy - h / 2],
    [cx + w / 2, cy - h / 2],
    [cx + w / 2, cy + h / 2],
    [cx - w / 2, cy + h / 2],
  ];
}

/** 센 하나 — 나감은 채운 점, 들어옴(또는 들어옴이 지운 자리)은 속 빈 고리. */
function mark(out: Primitive[], id: string, pos: Vec2, filled: boolean, opacity: number): void {
  if (filled) {
    out.push({
      type: 'body',
      id,
      pos,
      shape: 'circle',
      size: MARK_RADIUS,
      glow: false,
      outline: 'background',
      opacity,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    return;
  }
  out.push({
    type: 'trajectory',
    id,
    points: ring(pos, MARK_RADIUS),
    closed: true,
    width: RING_WIDTH_PX,
    opacity,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
}

function columnX(k: number): number {
  return COLUMN_FIRST_X + k * COLUMN_GAP;
}

/** 곡선 하나의 기둥 — 알짜만큼 채운 점, 올랐다가 빠진 자리는 속 빈 고리. */
function column(
  out: Primitive[],
  k: number,
  list: readonly Crossing[],
  f: number,
  pitch: number,
  alpha: number,
): void {
  const { net, peak } = tallyAt(list, f);
  const x = columnX(k);
  for (let j = 1; j <= peak; j++) {
    const pos: Vec2 = [x, COLUMN_BASE_Y + (j - 0.5) * pitch];
    const kept = j <= net;
    mark(out, `tally-${k}-${j}`, pos, kept, (kept ? 1 : GHOST_OPACITY) * alpha);
  }
}

/** 기둥 아래 작은 곡선 그림 — 전하 점과 곡선을 함께 줄여 기둥 가운데 아래에 둔다. */
function miniature(out: Primitive[], k: number, loop: SampledLoop, lit: boolean, alpha: number): void {
  const pts = loop.points.slice(0, -1).map(([px, py]): Vec2 => [px * MINI_SCALE, py * MINI_SCALE]);
  const xs = [0, ...pts.map((p) => p[0])];
  const ys = [0, ...pts.map((p) => p[1])];
  const dx = columnX(k) - (Math.min(...xs) + Math.max(...xs)) / 2;
  const dy = MINI_Y - (Math.min(...ys) + Math.max(...ys)) / 2;
  const opacity = (lit ? 1 : MINI_IDLE_OPACITY) * alpha;
  out.push({
    type: 'trajectory',
    id: `mini-loop-${k}`,
    points: pts.map(([px, py]): Vec2 => [px + dx, py + dy]),
    closed: true,
    width: MINI_WIDTH_PX,
    opacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: `mini-charge-${k}`,
    pos: [dx, dy],
    shape: 'point',
    opacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
}

/** 지금 곡선의 모양과 그것이 어느 곡선(가장 최근에 넘어온 곡선)인지. */
function currentShape(
  tl: TimelineFrame,
  c: GausssLawConstants,
): { shape: LoopShape; active: number; morphing: boolean } {
  let shape = loopShape(LOOP_IDS[0], c);
  let active = 0;
  let morphing = false;
  for (let k = 1; k < LOOP_IDS.length; k++) {
    const id = LOOP_IDS[k]!;
    const f = tl.at(`morph-${id}`);
    if (f <= 0) break;
    shape = mixShape(loopShape(LOOP_IDS[k - 1]!, c), loopShape(id, c), f);
    active = k;
    morphing = tl.phase === `morph-${id}`;
  }
  return { shape, active, morphing };
}

export function scene(params: {
  state: GausssLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('gausss-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];
  // 다음 주기로 넘어가며 흐려지는 정도.
  const alpha = 1 - tl.at('fade');

  const loops = LOOP_IDS.map((id) => sampleLoop(loopShape(id, c), c));
  const lists = loops.map((l) => crossings(l, c));

  // 기둥 점 간격 — 가장 높이 오르는 기둥이 자리 안에 들도록 넘치면 좁힌다 (원칙 6).
  const tallest = Math.max(c.lines, ...lists.map((l) => tallyAt(l, 1).peak));
  const pitch = Math.min(DOT_PITCH, COLUMN_HEIGHT / tallest);

  // ---- 전기력선 ----
  // 전하 둘레에서 곧게 뻗는다. 끝의 촉이 방향(밖으로)을 말한다 — 나감 · 들어옴은 이 방향으로 가른다.
  const lines: Vec2[][] = [];
  for (let k = 0; k < c.lines; k++) {
    const [dx, dy] = lineDirection(k, c);
    lines.push([
      [dx * CHARGE_RADIUS, dy * CHARGE_RADIUS],
      [dx * c.reach, dy * c.reach],
    ]);
  }
  out.push({
    type: 'lineSet',
    id: 'field-lines',
    lines,
    width: LINE_WIDTH_PX,
    opacity: LINE_OPACITY,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  for (let k = 0; k < c.lines; k++) {
    const [dx, dy] = lineDirection(k, c);
    out.push({
      type: 'vector',
      id: `line-head-${k}`,
      from: [dx * (c.reach - HEAD_LENGTH), dy * (c.reach - HEAD_LENGTH)],
      delta: [dx * HEAD_LENGTH, dy * HEAD_LENGTH],
      width: LINE_WIDTH_PX,
      opacity: LINE_OPACITY,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // ---- 기준선 ----
  const ruleFrom = columnX(0) - MARK_RADIUS - RULE_OVERHANG;
  const ruleTo = columnX(LOOP_IDS.length - 1) + MARK_RADIUS + RULE_OVERHANG;
  const topY = COLUMN_BASE_Y + c.lines * pitch;
  out.push({
    type: 'trajectory',
    id: 'rule-zero',
    points: [
      [ruleFrom, COLUMN_BASE_Y],
      [ruleTo, COLUMN_BASE_Y],
    ],
    width: RULE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'rule-count',
    points: [
      [ruleFrom, topY],
      [ruleTo, topY],
    ],
    width: RULE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: 'rule-zero-label',
    anchor: { world: [ruleFrom - RULE_LABEL_GAP, COLUMN_BASE_Y] },
    text: text('label.zero'),
    chip: false,
    font: 'text',
    fontSize: SYMBOL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'rule-count-label',
    anchor: { world: [ruleFrom - RULE_LABEL_GAP, topY] },
    text: text('label.count'),
    vars: { n: state.lineCount },
    chip: false,
    font: 'text',
    fontSize: SYMBOL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 기둥과 작은 그림 ----
  LOOP_IDS.forEach((id, k) => {
    const counting = tl.phase === `count-${id}`;
    const reading = tl.phase === `read-${id}`;
    miniature(out, k, loops[k]!, counting || reading, alpha);
    const f = tl.at(`count-${id}`);
    if (!counting && f <= 0) return;
    column(out, k, lists[k]!, f, pitch, alpha);
  });

  // ---- 닫힌 곡선 ----
  const { shape, active, morphing } = currentShape(tl, c);
  const activeId = LOOP_IDS[active]!;
  const counting = tl.phase === `count-${activeId}`;
  const loop = morphing ? sampleLoop(shape, c) : loops[active]!;
  const f = tl.at(`count-${activeId}`);

  if (counting) {
    out.push({
      type: 'trajectory',
      id: 'loop',
      points: loop.points,
      closed: true,
      width: AHEAD_WIDTH_PX,
      opacity: AHEAD_OPACITY,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'trajectory',
      id: 'walked',
      points: walkedPoints(loop, f),
      width: WALKED_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  } else {
    out.push({
      type: 'trajectory',
      id: 'loop',
      points: loop.points,
      closed: true,
      width: LOOP_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 교차 표식 ----
  // 모양이 바뀌는 동안에는 세지 않는다 — 세는 것은 한 곡선을 한 바퀴 도는 동안이다.
  if (!morphing) {
    lists[active]!.forEach((x, i) => {
      if (x.at <= f) mark(out, `cross-${i}`, x.pos, x.sign > 0, alpha);
    });
  }

  // ---- 도는 점 ----
  if (counting) {
    out.push({
      type: 'body',
      id: 'walker',
      pos: walkAt(loop, f).pos,
      shape: 'circle',
      size: WALKER_RADIUS,
      glow: false,
      outline: 'background',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 전하 ----
  // 선의 뿌리를 덮는다. + 는 바탕색 칠이다(`region` opaque, 채움 0 — 바탕만 깔린다).
  out.push({
    type: 'body',
    id: 'charge',
    pos: [0, 0],
    shape: 'circle',
    size: CHARGE_RADIUS,
    glow: false,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'region',
    id: 'charge-plus-h',
    points: rect(0, 0, PLUS_ARM * 2, PLUS_STROKE),
    opaque: true,
    fillOpacity: 0,
    style: { colorRole: 'ink' },
  });
  out.push({
    type: 'region',
    id: 'charge-plus-v',
    points: rect(0, 0, PLUS_STROKE, PLUS_ARM * 2),
    opaque: true,
    fillOpacity: 0,
    style: { colorRole: 'ink' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
