// ========================================================================
// rolling-without-slipping — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 바닥(surface) · 끌린
// 자국(region) · 바퀴 테와 자취와 속도 끝을 잇는 선(trajectory) · 바퀴살(lineSet) ·
// 축과 표시한 점과 접점 고리(body) · 속도 화살표(vector) · 이름표(readout).
//
// 색은 뜻마다 하나다 — 바퀴(테 · 살 · 축)는 먹색, 속도 화살표는 primary, 표시한 점과
// 그 자취는 secondary, 끌린 자국은 negative(마찰이 빼앗는 자리), 바닥 · 보조선은 muted.
// **강조색은 「바닥에 닿은 점」 한 뜻에만** — 접점 고리와 그 속도 0 표식.
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
import { isFrozen, readConstants, readWheel, sceneOpacity, type RollingConstants } from './physics';
import {
  ARROW_SCALE,
  COMPONENT_Y,
  CONTACT_RING_RADIUS,
  HUB_RADIUS,
  LANE_LABEL_X,
  LANE_ROLL_Y,
  LANE_SLIP_Y,
  MARK_RADIUS,
  SCENE_BOUNDS,
  SKID_THICKNESS,
  text,
  type RollingWithoutSlippingMessageKey,
} from './schema';
import type { RollingWithoutSlippingState } from './state';

/** 테 원을 이루는 점 개수. */
const RIM_SEGMENTS = 72;
/** 바퀴살 수. 넷이면 도는 것이 읽히고 화살표를 덜 가린다. */
const SPOKES = 4;
/** 테 · 살 굵기(화면 px). 바퀴는 대상이지만 화살표보다 가늘어야 화살표가 읽힌다. */
const RIM_WIDTH = 2;
const SPOKE_WIDTH = 1.5;
/** 자취 굵기(화면 px)와 짙기. 지나온 길이라 표시한 점보다 물러나 있다. */
const TRACE_WIDTH = 1.5;
const TRACE_OPACITY = 0.75;
/** 화살표 끝을 잇는 보조선 굵기 · 짙기. 안내선이라 가장 가늘다. */
const TIP_LINE_WIDTH = 1;
const TIP_LINE_OPACITY = 0.7;
/** 끌린 자국 띠의 짙기. 다크 바탕에서도 바닥과 갈려야 한다. */
const SKID_FILL = 0.7;
/** 레인 이름표 글자 크기(화면 px). */
const LANE_LABEL_PX = 13;
/** 접점 속도 0 표식을 접점 아래로 내리는 거리(화면 px). */
const ZERO_OFFSET_PX = 16;
/** 이보다 짧은 속도(m/s)는 화살표를 긋지 않는다 — 머리만 남은 점이 「0」 을 가린다. */
const MIN_ARROW_SPEED = 1e-6;

/** 한 레인의 선언 — 바닥 높이, 도는 몫, 이름표. */
interface Lane {
  id: string;
  y: number;
  ratio: number;
  label: RollingWithoutSlippingMessageKey;
}

export function scene(params: {
  state: RollingWithoutSlippingState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('rolling-without-slipping: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const frozen = isFrozen(timeline);
  const out: Primitive[] = [];

  const lanes: Lane[] = [
    { id: 'roll', y: LANE_ROLL_Y, ratio: 1, label: 'label.laneRoll' },
    { id: 'slip', y: LANE_SLIP_Y, ratio: c.slipRatio, label: 'label.laneSlip' },
  ];

  for (const lane of lanes) {
    const w = readWheel(timeline, lane.y, lane.ratio, c);
    pushLane(out, lane, w, c, alpha, frozen);
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

function pushLane(
  out: Primitive[],
  lane: Lane,
  w: ReturnType<typeof readWheel>,
  c: RollingConstants,
  alpha: number,
  frozen: boolean,
): void {
  const id = (name: string): string => `${name}-${lane.id}`;

  // ---- 바닥 ----
  out.push({
    type: 'surface',
    id: id('floor'),
    geometry: { kind: 'wall', from: [SCENE_BOUNDS.minX, lane.y], to: [SCENE_BOUNDS.maxX, lane.y] },
    material: 'solid',
  });

  // ---- 레인 이름표 ----
  // 두 레인을 가르는 조건 하나. 수식 표기라 표식이다 (C1 판정 3).
  out.push({
    type: 'readout',
    id: id('lane-label'),
    anchor: { world: [LANE_LABEL_X, lane.y + c.radius] },
    text: text(lane.label),
    chip: false,
    fontSize: LANE_LABEL_PX,
    font: 'text',
    italic: true,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 끌린 자국 ----
  // 접점이 미끄러지는 바퀴만 바닥을 긁는다. 바퀴 **아래**로 깔려 바퀴가 그 위를 지나온
  // 것으로 읽힌다 (drawOrder: 'scene').
  if (w.skid) {
    const [x0, x1] = w.skid;
    out.push({
      type: 'region',
      id: id('skid'),
      points: [
        [x0, lane.y],
        [x1, lane.y],
        [x1, lane.y + SKID_THICKNESS],
        [x0, lane.y + SKID_THICKNESS],
      ],
      fillOpacity: SKID_FILL,
      opacity: alpha,
      style: { colorRole: 'negative', emphasis: 'strong' },
    });
  }

  // ---- 표시한 점의 자취 ----
  // 구르는 바퀴에서는 바닥에 닿는 자리에서 뾰족하게 꺾인다 — 그 순간 점이 멈춰 있어서다.
  out.push({
    type: 'trajectory',
    id: id('trace'),
    points: w.trace,
    width: TRACE_WIDTH,
    opacity: alpha * TRACE_OPACITY,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 바퀴 ----
  const [cx, cy] = w.center;
  const rim: Vec2[] = Array.from({ length: RIM_SEGMENTS }, (_, i) => {
    const a = (i / RIM_SEGMENTS) * Math.PI * 2;
    return [cx + c.radius * Math.cos(a), cy + c.radius * Math.sin(a)];
  });
  out.push({
    type: 'trajectory',
    id: id('rim'),
    points: rim,
    closed: true,
    width: RIM_WIDTH,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  // 바퀴살 — 하나는 표시한 점을 향한다. 도는 빠르기가 살의 돌아감으로 보인다.
  const spokes: Vec2[][] = Array.from({ length: SPOKES }, (_, j) => {
    const a = w.markAngle + (j / SPOKES) * Math.PI * 2;
    return [
      [cx, cy],
      [cx + c.radius * Math.cos(a), cy + c.radius * Math.sin(a)],
    ];
  });
  out.push({
    type: 'lineSet',
    id: id('spokes'),
    lines: spokes,
    width: SPOKE_WIDTH,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: id('hub'),
    pos: w.center,
    shape: 'circle',
    size: HUB_RADIUS,
    outline: 'none',
    glow: false,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 접점 고리 ----
  // 강조색의 유일한 뜻. 두 레인 모두 같은 모양 — 다른 것은 그 점의 속도뿐이다.
  out.push({
    type: 'body',
    id: id('contact'),
    pos: w.contact,
    shape: 'circle',
    size: CONTACT_RING_RADIUS,
    fill: 'none',
    outline: 'role',
    opacity: alpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 표시한 점 ----
  // 바퀴살 위 · 접점 고리 안에 온다. 닿는 순간 고리 속에 들어가 멈춘다.
  out.push({
    type: 'body',
    id: id('mark'),
    pos: w.mark,
    shape: 'circle',
    size: MARK_RADIUS,
    outline: 'background',
    glow: false,
    opacity: alpha,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 수직 지름 위 세 점의 속도 ----
  // 모두 가로다. 길이는 속도에 비례해, 구르는 바퀴에서는 꼭대기 2v · 중심 v · 접점 0 이
  // 한 직선 위에 선다. 그 직선이 접점을 지난다는 것이 「바퀴는 그 순간 접점을 축으로
  // 돈다」 는 모양이다.
  const arrows: { at: Vec2; speed: number; label: RollingWithoutSlippingMessageKey; key: string }[] = [
    { at: [cx, lane.y + 2 * c.radius], speed: w.topSpeed, label: 'label.top', key: 'top' },
    { at: w.center, speed: w.centerSpeed, label: 'label.center', key: 'center' },
    { at: w.contact, speed: w.contactSpeed, label: 'label.bottom', key: 'bottom' },
  ];
  const tips: Vec2[] = arrows.map((a) => [a.at[0] + a.speed * ARROW_SCALE, a.at[1]]);
  out.push({
    type: 'trajectory',
    id: id('tip-line'),
    points: [tips[2]!, tips[0]!],
    width: TIP_LINE_WIDTH,
    opacity: alpha * TIP_LINE_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  for (const a of arrows) {
    if (Math.abs(a.speed) < MIN_ARROW_SPEED) continue;
    // 접점 화살표의 이름은 바닥 **아래**로 — 위에 두면 바퀴 테 · 표시한 점과 겹친다.
    // 다른 레인의 「0」 과 같은 자리라 두 접점의 속도를 같은 줄에서 읽는다.
    out.push({
      type: 'vector',
      id: id(`v-${a.key}`),
      from: a.at,
      delta: [a.speed * ARROW_SCALE, 0],
      label: text(a.label),
      labelSide: a.key === 'bottom' ? 'cw' : 'ccw',
      outline: 'background',
      opacity: alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // 접점 속도가 0 인 바퀴는 화살표 대신 0 을 둔다 — 없는 화살표는 읽히지 않는다.
  if (Math.abs(w.contactSpeed) < MIN_ARROW_SPEED) {
    out.push({
      type: 'readout',
      id: id('zero'),
      anchor: { world: w.contact, offset: [0, ZERO_OFFSET_PX] },
      text: text('label.zero'),
      chip: false,
      font: 'text',
      weight: 'bold',
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  if (!frozen) return;

  // ---- 멈춘 순간: 접점 속도를 두 성분으로 ----
  // 앞으로 가는 v(바퀴 전체가 옮겨 가는 몫)와 뒤로 도는 ωR(축을 도는 몫). 바닥 아래로
  // 내려 그어 바퀴 테 · 자국과 섞이지 않게 한다. 구르면 두 화살이 같은 길이로 맞서고,
  // 끌리면 ωR 이 짧다.
  const [px, py] = w.contact;
  const compY = py + COMPONENT_Y;
  out.push({
    type: 'vector',
    id: id('comp-translate'),
    from: [px, compY],
    delta: [c.speed * ARROW_SCALE, 0],
    label: text('label.translate'),
    labelSide: 'cw',
    opacity: alpha,
    style: { colorRole: 'primary', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'vector',
    id: id('comp-spin'),
    from: [px, compY],
    delta: [-w.spinSpeed * ARROW_SCALE, 0],
    label: text('label.spin'),
    labelSide: 'ccw',
    opacity: alpha,
    style: { colorRole: 'primary', emphasis: 'strong', lineStyle: 'dashed' },
  });
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
