// ========================================================================
// entropy-and-irreversibility — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없이 표준 어휘만 쓴다.
//
//   바닥 열         scalarField 순차형(accent 한 역할의 명암) — 열이 모인 곳이 짙다
//   알갱이 바닥     particleSystem(자취 있음) — 떨림이 센 알갱이일수록 자취 획이 길다
//   공              body(circle)
//   처음 높이       trajectory 점선 + readout 표식 `h₀` — 되감긴 공이 정확히 여기까지 오른다
//   재생 표식       readout `▶` / `◀` — 뒤집기 단계에서 서로 자리를 바꾼다
//
// 겹침 순서는 scene 에 쓴 순서다 (`schema.drawOrder: 'scene'`) — 명암이 알갱이 밑에 깔린다.
//
// 필름 시각 s — 정방향 단계(`ready` · `play` · `settle`)의 진행도 × 길이를 더하고, 거꾸로 단계의
// 진행도 × 짝 정방향 단계의 길이를 뺀다. 분기 없이 한 식이라 거꾸로 단계에서는 s 가 줄어들고,
// 같은 닫힌 식이 그대로 되감긴 장면을 만든다.
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
import { ballHeight, grainsAt, heatAt, readConstants } from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { EntropyAndIrreversibilityState } from './state';

/**
 * 정방향 단계와 그것을 되짚는 거꾸로 단계의 짝. 시간표에 선언된 단계 id 다 — 거꾸로 단계는
 * 짝 정방향 단계의 길이만큼 필름을 되감는다.
 */
const FILM_PHASES = [
  { forward: 'ready', reverse: 'rewind-ready' },
  { forward: 'play', reverse: 'rewind-play' },
  { forward: 'settle', reverse: 'rewind-settle' },
] as const;
/** 공을 놓는 단계 — 이 단계가 시작하는 필름 시각이 낙하의 0 초다. */
const DROP_PHASE = 'play';
/** 재생 표식이 ▶ 에서 ◀ 로, 다시 ◀ 에서 ▶ 로 바뀌는 단계. */
const TURN_PHASE = 'turn';
const REWOUND_PHASE = 'rewound';

/** 알갱이 점 반지름(화면 px). */
const GRAIN_R = 4;
/** 알갱이 자취 — 길이 = 떨림 속도 × 이 시간(초), 불투명도, 굵기(화면 px). 세게 떠는 알갱이만 획이 길다. */
const GRAIN_TRAIL_SECONDS = 0.15;
const GRAIN_TRAIL_OPACITY = 0.55;
const GRAIN_TRAIL_WIDTH_PX = 2;
/** 자취 획 길이 상한(화면 px). 부딪힌 순간 가장 센 알갱이의 획이 이웃 알갱이를 넘어가지 않게 — 그 획만 비례가 끊긴다. */
const GRAIN_TRAIL_MAX_PX = 14;
/** 열 명암 격자 — 알갱이 간격 하나에 칸 몇 개. 부드럽게 보간되므로 둘이면 충분하다. */
const HEAT_CELLS_PER_GRAIN = 2;
/** 처음 높이 점선 굵기(화면 px)와, 공 왼쪽으로 뻗는 길이 · 공과 띄우는 틈(월드). */
const GUIDE_WIDTH_PX = 1;
const GUIDE_REACH = 0.45;
const GUIDE_GAP = 0.08;
/** 표식 `h₀` 글자 크기와 점선 끝에서 띄우는 거리(화면 px). */
const LABEL_PX = 12;
const LABEL_GAP = 6;
/** 재생 표식 글자 크기(화면 px)와 화면 왼쪽 위 모서리에서 띄우는 거리(화면 px). */
const MARKER_PX = 22;
const MARKER_OFFSET: Vec2 = [0, 0];

export function scene(params: {
  state: EntropyAndIrreversibilityState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('entropy-and-irreversibility: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  // ---- 필름 시각 ----
  let s = 0;
  // 필름이 흐르는 방향 — 자취 획이 화면에서 실제로 움직이는 쪽을 가리키게. 멈춘 단계는 0.
  let direction = 0;
  for (const pair of FILM_PHASES) {
    const length = tl.duration(pair.forward);
    s += (tl.at(pair.forward) - tl.at(pair.reverse)) * length;
    if (tl.phase === pair.forward) direction = 1;
    if (tl.phase === pair.reverse) direction = -1;
  }
  // 떨어뜨린 뒤 흐른 시간 — 놓는 단계가 필름에서 시작하는 자리를 뺀다.
  const tau = s - (tl.start(DROP_PHASE) - tl.start(FILM_PHASES[0].forward));

  const out: Primitive[] = [];

  // ---- 바닥 열 ----
  // 알갱이 격자를 간격 반만큼 둘러싼 사각형. 칸 가운데마다 알갱이 하나가 가질 열의 몫을 읽는다.
  const sp = c.grainSpacing;
  const halfW = (c.grainCols * sp) / 2;
  const depth = c.grainRows * sp;
  const cols = c.grainCols * HEAT_CELLS_PER_GRAIN;
  const rows = c.grainRows * HEAT_CELLS_PER_GRAIN;
  const cells: Vec2[] = [];
  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < cols; q++) {
      cells.push([-halfW + ((q + 0.5) / cols) * 2 * halfW, -((r + 0.5) / rows) * depth]);
    }
  }
  out.push({
    type: 'scalarField',
    id: 'heat',
    min: [-halfW, -depth],
    max: [halfW, 0],
    cols,
    rows,
    values: heatAt(c, state.grains, state.impacts, tau, cells),
    range: [0, c.heatShadeFull],
    colors: { high: 'accent' },
  });

  // ---- 알갱이 바닥 ----
  const { positions, velocities } = grainsAt(c, state.grains, state.impacts, s, tau);
  out.push({
    type: 'particleSystem',
    id: 'grains',
    positions,
    velocities: velocities.map(([vx, vy]): Vec2 => [vx * direction, vy * direction]),
    trail: true,
    trailStyle: {
      seconds: GRAIN_TRAIL_SECONDS,
      opacity: GRAIN_TRAIL_OPACITY,
      width: GRAIN_TRAIL_WIDTH_PX,
      maxLength: GRAIN_TRAIL_MAX_PX,
    },
    sizes: GRAIN_R,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 처음 높이 ----
  // 공 가운데 높이에 공 왼쪽으로 짧게. 되감긴 공이 정확히 여기까지 돌아온다.
  const startY = c.dropHeight + c.ballRadius;
  const guideRight = -(c.ballRadius + GUIDE_GAP);
  out.push({
    type: 'trajectory',
    id: 'start-height',
    points: [
      [guideRight - GUIDE_REACH, startY],
      [guideRight, startY],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: 'start-height-label',
    anchor: { world: [guideRight - GUIDE_REACH, startY], offset: [-LABEL_GAP, 0] },
    text: text('label.startHeight'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 공 ----
  out.push({
    type: 'body',
    id: 'ball',
    shape: 'circle',
    pos: [0, c.ballRadius + ballHeight(c, state.impacts, tau)],
    size: c.ballRadius,
    glow: false,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 재생 표식 ----
  // 뒤집기 단계에서 ▶ 가 사라지며 ◀ 가 나타나고, 되감김 단계에서 거꾸로 바뀐다.
  const reversed = tl.at(TURN_PHASE) - tl.at(REWOUND_PHASE);
  out.push({
    type: 'readout',
    id: 'marker-forward',
    anchor: { screen: 'top-left', offset: MARKER_OFFSET },
    text: text('label.forward'),
    chip: false,
    font: 'text',
    fontSize: MARKER_PX,
    align: 'left',
    opacity: 1 - reversed,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'marker-reverse',
    anchor: { screen: 'top-left', offset: MARKER_OFFSET },
    text: text('label.reverse'),
    chip: false,
    font: 'text',
    fontSize: MARKER_PX,
    align: 'left',
    opacity: reversed,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
