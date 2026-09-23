// ========================================================================
// range-and-surface-gravity — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 눈금(lineSet + readout) ·
// 땅(surface) · 나아간 띠(region) · 포물선(trajectory) · 착지 자국(trace) · 공(body) ·
// 발사각(sector) · 발사 화살표(vector) · 레인 이름(readout)이 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 두 공은 먹색(같은 공이라 같은 색), 발사 화살표는 primary,
// 포물선은 secondary, **강조색은 「나아간 가로 거리」 한 가지 뜻에만**(땅 위의 띠와
// 착지 자국). 땅 · 눈금 · 발사각 · 레인 이름은 배경 정보라 muted.
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
import { ballAt, readConstants, rangeOf, sceneOpacity } from './physics';
import {
  ANGLE_R,
  BALL_R,
  CELL_LABELS,
  LANE_EARTH_Y,
  LANE_G_DY,
  LANE_LABEL_X,
  LANE_MOON_Y,
  LANE_NAME_DY,
  REACH_THICKNESS,
  SCENE_BOUNDS,
  TICK_BOTTOM_Y,
  TICK_LABEL_Y,
  text,
  type RangeAndSurfaceGravityMessageKey,
} from './schema';
import type { RangeAndSurfaceGravityState } from './state';

/** 눈금 이름표 · 레인 이름의 글자 크기(화면 px). 자에 적힌 수라 본문보다 작다. */
const TICK_LABEL_PX = 11;
const LANE_LABEL_PX = 12;
/** 눈금선 굵기(화면 px). 재는 선이지 그림의 일부가 아니라 가장 가늘게. */
const TICK_WIDTH = 1;
/**
 * 눈금선 짙기. 공 · 띠보다 뒤로 물러나 있어야 하되, 다크에서 사라지면 칸을 셀
 * 자가 없어진다 — 두 테마 촬영으로 잡은 값이다.
 */
const TICK_OPACITY = 0.52;
/** 포물선 굵기(화면 px). */
const PATH_WIDTH = 2;
/** 나아간 띠의 짙기. 다크 바탕에서도 또렷해야 한다. */
const REACH_FILL = 0.72;
/** 발사각 부채꼴의 채움 짙기와 테두리 호의 굵기(화면 px). */
const ANGLE_FILL = 0.18;
const ANGLE_RIM = 1;
/** 착지 자국 점의 반지름(화면 px). */
const MARK_SIZE = 3.5;
/** 착지 울림 고리 — 처음 반지름 · 퍼지는 끝 반지름(화면 px) · 사는 시간(초). */
const RIPPLE_SIZE = 3;
const RIPPLE_SPREAD = 16;
const RIPPLE_LIFE = 0.55;

/** 한 레인의 선언 — 땅 높이, 그 하늘의 표면 중력, 이름. */
interface Lane {
  id: string;
  y: number;
  g: number;
  name: RangeAndSurfaceGravityMessageKey;
}

export function scene(params: {
  state: RangeAndSurfaceGravityState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('range-and-surface-gravity: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const out: Primitive[] = [];

  const lanes: Lane[] = [
    { id: 'earth', y: LANE_EARTH_Y, g: c.gEarth, name: 'label.earth' },
    { id: 'moon', y: LANE_MOON_Y, g: c.gMoon, name: 'label.moon' },
  ];

  // ---- 눈금 ----
  // 한 칸 = 지구에서의 사거리 R. 두 레인을 세로로 꿰어야 「위가 한 칸일 때 아래는
  // 몇 칸인가」 를 눈으로 셀 수 있다. 재는 것이 거리 자체가 아니라 **칸 수**라
  // 거리 격자(`chrome.grid`)를 켜지 않는다.
  const cell = rangeOf(c, c.gEarth);
  const ticks: Vec2[][] = CELL_LABELS.map((_, i) => [
    [cell * (i + 1), TICK_BOTTOM_Y],
    [cell * (i + 1), LANE_EARTH_Y],
  ]);
  out.push({
    type: 'lineSet',
    id: 'cell-ticks',
    lines: ticks,
    width: TICK_WIDTH,
    opacity: TICK_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  CELL_LABELS.forEach((labelKey, i) => {
    out.push({
      type: 'readout',
      id: `cell-label-${i + 1}`,
      anchor: { world: [cell * (i + 1), TICK_LABEL_Y] },
      text: text(labelKey),
      chip: false,
      fontSize: TICK_LABEL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  });

  // ---- 레인마다: 땅 · 나아간 띠 · 포물선 · 착지 자국 · 공 · 발사각 · 발사 화살표 ----
  for (const lane of lanes) {
    const ball = ballAt(timeline, c, lane.g);

    // 땅. 두 레인이 같은 재질 · 같은 색이다 — 다른 것은 그 하늘의 중력뿐이다.
    out.push({
      type: 'surface',
      id: `ground-${lane.id}`,
      geometry: { kind: 'wall', from: [SCENE_BOUNDS.minX, lane.y], to: [SCENE_BOUNDS.maxX, lane.y] },
      material: 'solid',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // 나아간 가로 거리. 공이 떠난 자리부터 지금 자리의 바로 아래까지 땅 위에
    // 자란다 — 두 띠가 **같은 속력으로** 자라다가 지구 쪽만 먼저 멈춘다.
    if (ball.x > 0) {
      out.push({
        type: 'region',
        id: `reach-${lane.id}`,
        points: [
          [0, lane.y],
          [ball.x, lane.y],
          [ball.x, lane.y + REACH_THICKNESS],
          [0, lane.y + REACH_THICKNESS],
        ],
        fillOpacity: REACH_FILL,
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }

    // 지나온 포물선. 달 쪽이 여섯 배 오래 떠 있어 훨씬 길고 높게 휜다.
    out.push({
      type: 'trajectory',
      id: `path-${lane.id}`,
      points: ball.path.map(([px, py]) => [px, lane.y + py] as Vec2),
      width: PATH_WIDTH,
      opacity: alpha,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });

    // 착지 자국. 떨어진 자리에 남아 두 레인의 거리를 눈금 위에서 맞대게 한다.
    if (ball.landed) {
      out.push({
        type: 'trace',
        id: `mark-${lane.id}`,
        marks: [{ pos: [ball.x, lane.y] }],
        shape: 'dot',
        size: MARK_SIZE,
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
      // 떨어진 순간의 울림. 땅 밑으로 퍼지지 않게 위 반쪽만 그린다.
      out.push({
        type: 'trace',
        id: `ripple-${lane.id}`,
        marks: [{ pos: [ball.x, lane.y], age: ball.landedAge }],
        shape: 'ring',
        size: RIPPLE_SIZE,
        spreadTo: RIPPLE_SPREAD,
        life: RIPPLE_LIFE,
        arc: [0, Math.PI],
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }

    // 발사각. 두 부채꼴이 같은 각을 쓸어 「같은 각도」 가 그림으로 읽힌다.
    out.push({
      type: 'sector',
      id: `angle-${lane.id}`,
      center: [0, lane.y],
      radius: ANGLE_R,
      from: 0,
      to: (c.angleDeg * Math.PI) / 180,
      fillOpacity: ANGLE_FILL,
      rimWidth: ANGLE_RIM,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // 발사 화살표. **두 레인의 길이와 방향이 같다** — 같은 속력, 같은 각도로
    // 떠났다는 것이 이 조각의 전제이고, 이 화살표가 그 전제를 화면에 남긴다.
    out.push({
      type: 'vector',
      id: `launch-${lane.id}`,
      from: [0, lane.y],
      delta: [
        c.v0 * c.arrowScale * Math.cos((c.angleDeg * Math.PI) / 180),
        c.v0 * c.arrowScale * Math.sin((c.angleDeg * Math.PI) / 180),
      ],
      label: text('label.v0'),
      labelSide: 'ccw',
      opacity: alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });

    // 공. 둘이 같은 크기 · 같은 색이다 — 다른 것은 아래 땅의 중력뿐이다.
    out.push({
      type: 'body',
      id: `ball-${lane.id}`,
      pos: [ball.x, lane.y + ball.y + BALL_R],
      shape: 'circle',
      size: BALL_R,
      outline: 'none',
      glow: false,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // 레인 이름과 그 하늘의 중력. 발사점 왼쪽에 오른쪽 맞춤으로 둔다 — 발사대
    // 위는 화살표와 포물선이 지나는 자리다.
    out.push({
      type: 'readout',
      id: `name-${lane.id}`,
      anchor: { world: [LANE_LABEL_X, lane.y + LANE_NAME_DY] },
      text: text(lane.name),
      chip: false,
      font: 'text',
      fontSize: LANE_LABEL_PX,
      align: 'right',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `gravity-${lane.id}`,
      anchor: { world: [LANE_LABEL_X, lane.y + LANE_G_DY] },
      text: text('label.gValue'),
      vars: { g: String(lane.g) },
      chip: false,
      fontSize: TICK_LABEL_PX,
      align: 'right',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
