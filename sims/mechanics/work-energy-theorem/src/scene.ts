// ========================================================================
// work-energy-theorem — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 바닥(surface) · 일 칸의
// 테두리(trajectory closed) · 칠해지는 일(region) · 눈금(lineSet + readout) ·
// 수레(body) · 화살표(vector)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 수레는 먹색(둘이 같은 대상이라 같은 색), 속도 화살표는
// primary, 미는 힘 화살표는 secondary, **강조색은 「한 일」 한 가지 뜻에만**
// (칠해지는 칸). 바닥 · 눈금 · 칸 테두리 · 칸 이름표는 배경 정보라 muted.
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
import { readCart, readConstants, sceneOpacity } from './physics';
import {
  CART_SIZE,
  FORCE_ARROW_SCALE,
  FORCE_ARROW_Y,
  LANE_BOTTOM_Y,
  LANE_TOP_Y,
  SCENE_BOUNDS,
  SPEED_ARROW_SCALE,
  SPEED_ARROW_Y,
  TICK_BOTTOM_Y,
  TICK_LABEL_Y,
  TICK_TOP_Y,
  WORK_HEIGHT_PER_N,
  WORK_LABEL_GAP,
  text,
  type WorkEnergyTheoremMessageKey,
} from './schema';
import type { WorkEnergyTheoremState } from './state';

/** 눈금 · 칸 이름표 글자 크기(화면 px). 자에 적힌 수라 본문보다 작다. */
const TICK_LABEL_PX = 11;
/** 눈금선 굵기(화면 px). 재는 선이지 그림의 일부가 아니라 가장 가늘게. */
const TICK_WIDTH = 1;
/** 눈금선 짙기. 수레 · 칸보다 뒤로 물러나 있어야 한다. */
const TICK_OPACITY = 0.45;
/** 일 칸 테두리 굵기(화면 px). 아직 하지 않은 일의 자리라 가늘게. */
const FRAME_WIDTH = 1;
/** 칠해진 일의 짙기. 다크 바탕에서도 테두리와 갈려야 한다. */
const WORK_FILL = 0.62;

/** 한 레인의 선언 — 바닥 높이, 미는 힘 · 거리, 붙는 기호. */
interface Lane {
  id: string;
  y: number;
  force: number;
  dist: number;
  forceLabel: WorkEnergyTheoremMessageKey;
  workLabel: WorkEnergyTheoremMessageKey;
}

export function scene(params: {
  state: WorkEnergyTheoremState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('work-energy-theorem: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const out: Primitive[] = [];
  const half = CART_SIZE[0] / 2;

  const lanes: Lane[] = [
    {
      id: 'top',
      y: LANE_TOP_Y,
      force: c.forceBig,
      dist: c.distShort,
      forceLabel: 'label.forceBig',
      workLabel: 'label.workShort',
    },
    {
      id: 'bottom',
      y: LANE_BOTTOM_Y,
      force: c.forceSmall,
      dist: c.distLong,
      forceLabel: 'label.forceSmall',
      workLabel: 'label.workLong',
    },
  ];

  // ---- 눈금 ----
  // 출발점 · d · 2d 에 두 레인을 세로로 꿰는 선. 위 칸이 d 에서, 아래 칸이 2d 에서 끝나는
  // 것을 맞대 본다. 재는 것이 거리 자체가 아니라 d 의 배수라 거리 격자를 켜지 않는다.
  const tickXs = [0, c.distShort, c.distLong];
  const ticks: Vec2[][] = tickXs.map((x) => [
    [x, TICK_BOTTOM_Y],
    [x, TICK_TOP_Y],
  ]);
  out.push({
    type: 'lineSet',
    id: 'dist-ticks',
    lines: ticks,
    width: TICK_WIDTH,
    opacity: TICK_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const tickLabels: [number, WorkEnergyTheoremMessageKey][] = [
    [c.distShort, 'label.tick1'],
    [c.distLong, 'label.tick2'],
  ];
  for (const [x, k] of tickLabels) {
    out.push({
      type: 'readout',
      id: `tick-label-${k}`,
      anchor: { world: [x, TICK_LABEL_Y] },
      text: text(k),
      chip: false,
      fontSize: TICK_LABEL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  for (const lane of lanes) {
    const cart = readCart(timeline, lane.force, lane.dist, c.mass);
    const h = lane.force * WORK_HEIGHT_PER_N;
    const bottom = lane.y - h;

    // ---- 한 일 칸 ----
    // 바닥선 아래로 드리운다. 높이가 힘, 길이가 민 거리 — 넓이가 일이다. 테두리는 이
    // 레인이 받을 일 전체의 자리이고, 수레가 밀린 만큼 그 안이 칠해진다.
    if (cart.workedDist > 0) {
      out.push({
        type: 'region',
        id: `work-${lane.id}`,
        points: [
          [0, lane.y],
          [cart.workedDist, lane.y],
          [cart.workedDist, bottom],
          [0, bottom],
        ],
        fillOpacity: WORK_FILL,
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
    out.push({
      type: 'trajectory',
      id: `work-frame-${lane.id}`,
      points: [
        [0, lane.y],
        [lane.dist, lane.y],
        [lane.dist, bottom],
        [0, bottom],
      ],
      closed: true,
      width: FRAME_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
    out.push({
      type: 'readout',
      id: `work-label-${lane.id}`,
      anchor: { world: [lane.dist + WORK_LABEL_GAP, lane.y - h / 2] },
      text: text(lane.workLabel),
      chip: false,
      fontSize: TICK_LABEL_PX,
      align: 'left',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // ---- 바닥선 ----
    // 마찰 없는 바닥. 미는 힘이 곧 알짜힘이라는 전제를 결 없는 선 하나로 둔다.
    out.push({
      type: 'surface',
      id: `floor-${lane.id}`,
      geometry: { kind: 'wall', from: [SCENE_BOUNDS.minX, lane.y], to: [SCENE_BOUNDS.maxX, lane.y] },
      material: 'solid',
    });

    // ---- 수레 ----
    // 둘이 같은 크기 · 같은 색이다 — 다른 것은 미는 힘과 거리뿐이다.
    out.push({
      type: 'body',
      id: `cart-${lane.id}`,
      pos: [cart.x, lane.y + CART_SIZE[1] / 2],
      shape: 'rect',
      size: CART_SIZE,
      outline: 'none',
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // ---- 미는 힘 ----
    // 뒤에서 민다. 길이가 힘에 비례해 위가 아래의 두 배다. 밀리는 동안만 있다 —
    // 밀기가 끝난 뒤에 남아 있으면 없는 힘을 그리는 것이 된다.
    if (cart.pushed) {
      const len = lane.force * FORCE_ARROW_SCALE;
      out.push({
        type: 'vector',
        id: `force-${lane.id}`,
        from: [cart.x - half - len, lane.y + FORCE_ARROW_Y],
        delta: [len, 0],
        label: text(lane.forceLabel),
        labelSide: 'ccw',
        opacity: alpha,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
    }

    // ---- 속도 ----
    // 밀리는 동안 자라고, 밀기가 끝나면 그 길이로 굳는다. 끝 속력 기호 `v` 는 굳은
    // 뒤에만 붙인다 — 두 수레에 같은 기호가 붙는 것이 결론이다.
    if (cart.speed > 0) {
      out.push({
        type: 'vector',
        id: `speed-${lane.id}`,
        from: [cart.x, lane.y + SPEED_ARROW_Y],
        delta: [cart.speed * SPEED_ARROW_SCALE, 0],
        label: cart.released ? text('label.speed') : undefined,
        labelSide: 'ccw',
        opacity: alpha,
        style: { colorRole: 'primary', emphasis: 'strong' },
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
