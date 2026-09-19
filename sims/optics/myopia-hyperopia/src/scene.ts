// ========================================================================
// myopia-hyperopia — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 눈 두 벌(근시 · 원시)을 같은 자리에 두고 시간표 짙기로 교대한다. 눈알은 `region` 타원
//   다각형 — 근시 눈은 가로로 길고 원시 눈은 짧다. 망막은 눈알 뒤쪽 호 `trajectory`.
// - 수정체 · 안경알은 `region` 다각형이다. plugin `opticalElement` 그림은 두께가 고정이고
//   (G219) `lens-concave` 가 볼록 모양으로 그려진다(G224) — G224 는 이후 엔진에서 고쳤다(2026-09-19), 이 조각은 region 그림을 그대로 둔다. 렌즈 요소는 선언만 만들어
//   `traceRay` 에 넘긴다.
// - 줄기는 `ray`(plugin 강조색 하나) — 빛 한 가지 뜻이다. 근시 · 원시 줄기를 색으로 가르지
//   않는다. 가르는 것은 들어오는 모양(나란함 · 벌어짐)과 이름표다 (S-piece).
// - 망막 뒤로 이은 줄기는 같은 강조색의 **점선** `trajectory` — 망막에 막혀 실제로는 가지
//   않는 길이라 선 모양으로 가른다. 망막에 번진 얼룩도 같은 강조색(빛이 닿은 자리)이다.
// - 모이는 점은 먹색 점 — 줄기가 실제로 모인 점(망막 앞 · 위)은 채우고, 점선만 모인 점(망막
//   뒤)은 비운다.
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
  HYPEROPIC_PHASES,
  MYOPIC_PHASES,
  clipByX,
  ellipseAngle,
  eyeOpacity,
  eyeball,
  frontX,
  glassesOpacity,
  hitEllipse,
  markOpacity,
  meetAxis,
  nearSourceX,
  objectLabelOpacity,
  onEllipse,
  rayHeights,
  readConstants,
  tailX,
  wear,
  type Ellipse,
  type EyePhases,
  type MyopiaHyperopiaConstants,
} from './physics';
import {
  AXIS_FROM_X,
  AXIS_TO_X,
  EYE_LABEL_GAP,
  FOCUS_DOT_RADIUS,
  GLASSES_HALF,
  GLASSES_LABEL_GAP,
  GLASSES_THICK_HALF,
  GLASSES_THIN_HALF,
  LENS_CENTER_HALF,
  LENS_EDGE_HALF,
  LENS_HALF,
  LENS_LABEL_GAP,
  OBJECT_LABEL_POS,
  RAY_START_X,
  RETINA_HALF_ANGLE,
  RETINA_LABEL_DX,
  RETINA_LABEL_Y,
  SCENE_BOUNDS,
  text,
  type MyopiaHyperopiaMessageKey,
} from './schema';
import type { MyopiaHyperopiaState } from './state';

/** 광축 굵기(화면 px). 재는 기준선이라 가늘다. */
const AXIS_WIDTH_PX = 1;
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
/** 모이는 점이 망막 뒤 끝에서 이만큼(mm) 안쪽이면 망막 위에 모인 것으로 채운다. */
const ON_RETINA_TOLERANCE = 0.1;
/** 눈알 채움 짙기. 눈 속을 옅게 가른다. */
const EYE_FILL = 0.08;
/** 수정체 · 안경알 채움 짙기. 지나가는 줄기가 비쳐 보이는 정도. */
const LENS_FILL = 0.28;
/** 눈알 타원을 자르는 마디 수. */
const EYE_SAMPLES = 72;
/** 망막 호를 자르는 마디 수. */
const RETINA_SAMPLES = 40;
/** 번진 얼룩(망막 위 짧은 호)을 자르는 마디 수. */
const BLUR_SAMPLES = 8;
/** 렌즈 윤곽 한쪽 면을 자르는 마디 수. */
const LENS_SAMPLES = 18;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 눈 이름표 · 보는 대상 이름표 글자 크기(화면 px). */
const TITLE_LABEL_PX = 14;
/** `traceRay` 가 수정체 뒤로 뻗는 길이(mm). 망막보다 넉넉하면 된다 — 뒤는 망막에서 자른다. */
const TRACE_LENGTH = 120;
/** 수정체에 닿은 점으로 볼 x 허용 오차(mm). 그보다 멀면 줄기가 수정체를 비껴간 것이다. */
const LENS_HIT_TOLERANCE = 1e-3;

/** 한 눈의 선언. 눈마다 다른 것은 망막 거리 · 보는 대상 · 안경알 종류다. */
interface EyeCase {
  key: 'myopic' | 'hyperopic';
  phases: EyePhases;
  retina: (c: MyopiaHyperopiaConstants) => number;
  source: 'far' | 'near';
  glasses: 'lens-concave' | 'lens-convex';
  glassesFocal: (c: MyopiaHyperopiaConstants) => number;
  eyeLabel: MyopiaHyperopiaMessageKey;
  glassesLabel: MyopiaHyperopiaMessageKey;
  objectLabel: MyopiaHyperopiaMessageKey;
  /** y 만큼 떨어진 곳의 안경알 반두께. */
  glassesHalf: (y: number) => number;
}

const EYES: readonly EyeCase[] = [
  {
    key: 'myopic',
    phases: MYOPIC_PHASES,
    retina: (c) => c.myopicRetina,
    source: 'far',
    glasses: 'lens-concave',
    glassesFocal: (c) => c.concaveFocal,
    eyeLabel: 'label.myopicEye',
    glassesLabel: 'label.concave',
    objectLabel: 'label.far',
    // 가운데가 얇고 가장자리로 갈수록 두껍다.
    glassesHalf: (y) => GLASSES_THIN_HALF + (GLASSES_THICK_HALF - GLASSES_THIN_HALF) * (y / GLASSES_HALF) ** 2,
  },
  {
    key: 'hyperopic',
    phases: HYPEROPIC_PHASES,
    retina: (c) => c.hyperopicRetina,
    source: 'near',
    glasses: 'lens-convex',
    glassesFocal: (c) => c.convexFocal,
    eyeLabel: 'label.hyperopicEye',
    glassesLabel: 'label.convex',
    objectLabel: 'label.near',
    // 가운데가 두껍고 가장자리로 갈수록 얇다.
    glassesHalf: (y) => GLASSES_THIN_HALF + (GLASSES_THICK_HALF - GLASSES_THIN_HALF) * (1 - (y / GLASSES_HALF) ** 2),
  },
];

/** 렌즈 윤곽 다각형 — 오른쪽 면을 위에서 아래로, 왼쪽 면을 아래에서 위로. x = `cx` 가 가운데. */
function lensOutline(cx: number, half: number, halfThickness: (y: number) => number): Vec2[] {
  const right: Vec2[] = [];
  const left: Vec2[] = [];
  for (let i = 0; i <= LENS_SAMPLES; i++) {
    const y = half - (2 * half * i) / LENS_SAMPLES;
    right.push([cx + halfThickness(y), y]);
  }
  for (let i = 0; i <= LENS_SAMPLES; i++) {
    const y = -half + (2 * half * i) / LENS_SAMPLES;
    left.push([cx - halfThickness(y), y]);
  }
  return [...right, ...left];
}

/** 수정체 반두께 — 두께가 그대로인 볼록 모양. */
function eyeLensHalf(y: number): number {
  return LENS_EDGE_HALF + (LENS_CENTER_HALF - LENS_EDGE_HALF) * (1 - (y / LENS_HALF) ** 2);
}

/** 줄기 출발점 · 방향 — 먼 곳은 나란하게, 책은 한 점(nearSourceX, 0)에서 벌어지며. */
function beams(c: MyopiaHyperopiaConstants, source: 'far' | 'near'): { origin: Vec2; dir: Vec2 }[] {
  const sx = nearSourceX(c);
  return rayHeights(c).map((h) => {
    if (source === 'far') return { origin: [RAY_START_X, h] as Vec2, dir: [1, 0] as Vec2 };
    // 책의 한 점(sx, 0)에서 수정체 높이 h 로 가는 직선을 화면 왼쪽 끝에서 잘라 출발한다.
    const y0 = (h * (RAY_START_X - sx)) / (0 - sx);
    return { origin: [RAY_START_X, y0] as Vec2, dir: [-sx, h] as Vec2 };
  });
}

/** 추적한 줄기 하나 — 출발점에서 망막까지, 망막에 닿은 점, 수정체 뒤 줄기가 축과 만나는 점. */
interface TracedBeam {
  path: Vec2[];
  retinaHit: Vec2;
  meet: Vec2 | null;
}

function traceBeam(origin: Vec2, dir: Vec2, elements: OpticalElement[], eye: Ellipse): TracedBeam | null {
  const segs = traceRay(origin, dir, elements, { maxBounces: elements.length, maxLength: TRACE_LENGTH }).segments;
  if (segs.length < 3) return null;
  const hit = segs[segs.length - 2]!;
  const far = segs[segs.length - 1]!;
  // 마지막으로 꺾인 곳이 수정체(x = 0)여야 한다.
  if (Math.abs(hit[0]) > LENS_HIT_TOLERANCE) return null;
  const retinaHit = hitEllipse(hit, [far[0] - hit[0], far[1] - hit[1]], eye);
  if (!retinaHit) return null;
  return { path: [...segs.slice(0, -1), retinaHit], retinaHit, meet: meetAxis(hit, far) };
}

function eyePrimitives(c: MyopiaHyperopiaConstants, tl: TimelineFrame, eyeCase: EyeCase): Primitive[] {
  const p = eyeCase.phases;
  const eo = eyeOpacity(tl, p);
  if (eo <= 0) return [];
  const retina = eyeCase.retina(c);
  const e = eyeball(retina);
  const w = wear(tl, p);
  const go = glassesOpacity(tl, p);
  const shade = markOpacity(tl, p);
  const id = (s: string): string => `${eyeCase.key}-${s}`;

  const body: Primitive[] = [];
  const rays: Primitive[] = [];
  const marks: Primitive[] = [];
  const labels: Primitive[] = [];

  // ---- 눈알 ----
  const eyePts: Vec2[] = Array.from({ length: EYE_SAMPLES }, (_, i) => onEllipse(e, (2 * Math.PI * i) / EYE_SAMPLES));
  body.push({
    type: 'region',
    id: id('eyeball'),
    points: eyePts,
    fillOpacity: EYE_FILL,
    opacity: eo,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  body.push({
    type: 'trajectory',
    id: id('eyeball-outline'),
    points: eyePts,
    closed: true,
    width: EYE_WIDTH_PX,
    opacity: eo,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 수정체 ----
  const lensPts = lensOutline(0, LENS_HALF, eyeLensHalf);
  body.push({
    type: 'region',
    id: id('lens'),
    points: lensPts,
    fillOpacity: LENS_FILL,
    outline: lensPts.map((_, i) => [i, (i + 1) % lensPts.length] as const),
    opacity: eo,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 망막 ----
  body.push({
    type: 'trajectory',
    id: id('retina'),
    points: Array.from({ length: RETINA_SAMPLES + 1 }, (_, i) =>
      onEllipse(e, -RETINA_HALF_ANGLE + (2 * RETINA_HALF_ANGLE * i) / RETINA_SAMPLES),
    ),
    width: RETINA_WIDTH_PX,
    opacity: eo,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 안경알 ----
  if (go > 0) {
    const gPts = lensOutline(-c.glassesGap, GLASSES_HALF, eyeCase.glassesHalf);
    body.push({
      type: 'region',
      id: id('glasses'),
      points: gPts,
      fillOpacity: LENS_FILL,
      outline: gPts.map((_, i) => [i, (i + 1) % gPts.length] as const),
      opacity: go,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    labels.push({
      type: 'readout',
      id: id('name-glasses'),
      anchor: { world: [-c.glassesGap, -GLASSES_HALF - GLASSES_LABEL_GAP] },
      text: text(eyeCase.glassesLabel),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: go,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 줄기 ----
  // 렌즈 요소는 추적에만 쓴다. 안경알의 굴절력은 안경 몫만큼 0 에서 선언값까지 오른다.
  const elements: OpticalElement[] = [];
  if (w > 0) {
    elements.push({
      type: 'opticalElement',
      id: id('glasses-element'),
      subtype: eyeCase.glasses,
      pos: [-c.glassesGap, 0],
      orientation: 0,
      size: GLASSES_HALF * 2,
      focalLength: eyeCase.glassesFocal(c) / w,
    });
  }
  elements.push({
    type: 'opticalElement',
    id: id('lens-element'),
    subtype: 'lens-convex',
    pos: [0, 0],
    orientation: 0,
    size: LENS_HALF * 2,
    focalLength: c.eyeFocal,
  });

  const traced = beams(c, eyeCase.source)
    .map((b) => traceBeam(b.origin, b.dir, elements, e))
    .filter((b): b is TracedBeam => b !== null);
  const x1 = frontX(tl, p, retina);
  const x0 = tailX(tl, p, retina);
  let focus: Vec2 | null = null;

  for (const [i, beam] of traced.entries()) {
    const shown = clipByX(beam.path, x0, x1);
    if (shown.length >= 2) {
      rays.push({ type: 'ray', id: id(`ray-${i}`), segments: shown, showArrow: false });
    }
    if (!beam.meet) continue;
    // 모이는 점은 추적한 줄기가 축과 만나는 자리다. 가운데 줄기는 꺾이지 않아 만나는 점이 없다.
    focus ??= beam.meet;

    // 망막 뒤에서 모이면 망막을 지나 그 점까지 점선으로 잇는다 — 실제로는 망막에 막힌다.
    const behind = beam.meet[0] - beam.retinaHit[0];
    if (shade > 0 && behind > EXTENSION_MIN_LENGTH) {
      marks.push({
        type: 'trajectory',
        id: id(`extension-${i}`),
        points: [beam.retinaHit, beam.meet],
        width: EXTENSION_WIDTH_PX,
        opacity: shade,
        style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
      });
    }
  }

  // ---- 망막에 번진 얼룩 — 줄기가 망막에 닿은 폭 ----
  if (shade > 0 && traced.length >= 2) {
    const angles = traced.map((b) => ellipseAngle(e, b.retinaHit));
    const lo = Math.min(...angles);
    const hi = Math.max(...angles);
    const a = onEllipse(e, lo);
    const b = onEllipse(e, hi);
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) > BLUR_MIN_SPREAD) {
      marks.push({
        type: 'trajectory',
        id: id('blur'),
        points: Array.from({ length: BLUR_SAMPLES + 1 }, (_, i) => onEllipse(e, lo + ((hi - lo) * i) / BLUR_SAMPLES)),
        width: BLUR_WIDTH_PX,
        opacity: shade,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // ---- 모이는 점 ----
  if (focus && shade > 0) {
    const reached = focus[0] <= retina + ON_RETINA_TOLERANCE;
    marks.push({
      type: 'body',
      id: id('focus'),
      shape: 'circle',
      pos: focus,
      size: FOCUS_DOT_RADIUS,
      // 줄기가 실제로 모인 점(망막 앞 · 위)은 채우고, 점선만 모인 점(망막 뒤)은 비운다.
      fill: reached ? 'solid' : 'none',
      outline: 'role',
      glow: false,
      opacity: shade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 이름표 ----
  labels.push(
    {
      type: 'readout',
      id: id('name-eye'),
      anchor: { world: [e.center[0], e.b + EYE_LABEL_GAP] },
      text: text(eyeCase.eyeLabel),
      chip: false,
      font: 'text',
      fontSize: TITLE_LABEL_PX,
      align: 'center',
      opacity: eo,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'readout',
      id: id('name-lens'),
      anchor: { world: [0, LENS_HALF + LENS_LABEL_GAP] },
      text: text('label.lens'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: eo,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'readout',
      id: id('name-retina'),
      anchor: { world: [retina + RETINA_LABEL_DX, RETINA_LABEL_Y] },
      text: text('label.retina'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'left',
      opacity: eo,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'readout',
      id: id('name-object'),
      anchor: { world: [OBJECT_LABEL_POS[0], OBJECT_LABEL_POS[1]] },
      text: text(eyeCase.objectLabel),
      vars: { d: String(c.nearDistanceCm) },
      chip: false,
      font: 'text',
      fontSize: TITLE_LABEL_PX,
      align: 'center',
      opacity: objectLabelOpacity(tl, p),
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
  );

  return [...body, ...rays, ...marks, ...labels];
}

export function scene(params: {
  state: MyopiaHyperopiaState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('myopia-hyperopia: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  // ---- 광축 — 두 눈이 함께 쓴다 ----
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

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return [axis, ...EYES.flatMap((eyeCase) => eyePrimitives(c, timeline, eyeCase))];
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
