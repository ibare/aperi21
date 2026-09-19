// ========================================================================
// self-inductance — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽: 전지(왼쪽 변) · 코일(위 변) · 스위치(아래 변)가 한 고리다. 전류 화살표 `I` 가
// 오른쪽 변을 따라 흐르고, 길이가 전류에 비례한다. 스위치 날이 젖혀지면 벌어진 틈에
// 불꽃(지그재그 + 빛살)이 튄다.
//
// 오른쪽: 같은 시간축의 기록지 두 장 — 위는 전류 `I`, 아래는 코일 양 끝 전압 `ε`.
// 전류가 일정한 동안 ε 자취는 바닥에 붙어 있고, 전류가 급히 꺾이는 그 순간 ε 자취가
// 전지 전압 점선을 훌쩍 넘게 치솟는다. 두 기록지를 세로로 맞대 「같은 순간」 을 점선
// 하나로 잇는다.
//
// 색은 뜻마다 하나다. 회로 · 자취 · 글자는 먹색, 기록지 축 · 기준선은 배경 정보라
// muted, 전류 화살표는 primary. **강조색은 불꽃 한 가지 뜻에만** 쓴다. 불꽃의 색을
// 지어내지 않는다 — 불꽃인 것은 모양(지그재그 · 빛살)과 전압을 따라 줄어드는 크기가 말한다.
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
import {
  breakTime,
  coilVoltageAt,
  currentAt,
  peakVoltage,
  readConstants,
  recordEnd,
  steadyCurrent,
  type SelfInductanceConstants,
} from './physics';
import {
  BATTERY_LONG_HALF,
  BATTERY_PLATE_GAP,
  BATTERY_SHORT_HALF,
  BATTERY_Y,
  COIL_HUMP,
  COIL_TURNS,
  COIL_WIDTH,
  COIL_X,
  GRAPH_X,
  I_GRAPH_H,
  I_GRAPH_Y,
  LOOP_BOTTOM,
  LOOP_LEFT,
  LOOP_RIGHT,
  LOOP_TOP,
  SCENE_BOUNDS,
  SWITCH_CONTACT_X,
  SWITCH_HINGE_X,
  V_GRAPH_H,
  V_GRAPH_Y,
  text,
} from './schema';
import type { SelfInductanceState } from './state';

// ------------------------------------------------------------------------
// 색
// ------------------------------------------------------------------------

/** 회로 · 자취 · 이름표. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 기록지 축 · 기준선 · 맞대는 점선 — 배경 정보. */
const GUIDE = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 전류. */
const CURRENT = { colorRole: 'primary', emphasis: 'strong' } as const;
/** 불꽃 — 강조색의 유일한 뜻. */
const SPARK = { colorRole: 'accent', emphasis: 'strong' } as const;

// ------------------------------------------------------------------------
// 치수 — 굵기 · 글자 크기 · 띄움은 화면 px, 나머지는 월드
// ------------------------------------------------------------------------

/** 도선 · 코일 · 스위치 날 굵기. */
const WIRE_PX = 2.5;
const COIL_PX = 2.5;
/** 전지 두 판의 굵기 — 짧은 판(−)을 더 굵게 긋는 관례를 따른다. */
const BATTERY_LONG_PX = 2.5;
const BATTERY_SHORT_PX = 4.5;
/** 코일 혹 하나를 이루는 점 개수. */
const HUMP_SEGMENTS = 16;

/** 스위치 날이 다 젖혀졌을 때의 각(라디안). 고리 바깥(아래)으로 든다. */
const SWITCH_SWING_RAD = (32 * Math.PI) / 180;

/** 불꽃 — 지그재그 마디 수 · 옆으로 꺾이는 폭(월드) · 굵기(화면 px). */
const SPARK_JAGS = 6;
const SPARK_JAG = 0.06;
const SPARK_PX = 3;
/** 불꽃 빛살 — 방향 수, 틈 가운데에서 빛살이 시작하는 거리(월드), 굵기(화면 px). */
const SPARK_RAYS = 8;
const SPARK_RAY_INNER = 0.14;
const SPARK_RAY_PX = 2.5;
/** 이보다 옅어진 불꽃은 선언하지 않는다(0 · 1 밖의 문턱). */
const SPARK_MIN = 0.03;

/** 전류 화살표 — 고리 안쪽으로 비켜선 거리(월드), 굵기(화면 px), 머리(월드), 이보다 짧으면 두지 않는다. */
const ARROW_INSET = 0.35;
const ARROW_PX = 3;
const ARROW_HEAD = 0.16;
const ARROW_MIN = 0.06;
/** 전류 기호가 화살표에서 비켜서는 거리(월드). */
const ARROW_LABEL_GAP = 0.16;

/** 기록지 — 축 굵기, 자취 굵기, 맞대는 점선 굵기, 표본 간격(초). */
const AXIS_PX = 1.4;
const TRACE_PX = 2.6;
const GUIDE_PX = 1.2;
const TRACE_DT = 0.01;

/** 글자 크기(화면 px). */
const LABEL_PX = 13;
const SIGN_PX = 15;
const AXIS_PX_FONT = 13;
/** 이름표 띄움 — 전지 이름표(월드), 부호(월드), 코일 기호(월드). */
const BATTERY_LABEL_GAP = 0.55;
const SIGN_GAP = 0.28;
const SIGN_RISE = 0.16;
const COIL_LABEL_RISE = 0.3;
/** 축 이름 · 기준선 이름표가 축에서 비켜서는 거리(화면 px). */
const AXIS_TOP_OFFSET: Vec2 = [0, -10];
const AXIS_END_OFFSET: Vec2 = [10, 0];
const REF_LABEL_OFFSET: Vec2 = [-8, 0];

// ------------------------------------------------------------------------
// 회로
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

/** 스위치 날 끝. 경첩(오른쪽)에서 닿는 곳(왼쪽)을 향하다 `angle` 만큼 아래로 젖혀진다. */
function bladeTip(angle: number): Vec2 {
  const len = SWITCH_HINGE_X - SWITCH_CONTACT_X;
  return [SWITCH_HINGE_X - len * Math.cos(angle), LOOP_BOTTOM - len * Math.sin(angle)];
}

/** 틈을 건너는 지그재그. 두 끝은 날 끝과 닿는 곳에 붙는다. */
function sparkBolt(from: Vec2, to: Vec2): Vec2[] {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return Array.from({ length: SPARK_JAGS + 1 }, (_, k): Vec2 => {
    const f = k / SPARK_JAGS;
    const side = k === 0 || k === SPARK_JAGS ? 0 : k % 2 === 0 ? -1 : 1;
    return [from[0] + dx * f + nx * SPARK_JAG * side, from[1] + dy * f + ny * SPARK_JAG * side];
  });
}

/** 틈 가운데에서 사방으로 뻗는 빛살. 길이가 불꽃 세기에 비례한다. */
function sparkRays(center: Vec2, reach: number): Vec2[][] {
  return Array.from({ length: SPARK_RAYS }, (_, k) => {
    const a = (k / SPARK_RAYS) * Math.PI * 2 + Math.PI / SPARK_RAYS;
    const u: Vec2 = [Math.cos(a), Math.sin(a)];
    return [
      [center[0] + u[0] * SPARK_RAY_INNER, center[1] + u[1] * SPARK_RAY_INNER],
      [center[0] + u[0] * (SPARK_RAY_INNER + reach), center[1] + u[1] * (SPARK_RAY_INNER + reach)],
    ];
  });
}

// ------------------------------------------------------------------------
// 기록지
// ------------------------------------------------------------------------

function iPoint(time: number, current: number, c: SelfInductanceConstants): Vec2 {
  return [GRAPH_X + time * c.secondsToWorld, I_GRAPH_Y + current * c.currentScale];
}

function vPoint(time: number, volt: number, c: SelfInductanceConstants): Vec2 {
  return [GRAPH_X + time * c.secondsToWorld, V_GRAPH_Y + volt * c.voltScale];
}

/**
 * 자취 표본. 끊기 전은 곧은 선이라 두 점, 끊은 뒤는 표본 간격마다. ε 는 끊는 순간 곧게
 * 치솟으므로 그 자리에 바닥과 봉우리 두 점을 둔다.
 */
function traces(now: number, tl: TimelineFrame, c: SelfInductanceConstants): { i: Vec2[]; v: Vec2[] } {
  const tb = breakTime(tl);
  const i0 = steadyCurrent(c);
  const i: Vec2[] = [iPoint(0, i0, c), iPoint(Math.min(now, tb), i0, c)];
  const v: Vec2[] = [vPoint(0, 0, c), vPoint(Math.min(now, tb), 0, c)];
  if (now >= tb) {
    v.push(vPoint(tb, peakVoltage(c), c));
    const count = Math.max(1, Math.ceil((now - tb) / TRACE_DT));
    for (let k = 1; k <= count; k++) {
      const time = tb + ((now - tb) * k) / count;
      i.push(iPoint(time, currentAt(time, tl, c), c));
      v.push(vPoint(time, coilVoltageAt(time, tl, c), c));
    }
  }
  return { i, v };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: SelfInductanceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('self-inductance: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];
  const u = tl.u;
  const tb = breakTime(tl);
  const end = recordEnd(tl);
  const recording = u < end;
  /** 다시 닫는 동안 기록이 흐려진다. */
  const clearing = 1 - tl.at('close');

  // ---- 도선 — 전지 두 판 사이 · 코일 · 스위치 자리를 비우고 긋는다 ----
  const plusY = BATTERY_Y + BATTERY_PLATE_GAP / 2;
  const minusY = BATTERY_Y - BATTERY_PLATE_GAP / 2;
  const coilLeft = COIL_X - COIL_WIDTH / 2;
  const coilRight = COIL_X + COIL_WIDTH / 2;
  out.push({
    type: 'lineSet',
    id: 'wires',
    lines: [
      [
        [coilLeft, LOOP_TOP],
        [LOOP_LEFT, LOOP_TOP],
        [LOOP_LEFT, plusY],
      ],
      [
        [LOOP_LEFT, minusY],
        [LOOP_LEFT, LOOP_BOTTOM],
        [SWITCH_CONTACT_X, LOOP_BOTTOM],
      ],
      [
        [SWITCH_HINGE_X, LOOP_BOTTOM],
        [LOOP_RIGHT, LOOP_BOTTOM],
        [LOOP_RIGHT, LOOP_TOP],
        [coilRight, LOOP_TOP],
      ],
    ],
    width: WIRE_PX,
    style: INK,
  });

  // ---- 코일 ----
  out.push({ type: 'lineSet', id: 'coil', lines: [coilLine()], width: COIL_PX, style: INK });

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

  // ---- 스위치 날 — 끊을 때 젖혀지고, 다시 닫을 때 돌아온다 ----
  const swing = (tl.at('open') - tl.at('close')) * SWITCH_SWING_RAD;
  const tip = bladeTip(swing);
  out.push({
    type: 'lineSet',
    id: 'switch-blade',
    lines: [[[SWITCH_HINGE_X, LOOP_BOTTOM], tip]],
    width: WIRE_PX,
    style: INK,
  });

  // ---- 불꽃 — 끊은 뒤 코일 전압을 따라 옅어지고 작아진다 ----
  const strength = u >= tb && recording ? coilVoltageAt(u, tl, c) / peakVoltage(c) : 0;
  if (strength > SPARK_MIN) {
    const contact: Vec2 = [SWITCH_CONTACT_X, LOOP_BOTTOM];
    const mid: Vec2 = [(tip[0] + contact[0]) / 2, (tip[1] + contact[1]) / 2];
    const sparkOpacity = Math.min(1, strength / c.sparkFull);
    out.push({
      type: 'lineSet',
      id: 'spark-rays',
      lines: sparkRays(mid, c.sparkReach * strength),
      width: SPARK_RAY_PX,
      opacity: sparkOpacity,
      style: SPARK,
    });
    out.push({
      type: 'lineSet',
      id: 'spark-bolt',
      lines: [sparkBolt(tip, contact)],
      width: SPARK_PX,
      opacity: sparkOpacity,
      style: SPARK,
    });
  }

  // ---- 스위치 이음점 — 날 위에 ----
  out.push({ type: 'terminal', id: 'switch-hinge', pos: [SWITCH_HINGE_X, LOOP_BOTTOM], kind: 'node' });
  out.push({ type: 'terminal', id: 'switch-contact', pos: [SWITCH_CONTACT_X, LOOP_BOTTOM], kind: 'node' });

  // ---- 전류 화살표 — 오른쪽 변을 따라 아래로. 길이가 전류에 비례한다 ----
  // 다시 닫는 동안에는 일정한 전류로 돌아온 화살표가 짙어진다 — 차오르는 곡선은 `rl-circuit` 의 몫이다.
  const shown = recording ? currentAt(u, tl, c) : steadyCurrent(c);
  const arrowOpacity = recording ? 1 : tl.at('close');
  const len = shown * c.arrowScale;
  if (len > ARROW_MIN && arrowOpacity > 0) {
    const x = LOOP_RIGHT - ARROW_INSET;
    out.push({
      type: 'vector',
      id: 'current',
      from: [x, len / 2],
      delta: [0, -len],
      width: ARROW_PX,
      headSize: ARROW_HEAD,
      opacity: arrowOpacity,
      style: CURRENT,
    });
    out.push({
      type: 'readout',
      id: 'current-label',
      anchor: { world: [x - ARROW_LABEL_GAP, 0] },
      text: text('label.current'),
      chip: false,
      align: 'right',
      font: 'text',
      italic: true,
      fontSize: LABEL_PX,
      opacity: arrowOpacity,
      style: CURRENT,
    });
  }

  // ---- 회로 이름표 ----
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
    chip: false,
    align: 'center',
    font: 'text',
    italic: true,
    fontSize: LABEL_PX,
    style: INK,
  });

  // ---- 기록지 축 ----
  const axisEnd = GRAPH_X + c.graphSeconds * c.secondsToWorld;
  out.push({
    type: 'lineSet',
    id: 'axes',
    lines: [
      [
        [GRAPH_X, I_GRAPH_Y + I_GRAPH_H],
        [GRAPH_X, I_GRAPH_Y],
        [axisEnd, I_GRAPH_Y],
      ],
      [
        [GRAPH_X, V_GRAPH_Y + V_GRAPH_H],
        [GRAPH_X, V_GRAPH_Y],
        [axisEnd, V_GRAPH_Y],
      ],
    ],
    width: AXIS_PX,
    style: GUIDE,
  });
  out.push(axisLabel('axis-i', [GRAPH_X, I_GRAPH_Y + I_GRAPH_H], AXIS_TOP_OFFSET, 'center', text('label.axisI')));
  out.push(axisLabel('axis-v', [GRAPH_X, V_GRAPH_Y + V_GRAPH_H], AXIS_TOP_OFFSET, 'center', text('label.axisV')));
  out.push(axisLabel('axis-t-i', [axisEnd, I_GRAPH_Y], AXIS_END_OFFSET, 'left', text('label.axisT')));
  out.push(axisLabel('axis-t-v', [axisEnd, V_GRAPH_Y], AXIS_END_OFFSET, 'left', text('label.axisT')));

  // ---- 전지 전압 기준선 — ε 기록지에. 치솟은 봉우리를 견줄 자 ----
  const refY = V_GRAPH_Y + c.emf * c.voltScale;
  out.push({
    type: 'trajectory',
    id: 'battery-reference',
    points: [
      [GRAPH_X, refY],
      [axisEnd, refY],
    ],
    width: GUIDE_PX,
    style: { ...GUIDE, lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: 'battery-reference-label',
    anchor: { world: [GRAPH_X, refY], offset: REF_LABEL_OFFSET },
    text: text('label.volts'),
    vars: { v: String(c.emf) },
    chip: false,
    align: 'right',
    font: 'text',
    fontSize: LABEL_PX,
    style: GUIDE,
  });

  // ---- 끊은 순간 — 두 기록지를 세로로 잇는 점선 ----
  if (u >= tb) {
    const x = GRAPH_X + tb * c.secondsToWorld;
    out.push({
      type: 'trajectory',
      id: 'break-guide',
      points: [
        [x, V_GRAPH_Y],
        [x, I_GRAPH_Y + I_GRAPH_H],
      ],
      width: GUIDE_PX,
      opacity: clearing,
      style: { ...GUIDE, lineStyle: 'dotted' },
    });
  }

  // ---- 자취 — 같은 시간축. 다시 닫는 동안 흐려진다 ----
  const now = Math.min(u, end, c.graphSeconds);
  const tr = traces(now, tl, c);
  out.push({ type: 'trajectory', id: 'trace-i', points: tr.i, width: TRACE_PX, opacity: clearing, style: INK });
  out.push({ type: 'trajectory', id: 'trace-v', points: tr.v, width: TRACE_PX, opacity: clearing, style: INK });

  // 지금 적는 자리 — 기록하는 동안만.
  if (recording) {
    out.push({ type: 'body', id: 'pen-i', pos: tr.i[tr.i.length - 1]!, shape: 'point', style: INK });
    out.push({ type: 'body', id: 'pen-v', pos: tr.v[tr.v.length - 1]!, shape: 'point', style: INK });
  }

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

function axisLabel(
  id: string,
  at: Vec2,
  offset: Vec2,
  align: 'left' | 'center',
  label: LocalizedText,
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: label,
    chip: false,
    align,
    font: 'text',
    italic: true,
    fontSize: AXIS_PX_FONT,
    style: GUIDE,
  };
}
