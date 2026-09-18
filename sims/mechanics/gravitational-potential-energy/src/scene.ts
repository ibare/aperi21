// ========================================================================
// gravitational-potential-energy — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 들보 · 땅(surface) · 땅
// 단면과 저장 막대(region) · 말뚝과 추(body) · 줄(constraint) · 기준 눈금(lineSet) ·
// 높이 · 깊이 이름표(readout) · 떨어지는 속도(vector)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 추는 먹색(둘이 같은 대상이라 같은 색), 말뚝은 secondary,
// 떨어지는 속도는 primary, **강조색은 「높이에 담긴 몫」 한 가지 뜻에만** — 저장 막대와
// 그 끝의 이름표다. 들어 올린 동안은 기준 위로, 박힌 뒤에는 기준 아래로 같은 막대가
// 이어진다. 땅 · 눈금 · 줄은 배경 정보라 muted.
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
import { readConstants, readWeight, sceneOpacity } from './physics';
import {
  BAR_DX,
  BAR_WIDTH,
  BEAM_HALF,
  BEAM_Y,
  GROUND_BOTTOM,
  GROUND_HALF,
  LANE_HIGH_X,
  LANE_LOW_X,
  SCENE_BOUNDS,
  SPEED_ARROW_SCALE,
  SPEED_DX,
  STAKE_SIZE,
  STAKE_TOP_0,
  TICK_HALF,
  WEIGHT_SIZE,
  text,
  type GravitationalPotentialEnergyMessageKey,
} from './schema';
import type { GravitationalPotentialEnergyState } from './state';

/** 높이 · 깊이 이름표 글자 크기(화면 px)와 막대에서 띄우는 거리(화면 px). */
const MARK_LABEL_PX = 13;
const MARK_LABEL_GAP = 10;
/** 기준 눈금 굵기(화면 px). 재는 선이지 그림의 일부가 아니라 가늘게. */
const TICK_WIDTH = 1;
/** 땅 단면의 짙기. 말뚝이 그 속에 박힌 것이 비쳐 보일 만큼 옅다. */
const GROUND_FILL = 0.28;
/** 저장 막대의 짙기. 다크 바탕에서도 또렷해야 한다. */
const BAR_FILL = 0.85;
/** 막대가 이보다 짧으면 그리지 않는다(m) — 떨어지는 순간 0 에 가까운 막대가 점으로 남는다. */
const BAR_MIN = 0.004;

/** 말뚝 하나의 선언 — 가로 자리, 들어 올릴 높이, 끝에 붙는 기호. */
interface Lane {
  id: string;
  x: number;
  height: number;
  heightLabel: GravitationalPotentialEnergyMessageKey;
  depthLabel: GravitationalPotentialEnergyMessageKey;
}

export function scene(params: {
  state: GravitationalPotentialEnergyState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('gravitational-potential-energy: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const out: Primitive[] = [];

  const lanes: Lane[] = [
    { id: 'low', x: LANE_LOW_X, height: c.hLow, heightLabel: 'label.heightLow', depthLabel: 'label.depthLow' },
    { id: 'high', x: LANE_HIGH_X, height: c.hHigh, heightLabel: 'label.heightHigh', depthLabel: 'label.depthHigh' },
  ];

  // ---- 땅 단면 ----
  // 같은 땅 한 장이다. 두 말뚝 아래를 따로 칠하면 「다른 땅」 으로 읽힌다.
  out.push({
    type: 'region',
    id: 'ground',
    points: [
      [-GROUND_HALF, 0],
      [GROUND_HALF, 0],
      [GROUND_HALF, GROUND_BOTTOM],
      [-GROUND_HALF, GROUND_BOTTOM],
    ],
    fill: 'hatch',
    fillOpacity: GROUND_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'surface',
    id: 'ground-line',
    geometry: { kind: 'wall', from: [-GROUND_HALF, 0], to: [GROUND_HALF, 0] },
    material: 'solid',
  });

  // ---- 들보 ----
  // 두 추가 같은 들보에 매달린다 — 누가 들어 올리든 같은 줄, 같은 힘이다.
  out.push({
    type: 'surface',
    id: 'beam',
    geometry: { kind: 'wall', from: [-BEAM_HALF, BEAM_Y], to: [BEAM_HALF, BEAM_Y] },
    material: 'solid',
  });

  const readings = lanes.map((lane) => ({ lane, w: readWeight(timeline, lane.height, c) }));

  // ---- 기준 눈금 ----
  // 처음 말뚝 머리 높이. 막대가 이 위로 자라면 들어 올린 몫, 아래로 자라면 박힌 몫이다.
  // 들어 올린 높이 눈금은 추가 거기 다다른 뒤에만 건다 — 떨어진 뒤에도 남아 「어디서
  // 떨어졌나」 를 잰다.
  const ticks: Vec2[][] = [];
  for (const { lane, w } of readings) {
    const bx = lane.x + BAR_DX;
    ticks.push([
      [bx - TICK_HALF, STAKE_TOP_0],
      [bx + TICK_HALF, STAKE_TOP_0],
    ]);
    if (w.reached) {
      ticks.push([
        [bx - TICK_HALF, STAKE_TOP_0 + lane.height],
        [bx + TICK_HALF, STAKE_TOP_0 + lane.height],
      ]);
    }
  }
  out.push({
    type: 'lineSet',
    id: 'ticks',
    lines: ticks,
    width: TICK_WIDTH,
    opacity: alpha,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  for (const { lane, w } of readings) {
    const bx = lane.x + BAR_DX;

    // 말뚝. 둘이 같은 굵기 · 같은 길이다 — 같은 말뚝, 같은 땅.
    out.push({
      type: 'body',
      id: `stake-${lane.id}`,
      pos: [lane.x, w.stakeTop - STAKE_SIZE[1] / 2],
      shape: 'rect',
      size: STAKE_SIZE,
      outline: 'none',
      opacity: alpha,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });

    // 저장 막대. 처음 말뚝 머리 높이에서 추 밑면까지를 잇는다. 올리는 동안 위로 자라고,
    // 떨어지는 동안 추와 함께 줄고, 박히는 동안 기준 **아래**로 다시 자란다. 막대가
    // 끊기지 않고 기준을 건너가는 것이 「담은 것을 돌려준다」 는 한 동작이다.
    const top = Math.max(w.bottom, STAKE_TOP_0);
    const bottom = Math.min(w.bottom, STAKE_TOP_0);
    if (top - bottom > BAR_MIN) {
      out.push({
        type: 'region',
        id: `bar-${lane.id}`,
        points: [
          [bx - BAR_WIDTH / 2, bottom],
          [bx + BAR_WIDTH / 2, bottom],
          [bx + BAR_WIDTH / 2, top],
          [bx - BAR_WIDTH / 2, top],
        ],
        fillOpacity: BAR_FILL,
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }

    // 높이 이름표 — 다다른 뒤부터. 떨어진 뒤에도 남는다.
    if (w.reached) {
      out.push({
        type: 'readout',
        id: `height-${lane.id}`,
        anchor: { world: [bx, STAKE_TOP_0 + lane.height], offset: [MARK_LABEL_GAP, 0] },
        text: text(lane.heightLabel),
        chip: false,
        font: 'mono',
        italic: true,
        fontSize: MARK_LABEL_PX,
        align: 'left',
        opacity: alpha,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
    }

    // 깊이 이름표 — 말뚝이 멈춘 뒤에만. 박히는 도중에 붙이면 자라는 막대에 `2d` 가
    // 먼저 적혀 화면과 어긋난다.
    if (w.stopped) {
      out.push({
        type: 'readout',
        id: `depth-${lane.id}`,
        anchor: { world: [bx, (w.bottom + STAKE_TOP_0) / 2], offset: [MARK_LABEL_GAP, 0] },
        text: text(lane.depthLabel),
        chip: false,
        font: 'mono',
        italic: true,
        fontSize: MARK_LABEL_PX,
        align: 'left',
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }

    // 줄. 매달린 동안은 추를 잡고, 놓은 뒤에는 놓은 자리에 끝이 남는다 — 얼마나 높은
    // 곳에서 떨어졌는지를 줄의 끝이 계속 가리킨다.
    const ropeEnd = w.released ? STAKE_TOP_0 + lane.height + WEIGHT_SIZE[1] : w.bottom + WEIGHT_SIZE[1];
    out.push({
      type: 'constraint',
      id: `rope-${lane.id}`,
      subtype: 'string',
      from: [lane.x, BEAM_Y],
      to: [lane.x, ropeEnd],
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // 추. 둘이 같은 크기 · 같은 색이다 — 다른 것은 들어 올린 높이뿐이다.
    out.push({
      type: 'body',
      id: `weight-${lane.id}`,
      pos: [lane.x, w.bottom + WEIGHT_SIZE[1] / 2],
      shape: 'rect',
      size: WEIGHT_SIZE,
      outline: 'none',
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // 떨어지는 속도. 막대가 줄어드는 만큼 화살표가 자란다 — 높이에 있던 것이 어디로
    // 가는지를 말뚝에 닿기 전에도 보인다. 박히는 동안 줄어 멈추면 사라진다.
    if (w.speed > 0) {
      out.push({
        type: 'vector',
        id: `speed-${lane.id}`,
        from: [lane.x + SPEED_DX, w.bottom + WEIGHT_SIZE[1] / 2],
        delta: [0, -w.speed * SPEED_ARROW_SCALE],
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
