// ========================================================================
// eddy-current — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 나란히 선 관 둘(벽은 `body` rect 둘씩 — 옆에서 자른 단면)과 그 속을 떨어지는 자석
// (`body` rect 반쪽 둘 + 극 표식 `readout`). 관 왼쪽에는 같은 시간 간격의 스트로보
// 눈금(`trace` tick), 오른쪽에는 무게 mg 와 막는 힘 F(`vector`). 구리 관에는 자석
// 위 · 아래로 관을 휘감는 맴돌이 고리(`lineSet` 뒤 반쪽 · 앞 반쪽)와 도는 방향 촉(`vector`).
//
// 색은 뜻마다 하나다. 자석 · 무게 · 글자는 먹색, 관 · 바닥 · 눈금은 배경 정보라 muted,
// 맴돌이 전류는 secondary, **강조색은 막는 힘 F 한 뜻에만** 건다. 두 관은 색이 아니라
// 벽의 채움(속 빈 플라스틱 · 채운 구리)과 이름표로 가른다 (S-piece).
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
import { brakeRatio, dropAfter, readConstants, sinceRelease, strobeMarks, type EddyCurrentConstants, type Tube } from './physics';
import {
  COPPER_X,
  FORCE_GAP,
  LOOP_OFFSET,
  LOOP_RX,
  LOOP_RY,
  MAGNET_H,
  MAGNET_W,
  PLASTIC_X,
  SCENE_BOUNDS,
  START_Y,
  STROBE_GAP,
  STROBE_LEN,
  TUBE_BOTTOM,
  TUBE_INNER,
  TUBE_LABEL_Y,
  TUBE_TOP,
  TUBE_WALL,
  text,
} from './schema';
import type { EddyCurrentState } from './state';

// ------------------------------------------------------------------------
// 색
// ------------------------------------------------------------------------

/** 자석 · 무게 · 이름표. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 관 · 바닥 · 스트로보 눈금 — 배경 정보. */
const FRAME = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 맴돌이 전류. */
const CURRENT = { colorRole: 'secondary', emphasis: 'strong' } as const;
/** 막는 힘 — 강조색은 이 한 뜻에만. */
const BRAKE = { colorRole: 'accent', emphasis: 'strong' } as const;

/** 자석 S 극의 빛의 양 — 이웃 `lenz-law` · `faradays-law` 와 같은 자석이라 같은 값이다. */
const SOUTH_LUMINANCE = 0.33;
/** N 글자 — 짙은 반쪽에서 파낸 글자라 바탕에 가까운 빛의 양이다. */
const KNOCKOUT_LUMINANCE = 0.04;

// ------------------------------------------------------------------------
// 치수 — 굵기 · 글자 크기 · 띄움은 화면 px, 나머지는 월드
// ------------------------------------------------------------------------

/** 바닥선 굵기와, 관 바깥으로 내민 길이(월드). */
const FLOOR_WIDTH_PX = 1.4;
const FLOOR_OVERHANG = 0.75;
/** 스트로보 눈금 굵기. */
const TICK_WIDTH_PX = 1.8;

/** 맴돌이 고리 반쪽을 이루는 점 개수. */
const HALF_LOOP_SEGMENTS = 28;
/** 고리 굵기. */
const LOOP_WIDTH_PX = 2.2;
/** 고리 뒤 반쪽의 짙기 — 관 뒤로 돌아가는 몫이라 앞 반쪽보다 물러난다. */
const LOOP_BACK_OPACITY = 0.45;
/** 고리 위 방향 촉의 길이 · 머리(월드). */
const LOOP_ARROW_LEN = 0.34;
const LOOP_ARROW_HEAD = 0.12;
/** 이 세기 아래로는 고리를 그리지 않는다 — 멈춘 자석 둘레에 흐릿한 고리를 남기지 않는다. */
const LOOP_MIN_STRENGTH = 0.02;

/** 힘 화살표 굵기(화면 px) · 머리(월드). */
const FORCE_WIDTH_PX = 2.4;
const FORCE_HEAD = 0.12;
/** 힘 이름표가 화살표 옆으로 비켜서는 거리(화면 px). */
const FORCE_LABEL_OFFSET: Vec2 = [9, 0];

/** 글자 크기(화면 px). */
const POLE_FONT_PX = 11;
const LABEL_FONT_PX = 13;
const TUBE_FONT_PX = 12;

// ------------------------------------------------------------------------
// 관
// ------------------------------------------------------------------------

/** 관 바깥 면까지의 반폭. */
const OUTER = TUBE_INNER + TUBE_WALL;

function tubeWalls(tube: Tube, x: number): Primitive[] {
  const height = TUBE_TOP - TUBE_BOTTOM;
  const mid = (TUBE_TOP + TUBE_BOTTOM) / 2;
  const offset = TUBE_INNER + TUBE_WALL / 2;
  // 플라스틱은 속 빈 벽(윤곽만), 구리는 채운 벽 — 재질을 색이 아니라 채움으로 가른다.
  const skin =
    tube === 'plastic'
      ? ({ fill: 'none', outline: 'role' } as const)
      : ({ fill: 'solid' } as const);
  return [-1, 1].map(
    (side): Primitive => ({
      type: 'body',
      id: `${tube}-wall-${side < 0 ? 'l' : 'r'}`,
      pos: [x + side * offset, mid],
      shape: 'rect',
      size: [TUBE_WALL, height],
      ...skin,
      style: FRAME,
    }),
  );
}

// ------------------------------------------------------------------------
// 맴돌이 고리
// ------------------------------------------------------------------------

/**
 * 비스듬히 위에서 본 고리의 반쪽. 위 반(먼 쪽)이 뒤, 아래 반(가까운 쪽)이 앞이다.
 */
function halfLoop(cx: number, cy: number, front: boolean): Vec2[] {
  const from = front ? Math.PI : 0;
  return Array.from({ length: HALF_LOOP_SEGMENTS + 1 }, (_, k): Vec2 => {
    const a = from + (k / HALF_LOOP_SEGMENTS) * Math.PI;
    return [cx + LOOP_RX * Math.cos(a), cy + LOOP_RY * Math.sin(a)];
  });
}

/** 고리 둘의 높이 — 자석 위 · 아래. 관 끝을 넘지 않게 관 안으로 당긴다. */
function loopYs(magnetY: number): { above: number; below: number } {
  const clampY = (y: number): number => Math.min(TUBE_TOP - LOOP_RY, Math.max(TUBE_BOTTOM + LOOP_RY, y));
  return { above: clampY(magnetY + LOOP_OFFSET), below: clampY(magnetY - LOOP_OFFSET) };
}

/**
 * 도는 방향 — N 이 아래를 보고 떨어진다.
 *  · 아래 고리: 다가오는 N 을 밀어내려고 위쪽 장을 만든다 → 위에서 보아 반시계 → 앞 반쪽에서 오른쪽(+x).
 *  · 위 고리: 멀어지는 S 를 붙들려고 아래쪽 장을 만든다 → 위에서 보아 시계 → 앞 반쪽에서 왼쪽(−x).
 */
const FRONT_DIRECTION = { above: -1, below: 1 } as const;

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: EddyCurrentState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('eddy-current: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const tau = sinceRelease(tl);
  const shown = tl.at('appear') * (1 - tl.at('reset'));
  const marksAlpha = 1 - tl.at('reset');
  const out: Primitive[] = [];

  // ---- 바닥 ----
  out.push({
    type: 'lineSet',
    id: 'floor',
    lines: [
      [
        [PLASTIC_X - OUTER - FLOOR_OVERHANG, TUBE_BOTTOM],
        [PLASTIC_X + OUTER + FLOOR_OVERHANG, TUBE_BOTTOM],
      ],
      [
        [COPPER_X - OUTER - FLOOR_OVERHANG, TUBE_BOTTOM],
        [COPPER_X + OUTER + FLOOR_OVERHANG, TUBE_BOTTOM],
      ],
    ],
    width: FLOOR_WIDTH_PX,
    style: FRAME,
  });

  for (const [tube, x] of [
    ['plastic', PLASTIC_X],
    ['copper', COPPER_X],
  ] as const) {
    out.push(...tubeScene(tube, x, tau, c, shown, marksAlpha));
  }

  return out;
}

function tubeScene(
  tube: Tube,
  x: number,
  tau: number,
  c: EddyCurrentConstants,
  shown: number,
  marksAlpha: number,
): Primitive[] {
  const out: Primitive[] = [];
  const d = dropAfter(tau, tube, c);
  const magnetY = START_Y - d.fallen;
  const falling = tau > 0 && !d.landed;
  const brake = falling ? brakeRatio(d.speed, tube, c) : 0;
  const loops = tube === 'copper' && brake > LOOP_MIN_STRENGTH ? loopYs(magnetY) : undefined;

  // ---- 스트로보 눈금 — 관 왼쪽 ----
  const marks = strobeMarks(tau, tube, c);
  if (marks.length > 0) {
    out.push({
      type: 'trace',
      id: `${tube}-strobe`,
      marks: marks.map((fallen) => ({ pos: [x - OUTER - STROBE_GAP, START_Y - fallen] as Vec2 })),
      shape: 'tick',
      direction: [1, 0],
      size: STROBE_LEN,
      width: TICK_WIDTH_PX,
      opacity: marksAlpha,
      style: FRAME,
    });
  }

  // ---- 맴돌이 고리 뒤 반쪽 — 관 · 자석 아래 ----
  if (loops) {
    out.push({
      type: 'lineSet',
      id: `${tube}-loops-back`,
      lines: [halfLoop(x, loops.above, false), halfLoop(x, loops.below, false)],
      width: LOOP_WIDTH_PX,
      opacity: LOOP_BACK_OPACITY * brake,
      style: CURRENT,
    });
  }

  // ---- 관 벽 ----
  out.push(...tubeWalls(tube, x));

  // ---- 자석 ----
  const half = MAGNET_H / 4;
  out.push({
    type: 'body',
    id: `${tube}-magnet-s`,
    pos: [x, magnetY + half],
    shape: 'rect',
    size: [MAGNET_W, MAGNET_H / 2],
    luminance: SOUTH_LUMINANCE,
    opacity: shown,
    style: INK,
  });
  out.push({
    type: 'body',
    id: `${tube}-magnet-n`,
    pos: [x, magnetY - half],
    shape: 'rect',
    size: [MAGNET_W, MAGNET_H / 2],
    opacity: shown,
    style: INK,
  });
  out.push({
    type: 'readout',
    id: `${tube}-pole-s`,
    anchor: { world: [x, magnetY + half] },
    text: text('label.poleS'),
    chip: false,
    align: 'center',
    font: 'text',
    weight: 'bold',
    fontSize: POLE_FONT_PX,
    opacity: shown,
    style: INK,
  });
  out.push({
    type: 'readout',
    id: `${tube}-pole-n`,
    anchor: { world: [x, magnetY - half] },
    text: text('label.poleN'),
    chip: false,
    align: 'center',
    font: 'text',
    weight: 'bold',
    fontSize: POLE_FONT_PX,
    luminance: KNOCKOUT_LUMINANCE,
    opacity: shown,
    style: INK,
  });

  // ---- 맴돌이 고리 앞 반쪽 · 방향 촉 — 관 · 자석 위 ----
  // 짙기가 빠르기를 따른다 — 전류는 선속이 바뀌는 빠르기에 비례한다.
  if (loops) {
    out.push({
      type: 'lineSet',
      id: `${tube}-loops-front`,
      lines: [halfLoop(x, loops.above, true), halfLoop(x, loops.below, true)],
      width: LOOP_WIDTH_PX,
      opacity: brake,
      style: CURRENT,
    });
    for (const which of ['above', 'below'] as const) {
      const dir = FRONT_DIRECTION[which];
      const y = loops[which] - LOOP_RY;
      out.push({
        type: 'vector',
        id: `${tube}-loop-${which}-arrow`,
        from: [x - (dir * LOOP_ARROW_LEN) / 2, y],
        delta: [dir * LOOP_ARROW_LEN, 0],
        width: LOOP_WIDTH_PX,
        headSize: LOOP_ARROW_HEAD,
        opacity: brake,
        style: CURRENT,
      });
    }
  }

  // ---- 힘 — 떨어지는 동안만, 관 오른쪽 ----
  if (falling) {
    const fx = x + OUTER + FORCE_GAP;
    out.push({
      type: 'vector',
      id: `${tube}-weight`,
      from: [fx, magnetY],
      delta: [0, -c.forceScale],
      width: FORCE_WIDTH_PX,
      headSize: FORCE_HEAD,
      style: INK,
    });
    out.push({
      type: 'readout',
      id: `${tube}-weight-label`,
      anchor: { world: [fx, magnetY - c.forceScale / 2], offset: FORCE_LABEL_OFFSET },
      text: text('label.weight'),
      chip: false,
      align: 'left',
      font: 'text',
      italic: true,
      fontSize: LABEL_FONT_PX,
      style: INK,
    });
    if (brake > LOOP_MIN_STRENGTH) {
      out.push({
        type: 'vector',
        id: `${tube}-brake`,
        from: [fx, magnetY],
        delta: [0, c.forceScale * brake],
        width: FORCE_WIDTH_PX,
        headSize: FORCE_HEAD,
        style: BRAKE,
      });
      out.push({
        type: 'readout',
        id: `${tube}-brake-label`,
        anchor: { world: [fx, magnetY + (c.forceScale * brake) / 2], offset: FORCE_LABEL_OFFSET },
        text: text('label.brake'),
        chip: false,
        align: 'left',
        font: 'text',
        italic: true,
        fontSize: LABEL_FONT_PX,
        style: BRAKE,
      });
    }
  }

  // ---- 관 이름표 ----
  out.push({
    type: 'readout',
    id: `${tube}-label`,
    anchor: { world: [x, TUBE_LABEL_Y] },
    text: text(tube === 'plastic' ? 'label.plastic' : 'label.copper'),
    chip: false,
    align: 'center',
    font: 'text',
    fontSize: TUBE_FONT_PX,
    style: FRAME,
  });

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
