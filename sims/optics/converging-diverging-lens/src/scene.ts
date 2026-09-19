// ========================================================================
// converging-diverging-lens — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 렌즈 두 개는 `region` 이다. plugin 의 `opticalElement` 그림은 두께가 고정이고
//   `lens-concave` 가 가운데가 두꺼운 볼록 모양으로 나와(렌더러의 두 곡선이 볼록과 같은
//   도형을 만든다), 두 렌즈의 모양 차이가 주장의 절반인 이 조각에는 쓸 수 없다.
//   렌즈 요소는 선언만 만들어 `traceRay` 에 넘기고 화면에는 올리지 않는다.
//   (이 결함 — 장부 G224 — 은 이후 엔진에서 고쳤다(2026-09-19). 이 조각은 region 그림을 그대로 둔다.)
// - 줄기는 `ray`(plugin 강조색 하나) — 빛 한 가지 뜻이다. 두 렌즈의 줄기를 색으로 가르지
//   않는다. 가르는 것은 꺾이는 방향과 렌즈 모양이다 (S-piece).
// - 거꾸로 이은 줄기는 같은 강조색의 **점선** `trajectory` — 같은 줄기의 연장이라 같은
//   색이고, 실제 빛이 아니라는 것은 선 모양으로 가른다.
// - 실초점은 채운 점, 허초점은 빈 점(`body` fill none). 같은 표식 `F` 를 달고 모양으로 가른다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  OpticalElement,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { traceRay } from '@aperi21/plugin-optics';
import {
  clipByX,
  extensionOpacity,
  frontX,
  rayOffsets,
  readConstants,
  realFocusOpacity,
  tailX,
  traceBackReach,
  virtualFocusOpacity,
} from './physics';
import {
  AXIS_FROM_X,
  AXIS_TO_X,
  CONCAVE_AXIS_Y,
  CONCAVE_CENTER_HALF,
  CONCAVE_EDGE_HALF,
  CONCAVE_END_X,
  CONVEX_AXIS_Y,
  CONVEX_CENTER_HALF,
  CONVEX_EDGE_HALF,
  CONVEX_END_X,
  FOCUS_DOT_RADIUS,
  FOCUS_LABEL_DROP,
  LENS_HALF,
  LENS_LABEL_GAP,
  RAY_START_X,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { ConvergingDivergingLensState } from './state';

/** 광축 보조선 굵기(화면 px). 재는 기준선이라 줄기보다 가늘다. */
const AXIS_WIDTH_PX = 1;
/** 거꾸로 이은 점선 굵기(화면 px). 줄기(`ray`, 테마 regular)와 같은 줄기의 연장이라 비슷하게. */
const EXTENSION_WIDTH_PX = 1.5;
/** 렌즈 유리 채움 짙기. 지나가는 줄기가 비쳐 보이는 정도. */
const LENS_FILL = 0.22;
/** 렌즈 윤곽 한쪽 면을 자르는 마디 수. */
const LENS_SAMPLES = 18;
/** 렌즈 이름표 글자 크기(화면 px). */
const LENS_LABEL_PX = 13;
/** 초점 표식 `F` 글자 크기(화면 px). */
const FOCUS_LABEL_PX = 14;
/** `traceRay` 가 렌즈 뒤로 뻗는 길이(월드). 줄 끝(`*_END_X`)보다 넉넉하면 된다 — 뒤는 x 로 자른다. */
const TRACE_LENGTH = 30;

/** 한 줄(렌즈 하나)의 선언. */
interface Lane {
  key: 'convex' | 'concave';
  axisY: number;
  endX: number;
  /** 광축에서 y 만큼 떨어진 곳의 렌즈 반두께. */
  halfThickness: (y: number) => number;
}

const LANES: readonly Lane[] = [
  {
    key: 'convex',
    axisY: CONVEX_AXIS_Y,
    endX: CONVEX_END_X,
    // 가운데가 두껍고 가장자리로 갈수록 얇다.
    halfThickness: (y) => CONVEX_EDGE_HALF + (CONVEX_CENTER_HALF - CONVEX_EDGE_HALF) * (1 - (y / LENS_HALF) ** 2),
  },
  {
    key: 'concave',
    axisY: CONCAVE_AXIS_Y,
    endX: CONCAVE_END_X,
    // 가운데가 얇고 가장자리로 갈수록 두껍다.
    halfThickness: (y) => CONCAVE_CENTER_HALF + (CONCAVE_EDGE_HALF - CONCAVE_CENTER_HALF) * (y / LENS_HALF) ** 2,
  },
];

/** 렌즈 윤곽 다각형 — 오른쪽 면을 위에서 아래로, 왼쪽 면을 아래에서 위로. */
function lensOutline(lane: Lane): Vec2[] {
  const right: Vec2[] = [];
  const left: Vec2[] = [];
  for (let i = 0; i <= LENS_SAMPLES; i++) {
    const y = LENS_HALF - (2 * LENS_HALF * i) / LENS_SAMPLES;
    right.push([lane.halfThickness(y), lane.axisY + y]);
  }
  for (let i = 0; i <= LENS_SAMPLES; i++) {
    const y = -LENS_HALF + (2 * LENS_HALF * i) / LENS_SAMPLES;
    left.push([-lane.halfThickness(y), lane.axisY + y]);
  }
  return [...right, ...left];
}

/** `from` → `to` 로 가는 직선이 y = axisY 와 만나는 점. 수평이면 null. */
function meetAxis(from: Vec2, to: Vec2, axisY: number): Vec2 | null {
  const dy = to[1] - from[1];
  if (Math.abs(dy) < 1e-9) return null;
  const u = (axisY - from[1]) / dy;
  return [from[0] + (to[0] - from[0]) * u, axisY];
}

export function scene(params: {
  state: ConvergingDivergingLensState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('converging-diverging-lens: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const offsets = rayOffsets(c);

  const axes: Primitive[] = [];
  const lenses: Primitive[] = [];
  const rays: Primitive[] = [];
  const extensions: Primitive[] = [];
  const foci: Primitive[] = [];
  const labels: Primitive[] = [];

  for (const lane of LANES) {
    // ---- 광축 ----
    axes.push({
      type: 'trajectory',
      id: `axis-${lane.key}`,
      points: [
        [AXIS_FROM_X, lane.axisY],
        [AXIS_TO_X, lane.axisY],
      ],
      width: AXIS_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'medium' },
    });

    // ---- 렌즈 ----
    const outline = lensOutline(lane);
    lenses.push({
      type: 'region',
      id: `lens-${lane.key}`,
      points: outline,
      fillOpacity: LENS_FILL,
      outline: outline.map((_, i) => [i, (i + 1) % outline.length] as const),
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    labels.push({
      type: 'readout',
      id: `name-${lane.key}`,
      anchor: { world: [0, lane.axisY + LENS_HALF + LENS_LABEL_GAP] },
      text: text(lane.key === 'convex' ? 'label.convex' : 'label.concave'),
      chip: false,
      font: 'text',
      fontSize: LENS_LABEL_PX,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // ---- 줄기 추적 ----
    // 렌즈 요소는 추적에만 쓴다. 볼록 · 오목은 subtype 이 초점 거리의 부호를 정한다.
    const element: OpticalElement = {
      type: 'opticalElement',
      id: `element-${lane.key}`,
      subtype: lane.key === 'convex' ? 'lens-convex' : 'lens-concave',
      pos: [0, lane.axisY],
      orientation: 0,
      size: LENS_HALF * 2,
      focalLength: c.focalLength,
    };
    const x1 = frontX(timeline, lane.endX);
    const x0 = tailX(timeline, lane.endX);
    let focus: Vec2 | null = null;

    for (const [i, off] of offsets.entries()) {
      const traced = traceRay([RAY_START_X, lane.axisY + off], [1, 0], [element], {
        maxBounces: 1,
        maxLength: TRACE_LENGTH,
      });
      const [, hit, far] = traced.segments as [Vec2, Vec2, Vec2];

      const shown = clipByX(traced.segments, x0, x1);
      if (shown.length >= 2) {
        rays.push({ type: 'ray', id: `ray-${lane.key}-${i}`, segments: shown, showArrow: true });
      }

      // 초점은 추적한 줄기가 축과 만나는 자리다 — 볼록은 렌즈 뒤(앞으로 뻗은 줄기),
      // 오목은 렌즈 앞(거꾸로 이은 줄기). 가운데 줄기는 꺾이지 않아 만나는 점이 없다.
      const meet = meetAxis(hit, far, lane.axisY);
      if (!meet) continue;
      focus ??= meet;

      if (lane.key === 'concave') {
        const reach = traceBackReach(timeline);
        const fade = extensionOpacity(timeline);
        if (reach > 0 && fade > 0) {
          extensions.push({
            type: 'trajectory',
            id: `extension-${i}`,
            points: [hit, [hit[0] + (meet[0] - hit[0]) * reach, hit[1] + (meet[1] - hit[1]) * reach]],
            width: EXTENSION_WIDTH_PX,
            opacity: fade,
            style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
          });
        }
      }
    }

    // ---- 초점 ----
    const shade = lane.key === 'convex' ? realFocusOpacity(timeline) : virtualFocusOpacity(timeline);
    if (focus && shade > 0) {
      const f: Vec2 = focus;
      foci.push({
        type: 'body',
        id: `focus-${lane.key}`,
        shape: 'circle',
        pos: f,
        size: FOCUS_DOT_RADIUS,
        // 실초점은 줄기가 실제로 모인 점이라 채우고, 허초점은 점선만 모인 점이라 비운다.
        fill: lane.key === 'convex' ? 'solid' : 'none',
        outline: 'role',
        glow: false,
        opacity: shade,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      labels.push({
        type: 'readout',
        id: `focus-label-${lane.key}`,
        anchor: { world: [f[0], f[1] - FOCUS_LABEL_DROP] },
        text: text('label.focus'),
        chip: false,
        font: 'text',
        italic: true,
        fontSize: FOCUS_LABEL_PX,
        align: 'center',
        opacity: shade,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return [...axes, ...lenses, ...rays, ...extensions, ...foci, ...labels];
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
