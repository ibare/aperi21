// ========================================================================
// sound-intensity — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 소리 고리 · 귀가 서는 선 ·
// 막대 판 바닥(trajectory) · 음원과 귀(body) · 두 막대(region) · 이름표(readout).
//
// 색은 뜻마다 하나다. **강조색은 「소리의 세기」 한 뜻에만** 쓴다 — 퍼지는 고리와 세기
// 막대가 같은 색이라 「고리가 옅어지는 만큼 세기 막대가 준다」 가 한 대상으로 읽힌다.
// 세기 준위(dB) 막대는 먹색 — 같은 소리를 로그 눈금으로 잰 값이라 다른 대상이다.
// 음원 · 귀는 먹색, 선 · 이름표는 배경 정보라 muted.
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
import {
  isMoving,
  levelAt,
  listenerMultiple,
  readConstants,
  recordOpacity,
  relativeIntensity,
  ringRadii,
} from './physics';
import { BAND_HALF, BAR_BASE_Y, BAR_GAP, BAR_HEIGHT, BAR_WIDTH, SCENE_BOUNDS, text } from './schema';
import type { SoundIntensityState } from './state';

/** 고리를 긋는 표본 수. */
const RING_SAMPLES = 120;
/** 고리 굵기(화면 px). */
const RING_WIDTH_PX = 2.2;
/** r 안쪽(세기 1) 고리의 불투명도. 멀어지면 여기에 세기 비를 곱한다. */
const RING_OPACITY = 0.95;
/** 고리를 이 반지름까지 퍼뜨린다(월드) — 화면 오른쪽 끝을 넘을 만큼. */
const RING_MAX_RADIUS = 8.9;
/** 귀가 서는 선 · 막대 판 바닥의 굵기(화면 px). 안내선이라 가늘다. */
const GUIDE_WIDTH_PX = 1;
const GUIDE_OPACITY = 0.6;
/** 멈추는 자리 눈금의 반높이(월드). */
const TICK_HALF = 0.1;
/** 음원 · 귀의 크기(월드 반지름). */
const SOURCE_SIZE = 0.17;
const EAR_SIZE = 0.15;
/** 막대 채움 불투명도 — 세기(강조색)와 세기 준위(먹색). */
const INTENSITY_FILL = 0.85;
const LEVEL_FILL = 0.5;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;
const VALUE_PX = 12;
/** 음원 · 귀 이름표를 몸 위로 띄우는 거리(화면 px). */
const BODY_LABEL_OFFSET: Vec2 = [0, -20];
/** 거리 이름표를 선 아래로 띄우는 거리(화면 px). */
const DISTANCE_LABEL_OFFSET: Vec2 = [0, 14];
/** 막대 위 값을 막대 끝에서 띄우는 거리(화면 px). */
const VALUE_LABEL_GAP = 9;
/** 막대 이름을 바닥선 아래로 띄우는 거리(화면 px). */
const BAR_NAME_OFFSET = 12;

const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const sound = { colorRole: 'accent', emphasis: 'strong' } as const;

function circle(radius: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i < RING_SAMPLES; i++) {
    const a = (i / RING_SAMPLES) * Math.PI * 2;
    out.push([radius * Math.cos(a), radius * Math.sin(a)]);
  }
  return out;
}

function rect(x0: number, x1: number, y0: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

export function scene(params: {
  state: SoundIntensityState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('sound-intensity: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const r = c.radius;
  const g: Primitive[] = [];

  // ---- 소리 고리 — 퍼지며 옅어진다 ----
  // 짙기는 그 반지름의 세기(1/m²)다. r 안쪽은 1 로 자른다. 고리는 띠 안에만 그린다 —
  // 아래 막대 판을 가로지르면 막대 높이가 흐려진다.
  const band = {
    min: [SCENE_BOUNDS.minX - 1, -BAND_HALF] as Vec2,
    max: [SCENE_BOUNDS.maxX + 1, BAND_HALF] as Vec2,
  };
  ringRadii(tl.t, c, RING_MAX_RADIUS).forEach((R, i) => {
    g.push({
      type: 'trajectory',
      id: `ring-${i}`,
      points: circle(R),
      closed: true,
      width: RING_WIDTH_PX,
      opacity: RING_OPACITY * relativeIntensity(R / r),
      clip: band,
      style: sound,
    });
  });

  // ---- 귀가 서는 선과 멈추는 자리 ----
  const stops = [1, c.multiple2, c.multiple3];
  const lastX = r * c.multiple3;
  g.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [0, 0],
      [lastX, 0],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: GUIDE_OPACITY,
    style: { ...muted, lineStyle: 'dashed' },
  });
  stops.forEach((m, k) => {
    const x = r * m;
    g.push({
      type: 'trajectory',
      id: `tick-${k}`,
      points: [
        [x, -TICK_HALF],
        [x, TICK_HALF],
      ],
      width: GUIDE_WIDTH_PX,
      style: muted,
    });
    g.push({
      type: 'readout',
      id: `distance-${k}`,
      anchor: { world: [x, -TICK_HALF], offset: DISTANCE_LABEL_OFFSET },
      text: text(k === 0 ? 'label.distanceBase' : 'label.distanceScaled'),
      ...(k === 0 ? {} : { vars: { n: String(m) } }),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: LABEL_PX,
      align: 'center',
      style: muted,
    });
  });

  // ---- 음원 ----
  g.push({ type: 'body', id: 'source', pos: [0, 0], shape: 'circle', size: SOURCE_SIZE, glow: false, style: ink });
  g.push({
    type: 'readout',
    id: 'source-name',
    anchor: { world: [0, 0], offset: BODY_LABEL_OFFSET },
    text: text('label.source'),
    chip: true,
    font: 'text',
    fontSize: LABEL_PX,
    style: ink,
  });

  // ---- 귀 ----
  const m = listenerMultiple(tl, c);
  const earX = r * m;
  g.push({
    type: 'body',
    id: 'ear',
    pos: [earX, 0],
    shape: 'circle',
    size: EAR_SIZE,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: ink,
  });
  g.push({
    type: 'readout',
    id: 'ear-name',
    anchor: { world: [earX, 0], offset: BODY_LABEL_OFFSET },
    text: text('label.ear'),
    chip: true,
    font: 'text',
    fontSize: LABEL_PX,
    style: ink,
  });

  // ---- 막대 판 ----
  g.push({
    type: 'trajectory',
    id: 'bar-floor',
    points: [
      [SCENE_BOUNDS.minX + 0.2, BAR_BASE_Y],
      [SCENE_BOUNDS.maxX - 0.2, BAR_BASE_Y],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: GUIDE_OPACITY,
    style: muted,
  });

  /** 거리 배수 mm 자리에 막대 한 쌍. 세기는 왼쪽, 세기 준위는 오른쪽. */
  const pair = (id: string, mm: number, opacity: number): { iTop: number; lTop: number; iX: number; lX: number } => {
    const x = r * mm;
    const iTop = BAR_BASE_Y + BAR_HEIGHT * relativeIntensity(mm);
    const lTop = BAR_BASE_Y + BAR_HEIGHT * (levelAt(mm, c.level1) / c.level1);
    const i0 = x - BAR_GAP / 2 - BAR_WIDTH;
    const l0 = x + BAR_GAP / 2;
    g.push({
      type: 'region',
      id: `${id}-intensity`,
      points: rect(i0, i0 + BAR_WIDTH, BAR_BASE_Y, iTop),
      fillOpacity: INTENSITY_FILL,
      opacity,
      style: sound,
    });
    g.push({
      type: 'region',
      id: `${id}-level`,
      points: rect(l0, l0 + BAR_WIDTH, BAR_BASE_Y, lTop),
      fillOpacity: LEVEL_FILL,
      opacity,
      style: ink,
    });
    return { iTop, lTop, iX: i0 + BAR_WIDTH / 2, lX: l0 + BAR_WIDTH / 2 };
  };

  const ratios = [null, c.intensityRatio2, c.intensityRatio3] as const;
  const levels = [c.level1, c.level2, c.level3] as const;
  stops.forEach((mm, k) => {
    const op = recordOpacity(tl, k);
    if (op <= 0) return;
    const p = pair(`record-${k}`, mm, op);
    // 값은 선언한 정박값 그대로다 — 계산한 dB 를 반올림해 띄우지 않는다.
    // 두 글자는 막대 가운데에서 바깥쪽으로 정렬해 서로 겹치지 않게 한다.
    const ratio = ratios[k];
    g.push({
      type: 'readout',
      id: `record-${k}-intensity-value`,
      anchor: { world: [p.iX, p.iTop], offset: [0, -VALUE_LABEL_GAP] },
      text: text(ratio === null ? 'label.intensityBase' : 'label.intensityScaled'),
      ...(ratio === null ? {} : { vars: { n: String(ratio) } }),
      chip: false,
      font: 'mono',
      fontSize: VALUE_PX,
      align: 'right',
      opacity: op,
      style: sound,
    });
    g.push({
      type: 'readout',
      id: `record-${k}-level-value`,
      anchor: { world: [p.lX, p.lTop], offset: [0, -VALUE_LABEL_GAP] },
      text: text('label.level.value'),
      vars: { db: String(levels[k]) },
      chip: false,
      font: 'mono',
      fontSize: VALUE_PX,
      align: 'left',
      opacity: op,
      style: ink,
    });
    // 막대 이름은 첫 쌍 아래에만 — 나머지 쌍도 같은 순서(왼쪽 세기, 오른쪽 세기 준위)다.
    if (k === 0) {
      g.push({
        type: 'readout',
        id: 'name-intensity',
        anchor: { world: [p.iX + BAR_WIDTH / 2, BAR_BASE_Y], offset: [0, BAR_NAME_OFFSET] },
        text: text('label.intensity'),
        chip: false,
        font: 'text',
        fontSize: LABEL_PX,
        align: 'right',
        style: sound,
      });
      g.push({
        type: 'readout',
        id: 'name-level',
        anchor: { world: [p.lX - BAR_WIDTH / 2, BAR_BASE_Y], offset: [0, BAR_NAME_OFFSET] },
        text: text('label.level'),
        chip: false,
        font: 'text',
        fontSize: LABEL_PX,
        align: 'left',
        style: ink,
      });
    }
  });

  // ---- 물러나는 동안 귀 아래에서 함께 움직이며 줄어드는 쌍 (값 글자 없음) ----
  if (isMoving(tl)) pair('live', m, 1);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
