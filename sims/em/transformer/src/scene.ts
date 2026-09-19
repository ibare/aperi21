// ========================================================================
// transformer — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽: 네모난 철심. 왼 다리에 1차 코일(N₁ 바퀴), 오른 다리에 2차 코일(N₂ 바퀴)이
// 감겨 있다. 고리를 뒤 반쪽 · 앞 반쪽으로 나눠 철심을 그 사이에 둔다 — 고리가 다리를
// **감은** 것으로 읽힌다. 1차는 교류 전원(원 + `~`)에, 2차는 부하(지그재그)에 이어진다.
// 위 · 아래 멍에의 화살표 `Φ` 가 철심 속을 도는 선속이다 — 길이가 선속을 따라 늘고
// 줄고 뒤집힌다. 두 설정에서 똑같이 흔들린다.
//
// 오른쪽: 같은 시간축 · 같은 전압 배율의 기록지 두 장 — 위는 `V₁`, 아래는 `V₂`.
// 가는 가로줄의 간격이 한 바퀴 몫의 전압이라, 봉우리가 닿는 줄의 수가 감은 수다.
//
// 색은 뜻마다 하나다. 코일 · 도선 · 자취 · 글자는 먹색, 철심 · 기록지 축 · 가로줄은
// 배경 정보라 muted, 전류 화살표는 primary, 선속은 secondary. 두 기록지를 색으로
// 가르지 않는다 — 축 이름(`V₁` · `V₂`)이 가른다. 강조색은 쓰지 않는다.
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
  fluxAt,
  perTurnPeak,
  primaryCurrentAt,
  primaryVoltageAt,
  readConstants,
  secondaryCurrentAt,
  secondaryVoltageAt,
  type TransformerConstants,
} from './physics';
import {
  CORE_MAX_X,
  CORE_MAX_Y,
  CORE_MIN_X,
  CORE_MIN_Y,
  CORE_THICKNESS,
  GRAPH_X,
  LEAD_Y,
  LOAD_HALF,
  LOAD_X,
  LOAD_ZIG_W,
  LOAD_ZIGS,
  LOOP_OVERHANG,
  LOOP_PITCH,
  LOOP_RY,
  SCENE_BOUNDS,
  SOURCE_R,
  SOURCE_X,
  V1_GRAPH_H,
  V1_GRAPH_Y,
  V2_GRAPH_H,
  V2_GRAPH_Y,
  text,
} from './schema';
import type { TransformerState } from './state';

// ------------------------------------------------------------------------
// 색
// ------------------------------------------------------------------------

/** 코일 · 도선 · 자취 · 이름표. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 철심 · 기록지 축 · 가로줄 — 배경 정보. */
const GUIDE = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 전류. */
const CURRENT = { colorRole: 'primary', emphasis: 'strong' } as const;
/** 선속. */
const FLUX = { colorRole: 'secondary', emphasis: 'strong' } as const;

// ------------------------------------------------------------------------
// 치수 — 굵기 · 글자 크기 · 띄움은 화면 px, 나머지는 월드
// ------------------------------------------------------------------------

/** 도선 · 고리 굵기. */
const WIRE_PX = 2;
const LOOP_PX = 2.4;
/** 고리 반쪽 하나를 이루는 점 개수. */
const HALF_LOOP_SEGMENTS = 16;

/** 철심 채움 불투명도(바탕 위에 불투명하게 깐다). */
const CORE_FILL = 0.28;

/** 선속 — 도는 길 점선의 굵기 · 불투명도, 화살표 굵기 · 머리(월드). */
const FLUX_PATH_PX = 1.2;
const FLUX_PATH_OPACITY = 0.7;
const FLUX_ARROW_PX = 3;
const FLUX_HEAD = 0.13;
/** `Φ` 이름표가 위 멍에 바깥 끝에서 떠 있는 높이(월드). */
const FLUX_LABEL_GAP = 0.2;

/** 전류 화살표 — 이음선 위로 비켜선 높이(월드), 굵기(화면 px), 머리(월드), 이름표가 화살표 위로 떠 있는 높이(월드). */
const CURRENT_RISE = 0.17;
const CURRENT_PX = 2.6;
const CURRENT_HEAD = 0.1;
const CURRENT_LABEL_GAP = 0.2;

/** 이름표 — 감은 수 이름표가 철심 아래 끝에서 내려선 거리, 전압 기호가 전원 · 부하에서 비켜선 거리(월드). */
const TURNS_LABEL_GAP = 0.3;
const SOURCE_LABEL_GAP = 0.12;
const LOAD_LABEL_GAP = 0.22;

/** 기록지 — 축 굵기, 한 바퀴 몫 가로줄 굵기 · 불투명도, 자취 굵기. */
const AXIS_PX = 1.4;
const TURN_LINE_PX = 1;
const TURN_LINE_OPACITY = 0.45;
const TRACE_PX = 2.4;
/** 자취 표본 — 1 초에 찍는 점 수. */
const SAMPLES_PER_SECOND = 48;
/** 가로줄 수를 셀 때의 여유(부동소수 오차로 마지막 줄이 빠지지 않게). */
const TURN_LINE_EPS = 1e-6;

/** 글자 크기(화면 px). */
const LABEL_PX = 13;
const AC_PX = 20;
const AXIS_FONT_PX = 13;
/** 축 이름이 축에서 비켜서는 거리(화면 px). */
const AXIS_TOP_OFFSET: Vec2 = [0, -10];
const AXIS_END_OFFSET: Vec2 = [10, 0];

// ------------------------------------------------------------------------
// 철심 · 코일
// ------------------------------------------------------------------------

const LEFT_LIMB_X = CORE_MIN_X + CORE_THICKNESS / 2;
const RIGHT_LIMB_X = CORE_MAX_X - CORE_THICKNESS / 2;
const CORE_MID_Y = (CORE_MIN_Y + CORE_MAX_Y) / 2;
const CORE_MID_X = (CORE_MIN_X + CORE_MAX_X) / 2;
/** 고리 가로 반지름 — 다리 반 두께 + 비어져 나오는 몫. */
const LOOP_RX = CORE_THICKNESS / 2 + LOOP_OVERHANG;

/**
 * 철심 — 바깥 사각형을 반시계로, 안쪽 사각형을 시계로 도는 열쇠구멍 다각형 하나.
 * 감는 방향이 반대라 안쪽이 비어 창이 된다.
 */
function corePolygon(): Vec2[] {
  const t = CORE_THICKNESS;
  const o0: Vec2 = [CORE_MIN_X, CORE_MIN_Y];
  const i0: Vec2 = [CORE_MIN_X + t, CORE_MIN_Y + t];
  return [
    o0,
    [CORE_MAX_X, CORE_MIN_Y],
    [CORE_MAX_X, CORE_MAX_Y],
    [CORE_MIN_X, CORE_MAX_Y],
    o0,
    i0,
    [CORE_MIN_X + t, CORE_MAX_Y - t],
    [CORE_MAX_X - t, CORE_MAX_Y - t],
    [CORE_MAX_X - t, CORE_MIN_Y + t],
    i0,
  ];
}
/** 철심의 굵은 변 — 바깥 넷 · 안쪽 넷(열쇠구멍 틈은 긋지 않는다). */
const CORE_OUTLINE: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
];

/**
 * 감은 수 n 인 코일의 고리 자리 — 반 간격 단위의 정수 키 j(= 2i − (n−1)) 로 센다.
 * 가운데를 맞춰 쌓으므로 짝수끼리는 같은 자리를 나눠 쓴다(감은 수가 바뀔 때 남는 고리).
 */
function loopKeys(n: number): number[] {
  const count = Math.max(1, Math.round(n));
  return Array.from({ length: count }, (_, i) => 2 * i - (count - 1));
}

function loopY(key: number): number {
  return CORE_MID_Y + (key * LOOP_PITCH) / 2;
}

/**
 * 고리 반쪽. 다리를 감은 고리를 조금 위에서 비스듬히 본다 — **위 반쪽이 뒤, 아래 반쪽이 앞**.
 * 철심을 두 반쪽 사이에 선언하면 고리가 다리를 감은 것으로 읽힌다.
 */
function halfLoop(cx: number, cy: number, front: boolean): Vec2[] {
  const from = front ? Math.PI : 0;
  return Array.from({ length: HALF_LOOP_SEGMENTS + 1 }, (_, k): Vec2 => {
    const a = from + (k / HALF_LOOP_SEGMENTS) * Math.PI;
    return [cx + LOOP_RX * Math.cos(a), cy + LOOP_RY * Math.sin(a)];
  });
}

/** 코일 하나 — 고리 자리마다 불투명도. 감은 수가 바뀌는 동안 옛 고리는 사라지고 새 고리가 스며든다. */
interface CoilLoops {
  keys: number[];
  opacities: number[];
  /** 이음선이 붙는 맨 위 · 맨 아래 고리 높이 — 바뀌는 동안 옛 값에서 새 값으로 옮겨 간다. */
  top: number;
  bottom: number;
}

function coilLoops(oldTurns: number, newTurns: number, p: number): CoilLoops {
  const oldKeys = loopKeys(oldTurns);
  const newKeys = loopKeys(newTurns);
  const keys = [...new Set([...oldKeys, ...newKeys])].sort((a, b) => a - b);
  const opacities = keys.map((k) => (oldKeys.includes(k) ? 1 - p : 0) + (newKeys.includes(k) ? p : 0));
  const lerp = (a: number, b: number): number => a + (b - a) * p;
  return {
    keys,
    opacities,
    top: lerp(loopY(Math.max(...oldKeys)), loopY(Math.max(...newKeys))),
    bottom: lerp(loopY(Math.min(...oldKeys)), loopY(Math.min(...newKeys))),
  };
}

// ------------------------------------------------------------------------
// 단계 — 지금 어느 설정의 기록인가
// ------------------------------------------------------------------------

interface Config {
  /** 지금 보이는 기록지가 시작한 시각(주기 안). */
  recordStart: number;
  /** 기록이 끝나는 시각 — 전류를 짚는 단계가 끝나는 때. */
  recordEnd: number;
  /** 기록지 · 전류 화살표의 불투명도 — 코일을 바꾸는 동안 흐려진다. */
  fade: number;
  /** 기록 중인가(펜을 둔다). */
  recording: boolean;
  /** 기록지 · 전류에 쓰는 2차 감은 수. */
  turns: number;
  /** 코일 고리의 옛 · 새 감은 수와 바뀐 정도. */
  coilFrom: number;
  coilTo: number;
  coilP: number;
  /** 2차 감은 수 이름표가 보이는 값과 불투명도 — `swap*` 에서 옛 값이 사라지고 `label*` 에서 새 값이 스며든다. */
  labelTurns: number;
  labelOpacity: number;
}

function configAt(tl: TimelineFrame, c: TransformerConstants): Config {
  const up = c.secondaryTurnsUp;
  const down = c.secondaryTurnsDown;
  const upWindow = { recordStart: tl.start('upRecord'), recordEnd: tl.end('upNote') };
  const downWindow = { recordStart: tl.start('downRecord'), recordEnd: tl.end('downNote') };
  const steady = { fade: 1, recording: true, coilP: 0, labelOpacity: 1 };
  switch (tl.phase) {
    case 'swapDown': {
      const p = tl.at('swapDown');
      return { ...upWindow, fade: 1 - p, recording: false, turns: up, coilFrom: up, coilTo: down, coilP: p, labelTurns: up, labelOpacity: 1 - p };
    }
    case 'labelDown':
      return { ...upWindow, fade: 0, recording: false, turns: down, coilFrom: down, coilTo: down, coilP: 0, labelTurns: down, labelOpacity: tl.at('labelDown') };
    case 'downRecord':
    case 'downNote':
      return { ...downWindow, ...steady, turns: down, coilFrom: down, coilTo: down, labelTurns: down };
    case 'swapUp': {
      const p = tl.at('swapUp');
      return { ...downWindow, fade: 1 - p, recording: false, turns: down, coilFrom: down, coilTo: up, coilP: p, labelTurns: down, labelOpacity: 1 - p };
    }
    case 'labelUp':
      return { ...downWindow, fade: 0, recording: false, turns: up, coilFrom: up, coilTo: up, coilP: 0, labelTurns: up, labelOpacity: tl.at('labelUp') };
    default:
      return { ...upWindow, ...steady, turns: up, coilFrom: up, coilTo: up, labelTurns: up };
  }
}

// ------------------------------------------------------------------------
// 기록지
// ------------------------------------------------------------------------

/** 기록 시작부터 now 까지의 자취. y0 는 0 선, volt 는 시각 → 전압. */
function tracePoints(
  start: number,
  now: number,
  y0: number,
  volt: (time: number) => number,
  c: TransformerConstants,
): Vec2[] {
  const span = Math.max(0, Math.min(now - start, c.graphSeconds));
  const n = Math.max(1, Math.ceil(span * SAMPLES_PER_SECOND));
  return Array.from({ length: n + 1 }, (_, k): Vec2 => {
    const s = (k / n) * span;
    return [GRAPH_X + s * c.secondsToWorld, y0 + volt(start + s) * c.voltScale];
  });
}

/** 한 바퀴 몫 간격의 가로줄 — 0 선 위아래로 축 높이 안에 드는 만큼. */
function turnLines(y0: number, half: number, axisEnd: number, spacing: number): Vec2[][] {
  if (spacing <= 0) return [];
  const count = Math.floor(half / spacing + TURN_LINE_EPS);
  const lines: Vec2[][] = [];
  for (let k = 1; k <= count; k++) {
    for (const side of [1, -1]) {
      const y = y0 + side * k * spacing;
      lines.push([
        [GRAPH_X, y],
        [axisEnd, y],
      ]);
    }
  }
  return lines;
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: TransformerState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('transformer: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const cfg = configAt(tl, c);
  const u = tl.u;
  const out: Primitive[] = [];

  const primary = coilLoops(c.primaryTurns, c.primaryTurns, 0);
  const secondary = coilLoops(cfg.coilFrom, cfg.coilTo, cfg.coilP);

  // ---- 고리 뒤 반쪽 — 철심 아래 ----
  out.push(loopHalves('primary-back', LEFT_LIMB_X, primary, false));
  out.push(loopHalves('secondary-back', RIGHT_LIMB_X, secondary, false));

  // ---- 철심 ----
  out.push({
    type: 'region',
    id: 'core',
    points: corePolygon(),
    fillOpacity: CORE_FILL,
    opaque: true,
    outline: CORE_OUTLINE,
    style: GUIDE,
  });

  // ---- 선속 — 철심 한가운데를 도는 길, 위 · 아래 멍에의 화살표 ----
  const half = CORE_THICKNESS / 2;
  const pathMinX = CORE_MIN_X + half;
  const pathMaxX = CORE_MAX_X - half;
  const pathMinY = CORE_MIN_Y + half;
  const pathMaxY = CORE_MAX_Y - half;
  out.push({
    type: 'trajectory',
    id: 'flux-path',
    points: [
      [pathMinX, pathMinY],
      [pathMaxX, pathMinY],
      [pathMaxX, pathMaxY],
      [pathMinX, pathMaxY],
    ],
    closed: true,
    width: FLUX_PATH_PX,
    opacity: FLUX_PATH_OPACITY,
    style: { ...FLUX, lineStyle: 'dotted' },
  });
  const fluxLen = fluxAt(u, c) * c.fluxArrowScale;
  // 선속 + 는 위 멍에에서 오른쪽, 아래 멍에에서 왼쪽 — 철심을 시계 방향으로 돈다.
  out.push(centeredArrow('flux-top', [CORE_MID_X, pathMaxY], [fluxLen, 0], FLUX_ARROW_PX, FLUX_HEAD, FLUX));
  out.push(centeredArrow('flux-bottom', [CORE_MID_X, pathMinY], [-fluxLen, 0], FLUX_ARROW_PX, FLUX_HEAD, FLUX));
  out.push(label('flux-label', [CORE_MID_X, CORE_MAX_Y + FLUX_LABEL_GAP], text('label.flux'), FLUX, 'center', true));

  // ---- 고리 앞 반쪽 — 철심 위 ----
  out.push(loopHalves('primary-front', LEFT_LIMB_X, primary, true));
  out.push(loopHalves('secondary-front', RIGHT_LIMB_X, secondary, true));

  // ---- 이음선 — 1차는 전원으로, 2차는 부하로 ----
  const pOut = LEFT_LIMB_X - LOOP_RX;
  const sOut = RIGHT_LIMB_X + LOOP_RX;
  const leadTop = CORE_MID_Y + LEAD_Y;
  const leadBottom = CORE_MID_Y - LEAD_Y;
  const loadTop = CORE_MID_Y + LOAD_HALF;
  const loadBottom = CORE_MID_Y - LOAD_HALF;
  out.push({
    type: 'lineSet',
    id: 'leads',
    lines: [
      [
        [pOut, primary.top],
        [pOut, leadTop],
        [SOURCE_X, leadTop],
        [SOURCE_X, CORE_MID_Y + SOURCE_R],
      ],
      [
        [pOut, primary.bottom],
        [pOut, leadBottom],
        [SOURCE_X, leadBottom],
        [SOURCE_X, CORE_MID_Y - SOURCE_R],
      ],
      [[sOut, secondary.top], [sOut, leadTop], [LOAD_X, leadTop], [LOAD_X, loadTop], ...zigzag(loadTop, loadBottom), [LOAD_X, loadBottom], [LOAD_X, leadBottom], [sOut, leadBottom], [sOut, secondary.bottom]],
    ],
    width: WIRE_PX,
    style: INK,
  });

  // ---- 교류 전원 ----
  out.push({
    type: 'body',
    id: 'source',
    pos: [SOURCE_X, CORE_MID_Y],
    shape: 'circle',
    size: SOURCE_R,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: INK,
  });
  out.push({
    type: 'readout',
    id: 'source-ac',
    anchor: { world: [SOURCE_X, CORE_MID_Y] },
    text: text('label.ac'),
    chip: false,
    align: 'center',
    font: 'text',
    fontSize: AC_PX,
    style: INK,
  });
  out.push(label('source-v', [SOURCE_X - SOURCE_R - SOURCE_LABEL_GAP, CORE_MID_Y], text('label.v1'), INK, 'right', true));
  out.push(label('load-v', [LOAD_X + LOAD_LABEL_GAP, CORE_MID_Y], text('label.v2'), INK, 'left', true));

  // ---- 전류 화살표 — 윗 이음선 위. 길이가 지금 전류를 따라 늘고 줄고 뒤집힌다 ----
  const i1 = primaryCurrentAt(u, c) * c.currentArrowScale;
  const i2 = secondaryCurrentAt(u, cfg.turns, c) * c.currentArrowScale;
  const i1At: Vec2 = [(pOut + SOURCE_X) / 2, leadTop + CURRENT_RISE];
  const i2At: Vec2 = [(sOut + LOAD_X) / 2, leadTop + CURRENT_RISE];
  out.push({ ...centeredArrow('current-1', i1At, [i1, 0], CURRENT_PX, CURRENT_HEAD, CURRENT), opacity: cfg.fade });
  out.push({ ...centeredArrow('current-2', i2At, [i2, 0], CURRENT_PX, CURRENT_HEAD, CURRENT), opacity: cfg.fade });
  out.push({ ...label('current-1-label', [i1At[0], i1At[1] + CURRENT_LABEL_GAP], text('label.i1'), CURRENT, 'center', true), opacity: cfg.fade });
  out.push({ ...label('current-2-label', [i2At[0], i2At[1] + CURRENT_LABEL_GAP], text('label.i2'), CURRENT, 'center', true), opacity: cfg.fade });

  // ---- 감은 수 이름표 — 철심 아래. 2차는 코일을 바꾸는 동안 옛 값이 사라진 뒤 새 값이 스며든다 ----
  const turnsY = CORE_MIN_Y - TURNS_LABEL_GAP;
  out.push(turnsLabel('turns-1', LEFT_LIMB_X, turnsY, text('label.n1'), c.primaryTurns, 1));
  out.push(turnsLabel('turns-2', RIGHT_LIMB_X, turnsY, text('label.n2'), cfg.labelTurns, cfg.labelOpacity));

  // ---- 기록지 축 · 한 바퀴 몫 가로줄 ----
  const axisEnd = GRAPH_X + c.graphSeconds * c.secondsToWorld;
  const spacing = perTurnPeak(c) * c.voltScale;
  out.push({
    type: 'lineSet',
    id: 'turn-lines',
    lines: [
      ...turnLines(V1_GRAPH_Y, V1_GRAPH_H, axisEnd, spacing),
      ...turnLines(V2_GRAPH_Y, V2_GRAPH_H, axisEnd, spacing),
    ],
    width: TURN_LINE_PX,
    opacity: TURN_LINE_OPACITY,
    style: GUIDE,
  });
  out.push({
    type: 'lineSet',
    id: 'axes',
    lines: [
      [
        [GRAPH_X, V1_GRAPH_Y + V1_GRAPH_H],
        [GRAPH_X, V1_GRAPH_Y - V1_GRAPH_H],
      ],
      [
        [GRAPH_X, V1_GRAPH_Y],
        [axisEnd, V1_GRAPH_Y],
      ],
      [
        [GRAPH_X, V2_GRAPH_Y + V2_GRAPH_H],
        [GRAPH_X, V2_GRAPH_Y - V2_GRAPH_H],
      ],
      [
        [GRAPH_X, V2_GRAPH_Y],
        [axisEnd, V2_GRAPH_Y],
      ],
    ],
    width: AXIS_PX,
    style: GUIDE,
  });
  out.push(axisLabel('axis-v1', [GRAPH_X, V1_GRAPH_Y + V1_GRAPH_H], AXIS_TOP_OFFSET, 'center', text('label.v1')));
  out.push(axisLabel('axis-v2', [GRAPH_X, V2_GRAPH_Y + V2_GRAPH_H], AXIS_TOP_OFFSET, 'center', text('label.v2')));
  out.push(axisLabel('axis-t-1', [axisEnd, V1_GRAPH_Y], AXIS_END_OFFSET, 'left', text('label.axisT')));
  out.push(axisLabel('axis-t-2', [axisEnd, V2_GRAPH_Y], AXIS_END_OFFSET, 'left', text('label.axisT')));

  // ---- 자취 — 같은 시간축 · 같은 전압 배율. 코일을 바꾸는 동안 흐려진다 ----
  const now = Math.min(u, cfg.recordEnd);
  const v1 = tracePoints(cfg.recordStart, now, V1_GRAPH_Y, (t) => primaryVoltageAt(t, c), c);
  const v2 = tracePoints(cfg.recordStart, now, V2_GRAPH_Y, (t) => secondaryVoltageAt(t, cfg.turns, c), c);
  out.push({ type: 'trajectory', id: 'trace-v1', points: v1, width: TRACE_PX, opacity: cfg.fade, style: INK });
  out.push({ type: 'trajectory', id: 'trace-v2', points: v2, width: TRACE_PX, opacity: cfg.fade, style: INK });

  // 지금 적는 자리 — 기록하는 동안만.
  if (cfg.recording) {
    out.push({ type: 'body', id: 'pen-v1', pos: v1[v1.length - 1]!, shape: 'point', style: INK });
    out.push({ type: 'body', id: 'pen-v2', pos: v2[v2.length - 1]!, shape: 'point', style: INK });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}

// ------------------------------------------------------------------------
// 선언 도우미
// ------------------------------------------------------------------------

function loopHalves(id: string, cx: number, coil: CoilLoops, front: boolean): Primitive {
  return {
    type: 'lineSet',
    id,
    lines: coil.keys.map((k) => halfLoop(cx, loopY(k), front)),
    opacities: coil.opacities,
    width: LOOP_PX,
    style: INK,
  };
}

/** 부하 지그재그 — 위 끝에서 아래 끝까지 좌우로 꺾는다. */
function zigzag(top: number, bottom: number): Vec2[] {
  const n = Math.max(2, Math.round(LOAD_ZIGS));
  return Array.from({ length: n }, (_, k): Vec2 => {
    const y = top + ((k + 0.5) / n) * (bottom - top);
    return [LOAD_X + (k % 2 === 0 ? LOAD_ZIG_W : -LOAD_ZIG_W), y];
  });
}

/** 가운데 at 을 지나는 화살표. 길이가 0 에 가까우면 렌더러가 그리지 않는다. */
function centeredArrow(
  id: string,
  at: Vec2,
  delta: Vec2,
  width: number,
  head: number,
  style: typeof FLUX | typeof CURRENT,
): Primitive {
  return {
    type: 'vector',
    id,
    from: [at[0] - delta[0] / 2, at[1] - delta[1] / 2],
    delta,
    width,
    headSize: head,
    style,
  };
}

function label(
  id: string,
  at: Vec2,
  body: LocalizedText,
  style: typeof INK | typeof FLUX | typeof CURRENT,
  align: 'left' | 'center' | 'right',
  italic: boolean,
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: body,
    chip: false,
    align,
    font: 'text',
    italic,
    fontSize: LABEL_PX,
    style,
  };
}

function turnsLabel(id: string, x: number, y: number, body: LocalizedText, turns: number, opacity: number): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: [x, y] },
    text: body,
    vars: { n: String(turns) },
    chip: false,
    align: 'center',
    font: 'text',
    fontSize: LABEL_PX,
    opacity,
    style: INK,
  };
}

function axisLabel(
  id: string,
  at: Vec2,
  offset: Vec2,
  align: 'left' | 'center',
  body: LocalizedText,
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: body,
    chip: false,
    align,
    font: 'text',
    italic: true,
    fontSize: AXIS_FONT_PX,
    style: GUIDE,
  };
}
