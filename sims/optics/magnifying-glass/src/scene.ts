// ========================================================================
// magnifying-glass — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 위 줄: 개미 · 볼록 렌즈(plugin `opticalElement` `lens-convex`) · 눈. 개미 머리에서 나온
//   줄기는 `ray`(plugin 강조색 실선)로 렌즈를 지나 동공의 위 · 가운데 · 아래로 들어간다.
//   상의 자리는 두 멈춤 자리마다 `findImage` 한 번으로 얻고, 줄기는 상 머리에서 렌즈 위 점을
//   지나 동공으로 가는 직선으로 잇는다 — 상 점과 줄기 · 점선 교점이 한 계산이다.
// - 거꾸로 이은 연장은 같은 강조색의 **점선** `trajectory`. 허상은 개미와 같은 모양을 배율만큼
//   키운 **속 빈** 개미(`body` custom, 윤곽만) — 빛이 가지 않는 자리라 채우지 않는다.
// - 아래 줄: 같은 개미를 같은 눈으로 맨눈 거리에서 본다. 렌즈가 없다.
// - 두 줄 모두 동공에서 개미(위 줄은 허상)의 발끝 · 머리로 가는 **시야각 쐐기**(`region`)와,
//   동공을 중심으로 **같은 반지름의 부채꼴**(`sector`)을 둔다. 두 부채꼴이 같은 x 에 위아래로
//   놓여 각을 나란히 견준다. 같은 대상(시야각)이라 같은 색이다.
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
import { findImage } from '@aperi21/plugin-optics';
import {
  antDistance,
  clipByX,
  imageShade,
  pupilHeights,
  rayWindow,
  readConstants,
  traceReach,
  traceShade,
  type MagnifyingGlassConstants,
} from './physics';
import {
  ANGLE_ARC_RADIUS,
  AXIS_FROM_X,
  EYE_RADIUS,
  FOCUS_DOT_RADIUS,
  LENS_SIZE,
  NAKED_DIM_DROP,
  NAKED_ROW_Y,
  PUPIL_BAR_WIDTH,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { MagnifyingGlassState } from './state';

/** 광축 보조선 굵기(화면 px). 재는 기준선이라 가늘다. */
const AXIS_WIDTH_PX = 1;
/** 거꾸로 이은 점선 굵기(화면 px). 줄기(`ray`)의 연장이라 비슷하게. */
const EXTENSION_WIDTH_PX = 1.5;
/** 시야각 쐐기의 채움 불투명도. 줄기 · 개미가 비쳐 보이는 정도. */
const WEDGE_FILL = 0.1;
/** 시야각 부채꼴의 채움 불투명도와 호 굵기(화면 px). */
const ARC_FILL = 0.25;
const ARC_RIM_PX = 2;
/** 이름표(허상 · 맨눈) 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 배율 글자 크기(화면 px). */
const MAG_PX = 14;
/** 초점 표식 `F` 글자 크기(화면 px). */
const FOCUS_LABEL_PX = 14;
/** 초점 표식이 축 아래로 내려간 거리(화면 px). 줄기는 축 위로 다닌다. */
const FOCUS_LABEL_DROP_PX = 13;
/** 이름표가 대상 옆으로 비켜난 거리(화면 px). */
const LABEL_GAP_PX = 10;
/** 배율 글자가 상 머리 위로 올라간 거리(화면 px). */
const MAG_RISE_PX = 12;
/** 개미 윤곽의 반너비(다리 끝까지)가 키의 몇 배인가 — `antPath` 의 다리 끝 x 와 같다. 이름표를 그 밖에 둔다. */
const ANT_HALF_WIDTH = 0.3;
/** 개미 윤곽 좌표를 경로 글자로 옮길 때의 자릿수. 화면 글자가 아니라 경로 좌표다. */
const PATH_DIGITS = 4;

/**
 * 머리를 위로 선 개미의 옆모습 윤곽(SVG path, 발끝 가운데가 원점, y 위). 키 `h` 에 비례한다.
 * 배 · 가슴 · 머리 세 타원과 다리 여섯 · 더듬이 둘. 다리 · 더듬이는 선이라 윤곽 굵기로만 보인다.
 */
function antPath(h: number): string {
  const n = (v: number): string => (v * h).toFixed(PATH_DIGITS);
  const ellipse = (cx: number, cy: number, rx: number, ry: number): string =>
    `M${n(cx - rx)} ${n(cy)}A${n(rx)} ${n(ry)} 0 1 0 ${n(cx + rx)} ${n(cy)}A${n(rx)} ${n(ry)} 0 1 0 ${n(cx - rx)} ${n(cy)}Z`;
  const line = (x0: number, y0: number, x1: number, y1: number): string =>
    `M${n(x0)} ${n(y0)}L${n(x1)} ${n(y1)}`;
  const parts: string[] = [
    ellipse(0, 0.25, 0.14, 0.25), // 배
    ellipse(0, 0.6, 0.075, 0.13), // 가슴
    ellipse(0, 0.88, 0.1, 0.12), // 머리
  ];
  for (const s of [-1, 1]) {
    parts.push(line(s * 0.05, 0.66, s * 0.28, 0.8)); // 앞다리
    parts.push(line(s * 0.06, 0.6, s * 0.3, 0.56)); // 가운뎃다리
    parts.push(line(s * 0.05, 0.53, s * 0.28, 0.3)); // 뒷다리
    parts.push(line(s * 0.04, 0.97, s * 0.16, 1.08)); // 더듬이
  }
  return parts.join('');
}

/** `from` → `through` 직선이 x 에 닿는 점. */
function reachX(from: Vec2, through: Vec2, x: number): Vec2 {
  const u = (x - from[0]) / (through[0] - from[0]);
  return [x, from[1] + (through[1] - from[1]) * u];
}

/** 동공에서 개미(또는 상) 발끝 · 머리로 가는 시야각 쐐기와 같은 반지름의 부채꼴. */
function viewAngle(id: string, pupil: Vec2, footX: number, headY: number, rowY: number, shade: number): Primitive[] {
  const head: Vec2 = [footX, headY];
  const angle = Math.atan2(headY - rowY, pupil[0] - footX);
  return [
    {
      type: 'region',
      id: `${id}-wedge`,
      points: [pupil, [footX, rowY], head],
      fillOpacity: WEDGE_FILL,
      outline: [[0, 2]],
      opacity: shade,
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
    {
      type: 'sector',
      id: `${id}-arc`,
      center: pupil,
      radius: ANGLE_ARC_RADIUS,
      from: Math.PI,
      to: Math.PI - angle,
      fillOpacity: ARC_FILL,
      rimWidth: ARC_RIM_PX,
      opacity: shade,
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
  ];
}

/** 눈알(윤곽 원)과 동공(세로 막대). 동공이 눈알 왼쪽 끝, 광축 위에 온다. */
function eye(id: string, pupil: Vec2, pupilHalf: number): Primitive[] {
  return [
    {
      type: 'body',
      id: `${id}-ball`,
      shape: 'circle',
      pos: [pupil[0] + EYE_RADIUS, pupil[1]],
      size: EYE_RADIUS,
      fill: 'none',
      outline: 'role',
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'body',
      id: `${id}-pupil`,
      shape: 'rect',
      pos: pupil,
      size: [PUPIL_BAR_WIDTH, 2 * pupilHalf],
      glow: false,
      outline: 'none',
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
  ];
}

/** 한 멈춤의 상 머리 · 배율. 물체가 초점 위에 있으면 던진다. */
function imageOf(lens: OpticalElement, antX: number, c: MagnifyingGlassConstants): { head: Vec2; mag: number } {
  const img = findImage([antX, c.antHeight], lens);
  if (!img) throw new Error('magnifying-glass: 개미가 초점 위에 있다 — 스테이지 상수를 확인한다');
  return { head: img.position, mag: img.magnification };
}

export function scene(params: {
  state: MagnifyingGlassState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('magnifying-glass: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const h = c.antHeight;
  const pupil: Vec2 = [c.eyeGap, 0];
  const nakedPupil: Vec2 = [c.eyeGap, NAKED_ROW_Y];
  const nakedAntX = c.eyeGap - c.nakedDistance;

  const lens: OpticalElement = {
    type: 'opticalElement',
    id: 'lens',
    subtype: 'lens-convex',
    pos: [0, 0],
    orientation: 0,
    size: LENS_SIZE,
    focalLength: c.focalLength,
  };

  const back: Primitive[] = [];
  const angles: Primitive[] = [];
  const rays: Primitive[] = [];
  const extensions: Primitive[] = [];
  const figures: Primitive[] = [];
  const labels: Primitive[] = [];

  // ---- 광축 두 줄 ----
  back.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [AXIS_FROM_X, 0],
      [pupil[0], 0],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  back.push({
    type: 'trajectory',
    id: 'naked-axis',
    points: [
      [nakedAntX, NAKED_ROW_Y],
      [nakedPupil[0], NAKED_ROW_Y],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // ---- 앞 초점 ----
  back.push({
    type: 'body',
    id: 'focus',
    shape: 'circle',
    pos: [-c.focalLength, 0],
    size: FOCUS_DOT_RADIUS,
    fill: 'solid',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  labels.push({
    type: 'readout',
    id: 'focus-label',
    anchor: { world: [-c.focalLength, 0], offset: [0, FOCUS_LABEL_DROP_PX] },
    text: text('label.focus'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: FOCUS_LABEL_PX,
    align: 'center',
    style: { colorRole: 'ink', emphasis: 'medium' },
  });

  // ---- 맨눈 줄 — 늘 그대로 ----
  angles.push(...viewAngle('naked', nakedPupil, nakedAntX, NAKED_ROW_Y + h, NAKED_ROW_Y, 1));
  figures.push({
    type: 'body',
    id: 'naked-ant',
    shape: 'custom',
    pos: [nakedAntX, NAKED_ROW_Y],
    customPath: antPath(h),
    outline: 'role',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  figures.push(...eye('naked-eye', nakedPupil, c.pupilHalf));
  labels.push({
    type: 'readout',
    id: 'naked-label',
    anchor: { world: [nakedAntX, NAKED_ROW_Y + h / 2], offset: [-LABEL_GAP_PX, 0] },
    text: text('label.naked'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  labels.push({
    type: 'dimension',
    id: 'naked-distance',
    from: [nakedAntX, NAKED_ROW_Y - NAKED_DIM_DROP],
    to: [nakedPupil[0], NAKED_ROW_Y - NAKED_DIM_DROP],
    text: text('label.distance'),
    vars: { d: String(c.nakedDistance) },
  });

  // ---- 돋보기 줄 — 두 멈춤 ----
  for (const spot of ['near', 'far'] as const) {
    const antX = -(spot === 'near' ? c.nearDistance : c.farDistance);
    const shownMag = spot === 'near' ? c.nearMag : c.farMag;
    const tip: Vec2 = [antX, h];
    const img = imageOf(lens, antX, c);
    const win = rayWindow(timeline, spot, antX, pupil[0]);
    const reach = traceReach(timeline, spot);
    const extShade = traceShade(timeline, spot);
    const shade = imageShade(timeline, spot);

    for (const [i, p] of pupilHeights(c).entries()) {
      const into: Vec2 = [pupil[0], p];
      // 상 머리에서 동공 위 점으로 가는 직선이 렌즈를 지난 줄기다. 렌즈 위 점은 그 직선이 x = 0 에 닿는 곳.
      const hit = reachX(img.head, into, 0);
      const shown = clipByX([tip, hit, into], win.from, win.to);
      if (shown.length >= 2) {
        rays.push({ type: 'ray', id: `ray-${spot}-${i}`, segments: shown, showArrow: true });
      }
      if (reach > 0 && extShade > 0) {
        extensions.push({
          type: 'trajectory',
          id: `extension-${spot}-${i}`,
          points: [hit, [hit[0] + (img.head[0] - hit[0]) * reach, hit[1] + (img.head[1] - hit[1]) * reach]],
          width: EXTENSION_WIDTH_PX,
          opacity: extShade,
          style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
        });
      }
    }

    if (shade > 0) {
      angles.push(...viewAngle(`view-${spot}`, pupil, img.head[0], img.head[1], 0, shade));
      figures.push({
        type: 'body',
        id: `image-${spot}`,
        shape: 'custom',
        pos: [img.head[0], 0],
        customPath: antPath(img.head[1]),
        fill: 'none',
        outline: 'role',
        opacity: shade,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      labels.push({
        type: 'readout',
        id: `image-label-${spot}`,
        anchor: { world: [img.head[0] - img.head[1] * ANT_HALF_WIDTH, img.head[1] / 2], offset: [-LABEL_GAP_PX, 0] },
        text: text('label.virtual'),
        chip: false,
        font: 'text',
        fontSize: LABEL_PX,
        align: 'right',
        opacity: shade,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      labels.push({
        type: 'readout',
        id: `image-mag-${spot}`,
        anchor: { world: img.head, offset: [0, -MAG_RISE_PX] },
        text: text('label.magnification'),
        vars: { m: String(shownMag) },
        chip: false,
        font: 'mono',
        fontSize: MAG_PX,
        align: 'center',
        opacity: shade,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // ---- 개미 · 눈 ----
  figures.push({
    type: 'body',
    id: 'ant',
    shape: 'custom',
    pos: [-antDistance(timeline, c), 0],
    customPath: antPath(h),
    outline: 'role',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  figures.push(...eye('eye', pupil, c.pupilHalf));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return [...back, ...angles, lens, ...rays, ...extensions, ...figures, ...labels];
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
