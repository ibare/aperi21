// ========================================================================
// length-contraction — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 상자 몸(region) · 테와
// 옆면 원(lineSet) · 레일(lineSet) · 제 길이 자리와 찍힌 기록(trajectory 점선) ·
// 찍는 순간의 섬광(trace ring) · 두 길이(dimension) · 이름표(readout)가 모두 표준
// 어휘로 있다.
//
// 색은 뜻마다 하나다 — 두 상자는 같은 먹색 테 · 같은 옅은 몸(똑같이 만든 상자다),
// 레일 · 제 길이 자리 · L₀ 는 muted, **강조색은 「정지 틀이 한 순간에 찍은 지나가는
// 상자의 길이」 한 가지 뜻에만** (찍힌 윤곽 · 찍는 섬광 · 그 치수선).
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
import { passFrame, readConstants } from './physics';
import {
  MOVING_LABEL_Y,
  MOVING_Y,
  REST_DIM_Y,
  REST_LABEL_X,
  REST_Y,
  SCENE_BOUNDS,
  SNAP_DIM_Y,
  text,
} from './schema';
import type { LengthContractionState } from './state';

/** 상자 테 · 옆면 원의 굵기(화면 px). 상자에서 가장 먼저 읽혀야 하는 선이다. */
const BOX_LINE_PX = 2;
/** 상자 몸의 옅은 칠. 겹쳐도 짙어지지 않게 불투명하게 깐다 — 제 길이 자리 점선을 가린다. */
const BOX_FILL_OPACITY = 0.16;
/** 옆면 원(타원)의 표본 수. 상태로 바꾸지 않는다. */
const ELLIPSE_SAMPLES = 48;
/** 레일 굵기(화면 px) · 짙기. 배경 정보라 가늘고 옅다. */
const RAIL_WIDTH_PX = 1;
const RAIL_OPACITY = 0.5;
/** 제 길이 자리(멈춘 상자 두 끝에서 내린 점선) 굵기(화면 px) · 짙기. */
const GUIDE_WIDTH_PX = 1;
const GUIDE_OPACITY = 0.7;
/** 찍힌 기록(강조색 점선 윤곽) 굵기(화면 px). */
const SNAP_WIDTH_PX = 2;
/** 찍는 순간의 섬광 — 두 끝에서 퍼지는 고리(화면 px) · 수명(초) · 굵기(화면 px). */
const FLASH_FROM_PX = 6;
const FLASH_TO_PX = 22;
const FLASH_LIFE = 0.45;
const FLASH_WIDTH_PX = 1.5;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;

/** 가운데가 (cx, cy) 이고 가로 length · 세로 height 인 닫힌 사각형(월드). */
function rectPoints(cx: number, cy: number, length: number, height: number): Vec2[] {
  const a = length / 2;
  const b = height / 2;
  return [
    [cx - a, cy - b],
    [cx + a, cy - b],
    [cx + a, cy + b],
    [cx - a, cy + b],
  ];
}

/** 가로 반지름 rx · 세로 반지름 ry 인 타원 표본(닫힘). G28 — 타원 어휘가 없다. */
function ellipsePoints(cx: number, cy: number, rx: number, ry: number): Vec2[] {
  return Array.from({ length: ELLIPSE_SAMPLES + 1 }, (_, i) => {
    const th = (2 * Math.PI * i) / ELLIPSE_SAMPLES;
    return [cx + rx * Math.cos(th), cy + ry * Math.sin(th)] as Vec2;
  });
}

/** 상자 하나 — 옅은 몸 · 먹색 테 · 옆면 원. 두 상자가 같은 함수로 그려진다. */
function boxParts(
  id: string,
  center: Vec2,
  length: number,
  height: number,
  markRx: number,
  markRy: number,
  opacity: number,
): Primitive[] {
  const [cx, cy] = center;
  const rect = rectPoints(cx, cy, length, height);
  return [
    {
      type: 'region',
      id: `${id}-body`,
      points: rect,
      fillOpacity: BOX_FILL_OPACITY,
      opaque: true,
      opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'lineSet',
      id: `${id}-lines`,
      lines: [[...rect, rect[0]!], ellipsePoints(cx, cy, markRx, markRy)],
      width: BOX_LINE_PX,
      opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
  ];
}

export function scene(params: {
  state: LengthContractionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('length-contraction: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const f = passFrame(tl, c);
  const out: Primitive[] = [];

  const a0 = c.properLength / 2;
  const hb = c.boxHeight / 2;
  const restBottom = REST_Y - hb;
  const movingBottom = MOVING_Y - hb;
  const movingTop = MOVING_Y + hb;

  /** 지나가는 상자 — 나타나며 짙어지고, 기록을 남긴 뒤 빠져나가며 흐려진다. */
  const movingAlpha = tl.at('appear') * (1 - tl.at('leave'));
  /** 찍힌 기록 — 주기 끝에서 흐려진다. */
  const recordAlpha = 1 - tl.at('fade');
  /** 치수선 — 상자가 떠난 뒤 붙는다. */
  const dimAlpha = tl.at('compare') * recordAlpha;

  // ---- 레일 둘 ----
  out.push({
    type: 'lineSet',
    id: 'rails',
    lines: [
      [
        [SCENE_BOUNDS.minX, restBottom],
        [SCENE_BOUNDS.maxX, restBottom],
      ],
      [
        [SCENE_BOUNDS.minX, movingBottom],
        [SCENE_BOUNDS.maxX, movingBottom],
      ],
    ],
    width: RAIL_WIDTH_PX,
    opacity: RAIL_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 제 길이 자리 ----
  // 멈춘 상자 두 끝에서 아래 레일까지 내린 점선과, 아래 레일 위 상자 높이의 윗변.
  // 멈춘 상자를 그대로 옮겨 놓은 자리다 — 지나가는 상자가 여기에 맞는지를 본다.
  const guideStyle = { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' } as const;
  for (const [i, x] of [-a0, a0].entries()) {
    out.push({
      type: 'trajectory',
      id: `guide-side-${i}`,
      points: [
        [x, restBottom],
        [x, movingBottom],
      ],
      width: GUIDE_WIDTH_PX,
      opacity: GUIDE_OPACITY,
      style: guideStyle,
    });
  }
  out.push({
    type: 'trajectory',
    id: 'guide-top',
    points: [
      [-a0, movingTop],
      [a0, movingTop],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: GUIDE_OPACITY,
    style: guideStyle,
  });

  // ---- 멈춘 상자 ----
  out.push(...boxParts('rest', [0, REST_Y], c.properLength, c.boxHeight, c.markRadius, c.markRadius, 1));
  out.push({
    type: 'readout',
    id: 'rest-label',
    anchor: { world: [REST_LABEL_X, REST_Y] },
    text: text('label.rest'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 찍힌 기록 ----
  // 가운데에 선 순간 정지 틀이 두 끝의 자리(와 옆면 원)를 함께 찍어 남긴 윤곽. 상자 아래에 깔린다.
  if (f.snapped && recordAlpha > 0) {
    out.push({
      type: 'trajectory',
      id: 'snap-outline',
      points: rectPoints(0, MOVING_Y, f.length, c.boxHeight),
      closed: true,
      width: SNAP_WIDTH_PX,
      opacity: recordAlpha,
      style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
    });
    // 옆면 원도 찍힌다 — 상자가 떠난 뒤에도 「가로로만 눌렸다」 가 기록 위에서 읽힌다.
    out.push({
      type: 'trajectory',
      id: 'snap-mark',
      points: ellipsePoints(0, MOVING_Y, f.markRx, c.markRadius),
      closed: true,
      width: SNAP_WIDTH_PX,
      opacity: recordAlpha,
      style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 지나가는 상자 ----
  if (movingAlpha > 0) {
    out.push(
      ...boxParts('moving', [f.x, MOVING_Y], f.length, c.boxHeight, f.markRx, c.markRadius, movingAlpha),
    );
    out.push({
      type: 'readout',
      id: 'moving-label',
      anchor: { world: [f.x, MOVING_LABEL_Y] },
      text: text('label.moving'),
      vars: { beta: String(c.beta) },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: movingAlpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 찍는 순간의 섬광 ----
  // 두 끝에서 함께 퍼진다. 지나가는 상자 몸이 가리지 않도록 상자 뒤에 선언한다.
  if (f.snapped) {
    out.push({
      type: 'trace',
      id: 'snap-flash',
      marks: [-f.length / 2, f.length / 2].map((x) => ({ pos: [x, MOVING_Y] as Vec2, age: f.snapAge })),
      life: FLASH_LIFE,
      shape: 'ring',
      size: FLASH_FROM_PX,
      spreadTo: FLASH_TO_PX,
      width: FLASH_WIDTH_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 두 길이 ----
  if (dimAlpha > 0) {
    out.push({
      type: 'dimension',
      id: 'rest-length',
      from: [-a0, REST_DIM_Y],
      to: [a0, REST_DIM_Y],
      text: text('label.properLength'),
      opacity: dimAlpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'dimension',
      id: 'snap-length',
      from: [-f.length / 2, SNAP_DIM_Y],
      to: [f.length / 2, SNAP_DIM_Y],
      text: text('label.contracted'),
      vars: { n: String(c.ratioNum), d: String(c.ratioDen) },
      opacity: dimAlpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
