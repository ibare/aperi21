// ========================================================================
// focal-length — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 렌즈는 plugin `opticalElement` `lens-convex` 다. 같은 요소를 `findImage` 에도 넘긴다.
//   **렌즈 그림은 한 주기 내내 같다** — `focalLength` 가 그림에 반영되지 않기 때문(G219)이기도
//   하고, 두께가 바뀌는 렌즈는 `human-eye-accommodation` 의 몫이기 때문이기도 하다.
//   여기서 초점 거리를 나르는 것은 **초점 표식 F 의 자리와 축 아래 괄호의 길이**다.
// - 상의 자리 · 크기는 `findImage` 한 번으로 얻고, 줄기 둘은 물체 끝에서 그 상 끝으로 잇는다 —
//   상 점과 줄기 교점이 한 계산이다(`traceRay` 의 1/cosθ 오차를 피한다).
// - 물체 · 상은 같은 먹색 화살표(`vector`)다. 상이 거꾸로 선 것은 화살표 방향으로 보인다.
// - 괄호는 `dimension` 셋 — 축 위에 물체 거리(길이가 한 번도 바뀌지 않는다) · 상 거리,
//   축 아래에 초점 거리. 괄호 글자는 이름뿐이고 수는 멈춤마다 뜨는 `{f} cm` 둘뿐이다.
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
import { focalLength, readConstants, valueLabelOpacity } from './physics';
import {
  AXIS_FROM_X,
  AXIS_TO_X,
  DISTANCE_BRACKET_Y,
  FOCUS_BRACKET_Y,
  FOCUS_DOT_RADIUS,
  LENS_SIZE,
  RAY_TAIL,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { FocalLengthState } from './state';

/** 광축 보조선 굵기(화면 px). 재는 기준선이라 가늘다. */
const AXIS_WIDTH_PX = 1;
/** 물체 · 상 화살표 굵기(화면 px). */
const ARROW_WIDTH_PX = 3;
/** 초점 표식 `F` 글자 크기(화면 px). */
const FOCUS_LABEL_PX = 13;
/** 초점 표식이 초점 점에서 세로로 떨어진 거리(화면 px). */
const FOCUS_LABEL_DROP_PX = 13;
/** 렌즈 뒤 초점 표식이 오른쪽으로 비켜난 거리(화면 px). 초점을 지나 내려가는 줄기를 피한다. */
const FOCUS_LABEL_SIDE_PX = 10;
/** 초점 거리 글자 크기(화면 px). 표식 `F` 와 같은 크기이고 굵기로 값임을 가른다. */
const VALUE_LABEL_PX = 13;
/** 초점 거리 글자가 축 아래 괄호에서 더 내려간 거리(화면 px). */
const VALUE_LABEL_DROP_PX = 17;

export function scene(params: {
  state: FocalLengthState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('focal-length: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const f = focalLength(timeline, c);
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
  // 물체는 한 주기 내내 같은 자리다 — 바뀌는 것은 초점 거리뿐이라는 것이 주장의 전제다.
  const objBase: Vec2 = [-c.objectDistance, 0];
  const objTip: Vec2 = [-c.objectDistance, h];
  // 초점 거리는 늘 물체 거리보다 짧게 선언된다 — 실상이 렌즈 뒤에 선다.
  const image = findImage(objTip, lens);
  if (!image) {
    throw new Error('focal-length: 물체가 초점 위에 있다 — 스테이지 상수를 확인한다');
  }
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

  // ---- 괄호 셋 ----
  // 축 위 왼쪽: 물체 거리. **한 번도 길이가 바뀌지 않는다** — 「물체를 그대로 둔 채」 가 여기 있다.
  out.push({
    type: 'dimension',
    id: 'bracket-object-distance',
    from: [objBase[0], DISTANCE_BRACKET_Y],
    to: [0, DISTANCE_BRACKET_Y],
    text: text('label.objectDistance'),
  });
  // 축 위 오른쪽: 상 거리. 초점 거리를 따라 늘고 준다.
  out.push({
    type: 'dimension',
    id: 'bracket-image-distance',
    from: [0, DISTANCE_BRACKET_Y],
    to: [imgBase[0], DISTANCE_BRACKET_Y],
    text: text('label.imageDistance'),
  });
  // 축 아래: 초점 거리. 이 조각이 돌리는 단 하나의 손잡이다. **세 괄호가 같은 색이다** —
  // 셋 다 「재는 것」 이라는 같은 종류이고, 가르는 것은 이름과 축 위아래의 자리다 (S-piece).
  out.push({
    type: 'dimension',
    id: 'bracket-focal-distance',
    from: [0, FOCUS_BRACKET_Y],
    to: [f, FOCUS_BRACKET_Y],
    text: text('label.focalDistance'),
  });

  // ---- 초점 표식 둘 ----
  // 렌즈 앞 · 뒤에서 함께 움직인다. **먹색이다** — plugin `ray` 는 강조색 하나뿐이라(선언으로
  // 색을 고를 수 없다) 초점까지 강조색으로 두면 강조색이 「빛」 과 「초점」 두 뜻을 겸하고,
  // 렌즈 뒤 초점 점은 하필 그 점을 지나는 줄기 위에 놓여 색이 겹친다 (S-piece, 첫 촬영에서 확인).
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

  // ---- 줄기 둘 ----
  // 세 광선 작도는 `thin-lens` 의 몫이다. 여기 둘은 상 끝이 어디인지를 못박고, 초점이
  // 다가올수록 나란한 줄기가 더 세게 꺾여 둘이 더 가까이에서 만나는 것을 보인다.
  const past = (from: Vec2, through: Vec2): Vec2 => {
    const dx = through[0] - from[0];
    const dy = through[1] - from[1];
    const len = Math.hypot(dx, dy);
    return [through[0] + (dx / len) * RAY_TAIL, through[1] + (dy / len) * RAY_TAIL];
  };
  const lensHit: Vec2 = [0, h];
  // 나란히 오다 렌즈에서 꺾여 렌즈 뒤 F 를 지나 상 끝으로.
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

  // ---- 초점 거리 글자 — 멈춤 자리에서만, 그 자리의 정박값 ----
  const shade = valueLabelOpacity(timeline);
  const stops = [
    { id: 'focal-value-long', value: c.focalLong, opacity: shade.long },
    { id: 'focal-value-short', value: c.focalShort, opacity: shade.short },
  ];
  for (const s of stops) {
    if (s.opacity <= 0) continue;
    out.push({
      type: 'readout',
      id: s.id,
      anchor: { world: [s.value / 2, FOCUS_BRACKET_Y], offset: [0, VALUE_LABEL_DROP_PX] },
      text: text('label.focalValue'),
      vars: { f: s.value },
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: VALUE_LABEL_PX,
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
