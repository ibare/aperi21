// ========================================================================
// atmospheric-pressure — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 공기 알갱이(particleSystem) ·
// 머리 위 기둥(region + lineSet) · 산(region) · 땅(surface) · 압력 화살표(vector) ·
// 센서(body) · 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 공기는 muted, 산은 secondary, 센서는 먹색, 압력 화살표는
// primary, **강조색은 「센서 머리 위에 있는 공기」 한 가지 뜻에만**(기둥과 그 속 알갱이).
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
import { dotAt, readClimber, readConstants, sceneOpacity, summitHeight } from './physics';
import {
  ARROW_AT_GROUND,
  COLUMN_HALF_WIDTH,
  COLUMN_TOP,
  DOT_COUNT,
  LABEL_OFFSET_X,
  MOUNTAIN,
  SCENE_BOUNDS,
  SENSOR_SIZE,
  SUMMIT_INDEX,
  text,
} from './schema';
import type { AtmosphericPressureState } from './state';

/** 바깥 공기 알갱이 반지름(화면 px). 배경이라 작게. */
const AIR_DOT_PX = 1.7;
/** 기둥 속 알갱이 반지름(화면 px). 셀 수 있을 만큼 또렷하게. */
const COLUMN_DOT_PX = 2.3;
/** 기둥 채움 짙기. 알갱이가 주인이라 옅게 깐다. */
const COLUMN_FILL = 0.1;
/** 기둥 가장자리 굵기(화면 px)와 짙기. 경계를 알리되 알갱이보다 앞서지 않게. */
const COLUMN_EDGE_WIDTH = 1.2;
const COLUMN_EDGE_OPACITY = 0.7;
/** 산 채움 짙기. 알갱이를 가릴 만큼(산속에는 공기가 없다). */
const MOUNTAIN_FILL = 0.3;
/** 산 아래 화살표 잔상의 짙기와 굵기(화면 px). 살아 있는 화살표보다 옅고 가늘다. */
const GHOST_OPACITY = 0.45;
const GHOST_WIDTH = 2;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;
/** `½ p₀` 이름표가 정상 단계에 들어서며 켜지는 시간(초). */
const LABEL_FADE_IN = 0.5;

/** 산 외곽선을 정상 높이에 맞춘 월드 점들. */
function mountainPoints(summit: number): Vec2[] {
  return MOUNTAIN.map(([x, f]) => [x, f * summit] as Vec2);
}

/** 산 표면의 높이(km). 산 밖이면 0. */
function mountainTop(x: number, pts: readonly Vec2[]): number {
  for (let k = 0; k < pts.length - 1; k++) {
    const a = pts[k]!;
    const b = pts[k + 1]!;
    if (x >= a[0] && x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]);
  }
  return 0;
}

/** 오르는 능선에서 높이 y 인 자리의 x. 능선은 높이에 대해 단조다. */
function ridgeX(y: number, pts: readonly Vec2[]): number {
  for (let k = 0; k < SUMMIT_INDEX; k++) {
    const a = pts[k]!;
    const b = pts[k + 1]!;
    if (y <= b[1]) return a[0] + ((b[0] - a[0]) * (y - a[1])) / Math.max(1e-9, b[1] - a[1]);
  }
  return pts[SUMMIT_INDEX]![0];
}

export function scene(params: {
  state: AtmosphericPressureState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('atmospheric-pressure: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const climber = readClimber(timeline, c);
  const alpha = sceneOpacity(timeline);
  const summit = summitHeight(c);
  const mountain = mountainPoints(summit);
  const out: Primitive[] = [];

  // 센서 자리 — 밑면 가운데가 능선 위에 선다. 윗면이 화살표가 누르는 자리이자 기둥의 밑.
  const cx = ridgeX(climber.height, mountain);
  const top = climber.height + SENSOR_SIZE;
  const start: Vec2 = [mountain[0]![0], 0];
  const startTop = SENSOR_SIZE;

  // ---- 공기 알갱이 ----
  // 알갱이 하나가 같은 양의 공기다. 산속 알갱이는 빼고, 센서 머리 위 기둥 안의 것은
  // 따로 모아 강조색으로 칠한다 — 그것이 센서를 누르는 공기다.
  const air: Vec2[] = [];
  const overhead: Vec2[] = [];
  for (let i = 0; i < DOT_COUNT; i++) {
    const p = dotAt(i, timeline.t, c);
    if (p[1] < mountainTop(p[0], mountain)) continue;
    const inColumn = Math.abs(p[0] - cx) <= COLUMN_HALF_WIDTH;
    if (inColumn && p[1] >= top && alpha > 0) overhead.push(p);
    else if (inColumn && p[1] >= climber.height && p[1] < top) continue; // 센서 몸 속
    else air.push(p);
  }
  out.push({
    type: 'particleSystem',
    id: 'air',
    positions: air,
    sizes: AIR_DOT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 머리 위 공기 기둥 ----
  out.push({
    type: 'region',
    id: 'column',
    points: [
      [cx - COLUMN_HALF_WIDTH, top],
      [cx + COLUMN_HALF_WIDTH, top],
      [cx + COLUMN_HALF_WIDTH, COLUMN_TOP],
      [cx - COLUMN_HALF_WIDTH, COLUMN_TOP],
    ],
    fillOpacity: COLUMN_FILL,
    opacity: alpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: 'column-edges',
    lines: [
      [
        [cx - COLUMN_HALF_WIDTH, top],
        [cx - COLUMN_HALF_WIDTH, COLUMN_TOP],
      ],
      [
        [cx + COLUMN_HALF_WIDTH, top],
        [cx + COLUMN_HALF_WIDTH, COLUMN_TOP],
      ],
    ],
    width: COLUMN_EDGE_WIDTH,
    opacity: COLUMN_EDGE_OPACITY * alpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'particleSystem',
    id: 'air-overhead',
    positions: overhead,
    sizes: COLUMN_DOT_PX,
    opacity: alpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 산과 땅 ----
  const ridgeEdges: (readonly [number, number])[] = [];
  for (let k = 0; k < mountain.length - 1; k++) ridgeEdges.push([k, k + 1]);
  out.push({
    type: 'region',
    id: 'mountain',
    points: mountain,
    fillOpacity: MOUNTAIN_FILL,
    opaque: true,
    outline: ridgeEdges,
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });
  out.push({
    type: 'surface',
    id: 'ground',
    geometry: { kind: 'ground', y: 0 },
    material: 'solid',
  });

  // ---- 산 아래에서 남긴 잔상 ----
  // 오르는 동안 p₀ 의 길이가 화면에 남아 있어야 정상의 화살표와 견줄 수 있다.
  if (climber.leftGround) {
    out.push({
      type: 'vector',
      id: 'pressure-ghost',
      from: [start[0], startTop + ARROW_AT_GROUND],
      delta: [0, -ARROW_AT_GROUND],
      width: GHOST_WIDTH,
      opacity: GHOST_OPACITY * alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // ---- 압력 화살표 ----
  // 머리 위 기둥의 무게가 센서 윗면을 아래로 누른다. 길이가 곧 압력 — 머리 위 공기의 몫이다.
  const len = ARROW_AT_GROUND * climber.pressureRatio;
  out.push({
    type: 'vector',
    id: 'pressure',
    from: [cx, top + len],
    delta: [0, -len],
    outline: 'background',
    opacity: alpha,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 센서 ----
  out.push({
    type: 'body',
    id: 'sensor',
    pos: [cx, climber.height + SENSOR_SIZE / 2],
    shape: 'rect',
    size: [SENSOR_SIZE, SENSOR_SIZE],
    outline: 'background',
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 이름표 ----
  // 산 아래 화살표(p₀)는 늘, 정상의 화살표(½ p₀)는 정상에 들어서며 켠다.
  out.push({
    type: 'readout',
    id: 'label-ground',
    anchor: { world: [start[0] - LABEL_OFFSET_X, startTop + ARROW_AT_GROUND / 2] },
    text: text('label.pressureGround'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    italic: true,
    align: 'center',
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  const s0 = timeline.start('summit');
  const labelIn = timeline.span(s0, s0 + LABEL_FADE_IN);
  if (labelIn > 0) {
    out.push({
      type: 'readout',
      id: 'label-summit',
      anchor: { world: [cx - LABEL_OFFSET_X, top + len / 2] },
      text: text('label.pressureSummit'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      italic: true,
      align: 'center',
      opacity: labelIn * alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
