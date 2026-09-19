// ========================================================================
// magnification — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 렌즈는 plugin `opticalElement` `lens-convex` 다. 볼록 렌즈 하나뿐이고 두께가 주장이
//   아니라 고정 그림(G219)으로 충분하다. 같은 요소를 `findImage` 에도 넘긴다.
// - 상의 자리 · 크기는 `findImage` 한 번으로 얻고, 줄기 둘은 물체 끝에서 그 상 끝으로 잇는다 —
//   상 점과 줄기 교점이 한 계산이다. 나란히 가다 F 를 지나는 줄기, 렌즈 한가운데를 곧게
//   지나는 줄기 둘만 긋는다(세 광선 풀이는 `ray-tracing` 의 몫).
// - 물체 · 상은 같은 먹색 화살표(`vector`)다. 상이 거꾸로 선 것은 화살표 방향으로 보인다.
// - 괄호는 `dimension` — 광축 위쪽에 물체 거리 · 상 거리, 화살표 옆에 크기. 수를 쓰지 않고
//   길이의 견줌으로 읽힌다. 수는 멈춤마다 선언한 배율 정박값 `×{m}` 하나뿐이다.
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
import { magLabelOpacity, objectDistance, readConstants } from './physics';
import {
  AXIS_FROM_X,
  AXIS_TO_X,
  DISTANCE_BRACKET_Y,
  FOCUS_DOT_RADIUS,
  LENS_SIZE,
  RAY_TAIL,
  SCENE_BOUNDS,
  SIZE_BRACKET_GAP,
  text,
} from './schema';
import type { MagnificationState } from './state';

/** 광축 보조선 굵기(화면 px). 재는 기준선이라 가늘다. */
const AXIS_WIDTH_PX = 1;
/** 물체 · 상 화살표 굵기(화면 px). */
const ARROW_WIDTH_PX = 3;
/** 초점 표식 `F` 글자 크기(화면 px). */
const FOCUS_LABEL_PX = 13;
/** 초점 표식이 초점 점에서 떨어진 거리(화면 px) — 세로. */
const FOCUS_LABEL_DROP_PX = 12;
/** 렌즈 뒤 초점 표식이 오른쪽으로 비켜난 거리(화면 px). 초점을 지나는 줄기를 피한다. */
const FOCUS_LABEL_SIDE_PX = 9;
/** 배율 글자 크기(화면 px). */
const MAG_LABEL_PX = 15;
/** 배율 글자가 상 끝 아래로 내려간 거리(화면 px). */
const MAG_LABEL_DROP_PX = 14;
/** 배율 글자가 상 끝 왼쪽으로 비켜난 거리(화면 px). 상 끝을 지나 오른쪽 아래로 가는 줄기를 피한다. */
const MAG_LABEL_SIDE_PX = 16;

export function scene(params: {
  state: MagnificationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('magnification: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const f = c.focalLength;
  const h = c.objectHeight;

  // ---- 렌즈 · 물체 · 상 ----
  const lens: OpticalElement = {
    type: 'opticalElement',
    id: 'lens',
    subtype: 'lens-convex',
    pos: [0, 0],
    orientation: 0,
    size: LENS_SIZE,
    focalLength: f,
  };
  const u = objectDistance(timeline, c);
  const objBase: Vec2 = [-u, 0];
  const objTip: Vec2 = [-u, h];
  // 물체는 늘 초점 바깥(가장 가까운 자리도 초점 거리의 배수 > 1)이라 실상이 렌즈 뒤에 선다.
  const image = findImage(objTip, lens);
  if (!image) throw new Error('magnification: 물체가 초점 위에 있다 — 스테이지 상수를 확인한다');
  const imgTip = image.position;
  const imgBase: Vec2 = [imgTip[0], 0];

  const out: Primitive[] = [];

  // ---- 광축 ----
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [AXIS_FROM_X, 0],
      [AXIS_TO_X, 0],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  out.push(lens);

  // ---- 초점 ----
  for (const side of [-1, 1] as const) {
    out.push({
      type: 'body',
      id: side < 0 ? 'focus-front' : 'focus-back',
      shape: 'circle',
      pos: [side * f, 0],
      size: FOCUS_DOT_RADIUS,
      fill: 'solid',
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: side < 0 ? 'focus-label-front' : 'focus-label-back',
      // 렌즈 앞 F 는 축 아래(물체 쪽 줄기는 축 위로 다닌다), 렌즈 뒤 F 는 축 위 오른쪽
      // (F 를 지나는 줄기가 왼쪽 위에서 내려온다).
      anchor:
        side < 0
          ? { world: [-f, 0], offset: [0, FOCUS_LABEL_DROP_PX] }
          : { world: [f, 0], offset: [FOCUS_LABEL_SIDE_PX, -FOCUS_LABEL_DROP_PX] },
      text: text('label.focus'),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: FOCUS_LABEL_PX,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
  }

  // ---- 괄호 ----
  out.push({
    type: 'dimension',
    id: 'bracket-object-distance',
    from: [objBase[0], DISTANCE_BRACKET_Y],
    to: [0, DISTANCE_BRACKET_Y],
    text: text('label.objectDistance'),
  });
  out.push({
    type: 'dimension',
    id: 'bracket-image-distance',
    from: [0, DISTANCE_BRACKET_Y],
    to: [imgBase[0], DISTANCE_BRACKET_Y],
    text: text('label.imageDistance'),
  });
  out.push({
    type: 'dimension',
    id: 'bracket-object-size',
    from: [objBase[0] - SIZE_BRACKET_GAP, 0],
    to: [objBase[0] - SIZE_BRACKET_GAP, objTip[1]],
  });
  out.push({
    type: 'dimension',
    id: 'bracket-image-size',
    from: [imgBase[0] + SIZE_BRACKET_GAP, 0],
    to: [imgBase[0] + SIZE_BRACKET_GAP, imgTip[1]],
  });

  // ---- 줄기 둘 ----
  const past = (from: Vec2, through: Vec2): Vec2 => {
    const dx = through[0] - from[0];
    const dy = through[1] - from[1];
    const len = Math.hypot(dx, dy);
    return [through[0] + (dx / len) * RAY_TAIL, through[1] + (dy / len) * RAY_TAIL];
  };
  const lensHit: Vec2 = [0, h];
  // 나란히 가다 렌즈에서 꺾여 렌즈 뒤 F 를 지나 상 끝으로.
  out.push({
    type: 'ray',
    id: 'ray-parallel',
    segments: [objTip, lensHit, imgTip, past(lensHit, imgTip)],
    showArrow: true,
  });
  // 렌즈 한가운데를 곧게 지나 상 끝으로.
  out.push({
    type: 'ray',
    id: 'ray-center',
    segments: [objTip, imgTip, past(objTip, imgTip)],
    showArrow: true,
  });

  // ---- 물체 · 상 화살표 ----
  out.push({
    type: 'vector',
    id: 'object',
    from: objBase,
    delta: [0, objTip[1]],
    width: ARROW_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'image',
    from: imgBase,
    delta: [0, imgTip[1]],
    width: ARROW_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 배율 글자 — 멈춤 자리에서만, 그 자리의 정박값 ----
  const shade = magLabelOpacity(timeline);
  const stops = [
    { id: 'mag-far', m: state.farMag, opacity: shade.far },
    { id: 'mag-mid', m: state.midMag, opacity: shade.mid },
    { id: 'mag-near', m: state.nearMag, opacity: shade.near },
  ];
  for (const s of stops) {
    if (s.opacity <= 0) continue;
    out.push({
      type: 'readout',
      id: s.id,
      anchor: { world: imgTip, offset: [-MAG_LABEL_SIDE_PX, MAG_LABEL_DROP_PX] },
      text: text('label.magnification'),
      vars: { m: s.m },
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: MAG_LABEL_PX,
      align: 'center',
      opacity: s.opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
