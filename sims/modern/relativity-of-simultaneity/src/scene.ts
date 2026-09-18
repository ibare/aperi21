// ========================================================================
// relativity-of-simultaneity — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 칸(body rect 채움 +
// trajectory closed 윤곽) · 바퀴 · 등 · 감지기(body) · 선로와 침목(lineSet) · 빛
// (lineSet 짧은 획 + trace dot) · 번쩍임과 도착 섬광(trace ring) · 번쩍인 자리
// (trajectory 점선) · 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 기차 · 선로는 muted, 등 · 이름표는 먹색, **강조색은 「빛」
// 한 가지 뜻에만** (빛 획과 앞머리 · 번쩍임 · 빛이 닿아 켜진 감지기 · 도착 섬광).
// 두 판은 같은 기차 · 같은 빛이다 — 판을 색으로 가르지 않고 이름표와 움직임으로 가른다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LocalizedText,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { readConstants, simultaneityFrame, type PanelFrame } from './physics';
import {
  ARRIVAL_LABEL_ABOVE,
  DETECTOR_SIZE,
  DIVIDER_Y,
  FLOOR_ABOVE,
  GROUND_PANEL_Y,
  LIGHT_ABOVE,
  MOTION_LABEL_BELOW,
  PANEL_LABEL_ABOVE,
  PANEL_LABEL_X,
  ROOF_ABOVE,
  SCENE_BOUNDS,
  SLEEPER_LEN,
  TRAIN_PANEL_MOTION_X,
  TRAIN_PANEL_Y,
  WHEEL_ABOVE,
  WHEEL_R,
  text,
} from './schema';
import type { RelativityOfSimultaneityState } from './state';

/** 선로 굵기(화면 px) · 침목 굵기(화면 px). 배경 정보라 가늘다. */
const TRACK_WIDTH_PX = 1.5;
const SLEEPER_WIDTH_PX = 1;
/** 판 사이 나눔선 굵기(화면 px) · 짙기. */
const DIVIDER_WIDTH_PX = 1;
const DIVIDER_OPACITY = 0.5;
/** 칸 윤곽 굵기(화면 px) · 칸 채움의 빛의 양. */
const CAR_STROKE_PX = 2;
const CAR_FILL_LUMINANCE = 0.1;
/** 바퀴가 칸 끝에서 들어온 거리(월드). */
const WHEEL_INSET = 0.35;
/** 등 반지름(월드). */
const LAMP_R = 0.07;
/** 빛 획 — 앞머리 뒤로 끌리는 길이(월드) · 굵기(화면 px) · 앞머리 점 반지름(화면 px). */
const PULSE_LEN = 0.35;
const PULSE_WIDTH_PX = 3;
const PULSE_HEAD_PX = 4;
/** 번쩍임 — 등에서 퍼지는 고리(화면 px) · 수명(초) · 굵기(화면 px). */
const FLASH_FROM_PX = 6;
const FLASH_TO_PX = 30;
const FLASH_LIFE = 0.5;
const FLASH_WIDTH_PX = 2;
/** 도착 섬광 — 감지기에서 퍼지는 고리(화면 px) · 수명(초). */
const ARRIVAL_FROM_PX = 8;
const ARRIVAL_TO_PX = 34;
const ARRIVAL_LIFE = 0.6;
/** 번쩍인 자리 점선 — 지붕 위로 넘는 길이(월드) · 굵기(화면 px) · 짙기. */
const EMIT_GUIDE_OVER = 0.1;
const EMIT_GUIDE_WIDTH_PX = 1;
const EMIT_GUIDE_OPACITY = 0.7;
/** 판 이름표 · 도착 이름표 · 움직임 이름표 글자 크기(화면 px). */
const PANEL_LABEL_PX = 13;
const ARRIVAL_LABEL_PX = 13;
const MOTION_LABEL_PX = 12;

/** 음수에도 0 이상을 돌려주는 나머지. */
function mod(a: number, m: number): number {
  return ((a % m) + m) % m;
}

interface PanelLook {
  /** 인스턴스 id 머리. */
  id: string;
  /** 선로 높이. */
  y: number;
  /** 판 이름표. */
  title: LocalizedText;
  /** 두 끝의 도착 이름표. */
  rearLabel: LocalizedText;
  frontLabel: LocalizedText;
  /** 칸 전체 짙기 — 달리는 기차는 나타나고 흐려진다. */
  carAlpha: number;
  /** 침목 짙기 — 흘러가는 선로는 나타나고 흐려진다. */
  sleeperAlpha: number;
  /** 빛이 남긴 것(켜진 감지기 · 도착 이름표 · 번쩍인 자리)의 짙기. */
  recordAlpha: number;
}

function panel(out: Primitive[], f: PanelFrame, c: number, look: PanelLook): void {
  const { id, y } = look;
  const lightY = y + LIGHT_ABOVE;
  const floorY = y + FLOOR_ABOVE;
  const roofY = y + ROOF_ABOVE;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;

  // ---- 선로와 침목 ----
  out.push({
    type: 'lineSet',
    id: `${id}-track`,
    lines: [
      [
        [SCENE_BOUNDS.minX, y],
        [SCENE_BOUNDS.maxX, y],
      ],
    ],
    width: TRACK_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  const sleepers: Vec2[][] = [];
  const first = SCENE_BOUNDS.minX + mod(f.sleeperShift - SCENE_BOUNDS.minX, f.sleeperSpacing);
  for (let x = first; x <= SCENE_BOUNDS.maxX; x += f.sleeperSpacing) {
    sleepers.push([
      [x, y],
      [x, y - SLEEPER_LEN],
    ]);
  }
  out.push({
    type: 'lineSet',
    id: `${id}-sleepers`,
    lines: sleepers,
    width: SLEEPER_WIDTH_PX,
    opacity: look.sleeperAlpha,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // ---- 칸 ----
  const half = f.halfLength;
  const carAlpha = look.carAlpha;
  out.push({
    type: 'body',
    id: `${id}-car-fill`,
    shape: 'rect',
    pos: [f.trainX, (floorY + roofY) / 2],
    size: [half * 2, roofY - floorY],
    fill: 'solid',
    outline: 'none',
    luminance: CAR_FILL_LUMINANCE,
    opacity: carAlpha,
    style: muted,
  });
  out.push({
    type: 'trajectory',
    id: `${id}-car-outline`,
    points: [
      [f.trainX - half, floorY],
      [f.trainX + half, floorY],
      [f.trainX + half, roofY],
      [f.trainX - half, roofY],
    ],
    closed: true,
    width: CAR_STROKE_PX,
    opacity: carAlpha,
    style: muted,
  });
  [f.trainX - half + WHEEL_INSET, f.trainX + half - WHEEL_INSET].forEach((wx, i) => {
    out.push({
      type: 'body',
      id: `${id}-wheel-${i}`,
      shape: 'circle',
      pos: [wx, y + WHEEL_ABOVE],
      size: WHEEL_R,
      fill: 'solid',
      outline: 'none',
      glow: false,
      opacity: carAlpha,
      style: muted,
    });
  });

  // ---- 번쩍인 자리 — 이 틀에서 빛이 퍼져 나가는 가운데 ----
  // 기차 판에서는 등과 겹치고, 선로 판에서는 등이 이 자리를 떠난다.
  if (f.t >= 0) {
    out.push({
      type: 'trajectory',
      id: `${id}-emit-guide`,
      points: [
        [0, y - EMIT_GUIDE_OVER],
        [0, roofY + EMIT_GUIDE_OVER],
      ],
      width: EMIT_GUIDE_WIDTH_PX,
      opacity: EMIT_GUIDE_OPACITY * look.recordAlpha,
      style: { ...accent, lineStyle: 'dashed' },
    });
  }

  // ---- 감지기 — 빛이 닿으면 켜진다 ----
  const [detW, detH] = DETECTOR_SIZE;
  const ends = [
    { side: 'rear', face: f.rearFaceX, dir: -1, arrival: f.rearArrival, label: look.rearLabel },
    { side: 'front', face: f.frontFaceX, dir: 1, arrival: f.frontArrival, label: look.frontLabel },
  ] as const;
  for (const e of ends) {
    const lit = f.t >= e.arrival;
    out.push({
      type: 'body',
      id: `${id}-detector-${e.side}`,
      shape: 'rect',
      pos: [e.face + (e.dir * detW) / 2, lightY],
      size: [detW, detH],
      fill: lit ? 'solid' : 'none',
      outline: 'role',
      opacity: carAlpha * (lit ? look.recordAlpha : 1),
      style: lit ? accent : ink,
    });
  }

  // ---- 등 ----
  out.push({
    type: 'body',
    id: `${id}-lamp`,
    shape: 'circle',
    pos: [f.trainX, lightY],
    size: LAMP_R,
    fill: 'solid',
    outline: 'none',
    glow: false,
    opacity: carAlpha,
    style: ink,
  });

  // ---- 번쩍임 ----
  if (f.clock >= 0 && f.clock < FLASH_LIFE) {
    out.push({
      type: 'trace',
      id: `${id}-flash`,
      marks: [{ pos: [0, lightY], age: f.clock }],
      life: FLASH_LIFE,
      shape: 'ring',
      size: FLASH_FROM_PX,
      spreadTo: FLASH_TO_PX,
      width: FLASH_WIDTH_PX,
      style: accent,
    });
  }

  // ---- 빛 — 번쩍인 자리에서 양쪽으로 같은 빠르기 ----
  const pulses: Vec2[][] = [];
  const heads: { pos: Vec2 }[] = [];
  for (const e of ends) {
    if (f.t < 0 || f.t >= e.arrival) continue;
    const reach = c * f.t;
    const tail = Math.max(0, reach - PULSE_LEN);
    pulses.push([
      [e.dir * tail, lightY],
      [e.dir * reach, lightY],
    ]);
    heads.push({ pos: [e.dir * reach, lightY] });
  }
  if (pulses.length > 0) {
    out.push({ type: 'lineSet', id: `${id}-pulses`, lines: pulses, width: PULSE_WIDTH_PX, style: accent });
    out.push({ type: 'trace', id: `${id}-pulse-heads`, marks: heads, shape: 'dot', size: PULSE_HEAD_PX, style: accent });
  }

  // ---- 도착 — 섬광과 이름표 ----
  const flashes = ends
    .filter((e) => f.clock >= e.arrival && f.clock - e.arrival < ARRIVAL_LIFE)
    .map((e) => ({ pos: [e.face, lightY] as Vec2, age: f.clock - e.arrival }));
  if (flashes.length > 0) {
    out.push({
      type: 'trace',
      id: `${id}-arrival-flash`,
      marks: flashes,
      life: ARRIVAL_LIFE,
      shape: 'ring',
      size: ARRIVAL_FROM_PX,
      spreadTo: ARRIVAL_TO_PX,
      width: FLASH_WIDTH_PX,
      style: accent,
    });
  }
  for (const e of ends) {
    if (f.t < e.arrival) continue;
    out.push({
      type: 'readout',
      id: `${id}-arrival-${e.side}`,
      anchor: { world: [e.face, y + ARRIVAL_LABEL_ABOVE] },
      text: e.label,
      chip: false,
      font: 'text',
      fontSize: ARRIVAL_LABEL_PX,
      weight: 'bold',
      align: 'center',
      opacity: carAlpha * look.recordAlpha,
      style: ink,
    });
  }

  // ---- 판 이름표 ----
  out.push({
    type: 'readout',
    id: `${id}-title`,
    anchor: { world: [PANEL_LABEL_X, y + PANEL_LABEL_ABOVE] },
    text: look.title,
    chip: false,
    font: 'text',
    fontSize: PANEL_LABEL_PX,
    weight: 'bold',
    align: 'left',
    style: ink,
  });
}

export function scene(params: {
  state: RelativityOfSimultaneityState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('relativity-of-simultaneity: schema.timeline 이 선언되어야 한다');
  const k = readConstants(stage);
  const fr = simultaneityFrame(tl, k);
  const out: Primitive[] = [];

  /** 움직이는 것(선로 판의 기차 · 기차 판의 침목) — 나타나며 짙어지고 주기 끝에 흐려진다. */
  const movingAlpha = tl.at('appear') * (1 - tl.at('fade'));
  /** 빛이 남긴 것 — 주기 끝에서 흐려진다. */
  const recordAlpha = 1 - tl.at('fade');
  const beta = String(k.beta);

  // ---- 두 판 사이 나눔선 ----
  out.push({
    type: 'lineSet',
    id: 'divider',
    lines: [
      [
        [SCENE_BOUNDS.minX, DIVIDER_Y],
        [SCENE_BOUNDS.maxX, DIVIDER_Y],
      ],
    ],
    width: DIVIDER_WIDTH_PX,
    opacity: DIVIDER_OPACITY,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });

  // ---- 위 판: 기차 안에서 본 것 ----
  panel(out, fr.train, fr.c, {
    id: 'train-frame',
    y: TRAIN_PANEL_Y,
    title: text('label.trainFrame'),
    rearLabel: text('label.same'),
    frontLabel: text('label.same'),
    carAlpha: 1,
    sleeperAlpha: movingAlpha,
    recordAlpha,
  });
  out.push({
    type: 'readout',
    id: 'train-frame-motion',
    anchor: { world: [TRAIN_PANEL_MOTION_X, TRAIN_PANEL_Y + LIGHT_ABOVE] },
    text: text('label.trackMoves'),
    vars: { beta },
    chip: false,
    font: 'text',
    fontSize: MOTION_LABEL_PX,
    align: 'center',
    opacity: movingAlpha,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 아래 판: 선로에서 본 것 ----
  panel(out, fr.ground, fr.c, {
    id: 'ground-frame',
    y: GROUND_PANEL_Y,
    title: text('label.groundFrame'),
    rearLabel: text('label.first'),
    frontLabel: text('label.second'),
    carAlpha: movingAlpha,
    sleeperAlpha: 1,
    recordAlpha,
  });
  out.push({
    type: 'readout',
    id: 'ground-frame-motion',
    anchor: { world: [fr.ground.trainX, GROUND_PANEL_Y - MOTION_LABEL_BELOW] },
    text: text('label.trainMoves'),
    vars: { beta },
    chip: false,
    font: 'text',
    fontSize: MOTION_LABEL_PX,
    align: 'center',
    opacity: movingAlpha,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
