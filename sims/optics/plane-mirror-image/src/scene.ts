// ========================================================================
// plane-mirror-image — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 거울(opticalElement) ·
// 줄기(ray, plugin-optics `traceRay` 로 추적) · 거꾸로 이은 점선(trajectory) · 눈(region +
// trajectory + body) · F 모양 물체와 상(body custom) · 거리(dimension) · 이름표(readout).
//
// 색은 뜻마다 하나다 — 빛은 plugin 이 정한 강조색 하나(`ray`), 거꾸로 이은 선은 빛이 아니라
// 작도라 먹 점선, 물체와 상은 같은 대상이라 같은 primary(물체는 채움, 상은 속 빈 윤곽),
// 눈은 먹, 이름표 · 치수선은 배경 정보라 muted.
// 빛과 점선을 가르는 것은 색보다 선 모양(실선 화살촉 · 점선)이다 (S-piece).
// ========================================================================

import type {
  Body,
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
import { heldCm, meetBehind, objectCm, readConstants } from './physics';
import {
  DIM_Y,
  EYE_HALF_H,
  EYE_HALF_W,
  EYE_POS,
  EYE_TARGET_OFFSETS,
  F_HEIGHT,
  F_MID_WIDTH,
  F_MID_Y,
  F_STROKE,
  F_WIDTH,
  IRIS_R,
  MIRROR_BOTTOM,
  MIRROR_LABEL_GAP,
  MIRROR_TOP,
  NAME_GAP,
  PUPIL_R,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { PlaneMirrorImageState } from './state';

/** 거꾸로 이은 점선 굵기(화면 px) · 불투명도. 빛(1.5 px 강조색)과 모양으로 갈린다. */
const TRACE_WIDTH_PX = 1.5;
const TRACE_OPACITY = 0.85;
/** 눈 테 굵기(화면 px). */
const EYE_LINE_PX = 1.75;
/** 이름표 글자 크기(화면 px). */
const NAME_LABEL_PX = 12;
/** 줄기가 나오는 점 · 점선이 만나는 점의 반지름(월드). */
const POINT_R = 0.06;
/** 눈 아몬드꼴을 표본하는 점 수(한 변) · 눈동자 테 원의 점 수 (곡선 어휘가 없다 — G28). */
const EYE_SAMPLES = 24;
const IRIS_SAMPLES = 40;

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const guide = { colorRole: 'muted', emphasis: 'strong' } as const;
const thing = { colorRole: 'primary', emphasis: 'strong' } as const;

const MIRROR_CENTER: Vec2 = [0, (MIRROR_BOTTOM + MIRROR_TOP) / 2];

/** 평면거울. 면이 x = 0 이고 법선이 −x(물체 쪽)를 향한다. 뒷면 결은 거울 뒤(+x)에 그어진다. */
const MIRROR: OpticalElement = {
  type: 'opticalElement',
  id: 'mirror',
  subtype: 'mirror-flat',
  pos: MIRROR_CENTER,
  orientation: Math.PI,
  size: MIRROR_TOP - MIRROR_BOTTOM,
};

const mid = (a: Vec2, b: Vec2): Vec2 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];
const dist = (a: Vec2, b: Vec2): number => Math.hypot(a[0] - b[0], a[1] - b[1]);

/**
 * F 모양 윤곽(SVG path, `pos` = 기둥 바깥 아래 모서리, y 위). `sx` 가 +1 이면 가로획이 +x 로,
 * −1 이면 −x 로 뻗는다 — 거울 앞 물체는 거울 쪽(+x), 거울 뒤 상도 거울 쪽(−x)이다.
 */
function fPath(sx: 1 | -1): string {
  const pts: Vec2[] = [
    [0, 0],
    [sx * F_STROKE, 0],
    [sx * F_STROKE, F_MID_Y],
    [sx * F_MID_WIDTH, F_MID_Y],
    [sx * F_MID_WIDTH, F_MID_Y + F_STROKE],
    [sx * F_STROKE, F_MID_Y + F_STROKE],
    [sx * F_STROKE, F_HEIGHT - F_STROKE],
    [sx * F_WIDTH, F_HEIGHT - F_STROKE],
    [sx * F_WIDTH, F_HEIGHT],
    [0, F_HEIGHT],
  ];
  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ') + ' Z';
}

export function scene(params: {
  state: PlaneMirrorImageState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('plane-mirror-image: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const d = objectCm(timeline, c) * c.worldPerCm;
  const out: Primitive[] = [];

  // ---- 줄기 추적 ----
  // 물체 F 의 윗모서리 한 점에서 줄기 셋을 쏜다. 겨누는 곳은 눈의 세 자리로 가도록 고른
  // 거울 위 점이고(겨눔은 어느 줄기가 눈에 드는지 고르는 일), 꺾인 뒤의 길은 `traceRay` 가
  // 돌려준다. 상의 자리는 그 꺾인 줄기를 거꾸로 이은 직선들의 교점이다.
  const source: Vec2 = [-d, F_HEIGHT];
  const aim: Vec2 = [d, F_HEIGHT]; // 겨눔 전용 — 거울 반대편 같은 자리
  const traced = EYE_TARGET_OFFSETS.map((off) => {
    const eye: Vec2 = [EYE_POS[0], EYE_POS[1] + off];
    const s = aim[0] / (aim[0] - eye[0]);
    const onMirror: Vec2 = [aim[0] + (eye[0] - aim[0]) * s, aim[1] + (eye[1] - aim[1]) * s];
    const r = traceRay(source, sub(onMirror, source), [MIRROR], {
      maxBounces: 1,
      maxLength: dist(source, onMirror) + dist(onMirror, eye),
    });
    const [start, hit, end] = r.segments as [Vec2, Vec2, Vec2];
    return { start, hit, end };
  });
  const first = traced[0]!;
  const last = traced[traced.length - 1]!;
  const image =
    meetBehind(first.hit, sub(first.hit, first.end), last.hit, sub(last.hit, last.end)) ?? aim;

  // ---- 거꾸로 이은 점선 — 거울에서 상까지. 빛이 아니다 ----
  traced.forEach((r, i) => {
    out.push({
      type: 'trajectory',
      id: `trace-${i}`,
      points: [r.hit, image],
      width: TRACE_WIDTH_PX,
      opacity: TRACE_OPACITY,
      style: { ...ink, lineStyle: 'dashed' },
    });
  });

  // ---- 거울 ----
  out.push(MIRROR);

  // ---- 줄기 — 물체 → 거울 → 눈. 촉이 가운데에 오도록 한 다리를 두 토막으로 (G217) ----
  traced.forEach((r, i) => {
    const inMid = mid(r.start, r.hit);
    const outMid = mid(r.hit, r.end);
    out.push(
      { type: 'ray', id: `ray-${i}-in-a`, segments: [r.start, inMid], showArrow: true },
      { type: 'ray', id: `ray-${i}-in-b`, segments: [inMid, r.hit] },
      { type: 'ray', id: `ray-${i}-out-a`, segments: [r.hit, outMid], showArrow: true },
      { type: 'ray', id: `ray-${i}-out-b`, segments: [outMid, r.end] },
    );
  });

  // ---- 눈 — 바탕색으로 덮어 줄기 끝이 눈 안으로 들어간 것으로 읽힌다 ----
  const eyePts: Vec2[] = [];
  for (let i = 0; i <= EYE_SAMPLES; i++) {
    const k = -1 + (2 * i) / EYE_SAMPLES;
    eyePts.push([EYE_POS[0] + EYE_HALF_W * k, EYE_POS[1] + EYE_HALF_H * (1 - k * k)]);
  }
  for (let i = EYE_SAMPLES - 1; i >= 1; i--) {
    const k = -1 + (2 * i) / EYE_SAMPLES;
    eyePts.push([EYE_POS[0] + EYE_HALF_W * k, EYE_POS[1] - EYE_HALF_H * (1 - k * k)]);
  }
  out.push({
    type: 'region',
    id: 'eye',
    points: eyePts,
    opaque: true,
    fillOpacity: 0,
    outline: eyePts.map((_, i) => [i, (i + 1) % eyePts.length] as const),
    style: ink,
  });
  const iris: Vec2[] = [];
  for (let i = 0; i < IRIS_SAMPLES; i++) {
    const a = (2 * Math.PI * i) / IRIS_SAMPLES;
    iris.push([EYE_POS[0] + IRIS_R * Math.cos(a), EYE_POS[1] + IRIS_R * Math.sin(a)]);
  }
  out.push(
    { type: 'trajectory', id: 'iris', points: iris, closed: true, width: EYE_LINE_PX, style: ink },
    { type: 'body', id: 'pupil', pos: EYE_POS, shape: 'circle', size: PUPIL_R, glow: false, outline: 'none', style: ink },
  );

  // ---- 물체와 상 — 같은 대상이라 같은 색. 물체는 채움, 상은 속 빈 윤곽 ----
  const objectF: Body = {
    type: 'body',
    id: 'object',
    pos: [-d, 0],
    shape: 'custom',
    customPath: fPath(1),
    style: thing,
  };
  const imageF: Body = {
    type: 'body',
    id: 'image',
    pos: [image[0], image[1] - F_HEIGHT],
    shape: 'custom',
    customPath: fPath(-1),
    fill: 'none',
    outline: 'role',
    style: thing,
  };
  out.push(objectF, imageF);

  // ---- 두 점 — 줄기가 나오는 점(채움) · 점선이 만나는 점(속 빈) ----
  out.push(
    { type: 'body', id: 'source-point', pos: source, shape: 'circle', size: POINT_R, glow: false, outline: 'none', style: ink },
    {
      type: 'body',
      id: 'image-point',
      pos: image,
      shape: 'circle',
      size: POINT_R,
      fill: 'none',
      outline: 'role',
      glow: false,
      style: ink,
    },
  );

  // ---- 거리 — 물체에서 거울까지, 거울에서 상까지. 글자는 멈춤 단계에서만 선언값 그대로 ----
  const held = heldCm(timeline, c);
  const distText = held === null ? {} : { text: text('label.distance'), vars: { d: String(held) } };
  out.push(
    { type: 'dimension', id: 'dim-object', from: [-d, DIM_Y], to: [0, DIM_Y], ...distText, style: guide },
    { type: 'dimension', id: 'dim-image', from: [0, DIM_Y], to: [image[0], DIM_Y], ...distText, style: guide },
  );

  // ---- 이름표 ----
  const name = (id: string, at: Vec2, key: 'label.object' | 'label.image' | 'label.mirror'): Primitive => ({
    type: 'readout',
    id,
    anchor: { world: at },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: NAME_LABEL_PX,
    align: 'center',
    style: guide,
  });
  out.push(
    name('name-object', [-d - NAME_GAP, F_HEIGHT / 2], 'label.object'),
    name('name-image', [image[0] + NAME_GAP, F_HEIGHT / 2], 'label.image'),
    name('name-mirror', [0, MIRROR_BOTTOM - MIRROR_LABEL_GAP], 'label.mirror'),
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
