// ========================================================================
// mutual-inductance — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽: 같은 축 위의 두 코일. 1차 코일(왼쪽)은 단자 둘로 이어져 전류 `I₁` 을 받고,
// 2차 코일(오른쪽)은 가운데가 0 인 계기로 이어진다. 두 코일은 도선으로 이어져 있지
// 않다. 1차 전류에 비례하는 수의 자기력선이 1차 코일을 꿰고, 축 가까운 선이 멀리
// 뻗어 2차 고리까지 꿴다. 고리를 뒤 반쪽 · 앞 반쪽으로 나눠 그 사이에 자기력선을
// 둔다 — 선이 고리 **속**을 지나는 것으로 읽힌다.
//
// 오른쪽: 같은 시간축의 기록지 두 장 — 위는 1차 전류 `I₁`, 아래는 2차 전압 `V₂`
// (0 선 위가 +, 아래가 −). 1차 전류의 경사가 시작 · 끝나는 순간을 세로 점선으로 맞대
// 「V₂ 가 선 것은 I₁ 이 기울던 동안뿐」 을 짚는다.
//
// 색은 뜻마다 하나다. 코일 · 도선 · 자취 · 글자는 먹색, 기록지 축 · 안내선은 배경 정보라
// muted, 1차 전류 화살표는 primary, 자기력선은 secondary. 두 기록지를 색으로 가르지 않는다
// — 축 이름(`I₁` · `V₂`)과 선 모양이 가른다. 강조색은 쓰지 않는다.
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
  primaryCurrentAt,
  readConstants,
  recordEnd,
  secondaryVoltageAt,
  type MutualInductanceConstants,
} from './physics';
import {
  AXIS_Y,
  COIL_LENGTH,
  COIL_RINGS,
  GRAPH_X,
  I_GRAPH_H,
  I_GRAPH_Y,
  LEAD_Y,
  LINE_INNER_FRAC,
  LINE_INNER_REACH,
  LINE_INNER_RETURN,
  LINE_OUTER_FRAC,
  LINE_OUTER_REACH,
  LINE_OUTER_RETURN,
  METER_R,
  METER_X,
  METER_Y,
  PRIMARY_X,
  RING_RX,
  RING_RY,
  SCENE_BOUNDS,
  SECONDARY_X,
  V_GRAPH_H,
  V_GRAPH_Y,
  text,
} from './schema';
import type { MutualInductanceState } from './state';

// ------------------------------------------------------------------------
// 색
// ------------------------------------------------------------------------

/** 코일 · 도선 · 자취 · 이름표. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 기록지 축 · 안내선 · 계기판 — 배경 정보. */
const GUIDE = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 1차 전류. */
const CURRENT = { colorRole: 'primary', emphasis: 'strong' } as const;
/** 자기력선. */
const FIELD = { colorRole: 'secondary', emphasis: 'strong' } as const;

// ------------------------------------------------------------------------
// 치수 — 굵기 · 글자 크기 · 띄움은 화면 px, 나머지는 월드
// ------------------------------------------------------------------------

/** 도선 · 고리 굵기. */
const WIRE_PX = 2.2;
const RING_PX = 2.5;
/** 고리 반쪽 하나 · 자기력선 하나 · 계기판 반원을 이루는 점 개수. */
const HALF_RING_SEGMENTS = 20;
const FIELD_SEGMENTS = 72;
const METER_SEGMENTS = 24;
/** 자기력선 굵기. */
const FIELD_PX = 1.6;
/**
 * 자기력선 고리의 모남 — 초타원 지수. 2 면 타원이고, 클수록 코일 속을 지나는 아랫변이
 * 축과 나란히 곧게 뻗는다(솔레노이드 속의 고른 장).
 */
const FIELD_SQUARENESS = 2.4;

/** 1차 전류 화살표 — 이음선에서 비켜선 거리(월드), 굵기(화면 px), 머리(월드), 이보다 짧으면 두지 않는다. */
const ARROW_INSET = 0.2;
const ARROW_PX = 3;
const ARROW_HEAD = 0.14;
const ARROW_MIN = 0.06;
/** 전류 기호가 화살표에서 비켜서는 거리(월드). */
const ARROW_LABEL_GAP = 0.12;

/** 계기 — 판 굵기, 바늘 길이(판 반지름 대비), 바늘 굵기, 가운데 눈금 길이(월드), 부호가 판 끝에서 비켜서는 거리(월드). */
const METER_PX = 1.8;
const NEEDLE_FRAC = 0.86;
const NEEDLE_PX = 2.5;
const METER_TICK = 0.1;
const METER_SIGN_GAP = 0.16;
/** 계기 부호가 놓이는 높이(판 반지름 대비). */
const METER_SIGN_RISE = 0.6;
/** 계기 기호 `V₂` 가 판 꼭대기 위로 떠 있는 높이(월드). */
const METER_LABEL_GAP = 0.24;
/** 2차 이음선 가운데 하나가 계기판 아래로 돌아 들어가는 깊이(월드). */
const METER_LEAD_DROP = 0.28;

/** 기록지 — 축 굵기, 자취 굵기, 안내 점선 굵기. */
const AXIS_PX = 1.4;
const TRACE_PX = 2.6;
const GUIDE_PX = 1.2;
/** V₂ 기록지 부호 표식이 0 선에서 떨어진 높이(월드) — 기본 배율의 올리기 · 내리기 칸 높이 근처. */
const SIGN_RISE = 0.75;

/** 글자 크기(화면 px). */
const LABEL_PX = 13;
const SIGN_PX = 15;
const AXIS_PX_FONT = 13;
/** 코일 이름표가 가장 바깥 자기력선 위로 떠 있는 거리(월드)와 그 높이. */
const COIL_LABEL_GAP = 0.28;
const COIL_LABEL_Y = AXIS_Y + LINE_INNER_RETURN + COIL_LABEL_GAP;
/** 축 이름 · 부호 표식이 축에서 비켜서는 거리(화면 px). */
const AXIS_TOP_OFFSET: Vec2 = [0, -10];
const AXIS_END_OFFSET: Vec2 = [10, 0];
const AXIS_SIGN_OFFSET: Vec2 = [-9, 0];

// ------------------------------------------------------------------------
// 코일
// ------------------------------------------------------------------------

/** 코일의 고리 중심 x 들. */
function ringXs(center: number): number[] {
  const count = Math.max(2, COIL_RINGS);
  return Array.from({ length: count }, (_, i) => center - COIL_LENGTH / 2 + (i * COIL_LENGTH) / (count - 1));
}

/**
 * 고리 반쪽들. 옆에서 비스듬히 본 고리라 **왼쪽 반이 뒤, 오른쪽 반이 앞**이다.
 * 자기력선을 둘 사이에 선언하면 고리 속을 지나는 것으로 읽힌다.
 */
function halfRings(center: number, front: boolean): Vec2[][] {
  const from = front ? -Math.PI / 2 : Math.PI / 2;
  return ringXs(center).map((cx) =>
    Array.from({ length: HALF_RING_SEGMENTS + 1 }, (_, k): Vec2 => {
      const a = from + (k / HALF_RING_SEGMENTS) * Math.PI;
      return [cx + RING_RX * Math.cos(a), AXIS_Y + RING_RY * Math.sin(a)];
    }),
  );
}

/** 코일의 첫 · 끝 고리 아래 끝 — 이음선이 여기서 내려간다. */
function coilFeet(center: number): { first: Vec2; last: Vec2 } {
  const xs = ringXs(center);
  return { first: [xs[0]!, AXIS_Y - RING_RY], last: [xs[xs.length - 1]!, AXIS_Y - RING_RY] };
}

// ------------------------------------------------------------------------
// 자기력선
// ------------------------------------------------------------------------

/**
 * k 번째 자기력선(0 = 축에 가장 가까운 선). 1차 코일 한가운데를 높이 h 로 지나 축을 따라
 * 뻗고, 코일 바깥 높이 H 로 돌아오는 닫힌 고리다. 축 아래는 거울상. `side` 가 위(+1) · 아래(−1).
 */
function fieldLine(k: number, n: number, side: 1 | -1): Vec2[] {
  const f = n > 1 ? k / (n - 1) : 0;
  const h = RING_RY * (LINE_INNER_FRAC + (LINE_OUTER_FRAC - LINE_INNER_FRAC) * f);
  const H = LINE_INNER_RETURN + (LINE_OUTER_RETURN - LINE_INNER_RETURN) * f;
  const reach = LINE_INNER_REACH + (LINE_OUTER_REACH - LINE_INNER_REACH) * f;
  const yc = (h + H) / 2;
  const b = (H - h) / 2;
  return Array.from({ length: FIELD_SEGMENTS + 1 }, (_, i): Vec2 => {
    const a = (i / FIELD_SEGMENTS) * Math.PI * 2;
    const cx = Math.cos(a);
    const sy = Math.sin(a);
    const e = 2 / FIELD_SQUARENESS;
    return [
      PRIMARY_X + reach * Math.sign(cx) * Math.abs(cx) ** e,
      AXIS_Y + side * (yc + b * Math.sign(sy) * Math.abs(sy) ** e),
    ];
  });
}

/**
 * 선이 나타나는 차례. 축 가까운 절반(2차를 꿰는 선)과 바깥 절반을 번갈아 세워,
 * 전류가 어느 만큼이든 2차를 꿰는 몫이 같게 한다 — 그 몫이 바뀌면 상호 인덕턴스가
 * 바뀌는 것으로 읽힌다.
 */
function appearanceRank(n: number): number[] {
  const half = Math.ceil(n / 2);
  const order: number[] = [];
  for (let i = 0; i < half; i++) {
    order.push(i);
    if (i + half < n) order.push(i + half);
  }
  const rank = new Array<number>(n).fill(0);
  order.forEach((k, r) => {
    rank[k] = r;
  });
  return rank;
}

// ------------------------------------------------------------------------
// 기록지
// ------------------------------------------------------------------------

function iPoint(time: number, current: number, c: MutualInductanceConstants): Vec2 {
  return [GRAPH_X + time * c.secondsToWorld, I_GRAPH_Y + current * c.currentScale];
}

function vPoint(time: number, volt: number, c: MutualInductanceConstants): Vec2 {
  return [GRAPH_X + time * c.secondsToWorld, V_GRAPH_Y + volt * c.voltScale];
}

/** 1차 전류의 경사가 시작 · 끝나는 시각들 — 두 자취 모두 여기서만 꺾인다. */
function breakpoints(tl: TimelineFrame): number[] {
  return [tl.start('rise'), tl.end('rise'), tl.start('fall'), tl.end('fall')];
}

/**
 * 자취 표본. 두 자취 모두 경사 경계 사이에서는 곧으므로 경계마다 점을 두면 정확하다.
 * V₂ 는 경계에서 곧게 뛰므로 경계 바로 앞 값과 경계 값 두 점을 둔다.
 */
function traces(now: number, tl: TimelineFrame, c: MutualInductanceConstants): { i: Vec2[]; v: Vec2[] } {
  const i: Vec2[] = [iPoint(0, primaryCurrentAt(0, tl, c), c)];
  const v: Vec2[] = [vPoint(0, secondaryVoltageAt(0, tl, c), c)];
  // 경계 사이에서 V₂ 는 한 값이다 — 앞 구간의 값으로 경계까지 긋고, 경계에서 새 값으로 뛴다.
  let held = secondaryVoltageAt(0, tl, c);
  for (const tb of breakpoints(tl)) {
    if (tb > now) break;
    i.push(iPoint(tb, primaryCurrentAt(tb, tl, c), c));
    v.push(vPoint(tb, held, c));
    held = secondaryVoltageAt(tb, tl, c);
    v.push(vPoint(tb, held, c));
  }
  i.push(iPoint(now, primaryCurrentAt(now, tl, c), c));
  v.push(vPoint(now, secondaryVoltageAt(now, tl, c), c));
  return { i, v };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: MutualInductanceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('mutual-inductance: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];
  const u = tl.u;
  const end = recordEnd(tl);
  const recording = u < end;
  /** 기록을 지우는 동안 흐려진다. */
  const clearing = 1 - tl.at('clear');

  const current = primaryCurrentAt(u, tl, c);
  const volt = recording ? secondaryVoltageAt(u, tl, c) : 0;

  // ---- 이음선 — 1차는 단자 둘로, 2차는 계기판 양 끝으로 ----
  const p = coilFeet(PRIMARY_X);
  const s = coilFeet(SECONDARY_X);
  const meterLeft = METER_X - METER_R;
  const meterRight = METER_X + METER_R;
  out.push({
    type: 'lineSet',
    id: 'leads',
    lines: [
      [p.first, [p.first[0], LEAD_Y]],
      [p.last, [p.last[0], LEAD_Y]],
      [s.last, [s.last[0], METER_Y], [meterLeft, METER_Y]],
      [
        s.first,
        [s.first[0], METER_Y - METER_LEAD_DROP],
        [meterRight, METER_Y - METER_LEAD_DROP],
        [meterRight, METER_Y],
      ],
    ],
    width: WIRE_PX,
    style: INK,
  });

  // ---- 고리 뒤 반쪽 ----
  out.push({ type: 'lineSet', id: 'primary-back', lines: halfRings(PRIMARY_X, false), width: RING_PX, style: INK });
  out.push({ type: 'lineSet', id: 'secondary-back', lines: halfRings(SECONDARY_X, false), width: RING_PX, style: INK });

  // ---- 자기력선 — 수가 1차 전류에 비례한다. 선 하나가 자리를 잡는 동안만 옅다 ----
  const n = Math.max(1, Math.round(c.fieldLines));
  const rank = appearanceRank(n);
  const level = (current / c.currentMax) * n;
  const lines: Vec2[][] = [];
  const opacities: number[] = [];
  for (let k = 0; k < n; k++) {
    const o = Math.min(1, Math.max(0, level - rank[k]!));
    for (const side of [1, -1] as const) {
      lines.push(fieldLine(k, n, side));
      opacities.push(o);
    }
  }
  out.push({ type: 'lineSet', id: 'field-lines', lines, opacities, width: FIELD_PX, style: FIELD });

  // ---- 고리 앞 반쪽 — 자기력선 위 ----
  out.push({ type: 'lineSet', id: 'primary-front', lines: halfRings(PRIMARY_X, true), width: RING_PX, style: INK });
  out.push({ type: 'lineSet', id: 'secondary-front', lines: halfRings(SECONDARY_X, true), width: RING_PX, style: INK });

  // ---- 1차 단자 ----
  out.push({ type: 'terminal', id: 'primary-in', pos: [p.first[0], LEAD_Y], kind: 'node' });
  out.push({ type: 'terminal', id: 'primary-out', pos: [p.last[0], LEAD_Y], kind: 'node' });

  // ---- 1차 전류 화살표 — 끝 고리 이음선 옆을 따라 아래로. 길이가 전류에 비례한다 ----
  const len = current * c.arrowScale;
  if (len > ARROW_MIN) {
    const x = p.last[0] + ARROW_INSET;
    const midY = (p.last[1] + LEAD_Y) / 2;
    out.push({
      type: 'vector',
      id: 'current',
      from: [x, midY + len / 2],
      delta: [0, -len],
      width: ARROW_PX,
      headSize: ARROW_HEAD,
      style: CURRENT,
    });
    out.push({
      type: 'readout',
      id: 'current-label',
      anchor: { world: [x + ARROW_LABEL_GAP, midY] },
      text: text('label.current'),
      chip: false,
      align: 'left',
      font: 'text',
      italic: true,
      fontSize: LABEL_PX,
      style: CURRENT,
    });
  }

  // ---- 2차 계기 — 가운데가 0, + 쪽 · − 쪽으로 기운다 ----
  const arc: Vec2[] = Array.from({ length: METER_SEGMENTS + 1 }, (_, k): Vec2 => {
    const a = Math.PI - (k / METER_SEGMENTS) * Math.PI;
    return [METER_X + METER_R * Math.cos(a), METER_Y + METER_R * Math.sin(a)];
  });
  out.push({
    type: 'lineSet',
    id: 'meter-face',
    lines: [
      arc,
      [
        [meterLeft, METER_Y],
        [meterRight, METER_Y],
      ],
      [
        [METER_X, METER_Y + METER_R],
        [METER_X, METER_Y + METER_R - METER_TICK],
      ],
    ],
    width: METER_PX,
    style: GUIDE,
  });
  const tilt = (volt * c.needleDegPerVolt * Math.PI) / 180;
  const needleLen = METER_R * NEEDLE_FRAC;
  out.push({
    type: 'lineSet',
    id: 'meter-needle',
    lines: [
      [
        [METER_X, METER_Y],
        [METER_X + needleLen * Math.sin(tilt), METER_Y + needleLen * Math.cos(tilt)],
      ],
    ],
    width: NEEDLE_PX,
    style: INK,
  });
  out.push({ type: 'body', id: 'meter-pivot', pos: [METER_X, METER_Y], shape: 'point', style: INK });
  out.push(sign('meter-minus', [meterLeft - METER_SIGN_GAP, METER_Y + METER_R * METER_SIGN_RISE], 'right', text('label.minus'), GUIDE));
  out.push(sign('meter-plus', [meterRight + METER_SIGN_GAP, METER_Y + METER_R * METER_SIGN_RISE], 'left', text('label.plus'), GUIDE));
  out.push({
    type: 'readout',
    id: 'meter-label',
    anchor: { world: [METER_X, METER_Y + METER_R + METER_LABEL_GAP] },
    text: text('label.voltage'),
    chip: false,
    align: 'center',
    font: 'text',
    italic: true,
    fontSize: LABEL_PX,
    style: INK,
  });

  // ---- 코일 이름표 — 자기력선 위 ----
  out.push(coilLabel('primary-label', PRIMARY_X, text('label.primary')));
  out.push(coilLabel('secondary-label', SECONDARY_X, text('label.secondary')));

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
        [GRAPH_X, V_GRAPH_Y - V_GRAPH_H],
      ],
      [
        [GRAPH_X, V_GRAPH_Y],
        [axisEnd, V_GRAPH_Y],
      ],
    ],
    width: AXIS_PX,
    style: GUIDE,
  });
  out.push(axisLabel('axis-i', [GRAPH_X, I_GRAPH_Y + I_GRAPH_H], AXIS_TOP_OFFSET, 'center', text('label.current')));
  out.push(axisLabel('axis-v', [GRAPH_X, V_GRAPH_Y + V_GRAPH_H], AXIS_TOP_OFFSET, 'center', text('label.voltage')));
  out.push(axisLabel('axis-t-i', [axisEnd, I_GRAPH_Y], AXIS_END_OFFSET, 'left', text('label.axisT')));
  out.push(axisLabel('axis-t-v', [axisEnd, V_GRAPH_Y], AXIS_END_OFFSET, 'left', text('label.axisT')));
  out.push(axisSign('axis-plus', [GRAPH_X, V_GRAPH_Y + SIGN_RISE], text('label.plus')));
  out.push(axisSign('axis-zero', [GRAPH_X, V_GRAPH_Y], text('label.zero')));
  out.push(axisSign('axis-minus', [GRAPH_X, V_GRAPH_Y - SIGN_RISE], text('label.minus')));

  // ---- 경사가 시작 · 끝난 순간 — 두 기록지를 세로로 잇는 점선 ----
  const guides: Vec2[][] = breakpoints(tl)
    .filter((tb) => tb <= u && tb <= c.graphSeconds)
    .map((tb) => {
      const x = GRAPH_X + tb * c.secondsToWorld;
      return [
        [x, V_GRAPH_Y - V_GRAPH_H],
        [x, I_GRAPH_Y + I_GRAPH_H],
      ];
    });
  guides.forEach((pts, k) => {
    out.push({
      type: 'trajectory',
      id: `ramp-guide-${k}`,
      points: pts,
      width: GUIDE_PX,
      opacity: clearing,
      style: { ...GUIDE, lineStyle: 'dotted' },
    });
  });

  // ---- 자취 — 같은 시간축. 기록을 지우는 동안 흐려진다 ----
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

function sign(
  id: string,
  at: Vec2,
  align: 'left' | 'right',
  label: LocalizedText,
  style: typeof GUIDE | typeof INK,
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    fontSize: SIGN_PX,
    weight: 'bold',
    align,
    style,
  };
}

function coilLabel(id: string, x: number, label: LocalizedText): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: [x, COIL_LABEL_Y] },
    text: label,
    chip: false,
    align: 'center',
    font: 'text',
    fontSize: LABEL_PX,
    style: INK,
  };
}

function axisSign(id: string, at: Vec2, label: LocalizedText): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset: AXIS_SIGN_OFFSET },
    text: label,
    chip: false,
    align: 'right',
    font: 'text',
    fontSize: AXIS_PX_FONT,
    style: GUIDE,
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
