// ========================================================================
// mechanical-advantage — 선언으로서의 장면
// ========================================================================
// 그리지 않는다, 선언한다 (원칙 1). 자유 렌더 0건.
//
// 바닥 · 같은 높이 선 · 밧줄 · 막대는 `trajectory`, 받침점 · 비탈은 `region`, 상자 ·
// 손은 `body`, 손의 힘은 `vector`, 민 거리 띠는 `trajectory` + 출발점 `trace`(tick),
// 글자는 `readout` 이다. 올린 정도는 시간표의 단계 진행도에서 읽는다.
//
// 강조색(`accent`)은 **민 거리 띠 하나에만** 쓴다. 손 · 화살표 · 수치 글자는 먹색이다
// (NOTES (a) 1).
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';

import {
  ARROW_HEAD,
  ARROW_WIDTH_PX,
  BAND_TICK,
  BAND_WIDTH_PX,
  BOX_S,
  FLOOR_WIDTH_PX,
  FLOOR_X,
  FULCRUM_HALF,
  HAND_R,
  NAME_Y,
  PLATFORM_W,
  READING_Y,
  RISE,
  ROD_WIDTH_PX,
  ROPE_WIDTH_PX,
  SAME_HEIGHT_FONT_PX,
  SAME_HEIGHT_LABEL_AT,
  SCENE_BOUNDS,
  TARGET_WIDTH_PX,
  TICK_WIDTH_PX,
  TOOL_FONT_PX,
  TOOLS,
  WEIGHT_FONT_PX,
  WEIGHT_N,
  text,
  type MechanicalAdvantageMessageKey,
} from './schema';
import { inclinePose, leverPose, liftPose, progress, reading, type Pose } from './physics';
import type { MechanicalAdvantageState } from './state';

/** 띠가 이보다 짧거나 옅으면 두지 않는다. 원본 0.5 px. */
const MIN_BAND = 0.005;
const MIN_FADE = 0.001;

const TOOL_NAME: Record<(typeof TOOLS)[number]['id'], MechanicalAdvantageMessageKey> = {
  lift: 'label.tool.lift',
  lever: 'label.tool.lever',
  incline: 'label.tool.incline',
};

function line(id: string, points: Vec2[], width: number, emphasis: 'strong' | 'medium'): Trajectory {
  return { type: 'trajectory', id, points, width, style: { colorRole: 'muted', emphasis } };
}

function bandLength(points: readonly Vec2[]): number {
  let sum = 0;
  for (let i = 1; i < points.length; i++) {
    sum += Math.hypot(points[i]![0] - points[i - 1]![0], points[i]![1] - points[i - 1]![1]);
  }
  return sum;
}

/** 손이 민 거리 — 강조색 띠와 출발점 눈금. 같은 모양을 세 번 쓴다. */
function band(id: string, pose: Pose, fade: number): Primitive[] {
  const { points, tickDir } = pose.band;
  if (fade < MIN_FADE || bandLength(points) < MIN_BAND) return [];
  const stroke: Trajectory = {
    type: 'trajectory',
    id: `${id}-band`,
    points,
    width: BAND_WIDTH_PX,
    opacity: fade,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  const tick: Trace = {
    type: 'trace',
    id: `${id}-band-start`,
    marks: [{ pos: points[0]! }],
    shape: 'tick',
    size: BAND_TICK,
    direction: tickDir,
    width: TICK_WIDTH_PX,
    opacity: fade,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  return [stroke, tick];
}

/** 120 N 상자 — 세 칸 모두 같은 색 · 같은 크기. */
function box(id: string, pose: Pose): Primitive[] {
  const body: Body = {
    type: 'body',
    id: `${id}-box`,
    pos: pose.boxCenter,
    shape: 'rect',
    size: [BOX_S, BOX_S],
    orientation: pose.boxAngle,
    outline: 'role',
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  const weight: Readout = {
    type: 'readout',
    id: `${id}-weight`,
    anchor: { world: pose.boxCenter },
    text: text('label.weight'),
    vars: { w: WEIGHT_N },
    chip: false,
    font: 'text',
    align: 'center',
    fontSize: WEIGHT_FONT_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  return [body, weight];
}

/** 손과 손의 힘. 먹색 — 강조색은 띠의 몫이다. */
function hand(id: string, pose: Pose): Primitive[] {
  const dot: Body = {
    type: 'body',
    id: `${id}-hand`,
    pos: pose.hand,
    shape: 'circle',
    size: HAND_R,
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  const force: Vector = {
    type: 'vector',
    id: `${id}-force`,
    from: pose.arrowFrom,
    delta: pose.arrowDelta,
    width: ARROW_WIDTH_PX,
    headSize: ARROW_HEAD,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  return [dot, force];
}

export function scene(params: {
  state: MechanicalAdvantageState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('mechanical-advantage: schema.timeline 이 선언되어야 한다');
  const { p, fade } = progress(timeline);
  const out: Primitive[] = [];

  // ---- 바닥 · 같은 높이 선 ----
  // 세 칸이 공유한다. "같은 상자, 같은 높이" 가 비교의 전제다.
  out.push(line('floor', [[FLOOR_X[0], 0], [FLOOR_X[1], 0]], FLOOR_WIDTH_PX, 'medium'));
  const target: Trajectory = {
    type: 'trajectory',
    id: 'same-height',
    points: [[FLOOR_X[0], RISE], [FLOOR_X[1], RISE]],
    width: TARGET_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  };
  const targetLabel: Readout = {
    type: 'readout',
    id: 'same-height-label',
    anchor: { world: SAME_HEIGHT_LABEL_AT },
    text: text('label.sameHeight'),
    vars: { h: RISE.toFixed(1) },
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: SAME_HEIGHT_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(target, targetLabel);

  // ---- 1. 그대로 들기 ----
  const lift = liftPose(p);
  out.push(...band('lift', lift, fade));
  out.push(line('lift-rope', [lift.ropeFrom, lift.hand], ROPE_WIDTH_PX, 'medium'));
  out.push(...box('lift', lift), ...hand('lift', lift));

  // ---- 2. 지레 ----
  const lever = leverPose(p);
  out.push(...band('lever', lever, fade));
  const fulcrum: Region = {
    type: 'region',
    id: 'lever-fulcrum',
    points: [lever.pivot, [lever.pivot[0] - FULCRUM_HALF, 0], [lever.pivot[0] + FULCRUM_HALF, 0]],
    fillOpacity: 0.7,
    opaque: true,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(fulcrum);
  out.push(line('lever-rod', [lever.boxEnd, lever.handEnd], ROD_WIDTH_PX, 'strong'));
  out.push(...box('lever', lever), ...hand('lever', lever));

  // ---- 3. 빗면 ----
  const incline = inclinePose(p);
  const slope: Region = {
    type: 'region',
    id: 'incline-slope',
    points: [
      incline.foot,
      incline.top,
      [incline.top[0] + PLATFORM_W, incline.top[1]],
      [incline.top[0] + PLATFORM_W, 0],
    ],
    fillOpacity: 0.16,
    outline: [[0, 1], [1, 2], [2, 3]],
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  out.push(slope);
  out.push(...band('incline', incline, fade));
  out.push(...box('incline', incline), ...hand('incline', incline));

  // ---- 도구별 힘과 민 거리 ----
  for (const tool of TOOLS) {
    const r = reading(tool.ratio, p);
    const name: Readout = {
      type: 'readout',
      id: `${tool.id}-name`,
      anchor: { world: [tool.cx, NAME_Y] },
      text: text(TOOL_NAME[tool.id]),
      chip: false,
      font: 'text',
      align: 'center',
      fontSize: TOOL_FONT_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    const values: Readout = {
      type: 'readout',
      id: `${tool.id}-reading`,
      anchor: { world: [tool.cx, READING_Y] },
      text: text('label.reading'),
      // 유효숫자는 주장의 일부다 — 힘은 정수, 거리는 소수 둘째 자리 고정 (원본 NOTES (c)).
      vars: { f: Math.round(r.force), d: r.distance.toFixed(2) },
      chip: false,
      font: 'text',
      align: 'center',
      fontSize: TOOL_FONT_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(name, values);
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계. 상자가 오르내려도 카메라가 흔들리지 않는다 (S-piece).
  return { ...SCENE_BOUNDS };
}
