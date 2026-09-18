// ========================================================================
// hydrostatic-pressure — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 물(region) · 물통 벽
// (surface) · 센서(body) · 줄(constraint) · 압력 화살표(vector) · 꼬리 자취가 남긴
// 쐐기(region) · 눈금선(lineSet + readout)이 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 물은 secondary, 센서는 먹색, 압력 화살표는 primary,
// **강조색은 「깊이를 따라 자란 압력」 한 가지 뜻에만**(쐐기와 그 빗변). 눈금은
// 배경 정보라 muted.
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
import { pressureAt, readConstants, readSensor, sceneOpacity } from './physics';
import {
  ARROW_PER_PA,
  DEPTH_LABEL_X,
  PRESSURE_LABEL_Y,
  SCENE_BOUNDS,
  SENSOR_SIZE,
  SENSOR_X,
  STRING_TOP_Y,
  TANK_BOTTOM,
  TANK_LEFT,
  TANK_RIGHT,
  TANK_TOP,
  text,
} from './schema';
import type { HydrostaticPressureState } from './state';

/** 수면 일렁임(화면 px). 물이 고여 있다는 표시일 뿐이라 작게. */
const RIPPLE_PX = 1.5;
/** 눈금 이름표 글자 크기(화면 px). 자에 적힌 기호라 본문보다 작지 않게 — 읽혀야 한다. */
const TICK_LABEL_PX = 12;
/** 눈금선 굵기(화면 px). 재는 선이지 그림의 일부가 아니라 가장 가늘게. */
const TICK_WIDTH = 1;
/** 눈금선 짙기. 물 · 쐐기보다 뒤로 물러나 있어야 한다. */
const TICK_OPACITY = 0.55;
/** 쐐기 채움 짙기. 물 위에 얹혀도 물과 갈려야 하고 화살표를 가리지 않아야 한다. */
const WEDGE_FILL = 0.3;
/** h 에서 남긴 화살표 잔상의 짙기와 굵기(화면 px). 살아 있는 화살표보다 옅고 가늘다. */
const GHOST_OPACITY = 0.45;
const GHOST_WIDTH = 2;

export function scene(params: {
  state: HydrostaticPressureState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('hydrostatic-pressure: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const sensor = readSensor(timeline, c);
  const alpha = sceneOpacity(timeline);
  const out: Primitive[] = [];

  // 센서 왼쪽 면 — 압력 화살표가 누르는 자리이자 쐐기의 곧은 변.
  const face = SENSOR_X - SENSOR_SIZE / 2;
  // 두 멈춤 깊이와 그 압력이 만드는 화살표 길이. 눈금은 여기서 나온다.
  const depth1 = c.depthUnit * c.stop1;
  const depth2 = c.depthUnit * c.stop2;
  const len1 = pressureAt(depth1, c) * ARROW_PER_PA;
  const len2 = pressureAt(depth2, c) * ARROW_PER_PA;

  // ---- 물 ----
  out.push({
    type: 'region',
    id: 'water',
    points: [
      [TANK_LEFT, 0],
      [TANK_RIGHT, 0],
      [TANK_RIGHT, TANK_BOTTOM],
      [TANK_LEFT, TANK_BOTTOM],
    ],
    ripple: { edge: [0, 1], amplitude: RIPPLE_PX },
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });

  // ---- 눈금 ----
  // 깊이 h · 2h 의 가로선과 압력 p · 2p 의 세로선. 쐐기의 빗변이 두 교차점을 **곧게**
  // 꿰는 것이 정비례의 그림이다. 거리 격자가 아니라 이 네 선만 긋는다.
  const ticks: Vec2[][] = [
    [
      [TANK_LEFT, -depth1],
      [TANK_RIGHT, -depth1],
    ],
    [
      [TANK_LEFT, -depth2],
      [TANK_RIGHT, -depth2],
    ],
    [
      [face - len1, 0],
      [face - len1, TANK_BOTTOM],
    ],
    [
      [face - len2, 0],
      [face - len2, TANK_BOTTOM],
    ],
  ];
  out.push({
    type: 'lineSet',
    id: 'ticks',
    lines: ticks,
    width: TICK_WIDTH,
    opacity: TICK_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const tickLabels: { id: string; at: Vec2; key: Parameters<typeof text>[0] }[] = [
    { id: 'label-depth-1', at: [DEPTH_LABEL_X, -depth1], key: 'label.depth1' },
    { id: 'label-depth-2', at: [DEPTH_LABEL_X, -depth2], key: 'label.depth2' },
    { id: 'label-pressure-1', at: [face - len1, PRESSURE_LABEL_Y], key: 'label.pressure1' },
    { id: 'label-pressure-2', at: [face - len2, PRESSURE_LABEL_Y], key: 'label.pressure2' },
  ];
  for (const l of tickLabels) {
    out.push({
      type: 'readout',
      id: l.id,
      anchor: { world: l.at },
      text: text(l.key),
      chip: false,
      fontSize: TICK_LABEL_PX,
      italic: true,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 물통 벽 ----
  out.push(
    {
      type: 'surface',
      id: 'wall-left',
      geometry: { kind: 'wall', from: [TANK_LEFT, TANK_TOP], to: [TANK_LEFT, TANK_BOTTOM] },
      material: 'solid',
    },
    {
      type: 'surface',
      id: 'wall-bottom',
      geometry: { kind: 'wall', from: [TANK_LEFT, TANK_BOTTOM], to: [TANK_RIGHT, TANK_BOTTOM] },
      material: 'solid',
    },
    {
      type: 'surface',
      id: 'wall-right',
      geometry: { kind: 'wall', from: [TANK_RIGHT, TANK_BOTTOM], to: [TANK_RIGHT, TANK_TOP] },
      material: 'solid',
    },
  );

  const len = sensor.pressure * ARROW_PER_PA;
  const y = -sensor.depth;

  // ---- 쐐기 ----
  // 화살표 꼬리가 지나온 자리. 수면(압력 0)에서 출발해 지금 깊이까지 — 빗변이 곧으면
  // 압력이 깊이에 정비례한다는 뜻이다. 빗변만 굵게 긋는다.
  if (len > 0) {
    out.push({
      type: 'region',
      id: 'wedge',
      points: [
        [face, 0],
        [face, y],
        [face - len, y],
      ],
      fillOpacity: WEDGE_FILL,
      outline: [[2, 0]],
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- h 에서 남긴 잔상 ----
  // 더 내려가는 동안 p 의 길이가 화면에 남아 있어야 2p 와 견줄 수 있다.
  if (sensor.passedStop1) {
    out.push({
      type: 'vector',
      id: 'pressure-ghost',
      from: [face - len1, -depth1],
      delta: [len1, 0],
      width: GHOST_WIDTH,
      opacity: GHOST_OPACITY * alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // ---- 압력 화살표 ----
  // 센서 왼쪽 면을 누른다. 길이가 곧 압력이다 — 숫자가 아니라 길이로 자란다.
  out.push({
    type: 'vector',
    id: 'pressure',
    from: [face - len, y],
    delta: [len, 0],
    opacity: alpha,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 줄과 센서 ----
  out.push({
    type: 'constraint',
    id: 'string',
    subtype: 'string',
    from: [SENSOR_X, STRING_TOP_Y],
    to: [SENSOR_X, y + SENSOR_SIZE / 2],
    opacity: alpha,
  });
  out.push({
    type: 'body',
    id: 'sensor',
    pos: [SENSOR_X, y],
    shape: 'rect',
    size: [SENSOR_SIZE, SENSOR_SIZE],
    outline: 'none',
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
