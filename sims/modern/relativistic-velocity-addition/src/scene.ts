// ========================================================================
// relativistic-velocity-addition — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 배(body custom) · 탄환 ·
// 등(body) · 레인과 눈금자(lineSet) · 빛(lineSet 짧은 획 + trace dot) · 쏘는 순간의
// 섬광(trace ring) · 안내선(trajectory 점선) · 유령(body 속 빈 원 · trajectory 점선) ·
// 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 배 · 탄환 · 등은 먹색, 레인 · 눈금자 · 안내선 · 그냥 더한 유령은
// muted, **강조색은 「빛」 한 가지 뜻에만** (빛 획 · 앞머리 · 쏘는 섬광 · 눈금 c).
// 두 빛은 같은 빛이다 — 배가 쏜 것과 등이 쏜 것을 색으로 가르지 않고 레인으로 가른다.
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
import { raceFrame, readConstants } from './physics';
import {
  GHOST_ROW_Y,
  GROUND_LANE_Y,
  ORIGIN_X,
  RULER_Y,
  SCENE_BOUNDS,
  SHIP_HEIGHT,
  SHIP_LANE_Y,
  SHIP_LENGTH,
  text,
} from './schema';
import type { RelativisticVelocityAdditionState } from './state';

/** 레인 굵기(화면 px) · 짙기. 배경 정보라 가늘고 옅다. */
const LANE_WIDTH_PX = 1;
const LANE_OPACITY = 0.45;
/** 쏜 자리 · 멈춘 자리에서 눈금자로 내린 안내 점선 굵기(화면 px) · 짙기. */
const GUIDE_WIDTH_PX = 1;
const GUIDE_OPACITY = 0.7;
/** 눈금자 굵기(화면 px) · 눈금 반 길이(월드). */
const RULER_WIDTH_PX = 1.5;
const TICK_HALF = 0.09;
/** 탄환 반지름(월드). */
const BULLET_R = 0.09;
/** 등 반지름(월드). */
const LAMP_R = 0.1;
/** 빛 — 앞머리 뒤로 끌리는 길이(월드) · 굵기(화면 px) · 앞머리 점 반지름(화면 px). */
const PULSE_LEN = 0.7;
const PULSE_WIDTH_PX = 2.5;
const PULSE_HEAD_PX = 3.5;
/** 쏘는 순간의 섬광 — 퍼지는 고리(화면 px) · 굵기(화면 px). 수명은 `fire` 단계 길이다. */
const FLASH_FROM_PX = 5;
const FLASH_TO_PX = 20;
const FLASH_WIDTH_PX = 1.5;
/** 유령 — 속 빈 탄환 반지름(월드) · 빛 유령 획 굵기(화면 px). */
const GHOST_R = BULLET_R;
const GHOST_WIDTH_PX = 2;
/** 이름표 글자 크기(화면 px) · 눈금 글자 크기(화면 px). */
const LABEL_PX = 12;
const TICK_LABEL_PX = 13;
/** 이름표를 물체에서 띄우는 거리(월드). */
const SHIP_LABEL_ABOVE = 0.38;
const BULLET_LABEL_BELOW = 0.3;
const LIGHT_LABEL_ABOVE = 0.28;
const LIGHT_LABEL_BELOW = 0.3;
const LAMP_LABEL_GAP = 0.4;
const GHOST_ROW_LABEL_GAP = 0.3;
const TICK_LABEL_BELOW = 0.32;
const GHOST_LABEL_ABOVE = 0.3;

/** 뾰족한 앞머리의 길이 — 배 높이에 대한 비. */
const SHIP_NOSE_RATIO = 0.6;

/** 배 외형 — 앞머리가 `pos` 에서 SHIP_LENGTH/2 앞이다. 좌표는 pos 기준 월드, y 는 위. */
function shipPath(): string {
  const a = SHIP_LENGTH / 2;
  const b = SHIP_HEIGHT / 2;
  const shoulder = a - SHIP_HEIGHT * SHIP_NOSE_RATIO;
  return `M ${-a} ${-b} L ${shoulder} ${-b} L ${a} 0 L ${shoulder} ${b} L ${-a} ${b} Z`;
}

export function scene(params: {
  state: RelativisticVelocityAdditionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('relativistic-velocity-addition: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const f = raceFrame(tl, c);
  const out: Primitive[] = [];

  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

  /** 주기 끝에서 모두 흐려진다. */
  const live = 1 - tl.at('fade');
  /** 배 — 나타나며 짙어진다. */
  const shipAlpha = tl.at('appear') * live;
  /** 멈춘 뒤 눈금자 · 빠르기 글자. */
  const markAlpha = tl.at('mark') * live;
  /** 탄환 · 빛 이름표 — 눈금 글자가 붙으면 그 자리를 넘겨준다. */
  const nameAlpha = live * (1 - tl.at('mark'));
  /** 그냥 더했을 때의 유령. */
  const ghostAlpha = tl.at('compare') * live;
  const cEnd = ORIGIN_X + c.lightReach;

  // ---- 레인 둘 ----
  out.push({
    type: 'lineSet',
    id: 'lanes',
    lines: [
      [
        [SCENE_BOUNDS.minX, SHIP_LANE_Y],
        [SCENE_BOUNDS.maxX, SHIP_LANE_Y],
      ],
      [
        [SCENE_BOUNDS.minX, GROUND_LANE_Y],
        [SCENE_BOUNDS.maxX, GROUND_LANE_Y],
      ],
    ],
    width: LANE_WIDTH_PX,
    opacity: LANE_OPACITY,
    style: muted,
  });

  // ---- 쏜 자리 — 두 레인을 잇는 점선(눈금자의 0 까지) ----
  out.push({
    type: 'trajectory',
    id: 'origin-guide',
    points: [
      [ORIGIN_X, SHIP_LANE_Y],
      [ORIGIN_X, RULER_Y],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: GUIDE_OPACITY,
    style: { ...muted, lineStyle: 'dashed' },
  });

  // ---- 멈춘 자리에서 눈금자로 내린 점선 · 눈금자 ----
  if (markAlpha > 0) {
    const drops: [number, number][] = [
      [f.shipNose, SHIP_LANE_Y],
      [f.bullet, SHIP_LANE_Y],
      [f.light, SHIP_LANE_Y],
    ];
    for (const [i, [x, y]] of drops.entries()) {
      out.push({
        type: 'trajectory',
        id: `drop-${i}`,
        points: [
          [x, y],
          [x, RULER_Y],
        ],
        width: GUIDE_WIDTH_PX,
        opacity: GUIDE_OPACITY * markAlpha,
        style: { ...muted, lineStyle: 'dashed' },
      });
    }
    const ticks = [ORIGIN_X, f.shipNose, f.bullet, cEnd];
    out.push({
      type: 'lineSet',
      id: 'ruler',
      lines: [
        [
          [ORIGIN_X, RULER_Y],
          [cEnd, RULER_Y],
        ],
        ...ticks.map((x) => [
          [x, RULER_Y - TICK_HALF],
          [x, RULER_Y + TICK_HALF],
        ] as Vec2[]),
      ],
      width: RULER_WIDTH_PX,
      opacity: markAlpha,
      style: muted,
    });
    const tickLabels: { id: string; x: number; t: LocalizedText; vars?: Record<string, string>; style: typeof ink | typeof accent | typeof muted; bold?: boolean }[] = [
      { id: 'zero', x: ORIGIN_X, t: text('label.zero'), style: muted },
      { id: 'ship', x: f.shipNose, t: text('label.speed'), vars: { b: String(c.shipBeta) }, style: ink },
      { id: 'bullet', x: f.bullet, t: text('label.speed'), vars: { b: String(c.resultBeta) }, style: ink, bold: true },
      { id: 'c', x: cEnd, t: text('label.c'), style: accent, bold: true },
    ];
    for (const l of tickLabels) {
      out.push({
        type: 'readout',
        id: `tick-${l.id}`,
        anchor: { world: [l.x, RULER_Y - TICK_LABEL_BELOW] },
        text: l.t,
        ...(l.vars ? { vars: l.vars } : {}),
        chip: false,
        font: 'mono',
        fontSize: TICK_LABEL_PX,
        weight: l.bold ? 'bold' : 'normal',
        align: 'center',
        opacity: markAlpha,
        style: l.style,
      });
    }
  }

  // ---- 그냥 더했을 때의 유령 ----
  if (ghostAlpha > 0) {
    for (const [i, x] of [f.naiveBullet, f.naiveLight].entries()) {
      out.push({
        type: 'trajectory',
        id: `ghost-drop-${i}`,
        points: [
          [x, GHOST_ROW_Y],
          [x, RULER_Y],
        ],
        width: GUIDE_WIDTH_PX,
        opacity: GUIDE_OPACITY * ghostAlpha,
        style: { ...muted, lineStyle: 'dashed' },
      });
    }
    out.push({
      type: 'body',
      id: 'ghost-bullet',
      shape: 'circle',
      pos: [f.naiveBullet, GHOST_ROW_Y],
      size: GHOST_R,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: ghostAlpha,
      style: muted,
    });
    out.push({
      type: 'trajectory',
      id: 'ghost-light',
      points: [
        [f.naiveLight - PULSE_LEN, GHOST_ROW_Y],
        [f.naiveLight, GHOST_ROW_Y],
      ],
      width: GHOST_WIDTH_PX,
      opacity: ghostAlpha,
      style: { ...muted, lineStyle: 'dashed' },
    });
    out.push({
      type: 'readout',
      id: 'ghost-label-bullet',
      anchor: { world: [f.naiveBullet, GHOST_ROW_Y + GHOST_LABEL_ABOVE] },
      text: text('label.naiveSum'),
      vars: { v: String(c.shipBeta), u: String(c.bulletBeta) },
      chip: false,
      font: 'mono',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: ghostAlpha,
      style: muted,
    });
    out.push({
      type: 'readout',
      id: 'ghost-label-light',
      anchor: { world: [f.naiveLight, GHOST_ROW_Y + GHOST_LABEL_ABOVE] },
      text: text('label.naiveLight'),
      vars: { v: String(c.shipBeta) },
      chip: false,
      font: 'mono',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: ghostAlpha,
      style: muted,
    });
    out.push({
      type: 'readout',
      id: 'ghost-row-label',
      anchor: { world: [f.naiveBullet - GHOST_ROW_LABEL_GAP, GHOST_ROW_Y] },
      text: text('label.naive'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'right',
      opacity: ghostAlpha,
      style: muted,
    });
  }

  // ---- 땅의 등 ----
  out.push({
    type: 'body',
    id: 'lamp',
    shape: 'circle',
    pos: [ORIGIN_X, GROUND_LANE_Y],
    size: LAMP_R,
    fill: 'solid',
    outline: 'none',
    glow: false,
    opacity: live,
    style: ink,
  });
  out.push({
    type: 'readout',
    id: 'lamp-label',
    anchor: { world: [ORIGIN_X - LAMP_LABEL_GAP, GROUND_LANE_Y] },
    text: text('label.lamp'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'right',
    opacity: live,
    style: muted,
  });

  // ---- 빛 — 배가 쏜 것(위) · 등이 쏜 것(아래), 같은 빠르기 ----
  if (f.fired) {
    const tail = Math.max(ORIGIN_X, f.light - PULSE_LEN);
    out.push({
      type: 'lineSet',
      id: 'pulses',
      lines: [
        [
          [tail, SHIP_LANE_Y],
          [f.light, SHIP_LANE_Y],
        ],
        [
          [tail, GROUND_LANE_Y],
          [f.light, GROUND_LANE_Y],
        ],
      ],
      width: PULSE_WIDTH_PX,
      opacity: live,
      style: accent,
    });
    out.push({
      type: 'trace',
      id: 'pulse-heads',
      marks: [{ pos: [f.light, SHIP_LANE_Y] }, { pos: [f.light, GROUND_LANE_Y] }],
      shape: 'dot',
      size: PULSE_HEAD_PX,
      opacity: live,
      style: accent,
    });
    out.push({
      type: 'readout',
      id: 'light-label-ship',
      anchor: { world: [f.light, SHIP_LANE_Y + LIGHT_LABEL_ABOVE] },
      text: text('label.light'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: nameAlpha,
      style: accent,
    });
    out.push({
      type: 'readout',
      id: 'light-label-ground',
      anchor: { world: [f.light, GROUND_LANE_Y - LIGHT_LABEL_BELOW] },
      text: text('label.light'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: nameAlpha,
      style: accent,
    });
  }

  // ---- 배 ----
  if (shipAlpha > 0) {
    const shipCenter = f.shipNose - SHIP_LENGTH / 2;
    out.push({
      type: 'body',
      id: 'ship',
      shape: 'custom',
      pos: [shipCenter, SHIP_LANE_Y],
      customPath: shipPath(),
      fill: 'solid',
      opacity: shipAlpha,
      style: ink,
    });
    out.push({
      type: 'readout',
      id: 'ship-label',
      anchor: { world: [shipCenter, SHIP_LANE_Y + SHIP_LABEL_ABOVE] },
      text: text('label.ship'),
      vars: { v: String(c.shipBeta) },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: shipAlpha,
      style: ink,
    });
  }

  // ---- 탄환 ----
  if (f.fired) {
    out.push({
      type: 'body',
      id: 'bullet',
      shape: 'circle',
      pos: [f.bullet, SHIP_LANE_Y],
      size: BULLET_R,
      fill: 'solid',
      outline: 'background',
      glow: false,
      opacity: live,
      style: ink,
    });
    out.push({
      type: 'readout',
      id: 'bullet-label',
      anchor: { world: [f.bullet, SHIP_LANE_Y - BULLET_LABEL_BELOW] },
      text: text('label.bullet'),
      vars: { u: String(c.bulletBeta) },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: nameAlpha,
      style: ink,
    });
  }

  // ---- 쏘는 순간의 섬광 ----
  // 배 앞머리와 등에서 함께 퍼진다. 배 몸이 가리지 않도록 배 뒤에 선언한다.
  // 섬광은 `fire` 단계 동안만 있다 — 수명이 그 단계 길이라 단계가 끝나면 다 퍼져 사라진다.
  if (f.fired && tl.at('fire') < 1) {
    out.push({
      type: 'trace',
      id: 'fire-flash',
      marks: [
        { pos: [ORIGIN_X, SHIP_LANE_Y], age: f.fireAge },
        { pos: [ORIGIN_X, GROUND_LANE_Y], age: f.fireAge },
      ],
      life: tl.duration('fire'),
      shape: 'ring',
      size: FLASH_FROM_PX,
      spreadTo: FLASH_TO_PX,
      width: FLASH_WIDTH_PX,
      style: accent,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
