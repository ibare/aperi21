// ========================================================================
// elastic-potential-energy — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 바닥(surface) · 용수철
// (constraint spring) · 받침판과 공(body) · 누르는 힘(vector) · 원래 길이 점선
// (trajectory) · 누른 깊이와 오른 높이(dimension) · h 눈금(lineSet + readout)이 모두
// 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 공 · 받침판은 먹색(둘이 같은 대상이라 같은 색), 용수철은
// secondary, 누르는 힘은 primary, **강조색은 「오른 높이」 한 가지 뜻에만**. 누른
// 깊이 · 원래 길이 · 눈금 · 바닥은 재는 도구라 muted.
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
import { flightOf, readConstants, readLane, sceneOpacity } from './physics';
import {
  BALL_RADIUS,
  LANE_DEEP_X,
  LANE_SLOW_X,
  PLATE_SIZE,
  PRESS_LABEL_DX,
  PRESS_MEASURE_DX,
  PUSH_ARROW_GAP,
  PUSH_ARROW_SCALE,
  REST_LINE_FROM_DX,
  REST_LINE_TO_DX,
  RISE_LABELS,
  RISE_MEASURE_DX,
  SCENE_BOUNDS,
  SPRING_COILS,
  SPRING_LENGTH,
  TICK_FROM_DX,
  TICK_LABEL_DX,
  TICK_TO_DX,
  text,
  type ElasticPotentialEnergyMessageKey,
} from './schema';
import type { ElasticPotentialEnergyState } from './state';

/** 이름표 글자 크기(화면 px). 자에 적힌 기호라 본문보다 작다. */
const LABEL_PX = 12;
/** 눈금선 굵기(화면 px). 재는 선이지 그림의 일부가 아니라 가장 가늘게. */
const TICK_WIDTH = 1;
/** 눈금선 짙기. 공 · 치수선보다 뒤로 물러나 있어야 한다. */
const TICK_OPACITY = 0.6;
/** 원래 길이 점선의 굵기(화면 px) · 짙기. 기준선이라 옅게. */
const REST_LINE_WIDTH = 1;
const REST_LINE_OPACITY = 0.7;
/** 오른 높이 치수선이 이보다 짧으면 긋지 않는다(m) — 끝 표시 둘이 겹쳐 점 하나로 보인다. */
const MIN_MEASURE = 0.03;

/** 한 레인의 선언 — 발사대 자리와 누르는 깊이, 거기에 붙는 기호. */
interface Lane {
  id: string;
  x: number;
  depth: number;
  pressLabel: ElasticPotentialEnergyMessageKey;
}

export function scene(params: {
  state: ElasticPotentialEnergyState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('elastic-potential-energy: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const out: Primitive[] = [];

  const lanes: Lane[] = [
    { id: 'slow', x: LANE_SLOW_X, depth: c.pressSlow, pressLabel: 'label.pressSlow' },
    { id: 'deep', x: LANE_DEEP_X, depth: c.pressDeep, pressLabel: 'label.pressDeep' },
  ];

  // 한 칸 = 왼쪽 공이 오른 높이 h. 두 레인이 같은 자를 쓴다 — 오른쪽 레인의 눈금이
  // 왼쪽 공이 오른 만큼씩 쌓인 것이라야 「몇 배인가」 를 칸으로 셀 수 있다.
  const h = flightOf(c.pressSlow, c.g, c.stiffness).height;
  // 공 중심이 원래 길이에 있을 때의 높이. 변위 y 는 여기서 잰다.
  const restCenterY = SPRING_LENGTH + PLATE_SIZE[1] + BALL_RADIUS;

  // ---- 바닥 ----
  out.push({
    type: 'surface',
    id: 'floor',
    geometry: { kind: 'wall', from: [SCENE_BOUNDS.minX, 0], to: [SCENE_BOUNDS.maxX, 0] },
    material: 'solid',
  });

  for (const lane of lanes) {
    const r = readLane(timeline, lane.depth, c);
    const f = flightOf(lane.depth, c.g, c.stiffness);
    // 가장 눌린 자리의 공 중심 — 오른 높이는 여기서 잰다 (physics 머리글).
    const baseY = restCenterY - lane.depth;
    const cells = Math.round(f.height / h);

    // ---- 원래 길이 ----
    // 용수철 윗끝이 누르기 전에 있던 높이. 눌린 깊이 치수선이 여기서 출발한다.
    const restTop = SPRING_LENGTH;
    out.push({
      type: 'trajectory',
      id: `rest-${lane.id}`,
      points: [
        [lane.x + REST_LINE_FROM_DX, restTop],
        [lane.x + REST_LINE_TO_DX, restTop],
      ],
      width: REST_LINE_WIDTH,
      opacity: REST_LINE_OPACITY * alpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });

    // ---- h 눈금 ----
    // 놓은 자리(0)부터 h 칸마다. 오른쪽 레인에는 네 칸이 선다.
    const ticks: Vec2[][] = [];
    for (let i = 0; i <= cells; i++) {
      const y = baseY + i * h;
      ticks.push([
        [lane.x + TICK_FROM_DX, y],
        [lane.x + TICK_TO_DX, y],
      ]);
    }
    out.push({
      type: 'lineSet',
      id: `ticks-${lane.id}`,
      lines: ticks,
      width: TICK_WIDTH,
      opacity: TICK_OPACITY * alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    for (let i = 1; i <= cells; i++) {
      const labelKey = RISE_LABELS[i - 1];
      if (!labelKey) break;
      out.push({
        type: 'readout',
        id: `tick-label-${lane.id}-${i}`,
        anchor: { world: [lane.x + TICK_LABEL_DX, baseY + i * h] },
        text: text(labelKey),
        chip: false,
        fontSize: LABEL_PX,
        align: 'left',
        opacity: alpha,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
    }

    // ---- 용수철 · 받침판 · 공 ----
    const top = restTop + r.springTop;
    out.push({
      type: 'constraint',
      id: `spring-${lane.id}`,
      subtype: 'spring',
      from: [lane.x, 0],
      to: [lane.x, top],
      coils: SPRING_COILS,
      opacity: alpha,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: `plate-${lane.id}`,
      pos: [lane.x, top + PLATE_SIZE[1] / 2],
      shape: 'rect',
      size: PLATE_SIZE,
      outline: 'none',
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    const ballY = restCenterY + r.y;
    out.push({
      type: 'body',
      id: `ball-${lane.id}`,
      pos: [lane.x, ballY],
      shape: 'circle',
      size: BALL_RADIUS,
      outline: 'none',
      glow: false,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // ---- 누른 깊이 ----
    // 누르는 동안 자라고, 놓은 뒤에도 기록으로 남는다 — 끝 그림에서 x 와 h, 2x 와 4h 가
    // 한 레인에 나란히 서야 「누른 만큼 → 오른 만큼」 을 짝지어 읽는다.
    if (r.pressed > 0) {
      out.push({
        type: 'dimension',
        id: `press-measure-${lane.id}`,
        from: [lane.x + PRESS_MEASURE_DX, restTop],
        to: [lane.x + PRESS_MEASURE_DX, restTop - r.pressed],
        opacity: alpha,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
    }
    // 기호는 다 누른 뒤에만 붙인다 — 자라는 치수선에 `2x` 가 붙어 있으면 화면과 어긋난다.
    if (timeline.at('press') >= 1) {
      out.push({
        type: 'readout',
        id: `press-label-${lane.id}`,
        anchor: { world: [lane.x + PRESS_LABEL_DX, restTop - lane.depth / 2] },
        text: text(lane.pressLabel),
        chip: false,
        fontSize: LABEL_PX,
        align: 'right',
        opacity: alpha,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
    }

    // ---- 누르는 힘 ----
    // 공 위에서 아래로. 길이가 눌린 깊이를 따라 자라고, 놓는 순간 사라진다.
    if (r.holding && r.pressed > 0) {
      const len = r.pressed * PUSH_ARROW_SCALE;
      const tipY = ballY + BALL_RADIUS + PUSH_ARROW_GAP;
      out.push({
        type: 'vector',
        id: `push-${lane.id}`,
        from: [lane.x, tipY + len],
        delta: [0, -len],
        opacity: alpha,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    }

    // ---- 오른 높이 ----
    // 놓은 자리부터 이번 주기에 가장 높이 오른 곳까지. 공을 따라 자라다가 정점에서 선다 —
    // 이 선의 길이가 곧 용수철이 담고 있던 에너지(m·g·높이)다.
    if (r.risen > MIN_MEASURE) {
      out.push({
        type: 'dimension',
        id: `rise-measure-${lane.id}`,
        from: [lane.x + RISE_MEASURE_DX, baseY],
        to: [lane.x + RISE_MEASURE_DX, baseY + r.risen],
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
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
