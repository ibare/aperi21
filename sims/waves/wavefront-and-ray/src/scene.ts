// ========================================================================
// wavefront-and-ray — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
// - 물결 변위 — `scalarField` 한 장(순차형 `secondary`, 옅게). 파면이 그려 넣은 선이 아니라
//   실제 물결의 같은 위상 자리라는 것을 밑에 깔아 보인다.
// - 파면(마루) — `lineSet` 하나. 파원을 중심으로 한 원호 묶음(먹색).
// - 따라가는 파면 하나 — `trajectory` 굵게(먹색). 이 면과 광선이 만나는 자리에 직각 표지가 붙는다.
// - 광선 — `vector` 일곱(강조색). 강조색은 광선과 그 발(직각 표지) 한 뜻에만 쓴다.
// - 직각 표지 — `lineSet` 하나(ㄱ자 세 점 꺾은선).
// - 파원 — `body` 점 하나(먹색). 판 안에 있을 때만.
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
  COLS,
  ROWS,
  arc,
  crestRadii,
  insideField,
  rays,
  readConstants,
  rightAngleMark,
  sourceDistance,
  sourcePos,
  trackedCrest,
  waveField,
} from './physics';
import { CELL, FIELD_H, FIELD_W, SCENE_BOUNDS } from './schema';
import type { WavefrontAndRayState } from './state';

/** 물결 장 짙기 — 파면 · 광선 아래 깔리는 배경이라 물러나 있다. */
const FIELD_OPACITY = 0.45;
/** 파면(마루) 선 굵기(화면 px) · 짙기. */
const CREST_WIDTH_PX = 1.5;
const CREST_OPACITY = 0.7;
/** 따라가는 파면 선 굵기(화면 px). */
const TRACKED_WIDTH_PX = 3.5;
/** 광선 굵기(화면 px). */
const RAY_WIDTH_PX = 2;
/** 직각 표지 한 변(월드) · 굵기(화면 px). */
const MARK_SIZE = 11;
const MARK_WIDTH_PX = 1.5;
/** 파원 점 반지름(월드). */
const SOURCE_RADIUS = 6;
/** 광선을 파원에서 띄우는 거리 · 판 끝에서 화살촉을 들이는 거리(월드). */
const RAY_SOURCE_GAP = 10;
const RAY_END_INSET = 6;
/** 이보다 작은 파면은 그리지 않는다(월드) — 파원 바로 곁에서 점으로 뭉친다. */
const MIN_CREST_RADIUS = 14;

/** 판 밖으로 넘치는 원호 · 장의 마지막 칸을 자른다. */
const FIELD_CLIP = { min: [0, 0] as Vec2, max: [FIELD_W, FIELD_H] as Vec2 };

export function scene(params: {
  state: WavefrontAndRayState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('wavefront-and-ray: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const t = timeline.t;
  const d = sourceDistance(timeline, c);
  const s = sourcePos(d);
  const out: Primitive[] = [];

  // ---- 물결 ----
  out.push({
    type: 'scalarField',
    id: 'water',
    min: [0, FIELD_H - ROWS * CELL],
    max: [COLS * CELL, FIELD_H],
    cols: COLS,
    rows: ROWS,
    values: waveField(t, d, c),
    range: [-1, 1],
    colors: { high: 'secondary' },
    opacity: FIELD_OPACITY,
    clip: FIELD_CLIP,
  });

  // ---- 파면(마루) ----
  out.push({
    type: 'lineSet',
    id: 'wavefronts',
    lines: crestRadii(t, d, c, MIN_CREST_RADIUS).map((r) => arc(s, r)),
    width: CREST_WIDTH_PX,
    opacity: CREST_OPACITY,
    clip: FIELD_CLIP,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 따라가는 파면 하나 ----
  const tracked = trackedCrest(t, d, c);
  out.push({
    type: 'trajectory',
    id: 'tracked-front',
    points: arc(s, tracked.r),
    width: TRACKED_WIDTH_PX,
    opacity: tracked.fade,
    clip: FIELD_CLIP,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 광선 ----
  const bundle = rays(d, RAY_SOURCE_GAP, RAY_END_INSET);
  bundle.forEach((ray, i) => {
    out.push({
      type: 'vector',
      id: `ray-${i}`,
      from: ray.start,
      delta: [ray.end[0] - ray.start[0], ray.end[1] - ray.start[1]],
      width: RAY_WIDTH_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  });

  // ---- 직각 표지 ----
  // 따라가는 파면과 광선이 만나는 자리마다. 파면을 타고 함께 나아간다.
  const marks = bundle
    .map((ray) => rightAngleMark(d, ray, tracked.r, MARK_SIZE))
    .filter((m): m is Vec2[] => m !== null);
  out.push({
    type: 'lineSet',
    id: 'right-angles',
    lines: marks,
    width: MARK_WIDTH_PX,
    opacity: tracked.fade,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 파원 ----
  if (insideField(s)) {
    out.push({
      type: 'body',
      id: 'source',
      pos: s,
      shape: 'circle',
      size: SOURCE_RADIUS,
      glow: false,
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
