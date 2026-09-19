// ========================================================================
// spherical-aberration — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 렌즈는 `region` 이다. plugin `opticalElement` 그림은 두께 · 곡률이 고정이라 두 면이
//   구면인 두꺼운 렌즈를 그릴 수 없다. 윤곽은 줄기 추적과 같은 곡면 식(`physics.ts`)으로 표본한다.
// - 줄기는 `ray`(plugin 강조색 하나) — 빛 한 가지 뜻이다. 높이마다 색을 가르지 않는다.
//   가르는 것은 축을 건너는 자리다 (S-piece).
// - 교차점은 축 위 작은 먹색 점(`body`), 교차점이 퍼진 폭은 수 없는 치수선(`dimension`).
// - 조리개는 렌즈 앞 두 판(`region`)이다. 판이 줄기 높이까지 내려오면 그 줄기는 판에서 끝난다.
// ========================================================================

import type { Bounds, EnvironmentDef, Primitive, SceneGraph, StageDef, TimelineFrame, Vec2, ViewDef } from '@aperi21/schema';
import {
  clipByX,
  frontSurfaceX,
  backSurfaceX,
  frontX,
  markOpacity,
  rayHeights,
  readConstants,
  stopEdge,
  stopOpacity,
  tailX,
  traceThickLens,
} from './physics';
import {
  AXIS_FROM_X,
  AXIS_TO_X,
  CROSS_DOT_RADIUS,
  LENS_HALF,
  SCENE_BOUNDS,
  SPREAD_DROP,
  STOP_LABEL_GAP,
  STOP_PLATE_HALF_WIDTH,
  STOP_PLATE_OUTER,
  STOP_X,
  text,
} from './schema';
import type { SphericalAberrationState } from './state';

/** 광축 보조선 굵기(화면 px). 재는 기준선이라 줄기보다 가늘다. */
const AXIS_WIDTH_PX = 1;
/** 렌즈 유리 채움 짙기. 지나가는 줄기가 비쳐 보이는 정도. */
const LENS_FILL = 0.22;
/** 조리개 판 채움 짙기. 막는 물건이라 렌즈보다 짙다. */
const STOP_FILL = 0.85;
/** 렌즈 한쪽 면을 자르는 마디 수. */
const LENS_SAMPLES = 24;
/** 조리개 이름표 글자 크기(화면 px). */
const STOP_LABEL_PX = 13;

export function scene(params: {
  state: SphericalAberrationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('spherical-aberration: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const heights = rayHeights(c);

  // ---- 광축 ----
  const axis: Primitive = {
    type: 'trajectory',
    id: 'axis',
    points: [
      [AXIS_FROM_X, 0],
      [AXIS_TO_X, 0],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };

  // ---- 렌즈 — 뒷면을 위에서 아래로, 앞면을 아래에서 위로 ----
  const outline: Vec2[] = [];
  for (let i = 0; i <= LENS_SAMPLES; i++) {
    const y = LENS_HALF - (2 * LENS_HALF * i) / LENS_SAMPLES;
    outline.push([backSurfaceX(c, y), y]);
  }
  for (let i = 0; i <= LENS_SAMPLES; i++) {
    const y = -LENS_HALF + (2 * LENS_HALF * i) / LENS_SAMPLES;
    outline.push([frontSurfaceX(c, y), y]);
  }
  const lens: Primitive = {
    type: 'region',
    id: 'lens',
    points: outline,
    fillOpacity: LENS_FILL,
    outline: outline.map((_, i) => [i, (i + 1) % outline.length] as const),
    style: { colorRole: 'muted', emphasis: 'strong' },
  };

  // ---- 줄기 ----
  const edge = stopEdge(timeline, c);
  const x1 = frontX(timeline);
  const x0 = tailX(timeline);
  const blockX = STOP_X - STOP_PLATE_HALF_WIDTH;
  const rays: Primitive[] = [];
  const crossings: number[] = [];

  for (const [i, h] of heights.entries()) {
    const traced = traceThickLens(c, h);
    // 판 안쪽 끝이 줄기 높이까지 내려왔으면 그 줄기는 판 앞에서 끝난다.
    const blocked = h >= edge;
    if (!blocked && traced.crossX !== null) crossings.push(traced.crossX);

    for (const sign of [1, -1] as const) {
      const pts = traced.points.map(([x, y]) => [x, y * sign] as Vec2);
      const shown = clipByX(pts, x0, blocked ? Math.min(x1, blockX) : x1);
      if (shown.length < 2) continue;
      rays.push({
        type: 'ray',
        id: `ray-${i}-${sign > 0 ? 'up' : 'down'}`,
        segments: shown,
        showArrow: !blocked,
      });
    }
  }

  // ---- 조리개 ----
  const stops: Primitive[] = [];
  const stopShade = stopOpacity(timeline);
  if (stopShade > 0) {
    for (const sign of [1, -1] as const) {
      const inner = edge * sign;
      const outer = STOP_PLATE_OUTER * sign;
      stops.push({
        type: 'region',
        id: `stop-${sign > 0 ? 'top' : 'bottom'}`,
        points: [
          [STOP_X - STOP_PLATE_HALF_WIDTH, inner],
          [STOP_X + STOP_PLATE_HALF_WIDTH, inner],
          [STOP_X + STOP_PLATE_HALF_WIDTH, outer],
          [STOP_X - STOP_PLATE_HALF_WIDTH, outer],
        ],
        fillOpacity: STOP_FILL,
        opacity: stopShade,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
    stops.push({
      type: 'readout',
      id: 'stop-label',
      anchor: { world: [STOP_X, STOP_PLATE_OUTER + STOP_LABEL_GAP] },
      text: text('label.stop'),
      chip: false,
      font: 'text',
      fontSize: STOP_LABEL_PX,
      align: 'center',
      opacity: stopShade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 교차점과 퍼진 폭 ----
  const marks: Primitive[] = [];
  const shade = markOpacity(timeline);
  if (shade > 0 && crossings.length > 0) {
    const lo = Math.min(...crossings);
    const hi = Math.max(...crossings);
    if (hi > lo) {
      marks.push({
        type: 'dimension',
        id: 'spread',
        from: [lo, -SPREAD_DROP],
        to: [hi, -SPREAD_DROP],
        opacity: shade,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
    }
    for (const [i, x] of crossings.entries()) {
      marks.push({
        type: 'body',
        id: `cross-${i}`,
        shape: 'circle',
        pos: [x, 0],
        size: CROSS_DOT_RADIUS,
        fill: 'solid',
        outline: 'role',
        glow: false,
        opacity: shade,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return [axis, lens, ...rays, ...stops, ...marks];
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
