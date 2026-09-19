// ========================================================================
// human-eye-accommodation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 눈알은 `region` 원 다각형, 망막은 눈알 뒤쪽 호 `trajectory`, 수정체는 두께가 바뀌는
//   `region` 다각형이다. plugin `opticalElement` 그림은 렌즈 두께가 고정이라(G219)
//   「수정체가 두꺼워진다」 를 그릴 수 없다. 렌즈 요소는 선언만 만들어 `traceRay` 에 넘긴다.
// - 줄기는 `ray`(plugin 강조색 하나) — 빛 한 가지 뜻이다. 먼 산 줄기와 책 줄기를 색으로
//   가르지 않는다. 가르는 것은 들어오는 모양(나란함 · 벌어짐)과 이름표다 (S-piece).
// - 망막 뒤로 이은 줄기는 같은 강조색의 **점선** `trajectory` — 망막에 막혀 실제로는 가지
//   않는 길이라 선 모양으로 가른다. 망막에 번진 얼룩도 같은 강조색(빛이 닿은 자리)이다.
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
  accommodation,
  blurOpacity,
  clipByX,
  eyeCenter,
  farFocusOpacity,
  farFrontX,
  farLabelOpacity,
  farTailX,
  focalLengthNow,
  frontEndX,
  hitCircle,
  lensThicknessNow,
  meetAxis,
  nearFocusOpacity,
  nearFrontX,
  nearLabelOpacity,
  nearSourceX,
  nearTailX,
  rayHeights,
  readConstants,
  type HumanEyeAccommodationConstants,
} from './physics';
import {
  AXIS_FROM_X,
  AXIS_TO_X,
  DIMENSION_Y,
  EYE_RADIUS,
  FOCUS_DOT_RADIUS,
  GUIDE_GAP,
  LENS_EDGE_HALF,
  LENS_HALF,
  LENS_LABEL_GAP,
  OBJECT_LABEL_POS,
  RAY_START_X,
  RETINA_HALF_ANGLE,
  RETINA_LABEL_POS,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { HumanEyeAccommodationState } from './state';

/** 광축 · 치수 안내선 굵기(화면 px). 재는 기준선이라 가늘다. */
const GUIDE_WIDTH_PX = 1;
/** 눈알 윤곽 굵기(화면 px). */
const EYE_WIDTH_PX = 1.5;
/** 망막 굵기(화면 px). 눈알 윤곽보다 굵어 「여기가 상이 맺히는 막」 으로 읽힌다. */
const RETINA_WIDTH_PX = 4;
/** 망막 뒤로 이은 점선 굵기(화면 px). 줄기(`ray`)의 연장이라 비슷하게. */
const EXTENSION_WIDTH_PX = 1.5;
/** 망막에 번진 얼룩 굵기(화면 px). 망막 선 위에 겹쳐 빛이 닿은 폭을 보인다. */
const BLUR_WIDTH_PX = 7;
/** 번진 얼룩으로 그릴 최소 폭(mm). 이보다 좁으면 한 점에 모인 것이라 얼룩을 두지 않는다. */
const BLUR_MIN_SPREAD = 0.05;
/** 망막 뒤로 이은 점선을 그릴 최소 길이(mm). 이보다 짧으면 망막 위에 모인 것이다. */
const EXTENSION_MIN_LENGTH = 0.05;
/** 눈알 채움 짙기. 눈 속을 옅게 가른다. */
const EYE_FILL = 0.08;
/** 수정체 채움 짙기. 지나가는 줄기가 비쳐 보이는 정도. */
const LENS_FILL = 0.28;
/** 눈알 원을 자르는 마디 수. */
const EYE_SAMPLES = 72;
/** 망막 호를 자르는 마디 수. */
const RETINA_SAMPLES = 40;
/** 번진 얼룩(망막 위 짧은 호)을 자르는 마디 수. */
const BLUR_SAMPLES = 8;
/** 수정체 윤곽 한쪽 면을 자르는 마디 수. */
const LENS_SAMPLES = 18;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 보는 대상 이름표 글자 크기(화면 px). */
const OBJECT_LABEL_PX = 14;
/** `traceRay` 가 수정체 뒤로 뻗는 길이(mm). 망막보다 넉넉하면 된다 — 뒤는 망막에서 자른다. */
const TRACE_LENGTH = 80;

/** 눈알 원 위 각 θ 의 점. */
function onEye(center: Vec2, theta: number): Vec2 {
  return [center[0] + EYE_RADIUS * Math.cos(theta), center[1] + EYE_RADIUS * Math.sin(theta)];
}

/** 수정체 윤곽 다각형 — 오른쪽 면을 위에서 아래로, 왼쪽 면을 아래에서 위로. 가운데가 두껍다. */
function lensOutline(centerHalf: number): Vec2[] {
  const half = (y: number): number => LENS_EDGE_HALF + (centerHalf - LENS_EDGE_HALF) * (1 - (y / LENS_HALF) ** 2);
  const right: Vec2[] = [];
  const left: Vec2[] = [];
  for (let i = 0; i <= LENS_SAMPLES; i++) {
    const y = LENS_HALF - (2 * LENS_HALF * i) / LENS_SAMPLES;
    right.push([half(y), y]);
  }
  for (let i = 0; i <= LENS_SAMPLES; i++) {
    const y = -LENS_HALF + (2 * LENS_HALF * i) / LENS_SAMPLES;
    left.push([-half(y), y]);
  }
  return [...right, ...left];
}

/** 추적한 줄기 하나 — 수정체까지, 수정체에서 망막까지, 그리고 망막을 지나 축과 만나는 점. */
interface TracedBeam {
  path: Vec2[];
  retinaHit: Vec2;
  meet: Vec2 | null;
}

function traceBeam(
  origin: Vec2,
  dir: Vec2,
  lens: OpticalElement,
  center: Vec2,
): TracedBeam | null {
  const traced = traceRay(origin, dir, [lens], { maxBounces: 1, maxLength: TRACE_LENGTH });
  const [, hit, far] = traced.segments as [Vec2, Vec2, Vec2];
  if (!hit || !far) return null;
  const retinaHit = hitCircle(hit, [far[0] - hit[0], far[1] - hit[1]], center, EYE_RADIUS);
  if (!retinaHit) return null;
  return { path: [origin, hit, retinaHit], retinaHit, meet: meetAxis(hit, far) };
}

/** 먼 산 줄기(나란함)와 책 줄기(한 점에서 벌어짐)의 출발점 · 방향. */
function beams(c: HumanEyeAccommodationConstants, kind: 'far' | 'near'): { origin: Vec2; dir: Vec2 }[] {
  const sx = nearSourceX(c);
  return rayHeights(c).map((h) => {
    if (kind === 'far') return { origin: [RAY_START_X, h] as Vec2, dir: [1, 0] as Vec2 };
    // 책의 한 점(sx, 0)에서 수정체 높이 h 로 가는 직선을 화면 왼쪽 끝에서 잘라 출발한다.
    const y0 = (h * (RAY_START_X - sx)) / (0 - sx);
    return { origin: [RAY_START_X, y0] as Vec2, dir: [-sx, h] as Vec2 };
  });
}

export function scene(params: {
  state: HumanEyeAccommodationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('human-eye-accommodation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const center = eyeCenter(c);
  const a = accommodation(timeline);
  const endX = frontEndX(c);

  const out: Primitive[] = [];

  // ---- 눈알 ----
  const eyePts: Vec2[] = Array.from({ length: EYE_SAMPLES }, (_, i) => onEye(center, (2 * Math.PI * i) / EYE_SAMPLES));
  out.push({
    type: 'region',
    id: 'eyeball',
    points: eyePts,
    fillOpacity: EYE_FILL,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  out.push({
    type: 'trajectory',
    id: 'eyeball-outline',
    points: eyePts,
    closed: true,
    width: EYE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 광축 ----
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [AXIS_FROM_X, 0],
      [AXIS_TO_X, 0],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // ---- 수정체 ----
  const outline = lensOutline(lensThicknessNow(c, a) / 2);
  out.push({
    type: 'region',
    id: 'lens',
    points: outline,
    fillOpacity: LENS_FILL,
    outline: outline.map((_, i) => [i, (i + 1) % outline.length] as const),
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 망막 ----
  out.push({
    type: 'trajectory',
    id: 'retina',
    points: Array.from({ length: RETINA_SAMPLES + 1 }, (_, i) =>
      onEye(center, -RETINA_HALF_ANGLE + (2 * RETINA_HALF_ANGLE * i) / RETINA_SAMPLES),
    ),
    width: RETINA_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 수정체–망막 거리 (처음부터 끝까지 그대로) ----
  out.push({
    type: 'trajectory',
    id: 'guide-lens',
    points: [
      [0, -LENS_HALF],
      [0, DIMENSION_Y],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  out.push({
    type: 'trajectory',
    id: 'guide-retina',
    points: [
      [c.retinaDistance, -GUIDE_GAP],
      [c.retinaDistance, DIMENSION_Y],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  out.push({
    type: 'dimension',
    id: 'lens-retina',
    from: [0, DIMENSION_Y],
    to: [c.retinaDistance, DIMENSION_Y],
    text: text('label.distance'),
    vars: { d: String(c.retinaDistance) },
  });

  // ---- 줄기 ----
  // 수정체 요소는 추적에만 쓴다. 초점 거리는 지금 조절 몫에서 나온다.
  const lens: OpticalElement = {
    type: 'opticalElement',
    id: 'lens-element',
    subtype: 'lens-convex',
    pos: [0, 0],
    orientation: 0,
    size: LENS_HALF * 2,
    focalLength: focalLengthNow(c, a),
  };

  const sets = [
    { kind: 'far' as const, x1: farFrontX(timeline, endX), x0: farTailX(timeline, endX) },
    { kind: 'near' as const, x1: nearFrontX(timeline, endX), x0: nearTailX(timeline, endX) },
  ];
  const rays: Primitive[] = [];
  const extensions: Primitive[] = [];
  const marks: Primitive[] = [];
  let nearHits: Vec2[] = [];
  let farFocus: Vec2 | null = null;
  let nearFocus: Vec2 | null = null;

  for (const set of sets) {
    const traced = beams(c, set.kind)
      .map((b) => traceBeam(b.origin, b.dir, lens, center))
      .filter((b): b is TracedBeam => b !== null);

    for (const [i, beam] of traced.entries()) {
      const shown = clipByX(beam.path, set.x0, set.x1);
      if (shown.length >= 2) {
        rays.push({ type: 'ray', id: `ray-${set.kind}-${i}`, segments: shown, showArrow: false });
      }
      if (!beam.meet) continue;
      // 초점은 추적한 줄기가 축과 만나는 자리다. 가운데 줄기는 꺾이지 않아 만나는 점이 없다.
      if (set.kind === 'far') farFocus ??= beam.meet;
      else nearFocus ??= beam.meet;

      // 망막 뒤에서 모이면 망막을 지나 그 점까지 점선으로 잇는다 — 실제로는 망막에 막힌다.
      const shade = blurOpacity(timeline);
      const behind = beam.meet[0] - beam.retinaHit[0];
      if (set.kind === 'near' && shade > 0 && behind > EXTENSION_MIN_LENGTH) {
        extensions.push({
          type: 'trajectory',
          id: `extension-${i}`,
          points: [beam.retinaHit, beam.meet],
          width: EXTENSION_WIDTH_PX,
          opacity: shade,
          style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
        });
      }
    }
    if (set.kind === 'near') nearHits = traced.map((b) => b.retinaHit);
  }

  // ---- 망막에 번진 얼룩 — 책 줄기가 망막에 닿은 폭 ----
  const blurShade = blurOpacity(timeline);
  if (blurShade > 0 && nearHits.length >= 2) {
    const angles = nearHits.map((p) => Math.atan2(p[1] - center[1], p[0] - center[0]));
    const lo = Math.min(...angles);
    const hi = Math.max(...angles);
    if ((hi - lo) * EYE_RADIUS > BLUR_MIN_SPREAD) {
      marks.push({
        type: 'trajectory',
        id: 'blur',
        points: Array.from({ length: BLUR_SAMPLES + 1 }, (_, i) => onEye(center, lo + ((hi - lo) * i) / BLUR_SAMPLES)),
        width: BLUR_WIDTH_PX,
        opacity: blurShade,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // ---- 망막 위 한 점 ----
  for (const [id, focus, shade] of [
    ['focus-far', farFocus, farFocusOpacity(timeline)],
    ['focus-near', nearFocus, nearFocusOpacity(timeline)],
  ] as const) {
    if (!focus || shade <= 0) continue;
    marks.push({
      type: 'body',
      id,
      shape: 'circle',
      pos: focus,
      size: FOCUS_DOT_RADIUS,
      fill: 'solid',
      outline: 'role',
      glow: false,
      opacity: shade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 이름표 ----
  const labels: Primitive[] = [
    {
      type: 'readout',
      id: 'name-far',
      anchor: { world: [OBJECT_LABEL_POS[0], OBJECT_LABEL_POS[1]] },
      text: text('label.far'),
      chip: false,
      font: 'text',
      fontSize: OBJECT_LABEL_PX,
      opacity: farLabelOpacity(timeline),
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'readout',
      id: 'name-near',
      anchor: { world: [OBJECT_LABEL_POS[0], OBJECT_LABEL_POS[1]] },
      text: text('label.near'),
      vars: { d: String(c.nearDistanceCm) },
      chip: false,
      font: 'text',
      fontSize: OBJECT_LABEL_PX,
      opacity: nearLabelOpacity(timeline),
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'readout',
      id: 'name-lens',
      anchor: { world: [0, LENS_HALF + LENS_LABEL_GAP] },
      text: text('label.lens'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'readout',
      id: 'name-retina',
      anchor: { world: [RETINA_LABEL_POS[0], RETINA_LABEL_POS[1]] },
      text: text('label.retina'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
  ];

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return [...out, ...rays, ...extensions, ...marks, ...labels];
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
