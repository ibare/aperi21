// ========================================================================
// projectile-in-wind — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 바닥(surface) ·
// 바람과 발사 화살표(vector) · 궤적과 기준선(trajectory) · 공(body) ·
// 착지 자국(trace tick) · 잰 거리(dimension) · 이름표(readout)가 모두 표준 어휘다.
//
// 색은 뜻마다 하나다 — 공과 궤적은 먹색(셋이 같은 대상이라 같은 색), 발사는
// primary(셋이 같다), 바람은 secondary(레인마다 다른 것), **강조색은 「바람이
// 옮긴 자리」 한 가지 뜻에만** (착지 자국과 그것을 재는 치수선). 바닥 · 기준선 ·
// 이름표는 배경 정보라 muted.
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

import { landingX, pathTo, posAt, readConstants } from './physics';
import {
  BALL_RADIUS,
  DIM_Y,
  GROUND_FROM_X,
  GROUND_TO_X,
  LANE_CALM_Y,
  LANE_HEADWIND_Y,
  LANE_LABEL_Y,
  LANE_TAILWIND_Y,
  MARK_SIZE,
  REF_BOTTOM_Y,
  REF_LABEL_Y,
  REF_TOP_Y,
  SCENE_BOUNDS,
  TRAJ_SAMPLES,
  text,
  WIND_ARROW_X,
  WIND_ARROW_Y,
  type ProjectileInWindMessageKey,
} from './schema';
import type { ProjectileInWindState } from './state';

/** 궤적 선의 굵기(화면 px)와 짙기. 공보다 한 단 물러나 있어야 한다. */
const TRAJ_WIDTH = 1.5;
const TRAJ_OPACITY = 0.8;
/** 무풍 사거리 기준선의 굵기(화면 px)와 짙기. 재는 선이라 가장 가늘게. */
const REF_WIDTH = 1;
const REF_OPACITY = 0.55;
/** 착지 자국 획의 굵기(화면 px). 바닥선보다 굵어야 자국으로 읽힌다. */
const MARK_WIDTH = 2.5;
/** 레인 이름 · 기준선 이름의 글자 크기(화면 px). 그림에 붙는 이름이라 본문보다 작다. */
const LANE_LABEL_PX = 12;
const REF_LABEL_PX = 11;

/** 한 레인의 선언 — 바닥 높이와 그 레인에 부는 바람의 부호. */
interface Lane {
  id: string;
  y: number;
  /** 바람 세기에 곱하는 부호. 앞바람 −1 · 무풍 0 · 뒷바람 +1. */
  sign: number;
  nameKey: ProjectileInWindMessageKey;
}

const LANES: readonly Lane[] = [
  { id: 'headwind', y: LANE_HEADWIND_Y, sign: -1, nameKey: 'label.headwind' },
  { id: 'calm', y: LANE_CALM_Y, sign: 0, nameKey: 'label.calm' },
  { id: 'tailwind', y: LANE_TAILWIND_Y, sign: 1, nameKey: 'label.tailwind' },
];

export function scene(params: {
  state: ProjectileInWindState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('projectile-in-wind: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const wind = state.wind;

  // 날아간 시간. 겨누는 동안은 0 이고, **닿는 순간은 물리가 정한다** — 단계 경계가
  // 아니라 체공 시간 T 다 (S-piece).
  const flown = Math.min(Math.max(timeline.u - timeline.start('fly'), 0), c.flight);
  const landed = flown >= c.flight;
  // 자국을 잰 그림은 닿음 단계가 끝난 뒤부터 보인다.
  const measured = timeline.at('land') >= 1;
  const alpha = 1 - timeline.at('fade');
  /** 무풍 사거리 — 기준선이 서는 자리. */
  const refX = landingX(0, c);

  const out: Primitive[] = [];

  // ---- 바닥 ----
  for (const lane of LANES) {
    out.push({
      type: 'surface',
      id: `ground-${lane.id}`,
      geometry: { kind: 'wall', from: [GROUND_FROM_X, lane.y], to: [GROUND_TO_X, lane.y] },
      material: 'solid',
    });
  }

  // ---- 무풍 사거리 기준선 ----
  // 세 레인을 세로로 꿰는 선 하나. 가운데 공은 늘 이 선 위에 떨어지고, 바깥 둘이
  // 어느 쪽으로 얼마나 벗어났는지가 곧 바람이 한 일이다. 바람을 끌어도 이 선은
  // 움직이지 않는다 — 무풍 사거리는 바람과 무관하기 때문이다.
  out.push({
    type: 'trajectory',
    id: 'calm-range-line',
    points: [
      [refX, REF_BOTTOM_Y],
      [refX, REF_TOP_Y],
    ],
    width: REF_WIDTH,
    opacity: REF_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // ---- 레인마다: 바람 · 이름 · 발사 · 궤적 · 공 ----
  for (const lane of LANES) {
    const laneWind = lane.sign * wind;

    // 바람 화살표. 길이가 바람 세기에 비례하고 방향이 부호다. 무풍 레인은 화살표가
    // 없다 — 불지 않는 바람을 길이 0 의 화살표로 그리면 「아주 약한 바람」 으로 읽힌다.
    if (lane.sign !== 0) {
      const len = wind * c.windArrowScale;
      out.push({
        type: 'vector',
        id: `wind-${lane.id}`,
        from: [WIND_ARROW_X - (lane.sign * len) / 2, lane.y + WIND_ARROW_Y],
        delta: [lane.sign * len, 0],
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
    }

    // 레인 이름. 화살표 아래에 둔다.
    out.push({
      type: 'readout',
      id: `name-${lane.id}`,
      anchor: { world: [WIND_ARROW_X, lane.y + LANE_LABEL_Y] },
      text: text(lane.nameKey),
      font: 'text',
      chip: false,
      align: 'center',
      fontSize: LANE_LABEL_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // 발사 화살표. **셋이 똑같다** — 같은 각도 · 같은 속력이라는 전제가 이 그림에
    // 늘 남아 있어야 한다. 기호는 맨 아래 레인에만 붙인다(셋이 같은 화살표라 세 번
    // 쓰면 글자만 는다).
    out.push({
      type: 'vector',
      id: `launch-${lane.id}`,
      from: [0, lane.y + BALL_RADIUS],
      delta: [c.v0x * c.velArrowScale, c.v0y * c.velArrowScale],
      label: lane.id === 'tailwind' ? text('label.v0') : undefined,
      labelSide: 'ccw',
      opacity: alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });

    // 지나온 자리. 셋이 같은 색 · 같은 굵기다 — 다른 것은 굽은 모양뿐이다.
    // 공 **중심**이 지나온 길이라 공 반지름만큼 올려 긋는다 — 바닥에 놓인 공의
    // 중심 높이에서 출발해야 선이 공 밑을 지나지 않는다.
    const path = pathTo(flown, laneWind, c, TRAJ_SAMPLES);
    if (path.length > 1) {
      out.push({
        type: 'trajectory',
        id: `path-${lane.id}`,
        points: path.map(([x, y]): Vec2 => [x, lane.y + y + BALL_RADIUS]),
        width: TRAJ_WIDTH,
        opacity: TRAJ_OPACITY * alpha,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }

    // 공. 셋이 같은 크기 · 같은 색이고, 세로 자리도 늘 같다.
    const [bx, by] = posAt(flown, laneWind, c);
    out.push({
      type: 'body',
      id: `ball-${lane.id}`,
      pos: [bx, lane.y + by + BALL_RADIUS],
      shape: 'circle',
      size: BALL_RADIUS,
      glow: false,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 착지 자국 ----
  // 셋이 같은 순간 나타난다 — 체공 시간이 같기 때문이다. 자국 셋과 기준선의 순서가
  // 곧 이 조각의 주장이다.
  if (landed) {
    out.push({
      type: 'trace',
      id: 'landing-marks',
      marks: LANES.map((lane) => ({ pos: [landingX(lane.sign * wind, c), lane.y] as Vec2 })),
      shape: 'tick',
      direction: [0, 1],
      size: MARK_SIZE,
      width: MARK_WIDTH,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 바람이 옮긴 만큼 ----
  // 기준선에서 자국까지를 잰다. 무풍 레인은 잴 것이 없다(자국이 기준선 위에 있다).
  if (measured) {
    for (const lane of LANES) {
      if (lane.sign === 0) continue;
      const x = landingX(lane.sign * wind, c);
      out.push({
        type: 'dimension',
        id: `shift-${lane.id}`,
        from: [Math.min(refX, x), lane.y + DIM_Y],
        to: [Math.max(refX, x), lane.y + DIM_Y],
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // ---- 기준선 이름 ----
  out.push({
    type: 'readout',
    id: 'calm-range-label',
    anchor: { world: [refX, REF_LABEL_Y] },
    text: text('label.calmRange'),
    font: 'text',
    chip: false,
    align: 'center',
    fontSize: REF_LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 바람을 끌어도 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
