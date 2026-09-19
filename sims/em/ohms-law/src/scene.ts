// ========================================================================
// ohms-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 도선 · 저항 지그재그
// (trajectory) · 전지 칸(lineSet) · 전자 알갱이와 꼬리(particleSystem) · 방향 표식
// (vector) · 평면의 축(vector) · 눈금(lineSet) · 점(body) · 직선(trajectory) ·
// 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 전자는 primary(두 회로에서 같은 대상이라 같은 색), **강조색은
// 「지금 전압에서의 전류」 한 가지 뜻에만**(평면 위 지금 점). 지난 점 · 직선 · 저항 ·
// 전지는 먹색, 도선 · 축 · 이름표는 배경 정보라 muted.
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
  carrierCount,
  cumulativeLengths,
  currentOf,
  flowDistance,
  pointAt,
  pointShown,
  readConstants,
  subPath,
  visibleArcs,
  voltageLevel,
  type OhmsLawConstants,
} from './physics';
import {
  CELL_GAP,
  CELL_LONG_HALF,
  CELL_PITCH,
  CELL_SHORT_HALF,
  CURRENT_ARROW_FROM,
  DIRECTION_ARROW_LEN,
  DIRECTION_Y,
  ELECTRON_ARROW_FROM,
  LOOP_LARGE_BOTTOM,
  LOOP_LARGE_TOP,
  LOOP_LEFT,
  LOOP_RIGHT,
  LOOP_SMALL_BOTTOM,
  LOOP_SMALL_TOP,
  PLOT_ORIGIN_X,
  PLOT_ORIGIN_Y,
  RESISTOR_AMPLITUDE,
  RESISTOR_CENTER_X,
  RESISTOR_LENGTH,
  RESISTOR_TEETH,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { OhmsLawState } from './state';

/** 도선 굵기(화면 px). 알갱이가 그 위에서 또렷해야 해 가늘다. */
const WIRE_PX = 2;
/** 저항 지그재그 굵기(화면 px). 도선보다 굵어 「여기가 저항」 이 모양으로 읽힌다. */
const RESISTOR_PX = 2.5;
/** 전지 긴 판(+) · 짧은 판(−) 굵기(화면 px). 짧은 판이 굵은 것이 전지 기호의 관례다. */
const CELL_LONG_PX = 2;
const CELL_SHORT_PX = 4;
/** 전지 칸 사이를 잇는 짧은 도선 굵기(화면 px). */
const CELL_LINK_PX = 2;
/** 전자 알갱이 반지름(화면 px). 두 회로가 같다. */
const CARRIER_PX = 3;
/** 알갱이 꼬리 굵기(화면 px) · 짙기. 빠르기가 꼬리 길이로 읽혀야 해 알갱이만큼 짙지는 않게. */
const TRAIL_PX = 3;
const TRAIL_OPACITY = 0.55;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 방향 화살표 굵기(화면 px). */
const DIRECTION_ARROW_PX = 2;
/** 평면 축 굵기(화면 px) · 축 끝이 끝 값 너머로 더 나가는 길이(월드). */
const AXIS_PX = 1.5;
const AXIS_OVERRUN = 0.3;
/** 가로축 눈금 반높이(월드) · 굵기(화면 px). */
const TICK_HALF = 0.07;
const TICK_PX = 1.5;
/** 직선 굵기(화면 px). 점보다 앞에 나서지 않게 보통 굵기. */
const LINE_PX = 2;
/** 지난 점 · 지금 점 반지름(월드). 지금 점이 커서 「지금 여기」 가 크기로도 읽힌다. */
const POINT_RADIUS = 0.07;
const LIVE_POINT_RADIUS = 0.11;
/** 이름표 띄움(화면 px) — 전지 이름표는 전지 왼쪽, 저항 이름표는 지그재그 위, 눈금 이름표는 축 아래. */
const BATTERY_LABEL_GAP_PX = 30;
const RESISTOR_LABEL_GAP_PX = 18;
const TICK_LABEL_GAP_PX = 14;
/**
 * 평면 점(또는 직선 끝) 옆 저항 이름표의 띄움(화면 px) — 바로 오른쪽. 두 점이 가장 가까운
 * 1 단계에서도 위아래로 갈린다.
 */
const POINT_LABEL_OFFSET_PX: Vec2 = [12, 0];
/** 축 이름 띄움(화면 px). */
const AXIS_LABEL_GAP_PX = 12;
/** 전지 안에 든 알갱이를 가리는 여유(월드). 판 바로 곁의 알갱이가 판에 겹쳐 보이지 않게. */
const BATTERY_HIDE_MARGIN = 0.04;

/** 회로 한 벌의 선언 — 높이와 저항. */
interface Loop {
  id: 'small' | 'large';
  bottom: number;
  top: number;
  resistance: number;
}

export function scene(params: {
  state: OhmsLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('ohms-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const level = voltageLevel(timeline);
  const out: Primitive[] = [];

  // 회로 둘의 목록은 코드 표로 남는다 — 스테이지 상수가 수 하나씩뿐이다 (NOTES (c) G105).
  const loops: Loop[] = [
    { id: 'small', bottom: LOOP_SMALL_BOTTOM, top: LOOP_SMALL_TOP, resistance: c.resistanceSmall },
    { id: 'large', bottom: LOOP_LARGE_BOTTOM, top: LOOP_LARGE_TOP, resistance: c.resistanceLarge },
  ];

  for (const loop of loops) {
    pushCircuit(out, loop, c, level, timeline);
  }

  // ---- 방향 표식 ----
  // 위 회로 안쪽에 한 번만. 위 변에서 전자는 왼쪽으로, 관례 전류 I 는 오른쪽으로 간다.
  out.push({
    type: 'vector',
    id: 'direction-electron',
    from: [ELECTRON_ARROW_FROM, DIRECTION_Y],
    delta: [-DIRECTION_ARROW_LEN, 0],
    label: text('label.electron'),
    labelSide: 'cw',
    width: DIRECTION_ARROW_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'direction-current',
    from: [CURRENT_ARROW_FROM, DIRECTION_Y],
    delta: [DIRECTION_ARROW_LEN, 0],
    label: text('label.current'),
    labelSide: 'ccw',
    width: DIRECTION_ARROW_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  pushPlane(out, loops, c, level, timeline);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

// ------------------------------------------------------------------------
// 회로 한 벌
// ------------------------------------------------------------------------

/** 저항 지그재그의 점들 — 오른쪽 끝에서 왼쪽 끝으로(전자가 지나는 차례). */
function resistorZigzag(top: number): Vec2[] {
  const left = RESISTOR_CENTER_X - RESISTOR_LENGTH / 2;
  const segments = RESISTOR_TEETH * 2;
  const pts: Vec2[] = [];
  for (let i = segments; i >= 0; i--) {
    const x = left + (RESISTOR_LENGTH * i) / segments;
    const y = i === 0 || i === segments ? top : top + (i % 2 === 1 ? RESISTOR_AMPLITUDE : -RESISTOR_AMPLITUDE);
    pts.push([x, y]);
  }
  return pts;
}

/**
 * 전자가 도는 닫힌 길. 전지의 + 판이 위라 관례 전류는 시계 방향이고, 전자는 그 반대로
 * 돈다 — 아래 변을 왼쪽에서 오른쪽으로, 오른쪽 변을 위로, 위 변을 오른쪽에서 왼쪽으로
 * (저항 지그재그를 따라), 왼쪽 변을 아래로(전지를 지나).
 */
function electronPath(loop: Loop): Vec2[] {
  const zig = resistorZigzag(loop.top);
  return [[LOOP_LEFT, loop.bottom], [LOOP_RIGHT, loop.bottom], [LOOP_RIGHT, loop.top], ...zig, [LOOP_LEFT, loop.top]];
}

/** 전지 칸 수가 n 일 때 칸 묶음의 위 끝(첫 + 판) · 아래 끝(마지막 − 판). 묶음은 왼쪽 변 가운데에 놓인다. */
function batterySpan(loop: Loop, cells: number): { top: number; bottom: number } {
  const mid = (loop.bottom + loop.top) / 2;
  const height = (cells - 1) * CELL_PITCH + CELL_GAP;
  return { top: mid + height / 2, bottom: mid - height / 2 };
}

function pushCircuit(
  out: Primitive[],
  loop: Loop,
  c: OhmsLawConstants,
  level: 0 | 1 | 2,
  tl: TimelineFrame,
): void {
  const cells = level + 1;
  const span = batterySpan(loop, cells);
  const resLeft = RESISTOR_CENTER_X - RESISTOR_LENGTH / 2;
  const resRight = RESISTOR_CENTER_X + RESISTOR_LENGTH / 2;
  const wire = { colorRole: 'muted', emphasis: 'strong' } as const;

  // ---- 도선 ----
  // 전지 칸 묶음과 저항을 비워 두고 둘로 긋는다. 칸이 늘면 전지에 닿는 세로 토막이 줄어든다.
  out.push({
    type: 'trajectory',
    id: `wire-${loop.id}-lower`,
    points: [
      [resRight, loop.top],
      [LOOP_RIGHT, loop.top],
      [LOOP_RIGHT, loop.bottom],
      [LOOP_LEFT, loop.bottom],
      [LOOP_LEFT, span.bottom],
    ],
    width: WIRE_PX,
    style: wire,
  });
  out.push({
    type: 'trajectory',
    id: `wire-${loop.id}-upper`,
    points: [
      [LOOP_LEFT, span.top],
      [LOOP_LEFT, loop.top],
      [resLeft, loop.top],
    ],
    width: WIRE_PX,
    style: wire,
  });

  // ---- 저항 ----
  out.push({
    type: 'trajectory',
    id: `resistor-${loop.id}`,
    points: resistorZigzag(loop.top),
    width: RESISTOR_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: `resistor-label-${loop.id}`,
    anchor: { world: [RESISTOR_CENTER_X, loop.top], offset: [0, -RESISTOR_LABEL_GAP_PX] },
    text: text('label.resistance'),
    vars: { r: String(loop.resistance) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 전지 ----
  // 칸 k 의 긴 판(+)이 위, 짧은 판(−)이 아래. 칸 사이는 짧은 도선으로 잇는다.
  const longPlates: Vec2[][] = [];
  const shortPlates: Vec2[][] = [];
  const links: Vec2[][] = [];
  for (let k = 0; k < cells; k++) {
    const plus = span.top - k * CELL_PITCH;
    const minus = plus - CELL_GAP;
    longPlates.push([
      [LOOP_LEFT - CELL_LONG_HALF, plus],
      [LOOP_LEFT + CELL_LONG_HALF, plus],
    ]);
    shortPlates.push([
      [LOOP_LEFT - CELL_SHORT_HALF, minus],
      [LOOP_LEFT + CELL_SHORT_HALF, minus],
    ]);
    if (k < cells - 1) {
      links.push([
        [LOOP_LEFT, minus],
        [LOOP_LEFT, plus - CELL_PITCH],
      ]);
    }
  }
  if (links.length > 0) {
    out.push({
      type: 'lineSet',
      id: `battery-links-${loop.id}`,
      lines: links,
      width: CELL_LINK_PX,
      style: wire,
    });
  }
  out.push({
    type: 'lineSet',
    id: `battery-plus-${loop.id}`,
    lines: longPlates,
    width: CELL_LONG_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: `battery-minus-${loop.id}`,
    lines: shortPlates,
    width: CELL_SHORT_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: `battery-label-${loop.id}`,
    anchor: { world: [LOOP_LEFT, (loop.bottom + loop.top) / 2], offset: [-BATTERY_LABEL_GAP_PX, 0] },
    text: text('label.voltage'),
    vars: { v: String(c.voltages[level]) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 전자 알갱이 ----
  // 속력 = 전류 × 배율. 간격은 두 회로가 같아 빠르기만 다르다. 알갱이 뒤에 **길을 따라가는**
  // 꼬리를 긋고 그 길이를 속력에 비례하게 둔다 — 정지 화면에서도 어느 회로가 빠른지, 전압이
  // 오를 때 얼마나 빨라졌는지가 꼬리 길이로 읽힌다.
  const path = electronPath(loop);
  const lengths = cumulativeLengths(path);
  const loopLength = lengths[lengths.length - 1]!;
  const speedAt = (v: number): number => currentOf(v, loop.resistance) * c.flowSpeedPerAmp;
  const speeds = [speedAt(c.voltages[0]), speedAt(c.voltages[1]), speedAt(c.voltages[2])] as const;
  const trailLength = speeds[level] * c.trailSeconds;
  const n = carrierCount(loopLength, c.carrierSpacing);
  const pitch = loopLength / n;
  const offset = flowDistance(tl, speeds, loopLength);
  // 전지 칸 묶음이 차지하는 호길이 구간. 왼쪽 변은 길의 마지막 변으로, 위 (LOOP_LEFT, top)
  // 에서 아래로 내려간다. 이 구간의 알갱이와 꼬리는 보이지 않는다 — 전지 속을 지난다.
  const leftTopS = lengths[path.length - 1]!;
  const hidden: [number, number] = [
    leftTopS + (loop.top - span.top) - BATTERY_HIDE_MARGIN,
    leftTopS + (loop.top - span.bottom) + BATTERY_HIDE_MARGIN,
  ];
  const positions: Vec2[] = [];
  const trails: Vec2[][] = [];
  for (let k = 0; k < n; k++) {
    const s = (offset + k * pitch) % loopLength;
    if (s >= hidden[0] && s <= hidden[1]) continue;
    positions.push(pointAt(path, lengths, s).pos);
    for (const [a, b] of visibleArcs(s - trailLength, s, loopLength, hidden)) {
      trails.push(subPath(path, lengths, a, b));
    }
  }
  if (trails.length > 0) {
    out.push({
      type: 'lineSet',
      id: `trails-${loop.id}`,
      lines: trails,
      width: TRAIL_PX,
      opacity: TRAIL_OPACITY,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'particleSystem',
    id: `carriers-${loop.id}`,
    positions,
    sizes: CARRIER_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
}

// ------------------------------------------------------------------------
// I–V 평면
// ------------------------------------------------------------------------

function pushPlane(
  out: Primitive[],
  loops: readonly Loop[],
  c: OhmsLawConstants,
  level: 0 | 1 | 2,
  tl: TimelineFrame,
): void {
  const toPlane = (v: number, i: number): Vec2 => [
    PLOT_ORIGIN_X + v * c.plotWorldPerVolt,
    PLOT_ORIGIN_Y + i * c.plotWorldPerAmp,
  ];
  const axisX = c.plotAxisVoltage * c.plotWorldPerVolt + AXIS_OVERRUN;
  const axisY = c.plotAxisCurrent * c.plotWorldPerAmp + AXIS_OVERRUN;
  const axisStyle = { colorRole: 'muted', emphasis: 'strong' } as const;
  // 지난 점과 직선은 마지막 단계에서 흐려지고, 다음 주기에 다시 찍힌다.
  const history = 1 - tl.at('fade');

  // ---- 축 ----
  out.push({
    type: 'vector',
    id: 'axis-v',
    from: [PLOT_ORIGIN_X, PLOT_ORIGIN_Y],
    delta: [axisX, 0],
    width: AXIS_PX,
    style: axisStyle,
  });
  out.push({
    type: 'vector',
    id: 'axis-i',
    from: [PLOT_ORIGIN_X, PLOT_ORIGIN_Y],
    delta: [0, axisY],
    width: AXIS_PX,
    style: axisStyle,
  });
  out.push({
    type: 'readout',
    id: 'axis-v-label',
    anchor: { world: [PLOT_ORIGIN_X + axisX, PLOT_ORIGIN_Y], offset: [AXIS_LABEL_GAP_PX, 0] },
    text: text('label.axisV'),
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'left',
    style: axisStyle,
  });
  out.push({
    type: 'readout',
    id: 'axis-i-label',
    anchor: { world: [PLOT_ORIGIN_X, PLOT_ORIGIN_Y + axisY], offset: [-AXIS_LABEL_GAP_PX, 0] },
    text: text('label.axisI'),
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'right',
    style: axisStyle,
  });
  out.push({
    type: 'readout',
    id: 'axis-origin-label',
    anchor: { world: [PLOT_ORIGIN_X, PLOT_ORIGIN_Y], offset: [-AXIS_LABEL_GAP_PX, TICK_LABEL_GAP_PX] },
    text: text('label.origin'),
    chip: false,
    fontSize: LABEL_PX,
    align: 'center',
    style: axisStyle,
  });

  // ---- 가로축 눈금 — 단계마다의 전압 ----
  out.push({
    type: 'lineSet',
    id: 'axis-v-ticks',
    lines: c.voltages.map((v): Vec2[] => {
      const [x, y] = toPlane(v, 0);
      return [
        [x, y - TICK_HALF],
        [x, y + TICK_HALF],
      ];
    }),
    width: TICK_PX,
    style: axisStyle,
  });
  c.voltages.forEach((v, k) => {
    out.push({
      type: 'readout',
      id: `axis-v-tick-label-${k}`,
      anchor: { world: toPlane(v, 0), offset: [0, TICK_LABEL_GAP_PX] },
      text: text('label.voltage'),
      vars: { v: String(v) },
      chip: false,
      fontSize: LABEL_PX,
      align: 'center',
      style: axisStyle,
    });
  });

  // ---- 직선 — 원점에서 가로축 끝까지 뻗는다 ----
  // 직선의 끝을 회로마다 먼저 구해 둔다 — 저항 이름표가 지금 점을 지나 뻗는 직선 끝을 따라간다.
  const grow = tl.at('line');
  const tips = new Map<Loop['id'], Vec2>();
  for (const loop of loops) {
    const end = toPlane(c.plotAxisVoltage, currentOf(c.plotAxisVoltage, loop.resistance));
    tips.set(loop.id, [
      PLOT_ORIGIN_X + (end[0] - PLOT_ORIGIN_X) * grow,
      PLOT_ORIGIN_Y + (end[1] - PLOT_ORIGIN_Y) * grow,
    ]);
  }
  if (grow > 0) {
    for (const loop of loops) {
      out.push({
        type: 'trajectory',
        id: `line-${loop.id}`,
        points: [[PLOT_ORIGIN_X, PLOT_ORIGIN_Y], tips.get(loop.id)!],
        width: LINE_PX,
        opacity: history,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // ---- 점 ----
  // 이번 주기에 지나온 단계의 점은 먹색으로 남고, 지금 단계의 점은 강조색으로 크게.
  for (const loop of loops) {
    for (const k of [0, 1, 2] as const) {
      if (!pointShown(tl, k) || k === level) continue;
      out.push({
        type: 'body',
        id: `point-${loop.id}-${k}`,
        pos: toPlane(c.voltages[k], currentOf(c.voltages[k], loop.resistance)),
        shape: 'circle',
        size: POINT_RADIUS,
        outline: 'background',
        glow: false,
        opacity: history,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
    const live = toPlane(c.voltages[level], currentOf(c.voltages[level], loop.resistance));
    out.push({
      type: 'body',
      id: `point-${loop.id}-live`,
      pos: live,
      shape: 'circle',
      size: LIVE_POINT_RADIUS,
      outline: 'background',
      glow: false,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    // 어느 회로의 점인지 — 저항 이름표가 지금 점 오른쪽에 붙고, 직선이 그 점을 지나 뻗으면
    // 직선 끝으로 옮겨 탄다. 점 옆에 남으면 뻗어 나온 직선이 글자를 가로지른다.
    const tip = tips.get(loop.id)!;
    const labelAt = grow > 0 && tip[0] > live[0] ? tip : live;
    out.push({
      type: 'readout',
      id: `point-label-${loop.id}`,
      anchor: { world: labelAt, offset: POINT_LABEL_OFFSET_PX },
      text: text('label.resistance'),
      vars: { r: String(loop.resistance) },
      chip: false,
      fontSize: LABEL_PX,
      align: 'left',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
