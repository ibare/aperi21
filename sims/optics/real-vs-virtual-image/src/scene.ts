// ========================================================================
// real-vs-virtual-image — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 렌즈는 plugin `opticalElement` `lens-convex` 다. 볼록 렌즈 하나뿐이고 두께가 주장이
//   아니라 고정 그림(G219)으로 충분하다. 같은 요소를 `findImage` 에도 넘긴다.
// - 상의 자리는 두 장면(실상 · 허상)의 물체 거리마다 `findImage` 한 번으로 얻고, 줄기는
//   물체 끝 → 렌즈 위 한 점 → (상 끝을 향해 · 상 끝에서 멀어지는 쪽으로) 스크린까지 잇는다.
//   상 점과 줄기 교점이 한 계산이다(`traceRay` 의 비스듬한 줄기 1/cosθ 오차를 피한다).
// - 실제 줄기는 `ray`(plugin 강조색 실선), 거꾸로 이은 연장은 같은 강조색의 **점선**
//   `trajectory` — 같은 줄기라 같은 색이고, 실제 빛이 아니라는 것은 선 모양으로 가른다.
// - 스크린은 빛 없음 판(`region` `light: 0`)이다. 거기 떨어진 빛만 빛 채널로 칠한다 —
//   실상은 밝은 거꾸로 선 화살표, 허상 장면은 넓게 번진 옅은 띠. 빛은 역할색이 아니라
//   빛의 양이라 두 테마에서 밝은 것이 밝다(G34 해결 · G92).
// - 물체는 먹색 실선 화살표, 허상은 먹색 **점선** 화살표 — 빛이 가지 않는 자리라 선 모양으로 가른다.
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
  clipByX,
  extensionShade,
  lensHitHeights,
  objectDistance,
  rayWindow,
  readConstants,
  realImageShade,
  smearShade,
  traceBackReach,
  virtualImageShade,
} from './physics';
import {
  AXIS_FROM_X,
  AXIS_TO_X,
  FOCUS_DOT_RADIUS,
  IMAGE_HEAD,
  IMAGE_HEAD_HALF_WIDTH,
  LENS_SIZE,
  SCENE_BOUNDS,
  SCREEN_BOTTOM,
  SCREEN_HALF_WIDTH,
  SCREEN_TOP,
  text,
} from './schema';
import type { RealVsVirtualImageState } from './state';

/** 광축 보조선 굵기(화면 px). 재는 기준선이라 가늘다. */
const AXIS_WIDTH_PX = 1;
/** 스크린 판 테두리 굵기(화면 px). 빛 없음 판이 다크 바탕에 묻히지 않게 두른다(G140). */
const SCREEN_EDGE_WIDTH_PX = 1;
/** 스크린 위 실상 화살표 굵기(화면 px). */
const IMAGE_WIDTH_PX = 3;
/** 거꾸로 이은 점선 굵기(화면 px). 줄기(`ray`, 테마 regular)와 같은 줄기의 연장이라 비슷하게. */
const EXTENSION_WIDTH_PX = 1.5;
/** 물체 · 허상 화살표 굵기(화면 px). */
const ARROW_WIDTH_PX = 3;
/** 이름표(스크린 · 실상 · 허상) 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 초점 표식 `F` 글자 크기(화면 px). */
const FOCUS_LABEL_PX = 14;
/** 초점 표식이 축 아래로 내려간 거리(화면 px). 줄기는 축 위로 다닌다. */
const FOCUS_LABEL_DROP_PX = 13;
/** 이름표가 대상 옆으로 비켜난 거리(화면 px). */
const LABEL_GAP_PX = 9;
/** 스크린 이름표가 판 위 끝에서 올라간 거리(화면 px). */
const SCREEN_LABEL_RISE_PX = 11;

/** `from` → `through` 직선이 x 에 닿는 점. */
function reachX(from: Vec2, through: Vec2, x: number): Vec2 {
  const u = (x - from[0]) / (through[0] - from[0]);
  return [x, from[1] + (through[1] - from[1]) * u];
}

export function scene(params: {
  state: RealVsVirtualImageState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('real-vs-virtual-image: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const h = c.objectHeight;
  const sx = c.screenX;

  const lens: OpticalElement = {
    type: 'opticalElement',
    id: 'lens',
    subtype: 'lens-convex',
    pos: [0, 0],
    orientation: 0,
    size: LENS_SIZE,
    focalLength: c.focalLength,
  };

  // ---- 두 장면의 물체 끝과 상 끝 ----
  // 물체가 옮겨 가는 동안(`move` · `return`)은 줄기를 긋지 않으므로 상은 두 멈춤 자리에서만 구한다 —
  // 옮기는 도중 물체가 초점을 지나면 상이 무한히 멀어진다.
  const realTip: Vec2 = [-c.realObjectDistance, h];
  const virtualTip: Vec2 = [-c.virtualObjectDistance, h];
  const realImage = findImage(realTip, lens);
  const virtualImage = findImage(virtualTip, lens);
  if (!realImage || !virtualImage) throw new Error('real-vs-virtual-image: 물체가 초점 위에 있다 — 스테이지 상수를 확인한다');
  const realImageTip = realImage.position;
  const virtualImageTip = virtualImage.position;

  const u = objectDistance(timeline, c);
  const objectX = -u;
  const hits = lensHitHeights(c);

  const back: Primitive[] = [];
  const screenLight: Primitive[] = [];
  const rays: Primitive[] = [];
  const extensions: Primitive[] = [];
  const arrows: Primitive[] = [];
  const labels: Primitive[] = [];

  // ---- 광축 ----
  back.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [AXIS_FROM_X, 0],
      [AXIS_TO_X, 0],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // ---- 스크린 판 — 빛 없음 ----
  const panel: Vec2[] = [
    [sx - SCREEN_HALF_WIDTH, SCREEN_BOTTOM],
    [sx + SCREEN_HALF_WIDTH, SCREEN_BOTTOM],
    [sx + SCREEN_HALF_WIDTH, SCREEN_TOP],
    [sx - SCREEN_HALF_WIDTH, SCREEN_TOP],
  ];
  back.push({ type: 'region', id: 'screen', points: panel, fillOpacity: 1, light: 0 });
  back.push({
    type: 'trajectory',
    id: 'screen-edge',
    points: panel,
    closed: true,
    width: SCREEN_EDGE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  labels.push({
    type: 'readout',
    id: 'screen-label',
    anchor: { world: [sx, SCREEN_TOP], offset: [0, -SCREEN_LABEL_RISE_PX] },
    text: text('label.screen'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 줄기 — 실상 장면은 상 끝을 향해, 허상 장면은 상 끝에서 멀어지는 쪽으로 ----
  const realWin = rayWindow(timeline, 'real', objectX, sx);
  const virtualWin = rayWindow(timeline, 'virtual', objectX, sx);
  const reach = traceBackReach(timeline);
  const extShade = extensionShade(timeline);
  const lands: number[] = [];

  for (const [i, y] of hits.entries()) {
    const hit: Vec2 = [0, y];

    const realLand = reachX(hit, realImageTip, sx);
    const realShown = clipByX([realTip, hit, realLand], realWin.from, realWin.to);
    if (realShown.length >= 2) {
      rays.push({ type: 'ray', id: `ray-real-${i}`, segments: realShown, showArrow: true });
    }

    // 허상 끝에서 렌즈 위 점을 지나 뻗는 직선이 렌즈를 지난 줄기다.
    const virtualLand = reachX(virtualImageTip, hit, sx);
    lands.push(virtualLand[1]);
    const virtualShown = clipByX([virtualTip, hit, virtualLand], virtualWin.from, virtualWin.to);
    if (virtualShown.length >= 2) {
      rays.push({ type: 'ray', id: `ray-virtual-${i}`, segments: virtualShown, showArrow: true });
    }

    if (reach > 0 && extShade > 0) {
      extensions.push({
        type: 'trajectory',
        id: `extension-${i}`,
        points: [
          hit,
          [hit[0] + (virtualImageTip[0] - hit[0]) * reach, hit[1] + (virtualImageTip[1] - hit[1]) * reach],
        ],
        width: EXTENSION_WIDTH_PX,
        opacity: extShade,
        style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
      });
    }
  }

  // ---- 스크린에 떨어진 빛 ----
  const realShade = realImageShade(timeline);
  if (realShade > 0) {
    // 실상 끝 높이. 스크린이 상 거리에 서 있으면 줄기가 모두 이 점에 닿는다(NOTES (c) G143).
    const tipY = realImageTip[1];
    const dir = Math.sign(tipY) || -1;
    const neck = tipY - dir * IMAGE_HEAD;
    screenLight.push({
      type: 'trajectory',
      id: 'real-image',
      points: [
        [sx, 0],
        [sx, neck],
      ],
      width: IMAGE_WIDTH_PX,
      light: c.imageLight,
      opacity: realShade,
    });
    screenLight.push({
      type: 'region',
      id: 'real-image-head',
      points: [
        [sx - IMAGE_HEAD_HALF_WIDTH, neck],
        [sx + IMAGE_HEAD_HALF_WIDTH, neck],
        [sx, tipY],
      ],
      fillOpacity: 1,
      light: c.imageLight,
      opacity: realShade,
    });
    labels.push({
      type: 'readout',
      id: 'real-label',
      anchor: { world: [sx + SCREEN_HALF_WIDTH, tipY / 2], offset: [LABEL_GAP_PX, 0] },
      text: text('label.real'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'left',
      opacity: realShade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  const smear = smearShade(timeline);
  if (smear > 0) {
    // 벌어진 줄기가 스크린에 닿는 가장 낮은 · 높은 자리 사이 — 판 밖은 자른다.
    const lo = Math.max(SCREEN_BOTTOM, Math.min(...lands));
    const hi = Math.min(SCREEN_TOP, Math.max(...lands));
    screenLight.push({
      type: 'region',
      id: 'smear',
      points: [
        [sx - SCREEN_HALF_WIDTH, lo],
        [sx + SCREEN_HALF_WIDTH, lo],
        [sx + SCREEN_HALF_WIDTH, hi],
        [sx - SCREEN_HALF_WIDTH, hi],
      ],
      fillOpacity: 1,
      light: c.smearLight,
      opacity: smear,
    });
  }

  // ---- 초점 ----
  for (const side of [-1, 1] as const) {
    back.push({
      type: 'body',
      id: side < 0 ? 'focus-front' : 'focus-back',
      shape: 'circle',
      pos: [side * c.focalLength, 0],
      size: FOCUS_DOT_RADIUS,
      fill: 'solid',
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    labels.push({
      type: 'readout',
      id: side < 0 ? 'focus-label-front' : 'focus-label-back',
      anchor: { world: [side * c.focalLength, 0], offset: [0, FOCUS_LABEL_DROP_PX] },
      text: text('label.focus'),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: FOCUS_LABEL_PX,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
  }

  // ---- 물체 · 허상 화살표 ----
  arrows.push({
    type: 'vector',
    id: 'object',
    from: [objectX, 0],
    delta: [0, h],
    width: ARROW_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  const virtualShade = virtualImageShade(timeline);
  if (virtualShade > 0) {
    arrows.push({
      type: 'vector',
      id: 'virtual-image',
      from: [virtualImageTip[0], 0],
      delta: [0, virtualImageTip[1]],
      width: ARROW_WIDTH_PX,
      opacity: virtualShade,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
    });
    labels.push({
      type: 'readout',
      id: 'virtual-label',
      anchor: { world: [virtualImageTip[0], virtualImageTip[1] / 2], offset: [-LABEL_GAP_PX, 0] },
      text: text('label.virtual'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'right',
      opacity: virtualShade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return [...back, ...screenLight, lens, ...rays, ...extensions, ...arrows, ...labels];
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
