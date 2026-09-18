// ========================================================================
// newtons-law-of-gravitation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 두 물체(body) · 힘 한 쌍과
// 그 처음 길이(vector) · 거리 눈금(lineSet + readout) · 화살표 이름(readout)이 모두
// 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 두 물체는 먹색(크기만 다르다), 두 힘은 같은 primary(한 쌍이라
// 같은 색), 처음 길이의 잔상과 눈금은 배경 정보라 muted. 강조색은 쓰지 않는다 —
// 가리킬 것이 화살표 길이 하나뿐이라 그 자체가 강조다.
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
import { distanceMultiple, readConstants, relativeForce } from './physics';
import {
  RADIUS_BIG,
  RADIUS_SMALL,
  RULER_TICK,
  RULER_Y,
  SCENE_BOUNDS,
  TIP_GAP,
  text,
} from './schema';
import type { NewtonsLawOfGravitationState } from './state';

/** 힘 화살표 굵기는 테마 기본(굵은 선). 처음 길이의 잔상은 가늘게 — 지금 힘과 굵기로 갈린다. */
const GHOST_WIDTH = 1.5;
/** 잔상 짙기. 지금 화살표보다 뒤로 물러나 있어야 한다. */
const GHOST_OPACITY = 0.75;
/** 화살표 이름을 화살표 위로 띄우는 거리(화면 px). */
const FORCE_LABEL_OFFSET: Vec2 = [0, -17];
/** 눈금 이름표를 눈금 아래로 내리는 거리(화면 px). */
const RULER_LABEL_OFFSET: Vec2 = [0, 13];
/** 눈금 이름표 글자 크기(화면 px). 자에 적힌 기호라 본문보다 작다. */
const RULER_LABEL_PX = 12;
/** 눈금선 굵기(화면 px) · 짙기. 재는 선이지 그림의 일부가 아니다. */
const RULER_WIDTH = 1;
const RULER_OPACITY = 0.6;
/** 힘 화살표 굵기(화면 px). 1/3² 로 줄어든 화살표도 선으로 읽히도록 테마 기본보다 굵게. */
const FORCE_WIDTH = 3;
/**
 * 화살표 이름의 가운데를 꼬리에서 적어도 이만큼(월드) 띄운다. 1/3² 화살표는 짧아서 가운데에
 * 붙이면 이름이 물체 가장자리에 걸친다.
 */
const FORCE_LABEL_MIN_REACH = 0.24;
/** 처음 거리보다 이만큼 넘게 벌어졌을 때부터 잔상을 둔다. 같은 길이의 잔상은 그 아래에 숨는다. */
const GHOST_FROM = 1e-3;

export function scene(params: {
  state: NewtonsLawOfGravitationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('newtons-law-of-gravitation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  const r = c.nearDistance;
  const multiple = distanceMultiple(timeline, c);
  const xSmall = r * multiple;
  // 처음 거리에서의 화살표 길이. 두 화살표 머리가 가운데에서 거의 맞닿는 길이다 —
  // 그보다 길면 서로 겹쳐 한 줄로 읽힌다. 이 길이가 「F」 의 기준이다.
  const fullLength = (r - RADIUS_BIG - RADIUS_SMALL - TIP_GAP) / 2;
  const length = fullLength * relativeForce(multiple);

  // ---- 거리 눈금자 ----
  // M 의 중심에서부터 r · 2r · 3r. 격자가 아니라 **r 의 몇 배인가** 만 잰다.
  const marks = [1, c.farMultiple1, c.farMultiple2];
  const rulerEnd = r * c.farMultiple2;
  out.push({
    type: 'lineSet',
    id: 'ruler',
    lines: [
      [
        [0, RULER_Y],
        [rulerEnd, RULER_Y],
      ],
      [
        [0, RULER_Y],
        [0, RULER_Y + RULER_TICK],
      ],
      ...marks.map((k): Vec2[] => [
        [r * k, RULER_Y],
        [r * k, RULER_Y + RULER_TICK],
      ]),
    ],
    width: RULER_WIDTH,
    opacity: RULER_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  marks.forEach((k, i) => {
    out.push({
      type: 'readout',
      id: `ruler-label-${i}`,
      anchor: { world: [r * k, RULER_Y], offset: RULER_LABEL_OFFSET },
      // 배수는 스테이지 상수 그대로 끼운다 — 계산하거나 자릿수를 줄이지 않는다.
      text: i === 0 ? text('label.distanceNear') : text('label.distanceScaled'),
      vars: i === 0 ? undefined : { n: String(k) },
      chip: false,
      italic: true,
      fontSize: RULER_LABEL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  });

  // ---- 두 물체 ----
  // 크기만 다르다 — 같은 색, 같은 모양. 후광은 끈다: 번짐이 화살표 꼬리를 덮는다.
  out.push({
    type: 'body',
    id: 'big',
    pos: [0, 0],
    shape: 'circle',
    size: RADIUS_BIG,
    outline: 'none',
    glow: false,
    label: text('label.bigMass'),
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'small',
    pos: [xSmall, 0],
    shape: 'circle',
    size: RADIUS_SMALL,
    outline: 'none',
    glow: false,
    label: text('label.smallMass'),
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 힘 한 쌍 ----
  // 꼬리는 물체의 가장자리, 머리는 상대 쪽. 두 화살표는 **언제나 같은 길이** 다.
  const pair: { id: string; from: Vec2; dir: 1 | -1 }[] = [
    { id: 'on-big', from: [RADIUS_BIG, 0], dir: 1 },
    { id: 'on-small', from: [xSmall - RADIUS_SMALL, 0], dir: -1 },
  ];

  // 처음 길이의 잔상. 벌어진 동안만 둔다 — 지금 화살표가 그 몇 분의 일인지 한눈에 견준다.
  // 잔상은 **같은 자리에서** 출발한다: m 쪽 잔상은 m 을 따라간다.
  if (multiple > 1 + GHOST_FROM) {
    for (const f of pair) {
      out.push({
        type: 'vector',
        id: `ghost-${f.id}`,
        from: f.from,
        delta: [f.dir * fullLength, 0],
        width: GHOST_WIDTH,
        opacity: GHOST_OPACITY,
        style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
      });
    }
  }

  for (const f of pair) {
    out.push({
      type: 'vector',
      id: `force-${f.id}`,
      from: f.from,
      delta: [f.dir * length, 0],
      width: FORCE_WIDTH,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // ---- 화살표 이름 ----
  // 멈춰 있는 단계에서만 붙인다. 줄어드는 화살표에 `F` 가 남아 있으면 화면과 어긋난다.
  // 두 화살표에 **같은 이름** 을 붙인다 — 한 쌍이라는 것이 이름으로도 읽힌다.
  const forceLabel =
    timeline.phase === 'near'
      ? { text: text('label.force') }
      : timeline.phase === 'hold1'
        ? { text: text('label.forceScaled'), vars: { n: state.multiple1 } }
        : timeline.phase === 'hold2'
          ? { text: text('label.forceScaled'), vars: { n: state.multiple2 } }
          : null;
  if (forceLabel) {
    for (const f of pair) {
      out.push({
        type: 'readout',
        id: `force-label-${f.id}`,
        anchor: {
          world: [f.from[0] + f.dir * Math.max(length / 2, FORCE_LABEL_MIN_REACH), 0],
          offset: FORCE_LABEL_OFFSET,
        },
        text: forceLabel.text,
        vars: forceLabel.vars,
        chip: false,
        italic: true,
        weight: 'bold',
        align: 'center',
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
