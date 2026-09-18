// ========================================================================
// diffraction — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
// 물결 변위는 스칼라 장이라 `scalarField` 로 선언한다 — 벽 앞(평면파)과 틈 뒤(점파원 합)는
// 식이 달라 두 장이고, 같은 대상이라 같은 색 사상(순차형 `secondary`)을 쓴다. 벽은 `region`
// 둘, 「곧게 지났다면의 그늘 경계」 는 점선 `trajectory` 둘, 그늘 자리 이름표는 `readout` 하나.
//
// 색은 뜻마다 하나다 — 물은 `secondary` 의 명암, 벽 · 점선 · 이름표는 먹(`ink`).
// 강조색은 쓰지 않는다: 점선 바깥의 물결이 곧 요점이라 따로 칠할 것이 없다.
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
import {
  EXIT_X,
  LEFT_COLS,
  RIGHT_COLS,
  ROWS,
  diffractedField,
  incidentColumns,
  readConstants,
  slitEdges,
} from './physics';
import { CELL, FIELD_H, FIELD_W, SCENE_BOUNDS, WALL_X, text } from './schema';
import type { DiffractionState } from './state';

/** 점선 굵기(화면 px) · 짙기. 물결 위에서 읽혀야 하지만 벽보다는 물러나 있다. */
const SHADOW_LINE_PX = 1.5;
const SHADOW_LINE_OPACITY = 0.85;
/** 벽 칠 — 꽉 채운다. 물결이 비치면 벽이 아니다. */
const WALL_FILL = 1;
/** 그늘 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 이름표를 점선에서 띄우는 거리(월드) · 오른쪽 끝에서 들이는 거리(월드). */
const LABEL_GAP = 16;
const LABEL_INSET = 14;

/** 장이 월드 사각형 밖으로 넘치는 마지막 칸을 자른다. */
const FIELD_CLIP = { min: [0, 0] as Vec2, max: [FIELD_W, FIELD_H] as Vec2 };

export function scene(params: {
  state: DiffractionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('diffraction: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const { lower, upper } = slitEdges(c);
  const out: Primitive[] = [];

  // ---- 벽 앞: 들어오는 평면파 ----
  // 세로로 같은 값이라 한 행으로 선언하고 세로로 늘린다. 틈 안(벽 두께)까지 채운다 — 벽이 덮는다.
  out.push({
    type: 'scalarField',
    id: 'incident',
    min: [0, 0],
    max: [LEFT_COLS * CELL, FIELD_H],
    cols: LEFT_COLS,
    rows: 1,
    values: incidentColumns(timeline, c),
    range: [-1, 1],
    colors: { high: 'secondary' },
    clip: FIELD_CLIP,
  });

  // ---- 틈 뒤: 점파원 합 ----
  out.push({
    type: 'scalarField',
    id: 'diffracted',
    min: [EXIT_X, FIELD_H - ROWS * CELL],
    max: [EXIT_X + RIGHT_COLS * CELL, FIELD_H],
    cols: RIGHT_COLS,
    rows: ROWS,
    values: diffractedField(timeline, c),
    range: [-1, 1],
    colors: { high: 'secondary' },
    clip: FIELD_CLIP,
  });

  // ---- 벽 ----
  // 틈 아래 · 위 두 토막. 불투명하게 칠해 물결이 벽 속으로 비치지 않게 한다.
  const wall = (id: string, y0: number, y1: number): Primitive => ({
    type: 'region',
    id,
    points: [
      [WALL_X, y0],
      [EXIT_X, y0],
      [EXIT_X, y1],
      [WALL_X, y1],
    ],
    fillOpacity: WALL_FILL,
    opaque: true,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push(wall('wall-lower', 0, lower));
  out.push(wall('wall-upper', upper, FIELD_H));

  // ---- 곧게 지났다면의 그늘 경계 ----
  // 틈 가장자리에서 곧게 뻗는 점선. 물결이 빛살처럼 곧게만 지났다면 이 두 줄 바깥은 잠잠했다.
  for (const [id, y] of [
    ['shadow-lower', lower],
    ['shadow-upper', upper],
  ] as const) {
    out.push({
      type: 'trajectory',
      id,
      points: [
        [EXIT_X, y],
        [FIELD_W, y],
      ],
      width: SHADOW_LINE_PX,
      opacity: SHADOW_LINE_OPACITY,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 그늘 자리 이름표 ----
  // 위쪽 그늘 하나에만 단다. 두 곳에 달면 글자가 물결 무늬를 두 번 가린다.
  out.push({
    type: 'readout',
    id: 'shadow-label',
    anchor: { world: [FIELD_W - LABEL_INSET, upper + LABEL_GAP] },
    text: text('label.shadow'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 상태를 보지 않으므로 매 프레임 같다 — 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
