// ========================================================================
// slit-width-and-diffraction — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
// 물결 변위는 스칼라 장이라 `scalarField` 로 선언한다 — 벽 앞 평면파 한 장(두 수조가 같은 물결)과
// 수조마다 틈 뒤 점파원 합 한 장. 같은 대상이라 같은 색 사상(순차형 `secondary`)을 쓴다.
// 벽 · 칸막이는 `region`, 「곧게 지났다면의 그늘 경계」 는 수조마다 점선 `trajectory` 둘,
// 틈 폭 / 파장 비는 수조마다 `readout` 하나.
//
// 두 수조는 색으로 갈리지 않는다 — 다른 것은 틈 폭 하나뿐이고, 그 차이는 무늬의 모양으로 보인다.
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
  TANK_ROWS,
  diffractedField,
  gapEdges,
  incidentColumns,
  readConstants,
  type Gap,
} from './physics';
import {
  CELL,
  DIVIDER_H,
  FIELD_H,
  FIELD_W,
  NARROW_TANK_Y,
  SCENE_BOUNDS,
  TANK_H,
  WALL_X,
  WIDE_TANK_Y,
  text,
} from './schema';
import type { SlitWidthAndDiffractionState } from './state';

/** 점선 굵기(화면 px) · 짙기. 물결 위에서 읽혀야 하지만 벽보다는 물러나 있다. */
const SHADOW_LINE_PX = 1.5;
const SHADOW_LINE_OPACITY = 0.85;
/** 벽 · 칸막이 칠 — 꽉 채운다. 물결이 비치면 벽이 아니다. */
const WALL_FILL = 1;
/** 비 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 비 이름표를 수조 위 가장자리에서 내리는 거리(월드). 가로 자리는 벽 앞 평면파의 가운데. */
const LABEL_DROP = 20;
const LABEL_X = WALL_X / 2;

/** 장이 월드 사각형 밖으로 넘치는 마지막 칸을 자른다. */
const clipTo = (y0: number, y1: number): { min: Vec2; max: Vec2 } => ({
  min: [0, y0],
  max: [FIELD_W, y1],
});

const wall = (id: string, x0: number, x1: number, y0: number, y1: number): Primitive => ({
  type: 'region',
  id,
  points: [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ],
  fillOpacity: WALL_FILL,
  opaque: true,
  style: { colorRole: 'ink', emphasis: 'strong' },
});

export function scene(params: {
  state: SlitWidthAndDiffractionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('slit-width-and-diffraction: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  const tanks = [
    { id: 'wide', y: WIDE_TANK_Y, ratio: c.wideRatio },
    { id: 'narrow', y: NARROW_TANK_Y, ratio: c.narrowRatio },
  ].map((t) => ({
    ...t,
    gap: { center: t.y + TANK_H / 2, width: t.ratio * c.wavelength } satisfies Gap,
  }));

  // ---- 벽 앞: 들어오는 평면파 (두 수조가 같은 물결) ----
  // 세로로 같은 값이라 한 행으로 선언하고 세로로 늘린다. 칸막이가 위를 덮는다.
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
    clip: clipTo(0, FIELD_H),
  });

  // ---- 틈 뒤: 수조마다 점파원 합 ----
  for (const t of tanks) {
    out.push({
      type: 'scalarField',
      id: `diffracted-${t.id}`,
      min: [EXIT_X, t.y],
      max: [EXIT_X + RIGHT_COLS * CELL, t.y + TANK_ROWS * CELL],
      cols: RIGHT_COLS,
      rows: TANK_ROWS,
      values: diffractedField(timeline, c, t.y, t.gap),
      range: [-1, 1],
      colors: { high: 'secondary' },
      clip: clipTo(t.y, t.y + TANK_H),
    });
  }

  // ---- 칸막이 ----
  out.push(wall('divider', 0, FIELD_W, TANK_H, TANK_H + DIVIDER_H));

  // ---- 벽 ----
  // 틈마다 아래 · 위로 토막이 난다. 가운데 토막은 칸막이를 건너 두 수조에 걸친다.
  const narrow = gapEdges(tanks[1]!.gap);
  const wide = gapEdges(tanks[0]!.gap);
  out.push(wall('wall-bottom', WALL_X, EXIT_X, 0, narrow.lower));
  out.push(wall('wall-middle', WALL_X, EXIT_X, narrow.upper, wide.lower));
  out.push(wall('wall-top', WALL_X, EXIT_X, wide.upper, FIELD_H));

  for (const t of tanks) {
    const { lower, upper } = gapEdges(t.gap);

    // ---- 곧게 지났다면의 그늘 경계 ----
    // 틈 가장자리에서 곧게 뻗는 점선. 물결이 곧게만 지났다면 이 두 줄 바깥은 잠잠했다.
    for (const [side, y] of [
      ['lower', lower],
      ['upper', upper],
    ] as const) {
      out.push({
        type: 'trajectory',
        id: `shadow-${t.id}-${side}`,
        points: [
          [EXIT_X, y],
          [FIELD_W, y],
        ],
        width: SHADOW_LINE_PX,
        opacity: SHADOW_LINE_OPACITY,
        style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
      });
    }

    // ---- 틈 폭 / 파장 비 ----
    // 선언값을 그대로 띄운다 — 계산해 줄이지 않는다 (S-piece 유효숫자).
    out.push({
      type: 'readout',
      id: `ratio-${t.id}`,
      anchor: { world: [LABEL_X, t.y + TANK_H - LABEL_DROP] },
      text: text('label.ratio'),
      vars: { n: String(t.ratio) },
      chip: true,
      font: 'text',
      fontSize: LABEL_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 상태를 보지 않으므로 매 프레임 같다 — 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
