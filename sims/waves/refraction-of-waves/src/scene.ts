// ========================================================================
// refraction-of-waves — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 물결 장은 위상 무늬라 `scalarField` 한 장(두 매질을 한 위상식으로),
// 얕은 쪽 바닥빛은 옅은 `region`, 경계 · 점선 · 굵은 마루는 `trajectory` 를 반평면 `clip` 으로
// 잘라 긋는다. 매질 이름은 월드에 붙은 `readout` 이다. 캡션은 선언의 캡션 슬롯이 그린다.
// ========================================================================

import type {
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  ScalarField,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { COLS, FAST_CREST_DIR, ROWS, geometry, meetingY, slowCrestDir, waveField } from './physics';
import {
  BOUNDARY_X,
  CELL,
  FIELD_H,
  FIELD_W,
  SCENE_BOUNDS,
  SHALLOW_TINT_OPACITY,
  STROKE,
  text,
} from './schema';
import type { RefractionOfWavesState } from './state';

/** 반평면 — 빠른 쪽 · 느린 쪽. 원본 캔버스 밖도 함께 자른다. */
const FAST_HALF = { min: [0, 0] as Vec2, max: [BOUNDARY_X, FIELD_H] as Vec2 };
const SLOW_HALF = { min: [BOUNDARY_X, 0] as Vec2, max: [FIELD_W, FIELD_H] as Vec2 };

/** 화면 좌표(y 아래) → 월드(y 위). */
const toWorld = (x: number, py: number): Vec2 => [x, FIELD_H - py];

/** 만남점 (XB, yb) 를 지나고 화면 방향 (dx, dy) 인 긴 선. 반평면 `clip` 이 자른다. */
function longLine(yb: number, dir: readonly [number, number]): Vec2[] {
  const L = 2000;
  const n = Math.hypot(dir[0], dir[1]);
  const ux = (dir[0] / n) * L;
  const uy = (dir[1] / n) * L;
  return [toWorld(BOUNDARY_X - ux, yb - uy), toWorld(BOUNDARY_X + ux, yb + uy)];
}

export function scene(params: {
  state: RefractionOfWavesState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('refraction-of-waves: schema.timeline 이 선언되어야 한다');
  const g = geometry(state.ratio);
  const bent = !state.straight;
  const out: Primitive[] = [];

  // ---- 물결 장 ----
  // 순차형 한 역할 — 0(골)이 바탕, 1(마루)이 물결 색. 두 매질의 물결 색은 같다(같은 대상).
  const values = new Array<number>(COLS * ROWS);
  waveField(values, timeline.t, g);
  const field: ScalarField = {
    type: 'scalarField',
    id: 'water',
    min: [0, FIELD_H - ROWS * CELL],
    max: [COLS * CELL, FIELD_H],
    cols: COLS,
    rows: ROWS,
    values,
    range: [0, 1],
    colors: { high: 'secondary' },
  };
  out.push(field);

  // ---- 얕은 쪽 바닥빛 ----
  // 물결 색은 그대로, 바닥빛만 조금 다르게. 강조색을 쓰지 않는다.
  const shallow: Region = {
    type: 'region',
    id: 'shallow',
    points: [
      [BOUNDARY_X, 0],
      [FIELD_W, 0],
      [FIELD_W, FIELD_H],
      [BOUNDARY_X, FIELD_H],
    ],
    fillOpacity: SHALLOW_TINT_OPACITY,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  out.push(shallow);

  // ---- 경계 ----
  const boundary: Trajectory = {
    type: 'trajectory',
    id: 'boundary',
    points: [
      [BOUNDARY_X, 0],
      [BOUNDARY_X, FIELD_H],
    ],
    width: STROKE.boundaryWidth,
    opacity: STROKE.boundaryOpacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(boundary);

  // ---- 매질 이름 ----
  // 어느 쪽이 느린지는 색이 아니라 글자로 말한다 — 모르면 꺾임의 방향을 해석할 수 없다.
  const labelY = FIELD_H - STROKE.labelCenterY;
  const deep: Readout = {
    type: 'readout',
    id: 'label-deep',
    anchor: { world: [STROKE.labelInsetX, labelY] },
    text: text('label.deep'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: STROKE.labelPx,
    opacity: STROKE.labelOpacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  const shallowLabel: Readout = {
    ...deep,
    id: 'label-shallow',
    anchor: { world: [FIELD_W - STROKE.labelInsetX, labelY] },
    text: text(bent ? 'label.shallow' : 'label.shallowSame'),
    align: 'right',
  };
  out.push(deep, shallowLabel);

  // ---- 따라가는 마루의 자리 · 나타남 ----
  const yb = meetingY(timeline.u, timeline.start('bend'));
  const alpha = timeline.at('appear') * (1 - timeline.at('vanish'));

  // ---- 느려지지 않았을 마루 ----
  // 빠른 쪽 마루의 연장. 속력 비가 1 이면 실제 마루와 겹치므로 두지 않는다.
  if (bent) {
    const ghost: Trajectory = {
      type: 'trajectory',
      id: 'unslowed-crest',
      points: longLine(yb, FAST_CREST_DIR),
      width: STROKE.ghostWidth,
      opacity: alpha * STROKE.ghostOpacity,
      clip: SLOW_HALF,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
    };
    out.push(ghost);
  }

  // ---- 따라가는 마루 ----
  // 강조색은 이 뜻 하나에만. 두 반평면을 따로 잘라 경계에서 만나게 한다.
  const crestFast: Trajectory = {
    type: 'trajectory',
    id: 'crest-fast',
    points: longLine(yb, FAST_CREST_DIR),
    width: STROKE.crestWidth,
    opacity: alpha,
    clip: FAST_HALF,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  const crestSlow: Trajectory = {
    ...crestFast,
    id: 'crest-slow',
    points: longLine(yb, slowCrestDir(g)),
    clip: SLOW_HALF,
  };
  out.push(crestFast, crestSlow);

  return out;
}

/** 고정 경계. 상태를 보지 않으므로 매 프레임 같다 — 카메라가 흔들리지 않는다. */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
