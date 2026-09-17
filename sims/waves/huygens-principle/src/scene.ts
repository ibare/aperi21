// ========================================================================
// huygens-principle — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 물결 변위는 스칼라 장이라 `scalarField` 로 선언한다 —
// 왼쪽(들어오는 평면파)과 오른쪽(점파원 합)은 식이 달라 두 장이고, 같은 대상이라
// 같은 색 사상을 쓴다. 점파원 떼는 `particleSystem` 하나, 파면 자리는 선 하나다.
// ========================================================================

import type {
  EnvironmentDef,
  ParticleSystem,
  Primitive,
  ScalarField,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  LEFT_COLS,
  RIGHT_COLS,
  ROWS,
  aliveSources,
  incidentColumns,
  waveletField,
} from './physics';
import { CELL, FIELD_H, FIELD_W, SCENE_BOUNDS, SOURCE_RADIUS, WAVEFRONT_X } from './schema';
import type { HuygensPrincipleState } from './state';

/** 원본 캔버스 밖으로 넘치는 마지막 칸(842 · −1)을 자른다 — 원본도 캔버스가 잘랐다. */
const CANVAS_CLIP = { min: [0, 0] as Vec2, max: [FIELD_W, FIELD_H] as Vec2 };

/**
 * 변위 → 장 값. 색 사상은 「골 짙게 · 0 중간 · 마루 옅게」 한 줄이어야 한다.
 * 순차형(`high` 하나)은 `range[0]` 이 바탕, `range[1]` 이 역할 색이라 **골 깊이**(−변위)를
 * 넘긴다 — 마루가 바탕(옅게), 골이 먹색(짙게). NOTES 「장 색」.
 */
const toDepth = (pressed: number): number => -pressed;

export function scene(params: {
  state: HuygensPrincipleState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('huygens-principle: schema.timeline 이 선언되어야 한다');
  const start = (id: string): number => timeline.start(id);
  const out: Primitive[] = [];

  // ---- 들어오는 평면파 ----
  // 세로로 같은 값이라 한 행으로 선언하고 세로로 늘린다.
  const left = new Array<number>(LEFT_COLS);
  incidentColumns(left, timeline.t);
  const incident: ScalarField = {
    type: 'scalarField',
    id: 'incident',
    min: [0, FIELD_H - ROWS * CELL],
    max: [LEFT_COLS * CELL, FIELD_H],
    cols: LEFT_COLS,
    rows: 1,
    values: left.map(toDepth),
    range: [-1, 1],
    colors: { high: 'ink' },
    clip: CANVAS_CLIP,
  };
  out.push(incident);

  // ---- 점파원이 낸 파의 합 ----
  // 미리 그린 곧은 선이 아니라 실제 합이다. 곧아지는지는 계산이 결정한다.
  const right = new Array<number>(RIGHT_COLS * ROWS);
  waveletField(right, timeline.t, timeline.period, timeline.cycle, start);
  const wavelets: ScalarField = {
    type: 'scalarField',
    id: 'wavelets',
    min: [WAVEFRONT_X, FIELD_H - ROWS * CELL],
    max: [WAVEFRONT_X + RIGHT_COLS * CELL, FIELD_H],
    cols: RIGHT_COLS,
    rows: ROWS,
    values: right.map(toDepth),
    range: [-1, 1],
    colors: { high: 'ink' },
    clip: CANVAS_CLIP,
  };
  out.push(wavelets);

  // ---- 파면 자리 ----
  // 옅은 무채색 가는 선. 강조색을 쓰지 않는다.
  const wavefront: Trajectory = {
    type: 'trajectory',
    id: 'wavefront',
    points: [
      [WAVEFRONT_X, 0],
      [WAVEFRONT_X, FIELD_H],
    ],
    width: 1,
    opacity: 0.35,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(wavefront);

  // ---- 파면 위의 점파원 ----
  // 강조색은 오직 점파원에만. 화면 끝 점은 반쯤 잘리지 않게 안쪽으로 붙인다(원본 그대로).
  const alive = aliveSources(timeline.u, start);
  const sources: ParticleSystem = {
    type: 'particleSystem',
    id: 'sources',
    positions: alive.map((s): Vec2 => [
      WAVEFRONT_X,
      FIELD_H - Math.min(FIELD_H - SOURCE_RADIUS, Math.max(SOURCE_RADIUS, s.y)),
    ]),
    sizes: SOURCE_RADIUS,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(sources);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 상태를 보지 않으므로 매 프레임 같다 — 카메라가 흔들리지 않는다. */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
