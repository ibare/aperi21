// ========================================================================
// emf-and-internal-resistance — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 도선 · 전지 상자 · 지그재그 ·
// 스위치(trajectory) · ε 칸(lineSet) · 단자 · 받침점 · 평면의 점(body) · 전자 알갱이
// (particleSystem)와 꼬리(lineSet) · 방향 표식 · 축(vector) · 전위 막대와 Ir 기둥(region) ·
// 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 전자는 primary, **강조색은 「지금 단자 전압」 한 가지 뜻에만**
// (전위 막대의 채움과 평면의 지금 점 — 같은 양이다). 전지 안에서 잃는 몫 Ir 은 막대와
// 평면에서 모두 먹색 **사선 결**로 가른다(같은 ε 의 다른 몫이라 색이 아니라 결로).
// 전지 · 저항 · 스위치 · 지난 점 · 직선은 먹색, 도선 · 축 · 상자 · 이름표는 muted.
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
  levelAt,
  loadOf,
  pointAt,
  readConstants,
  subPath,
  terminalVoltage,
  visibleArcs,
  type EmfAndInternalResistanceConstants,
  type Level,
} from './physics';
import {
  BAR_LEFT,
  BAR_RIGHT,
  BOX_BOTTOM,
  BOX_HALF,
  BOX_TOP,
  CELL_GAP,
  CELL_LONG_HALF,
  CELL_PLUS_Y,
  CELL_SHORT_HALF,
  CURRENT_ARROW_FROM,
  DIRECTION_ARROW_LEN,
  DIRECTION_Y,
  ELECTRON_ARROW_FROM,
  INTERNAL_CENTER_Y,
  LOAD_CENTER_X,
  LOOP_BOTTOM,
  LOOP_LEFT,
  LOOP_RIGHT,
  LOOP_TOP,
  PLOT_ORIGIN_X,
  PLOT_ORIGIN_Y,
  RESISTOR_AMPLITUDE,
  RESISTOR_TOOTH_PITCH,
  SCENE_BOUNDS,
  SWITCH_CONTACT_X,
  SWITCH_OPEN_LIFT,
  SWITCH_PIVOT_X,
  text,
} from './schema';
import type { EmfAndInternalResistanceState } from './state';

/** 도선 굵기(화면 px). 알갱이가 그 위에서 또렷해야 해 가늘다. */
const WIRE_PX = 2;
/** 저항 지그재그 굵기(화면 px). 도선보다 굵어 「여기가 저항」 이 모양으로 읽힌다. */
const RESISTOR_PX = 2.5;
/** ε 칸 긴 판(+) · 짧은 판(−) 굵기(화면 px). 짧은 판이 굵은 것이 전지 기호의 관례다. */
const CELL_LONG_PX = 2;
const CELL_SHORT_PX = 4;
/** 전지 상자(점선) 굵기(화면 px). 안내선이라 가늘다. */
const BOX_PX = 1.5;
/** 스위치 막대 굵기(화면 px). */
const SWITCH_PX = 2.5;
/** 단자 · 스위치 받침점 반지름(월드). */
const NODE_RADIUS = 0.055;
/** 전자 알갱이 반지름(화면 px). */
const CARRIER_PX = 3;
/** 알갱이 꼬리 굵기(화면 px) · 짙기. */
const TRAIL_PX = 3;
const TRAIL_OPACITY = 0.55;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 방향 화살표 굵기(화면 px). */
const DIRECTION_ARROW_PX = 2;
/** 평면 축 굵기(화면 px) · 축 끝이 끝 값 너머로 더 나가는 길이(월드). */
const AXIS_PX = 1.5;
const AXIS_OVERRUN = 0.3;
/** ε 수평 점선 굵기(화면 px). 막대 테두리와 평면 ε 선이 같은 굵기. */
const EMF_LINE_PX = 1.5;
/** 직선 굵기(화면 px). 점보다 앞에 나서지 않게 보통 굵기. */
const LINE_PX = 2;
/** 지난 점 · 지금 점 반지름(월드). 지금 점이 커서 「지금 여기」 가 크기로도 읽힌다. */
const POINT_RADIUS = 0.07;
const LIVE_POINT_RADIUS = 0.11;
/** 평면 Ir 기둥의 반폭(월드). 막대보다 가늘어 점을 가리지 않는다. */
const DROP_COLUMN_HALF = 0.06;
/** 사선 결 기둥의 채움 짙기 — 결이 보일 만큼 옅게. 막대의 V 채움 짙기. */
const DROP_FILL_OPACITY = 0.55;
const TERMINAL_FILL_OPACITY = 0.8;
/** 이름표 띄움(화면 px). */
const LOAD_LABEL_GAP_PX = 18;
const BOX_LABEL_GAP_PX = 8;
const BAR_LABEL_GAP_PX = 8;
const BAR_TOP_LABEL_GAP_PX = 12;
const SIGN_OFFSET_PX: Vec2 = [12, 0];
const AXIS_LABEL_GAP_PX = 12;
const ORIGIN_LABEL_OFFSET_PX: Vec2 = [-12, 14];
/** 평면 점 이름표 — 점의 왼쪽 아래(직선 밑의 빈자리). */
const POINT_LABEL_OFFSET_PX: Vec2 = [-8, 14];
/** 평면 Ir 이름표 — 기둥 오른쪽. */
const DROP_LABEL_GAP_PX = 8;
/** ε 칸 안에 든 알갱이를 가리는 여유(월드). 판 바로 곁의 알갱이가 판에 겹쳐 보이지 않게. */
const CELL_HIDE_MARGIN = 0.05;

export function scene(params: {
  state: EmfAndInternalResistanceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('emf-and-internal-resistance: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const level = levelAt(timeline);
  const out: Primitive[] = [];

  pushCircuit(out, c, level, timeline);
  pushBar(out, c, level);
  pushPlane(out, c, level, timeline);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

// ------------------------------------------------------------------------
// 회로
// ------------------------------------------------------------------------

/**
 * 저항 지그재그 한 줄 — 전자가 지나는 차례로 점을 낸다. 길이는 저항 × 배율이고
 * 톱니 간격이 두 저항에 같아, 같은 저항이면 같은 크기로 보인다. `axis` 는 지그재그가 놓인
 * 방향(0 = 가로, 1 = 세로), `sign` 은 진행 방향(+1 · −1).
 */
function zigzag(
  c: EmfAndInternalResistanceConstants,
  ohms: number,
  center: Vec2,
  axis: 0 | 1,
  sign: 1 | -1,
): Vec2[] {
  const len = ohms * c.resistorWorldPerOhm;
  const teeth = Math.max(1, Math.round(len / RESISTOR_TOOTH_PITCH));
  const segments = teeth * 2;
  const pts: Vec2[] = [];
  for (let i = 0; i <= segments; i++) {
    const along = sign * (-len / 2 + (len * i) / segments);
    const across = i === 0 || i === segments ? 0 : i % 2 === 1 ? RESISTOR_AMPLITUDE : -RESISTOR_AMPLITUDE;
    pts.push(axis === 0 ? [center[0] + along, center[1] + across] : [center[0] + across, center[1] + along]);
  }
  return pts;
}

/** 바깥 저항 — 위 변 위, 오른쪽에서 왼쪽으로. */
function loadZigzag(c: EmfAndInternalResistanceConstants, load: number): Vec2[] {
  return zigzag(c, load, [LOAD_CENTER_X, LOOP_TOP], 0, -1);
}

/** 내부 저항 — 왼쪽 변 위(전지 상자 안), 위에서 아래로. */
function internalZigzag(c: EmfAndInternalResistanceConstants): Vec2[] {
  return zigzag(c, c.internalResistance, [LOOP_LEFT, INTERNAL_CENTER_Y], 1, -1);
}

function pushCircuit(
  out: Primitive[],
  c: EmfAndInternalResistanceConstants,
  level: Level,
  tl: TimelineFrame,
): void {
  const wire = { colorRole: 'muted', emphasis: 'strong' } as const;
  const inkStyle = { colorRole: 'ink', emphasis: 'strong' } as const;
  // 스위치가 열린 동안에도 바깥 저항은 load1 이 끼워져 있다 — 닫는 순간 이 저항으로 흐른다.
  const load = loadOf(c, level) ?? c.loads[0];
  const zig = loadZigzag(c, load);
  const span = { left: zig[zig.length - 1]![0], right: zig[0]![0] };
  const internal = internalZigzag(c);
  const internalTop = internal[0]![1];
  const internalBottom = internal[internal.length - 1]![1];
  const minusY = CELL_PLUS_Y - CELL_GAP;

  // ---- 도선 ----
  out.push({
    type: 'trajectory',
    id: 'wire-top',
    points: [
      [LOOP_LEFT, BOX_TOP],
      [LOOP_LEFT, LOOP_TOP],
      [span.left, LOOP_TOP],
    ],
    width: WIRE_PX,
    style: wire,
  });
  out.push({
    type: 'trajectory',
    id: 'wire-right',
    points: [
      [span.right, LOOP_TOP],
      [LOOP_RIGHT, LOOP_TOP],
      [LOOP_RIGHT, LOOP_BOTTOM],
      [SWITCH_CONTACT_X, LOOP_BOTTOM],
    ],
    width: WIRE_PX,
    style: wire,
  });
  out.push({
    type: 'trajectory',
    id: 'wire-bottom',
    points: [
      [SWITCH_PIVOT_X, LOOP_BOTTOM],
      [LOOP_LEFT, LOOP_BOTTOM],
      [LOOP_LEFT, BOX_BOTTOM],
    ],
    width: WIRE_PX,
    style: wire,
  });
  // 전지 안 도선 — 단자에서 ε 칸, ε 칸에서 r, r 에서 단자로.
  out.push({
    type: 'lineSet',
    id: 'wire-inside',
    lines: [
      [
        [LOOP_LEFT, BOX_TOP],
        [LOOP_LEFT, CELL_PLUS_Y],
      ],
      [
        [LOOP_LEFT, minusY],
        [LOOP_LEFT, internalTop],
      ],
      [
        [LOOP_LEFT, internalBottom],
        [LOOP_LEFT, BOX_BOTTOM],
      ],
    ],
    width: WIRE_PX,
    style: wire,
  });

  // ---- 전지 상자 — 이 안이 한 전지다 ----
  out.push({
    type: 'trajectory',
    id: 'battery-box',
    points: [
      [LOOP_LEFT - BOX_HALF, BOX_BOTTOM],
      [LOOP_LEFT + BOX_HALF, BOX_BOTTOM],
      [LOOP_LEFT + BOX_HALF, BOX_TOP],
      [LOOP_LEFT - BOX_HALF, BOX_TOP],
    ],
    closed: true,
    width: BOX_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // ---- ε 칸 ----
  out.push({
    type: 'lineSet',
    id: 'cell-plus',
    lines: [
      [
        [LOOP_LEFT - CELL_LONG_HALF, CELL_PLUS_Y],
        [LOOP_LEFT + CELL_LONG_HALF, CELL_PLUS_Y],
      ],
    ],
    width: CELL_LONG_PX,
    style: inkStyle,
  });
  out.push({
    type: 'lineSet',
    id: 'cell-minus',
    lines: [
      [
        [LOOP_LEFT - CELL_SHORT_HALF, minusY],
        [LOOP_LEFT + CELL_SHORT_HALF, minusY],
      ],
    ],
    width: CELL_SHORT_PX,
    style: inkStyle,
  });
  out.push({
    type: 'readout',
    id: 'cell-label',
    anchor: { world: [LOOP_LEFT - BOX_HALF, CELL_PLUS_Y - CELL_GAP / 2], offset: [-BOX_LABEL_GAP_PX, 0] },
    text: text('label.emfValue'),
    vars: { e: String(c.emf) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'right',
    style: inkStyle,
  });

  // ---- 내부 저항 r ----
  out.push({
    type: 'trajectory',
    id: 'internal-resistor',
    points: internal,
    width: RESISTOR_PX,
    style: inkStyle,
  });
  out.push({
    type: 'readout',
    id: 'internal-label',
    anchor: { world: [LOOP_LEFT - BOX_HALF, INTERNAL_CENTER_Y], offset: [-BOX_LABEL_GAP_PX, 0] },
    text: text('label.internalValue'),
    vars: { r: String(c.internalResistance) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'right',
    style: inkStyle,
  });

  // ---- 단자 ----
  for (const [id, y, sign] of [
    ['terminal-plus', BOX_TOP, 'label.plus'],
    ['terminal-minus', BOX_BOTTOM, 'label.minus'],
  ] as const) {
    out.push({
      type: 'body',
      id,
      pos: [LOOP_LEFT, y],
      shape: 'circle',
      size: NODE_RADIUS,
      outline: 'background',
      glow: false,
      style: inkStyle,
    });
    out.push({
      type: 'readout',
      id: `${id}-sign`,
      anchor: { world: [LOOP_LEFT + BOX_HALF, y], offset: SIGN_OFFSET_PX },
      text: text(sign),
      chip: false,
      fontSize: LABEL_PX,
      align: 'center',
      style: inkStyle,
    });
  }

  // ---- 바깥 저항 R ----
  out.push({
    type: 'trajectory',
    id: 'load-resistor',
    points: zig,
    width: RESISTOR_PX,
    style: inkStyle,
  });
  out.push({
    type: 'readout',
    id: 'load-label',
    anchor: { world: [LOAD_CENTER_X, LOOP_TOP], offset: [0, -LOAD_LABEL_GAP_PX] },
    text: text('label.loadValue'),
    vars: { r: String(load) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'center',
    style: inkStyle,
  });

  // ---- 스위치 ----
  const leverLen = SWITCH_CONTACT_X - SWITCH_PIVOT_X;
  const tip: Vec2 =
    level === 0
      ? [
          SWITCH_PIVOT_X + Math.sqrt(Math.max(0, leverLen * leverLen - SWITCH_OPEN_LIFT * SWITCH_OPEN_LIFT)),
          LOOP_BOTTOM + SWITCH_OPEN_LIFT,
        ]
      : [SWITCH_CONTACT_X, LOOP_BOTTOM];
  out.push({
    type: 'trajectory',
    id: 'switch-lever',
    points: [[SWITCH_PIVOT_X, LOOP_BOTTOM], tip],
    width: SWITCH_PX,
    style: inkStyle,
  });
  for (const [id, x] of [
    ['switch-pivot', SWITCH_PIVOT_X],
    ['switch-contact', SWITCH_CONTACT_X],
  ] as const) {
    out.push({
      type: 'body',
      id,
      pos: [x, LOOP_BOTTOM],
      shape: 'circle',
      size: NODE_RADIUS,
      outline: 'background',
      glow: false,
      style: inkStyle,
    });
  }

  // ---- 전자 알갱이 ----
  // 전지의 + 판이 위라 관례 전류는 시계 방향이고 전자는 반대로 돈다 — 위 변을 오른쪽에서
  // 왼쪽으로(바깥 저항을 따라), 왼쪽 변을 아래로(ε 칸 · r 을 지나), 아래 변을 오른쪽으로
  // (스위치를 지나), 오른쪽 변을 위로. 속력 = 전류 × 배율, 간격은 모든 단계에서 같다.
  const path: Vec2[] = [
    [LOOP_RIGHT, LOOP_TOP],
    ...zig,
    [LOOP_LEFT, LOOP_TOP],
    ...internal,
    [LOOP_LEFT, LOOP_BOTTOM],
    [LOOP_RIGHT, LOOP_BOTTOM],
  ];
  const lengths = cumulativeLengths(path);
  const loopLength = lengths[lengths.length - 1]!;
  const leftTopIndex = zig.length + 1;
  const leftTopS = lengths[leftTopIndex]!;
  // ε 칸의 두 판 사이 구간은 가린다 — 전지 속을 지나는 것으로 읽힌다.
  const hidden: [number, number] = [
    leftTopS + (LOOP_TOP - CELL_PLUS_Y) - CELL_HIDE_MARGIN,
    leftTopS + (LOOP_TOP - minusY) + CELL_HIDE_MARGIN,
  ];
  const speedAt = (k: Level): number => currentOf(c, k) * c.flowSpeedPerAmp;
  const speeds = [speedAt(0), speedAt(1), speedAt(2), speedAt(3)] as const;
  // 바깥 저항 지그재그의 길이가 단계마다 달라 고리 둘레가 바뀐다 — 흐른 거리는 이번 둘레로 접는다.
  const offset = flowDistance(tl, speeds, loopLength);
  const trailLength = speeds[level] * c.trailSeconds;
  const n = carrierCount(loopLength, c.carrierSpacing);
  const pitch = loopLength / n;
  const positions: Vec2[] = [];
  const trails: Vec2[][] = [];
  for (let k = 0; k < n; k++) {
    const s = (offset + k * pitch) % loopLength;
    if (s >= hidden[0] && s <= hidden[1]) continue;
    const pos = pointAt(path, lengths, s).pos;
    // 스위치가 열린 동안 끊긴 틈 위의 알갱이는 두지 않는다 — 도선이 없는 자리다.
    if (level === 0 && pos[1] === LOOP_BOTTOM && pos[0] > SWITCH_PIVOT_X && pos[0] < SWITCH_CONTACT_X) continue;
    positions.push(pos);
    if (trailLength > 0) {
      for (const [a, b] of visibleArcs(s - trailLength, s, loopLength, hidden)) {
        trails.push(subPath(path, lengths, a, b));
      }
    }
  }
  if (trails.length > 0) {
    out.push({
      type: 'lineSet',
      id: 'carrier-trails',
      lines: trails,
      width: TRAIL_PX,
      opacity: TRAIL_OPACITY,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'particleSystem',
    id: 'carriers',
    positions,
    sizes: CARRIER_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 방향 표식 — 회로 안쪽에 한 번. 위 변에서 전자는 왼쪽으로, 관례 전류 I 는 오른쪽으로 ----
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
    style: inkStyle,
  });
}

// ------------------------------------------------------------------------
// 전위 막대 — 전지의 − 단자를 바닥으로, 높이 ε 중 V(채움)와 Ir(사선)
// ------------------------------------------------------------------------

function pushBar(out: Primitive[], c: EmfAndInternalResistanceConstants, level: Level): void {
  const base = LOOP_BOTTOM;
  const emfTop = base + c.emf * c.worldPerVolt;
  const v = terminalVoltage(c, currentOf(c, level));
  const vTop = base + v * c.worldPerVolt;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const inkStyle = { colorRole: 'ink', emphasis: 'strong' } as const;

  out.push({
    type: 'region',
    id: 'bar-terminal',
    points: [
      [BAR_LEFT, base],
      [BAR_RIGHT, base],
      [BAR_RIGHT, vTop],
      [BAR_LEFT, vTop],
    ],
    fillOpacity: TERMINAL_FILL_OPACITY,
    opaque: true,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'bar-terminal-label',
    anchor: { world: [BAR_LEFT, (base + vTop) / 2], offset: [-BAR_LABEL_GAP_PX, 0] },
    text: text('label.terminal'),
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'right',
    style: inkStyle,
  });
  if (vTop < emfTop) {
    out.push({
      type: 'region',
      id: 'bar-drop',
      points: [
        [BAR_LEFT, vTop],
        [BAR_RIGHT, vTop],
        [BAR_RIGHT, emfTop],
        [BAR_LEFT, emfTop],
      ],
      fill: 'hatch',
      fillOpacity: DROP_FILL_OPACITY,
      opaque: true,
      style: inkStyle,
    });
    out.push({
      type: 'readout',
      id: 'bar-drop-label',
      anchor: { world: [BAR_LEFT, (vTop + emfTop) / 2], offset: [-BAR_LABEL_GAP_PX, 0] },
      text: text('label.drop'),
      chip: false,
      fontSize: LABEL_PX,
      italic: true,
      align: 'right',
      style: inkStyle,
    });
  }
  // ε 테두리 — 막대가 채울 수 있는 전체 높이. 늘 같다.
  out.push({
    type: 'trajectory',
    id: 'bar-emf-frame',
    points: [
      [BAR_LEFT, base],
      [BAR_RIGHT, base],
      [BAR_RIGHT, emfTop],
      [BAR_LEFT, emfTop],
    ],
    closed: true,
    width: EMF_LINE_PX,
    style: { ...muted, lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: 'bar-emf-label',
    anchor: { world: [(BAR_LEFT + BAR_RIGHT) / 2, emfTop], offset: [0, -BAR_TOP_LABEL_GAP_PX] },
    text: text('label.emf'),
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'center',
    style: inkStyle,
  });
}

// ------------------------------------------------------------------------
// V–I 평면
// ------------------------------------------------------------------------

function pushPlane(
  out: Primitive[],
  c: EmfAndInternalResistanceConstants,
  level: Level,
  tl: TimelineFrame,
): void {
  const toPlane = (i: number, v: number): Vec2 => [
    PLOT_ORIGIN_X + i * c.plotWorldPerAmp,
    PLOT_ORIGIN_Y + v * c.worldPerVolt,
  ];
  const axisX = c.plotAxisCurrent * c.plotWorldPerAmp + AXIS_OVERRUN;
  const axisY = c.plotAxisVoltage * c.worldPerVolt + AXIS_OVERRUN;
  const axisStyle = { colorRole: 'muted', emphasis: 'strong' } as const;
  const inkStyle = { colorRole: 'ink', emphasis: 'strong' } as const;
  // 지난 점과 직선은 마지막 단계에서 흐려지고, 다음 주기에 다시 찍힌다.
  const history = 1 - tl.at('fade');
  const emfY = PLOT_ORIGIN_Y + c.emf * c.worldPerVolt;

  // ---- 축 ----
  out.push({
    type: 'vector',
    id: 'axis-i',
    from: [PLOT_ORIGIN_X, PLOT_ORIGIN_Y],
    delta: [axisX, 0],
    width: AXIS_PX,
    style: axisStyle,
  });
  out.push({
    type: 'vector',
    id: 'axis-v',
    from: [PLOT_ORIGIN_X, PLOT_ORIGIN_Y],
    delta: [0, axisY],
    width: AXIS_PX,
    style: axisStyle,
  });
  out.push({
    type: 'readout',
    id: 'axis-i-label',
    anchor: { world: [PLOT_ORIGIN_X + axisX, PLOT_ORIGIN_Y], offset: [AXIS_LABEL_GAP_PX, 0] },
    text: text('label.axisI'),
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'left',
    style: axisStyle,
  });
  out.push({
    type: 'readout',
    id: 'axis-v-label',
    anchor: { world: [PLOT_ORIGIN_X, PLOT_ORIGIN_Y + axisY], offset: [-AXIS_LABEL_GAP_PX, 0] },
    text: text('label.axisV'),
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'right',
    style: axisStyle,
  });
  out.push({
    type: 'readout',
    id: 'axis-origin-label',
    anchor: { world: [PLOT_ORIGIN_X, PLOT_ORIGIN_Y], offset: ORIGIN_LABEL_OFFSET_PX },
    text: text('label.origin'),
    chip: false,
    fontSize: LABEL_PX,
    align: 'center',
    style: axisStyle,
  });

  // ---- ε 높이 — 막대 윗변과 같은 높이의 수평 점선 ----
  out.push({
    type: 'trajectory',
    id: 'plane-emf-line',
    points: [
      [PLOT_ORIGIN_X, emfY],
      [PLOT_ORIGIN_X + axisX, emfY],
    ],
    width: EMF_LINE_PX,
    style: { ...axisStyle, lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: 'plane-emf-label',
    anchor: { world: [PLOT_ORIGIN_X, emfY], offset: [-AXIS_LABEL_GAP_PX, 0] },
    text: text('label.emf'),
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'right',
    style: inkStyle,
  });

  // ---- 지금 점에서 ε 선까지 — 전지 안에서 잃은 몫 Ir ----
  const liveI = currentOf(c, level);
  const live = toPlane(liveI, terminalVoltage(c, liveI));
  if (live[1] < emfY) {
    out.push({
      type: 'region',
      id: 'plane-drop',
      points: [
        [live[0] - DROP_COLUMN_HALF, live[1]],
        [live[0] + DROP_COLUMN_HALF, live[1]],
        [live[0] + DROP_COLUMN_HALF, emfY],
        [live[0] - DROP_COLUMN_HALF, emfY],
      ],
      fill: 'hatch',
      fillOpacity: DROP_FILL_OPACITY,
      opaque: true,
      style: inkStyle,
    });
    out.push({
      type: 'readout',
      id: 'plane-drop-label',
      anchor: { world: [live[0] + DROP_COLUMN_HALF, (live[1] + emfY) / 2], offset: [DROP_LABEL_GAP_PX, 0] },
      text: text('label.drop'),
      chip: false,
      fontSize: LABEL_PX,
      italic: true,
      align: 'left',
      style: inkStyle,
    });
  }

  // ---- 직선 — ε 절편에서 가로축 끝까지 뻗는다 ----
  const grow = tl.at('line');
  if (grow > 0) {
    const start = toPlane(0, c.emf);
    const end = toPlane(c.plotAxisCurrent, terminalVoltage(c, c.plotAxisCurrent));
    out.push({
      type: 'trajectory',
      id: 'line',
      points: [start, [start[0] + (end[0] - start[0]) * grow, start[1] + (end[1] - start[1]) * grow]],
      width: LINE_PX,
      opacity: history,
      style: inkStyle,
    });
  }

  // ---- 점 ----
  // 이번 주기에 지나온 상태의 점은 먹색으로 남고, 지금 상태의 점은 강조색으로 크게.
  for (const k of [0, 1, 2, 3] as const) {
    if (k > level) continue;
    const i = currentOf(c, k);
    const pos = toPlane(i, terminalVoltage(c, i));
    const isLive = k === level;
    out.push({
      type: 'body',
      id: `point-${k}`,
      pos,
      shape: 'circle',
      size: isLive ? LIVE_POINT_RADIUS : POINT_RADIUS,
      outline: 'background',
      glow: false,
      ...(isLive ? {} : { opacity: history }),
      style: { colorRole: isLive ? 'accent' : 'ink', emphasis: 'strong' },
    });
    const load = loadOf(c, k);
    if (load !== null) {
      out.push({
        type: 'readout',
        id: `point-label-${k}`,
        anchor: { world: pos, offset: POINT_LABEL_OFFSET_PX },
        text: text('label.pointLoad'),
        vars: { r: String(load) },
        chip: false,
        fontSize: LABEL_PX,
        align: 'right',
        ...(isLive ? {} : { opacity: history }),
        style: axisStyle,
      });
    }
  }
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
