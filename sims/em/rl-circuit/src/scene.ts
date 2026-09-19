// ========================================================================
// rl-circuit — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽: 전지(왼쪽 변) · 코일(위 변) · 저항(오른쪽 변) · 스위치(아래 변)가 한 고리다.
// 코일 아래 고리 안쪽에 전류 화살표 `I` — 길이가 전류에 비례하고, 다 찬 전류 길이의
// 점선 화살표가 그 밑에 깔려 「가려는 곳」 을 보인다. 화살표는 단숨에 점선 끝까지 가지 못한다.
//
// 오른쪽: 높이가 전지 전압인 기둥 하나. 위 몫(사선 결)은 코일이, 아래 몫(채움)은 저항이
// 맡은 전압이다. 두 몫의 합은 언제나 기둥 높이 — 경계선이 올라가는 것이 「코일이 맡던 몫이
// 저항으로 넘어간다」 이다. 두 몫은 색이 아니라 결(사선 · 채움)과 표식(`L` · `R`)으로 가른다.
//
// 색은 뜻마다 하나다. 회로 · 경계선 · 글자는 먹색, 기둥 틀 · 목표 점선은 배경 정보라 muted,
// 전류는 primary, 전압(기둥의 두 몫)은 secondary. 강조색은 쓰지 않는다.
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
import { fullCurrent, inductanceOf, readConstants, readingAt } from './physics';
import {
  ARROW_Y,
  BATTERY_LONG_HALF,
  BATTERY_PLATE_GAP,
  BATTERY_SHORT_HALF,
  BATTERY_Y,
  COIL_HUMP,
  COIL_TURNS,
  COIL_WIDTH,
  COIL_X,
  COLUMN_BASE,
  COLUMN_LEFT,
  COLUMN_RIGHT,
  LOOP_BOTTOM,
  LOOP_LEFT,
  LOOP_RIGHT,
  LOOP_TOP,
  RES_LENGTH,
  RES_Y,
  RES_ZIG,
  RES_ZIGS,
  SCENE_BOUNDS,
  SWITCH_CONTACT_X,
  SWITCH_HINGE_X,
  text,
} from './schema';
import type { RlCircuitState } from './state';

// ------------------------------------------------------------------------
// 색
// ------------------------------------------------------------------------

/** 회로 · 경계선 · 이름표. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 기둥 틀 · 목표 점선 화살표 — 배경 정보. */
const GUIDE = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 전류. */
const CURRENT = { colorRole: 'primary', emphasis: 'strong' } as const;
/** 전압 — 기둥의 두 몫. 같은 양이라 같은 색, 결로 가른다. */
const VOLT = { colorRole: 'secondary', emphasis: 'strong' } as const;

// ------------------------------------------------------------------------
// 치수 — 굵기 · 글자 크기 · 띄움은 화면 px, 나머지는 월드
// ------------------------------------------------------------------------

/** 도선 · 코일 · 저항 · 스위치 날 굵기. */
const WIRE_PX = 2.5;
/** 전지 두 판의 굵기 — 짧은 판(−)을 더 굵게 긋는 관례를 따른다. */
const BATTERY_LONG_PX = 2.5;
const BATTERY_SHORT_PX = 4.5;
/** 코일 혹 하나를 이루는 점 개수. */
const HUMP_SEGMENTS = 16;
/** 스위치 날이 다 열렸을 때의 각(라디안). 고리 바깥(아래)으로 든다. */
const SWITCH_OPEN_RAD = (32 * Math.PI) / 180;

/** 전류 화살표 — 굵기(화면 px), 머리(월드), 이보다 짧으면 두지 않는다(월드). */
const ARROW_PX = 3;
const TARGET_PX = 1.6;
const ARROW_HEAD = 0.16;
const ARROW_MIN = 0.05;
/** 전류 기호가 화살표 아래로 비켜서는 거리(월드). */
const ARROW_LABEL_DROP = 0.24;

/** 전압 기둥 — 틀 굵기, 경계선 굵기, 경계선이 기둥 양옆으로 삐져나가는 길이(월드), 채움 불투명도. */
const FRAME_PX = 1.4;
const BORDER_PX = 2.5;
const BORDER_OVERHANG = 0.08;
const SHARE_FILL = 0.7;
/**
 * 몫 이름표(`L` · `R`)가 몫의 가운데 높이를 따라간다. 몫이 이 높이(월드)보다 얇아지면
 * 그 비율로 옅어진다 — 얇은 몫의 이름표가 이웃 몫 자리에 얹히지 않게.
 */
const SHARE_LABEL_MIN_H = 0.3;

/** 글자 크기(화면 px). */
const LABEL_PX = 13;
const SIGN_PX = 15;
const SHARE_PX = 15;
/** 이름표 띄움 — 전지 이름표(월드), 부호(월드), 코일 이름표(월드), 저항 이름표(월드). */
const BATTERY_LABEL_GAP = 0.55;
const SIGN_GAP = 0.28;
const SIGN_RISE = 0.16;
const COIL_LABEL_RISE = 0.3;
const RES_LABEL_GAP = 0.32;
/** 기둥 이름표가 기둥에서 비켜서는 거리(화면 px). */
const COLUMN_TOP_OFFSET: Vec2 = [-14, 0];
const SHARE_LABEL_OFFSET: Vec2 = [8, 0];

// ------------------------------------------------------------------------
// 회로 모양
// ------------------------------------------------------------------------

/** 코일 혹들 — 위 변 위로 솟은 반 타원을 이어 한 줄로. */
function coilLine(): Vec2[] {
  const left = COIL_X - COIL_WIDTH / 2;
  const pitch = COIL_WIDTH / COIL_TURNS;
  const pts: Vec2[] = [];
  for (let i = 0; i < COIL_TURNS; i++) {
    const cx = left + pitch * (i + 0.5);
    for (let k = i === 0 ? 0 : 1; k <= HUMP_SEGMENTS; k++) {
      const a = Math.PI - (k / HUMP_SEGMENTS) * Math.PI;
      pts.push([cx + (pitch / 2) * Math.cos(a), LOOP_TOP + COIL_HUMP * Math.sin(a)]);
    }
  }
  return pts;
}

/** 저항 지그재그 — 오른쪽 변 위에서 아래로. */
function resistorLine(): Vec2[] {
  const top = RES_Y + RES_LENGTH / 2;
  const seg = RES_LENGTH / RES_ZIGS;
  const pts: Vec2[] = [[LOOP_RIGHT, top]];
  for (let i = 0; i < RES_ZIGS; i++) {
    pts.push([LOOP_RIGHT + (i % 2 === 0 ? RES_ZIG : -RES_ZIG), top - seg * (i + 0.5)]);
  }
  pts.push([LOOP_RIGHT, top - RES_LENGTH]);
  return pts;
}

/** 스위치 날 끝. 경첩(오른쪽)에서 닿는 곳(왼쪽)을 향하다 `angle` 만큼 아래로 젖혀진다. */
function bladeTip(angle: number): Vec2 {
  const len = SWITCH_HINGE_X - SWITCH_CONTACT_X;
  return [SWITCH_HINGE_X - len * Math.cos(angle), LOOP_BOTTOM - len * Math.sin(angle)];
}

/** 월드 사각형 네 꼭짓점. */
function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: RlCircuitState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('rl-circuit: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const r = readingAt(tl.u, tl, state, c);
  /** 되돌리는 동안 전류 · 두 몫이 흐려진다. */
  const live = 1 - tl.at('reset');
  const out: Primitive[] = [];

  // ---- 도선 — 전지 두 판 사이 · 코일 · 저항 · 스위치 자리를 비우고 긋는다 ----
  const plusY = BATTERY_Y + BATTERY_PLATE_GAP / 2;
  const minusY = BATTERY_Y - BATTERY_PLATE_GAP / 2;
  const coilLeft = COIL_X - COIL_WIDTH / 2;
  const coilRight = COIL_X + COIL_WIDTH / 2;
  const resTop = RES_Y + RES_LENGTH / 2;
  const resBottom = RES_Y - RES_LENGTH / 2;
  out.push({
    type: 'lineSet',
    id: 'wires',
    lines: [
      [
        [LOOP_LEFT, plusY],
        [LOOP_LEFT, LOOP_TOP],
        [coilLeft, LOOP_TOP],
      ],
      [
        [coilRight, LOOP_TOP],
        [LOOP_RIGHT, LOOP_TOP],
        [LOOP_RIGHT, resTop],
      ],
      [
        [LOOP_RIGHT, resBottom],
        [LOOP_RIGHT, LOOP_BOTTOM],
        [SWITCH_HINGE_X, LOOP_BOTTOM],
      ],
      [
        [SWITCH_CONTACT_X, LOOP_BOTTOM],
        [LOOP_LEFT, LOOP_BOTTOM],
        [LOOP_LEFT, minusY],
      ],
    ],
    width: WIRE_PX,
    style: INK,
  });

  // ---- 코일 · 저항 ----
  out.push({ type: 'lineSet', id: 'coil', lines: [coilLine()], width: WIRE_PX, style: INK });
  out.push({ type: 'lineSet', id: 'resistor', lines: [resistorLine()], width: WIRE_PX, style: INK });

  // ---- 전지 — 긴 판(+) 위, 짧은 판(−) 아래 (G178: circuitElement battery 대신) ----
  out.push({
    type: 'lineSet',
    id: 'battery-plus',
    lines: [[[LOOP_LEFT - BATTERY_LONG_HALF, plusY], [LOOP_LEFT + BATTERY_LONG_HALF, plusY]]],
    width: BATTERY_LONG_PX,
    style: INK,
  });
  out.push({
    type: 'lineSet',
    id: 'battery-minus',
    lines: [[[LOOP_LEFT - BATTERY_SHORT_HALF, minusY], [LOOP_LEFT + BATTERY_SHORT_HALF, minusY]]],
    width: BATTERY_SHORT_PX,
    style: INK,
  });

  // ---- 스위치 날 — 열려 있다가 `close` 동안 내려와 닿는다 (G185) ----
  const tip = bladeTip((1 - tl.at('close')) * SWITCH_OPEN_RAD);
  out.push({
    type: 'lineSet',
    id: 'switch-blade',
    lines: [[[SWITCH_HINGE_X, LOOP_BOTTOM], tip]],
    width: WIRE_PX,
    style: INK,
  });
  out.push({ type: 'body', id: 'switch-hinge', shape: 'point', pos: [SWITCH_HINGE_X, LOOP_BOTTOM], style: INK });
  out.push({ type: 'body', id: 'switch-contact', shape: 'point', pos: [SWITCH_CONTACT_X, LOOP_BOTTOM], style: INK });

  // ---- 전류 화살표 — 코일 아래, 오른쪽으로. 다 찬 전류 길이의 점선 위에서 자란다 ----
  const arrowX = (LOOP_LEFT + LOOP_RIGHT) / 2;
  const fullLen = fullCurrent(c) * c.arrowScale;
  if (r.closed && live > 0) {
    out.push({
      type: 'vector',
      id: 'current-target',
      from: [arrowX - fullLen / 2, ARROW_Y],
      delta: [fullLen, 0],
      width: TARGET_PX,
      headSize: ARROW_HEAD,
      opacity: live,
      style: { ...GUIDE, lineStyle: 'dashed' },
    });
  }
  const len = r.current * c.arrowScale;
  if (len > ARROW_MIN && live > 0) {
    out.push({
      type: 'vector',
      id: 'current',
      from: [arrowX - fullLen / 2, ARROW_Y],
      delta: [len, 0],
      width: ARROW_PX,
      headSize: ARROW_HEAD,
      opacity: live,
      style: CURRENT,
    });
    out.push({
      type: 'readout',
      id: 'current-label',
      anchor: { world: [arrowX - fullLen / 2 + len / 2, ARROW_Y - ARROW_LABEL_DROP] },
      text: text('label.current'),
      chip: false,
      align: 'center',
      font: 'text',
      italic: true,
      fontSize: LABEL_PX,
      opacity: live,
      style: CURRENT,
    });
  }

  // ---- 회로 이름표 — 값은 스테이지 상수를 그대로 ----
  out.push({
    type: 'readout',
    id: 'battery-label',
    anchor: { world: [LOOP_LEFT - BATTERY_LABEL_GAP, BATTERY_Y] },
    text: text('label.volts'),
    vars: { v: String(c.emf) },
    chip: false,
    align: 'right',
    font: 'text',
    fontSize: LABEL_PX,
    style: INK,
  });
  out.push(sign('battery-plus-sign', [LOOP_LEFT + SIGN_GAP, plusY + SIGN_RISE], text('label.plus')));
  out.push(sign('battery-minus-sign', [LOOP_LEFT + SIGN_GAP, minusY - SIGN_RISE], text('label.minus')));
  out.push({
    type: 'readout',
    id: 'coil-label',
    anchor: { world: [COIL_X, LOOP_TOP + COIL_HUMP + COIL_LABEL_RISE] },
    text: text('label.coil'),
    vars: { l: String(inductanceOf(state, c)) },
    chip: false,
    align: 'center',
    font: 'text',
    fontSize: LABEL_PX,
    style: INK,
  });
  out.push({
    type: 'readout',
    id: 'resistor-label',
    anchor: { world: [LOOP_RIGHT + RES_LABEL_GAP, RES_Y] },
    text: text('label.resistor'),
    vars: { r: String(c.resistance) },
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: LABEL_PX,
    style: INK,
  });

  // ---- 전압 기둥 — 높이 = 전지 전압. 아래 몫 저항, 위 몫 코일 ----
  const top = COLUMN_BASE + c.emf * c.voltScale;
  const border = COLUMN_BASE + r.resistorVolt * c.voltScale;
  if (r.closed && live > 0) {
    if (border > COLUMN_BASE) {
      out.push({
        type: 'region',
        id: 'share-resistor',
        points: rect(COLUMN_LEFT, COLUMN_BASE, COLUMN_RIGHT, border),
        fillOpacity: SHARE_FILL,
        opacity: live,
        style: VOLT,
      });
    }
    if (top > border) {
      out.push({
        type: 'region',
        id: 'share-coil',
        points: rect(COLUMN_LEFT, border, COLUMN_RIGHT, top),
        fillOpacity: SHARE_FILL,
        fill: 'hatch',
        opacity: live,
        style: VOLT,
      });
    }
    out.push({
      type: 'lineSet',
      id: 'share-border',
      lines: [[[COLUMN_LEFT - BORDER_OVERHANG, border], [COLUMN_RIGHT + BORDER_OVERHANG, border]]],
      width: BORDER_PX,
      opacity: live,
      style: INK,
    });
    out.push(shareLabel('share-coil-label', (border + top) / 2, top - border, live, text('label.shareCoil')));
    out.push(shareLabel('share-resistor-label', (COLUMN_BASE + border) / 2, border - COLUMN_BASE, live, text('label.shareResistor')));
  }

  // 기둥 틀 — 전지 전압 높이. 비어 있어도 자리를 보인다.
  out.push({
    type: 'lineSet',
    id: 'column-frame',
    lines: [[...rect(COLUMN_LEFT, COLUMN_BASE, COLUMN_RIGHT, top), [COLUMN_LEFT, COLUMN_BASE]]],
    width: FRAME_PX,
    style: GUIDE,
  });
  out.push({
    type: 'readout',
    id: 'column-top-label',
    anchor: { world: [COLUMN_LEFT, top], offset: COLUMN_TOP_OFFSET },
    text: text('label.volts'),
    vars: { v: String(c.emf) },
    chip: false,
    align: 'right',
    font: 'text',
    fontSize: LABEL_PX,
    style: GUIDE,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}

function sign(id: string, at: Vec2, label: LocalizedText): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    fontSize: SIGN_PX,
    weight: 'bold',
    align: 'left',
    style: INK,
  };
}

/** 몫 이름표 — 기둥 오른쪽, 몫의 가운데 높이. 몫이 얇아지면 옅어진다. */
function shareLabel(id: string, y: number, height: number, live: number, label: LocalizedText): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: [COLUMN_RIGHT, y], offset: SHARE_LABEL_OFFSET },
    text: label,
    chip: false,
    align: 'left',
    font: 'text',
    italic: true,
    fontSize: SHARE_PX,
    opacity: live * Math.min(1, height / SHARE_LABEL_MIN_H),
    style: INK,
  };
}
