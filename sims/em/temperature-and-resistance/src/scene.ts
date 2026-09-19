// ========================================================================
// temperature-and-resistance — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 막대(region) · 이음 도선과
// 레일(trajectory · lineSet) · 전지 판(lineSet) · 격자 원자와 전자(particleSystem) · 양공
// (body 속 빈 원) · 온도계(region · body · lineSet) · 흐름 막대(region)와 차가울 때 윤곽
// (trajectory dashed) · 방향 표식(vector) · 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 나르개(e⁻ · h⁺)는 primary(둘은 색이 아니라 채움 · 표식 · 흐르는
// 방향으로 가른다), 격자 원자는 muted, 온도계 수은은 secondary, **강조색은 「지금 흐름」
// 한 가지 뜻에만**(흐름 막대). 막대 윤곽 · 전지 · 이름표는 먹색.
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
  atomOffset,
  electronWobble,
  heatLevel,
  metalCurrentRatio,
  metalLaneOffsets,
  metalSpeedNow,
  metalTravel,
  pairsNow,
  pitchOf,
  readConstants,
  semiCurrentRatio,
  vibAmplitude,
  wrap,
  type TemperatureAndResistanceConstants,
} from './physics';
import {
  ATOM_ROW_GAP,
  BAR_HALF,
  BAR_LENGTH,
  BAR_X0,
  BATTERY_X,
  CELL_GAP,
  CELL_LONG_HALF,
  CELL_SHORT_HALF,
  DIRECTION_E_X,
  DIRECTION_H_X,
  DIRECTION_LEN,
  DIRECTION_RISE,
  LANE_OFFSET,
  METER_HALF,
  METER_X,
  RAIL_LEFT_X,
  RAIL_RIGHT_X,
  ROW_METAL_Y,
  ROW_SEMI_Y,
  SCENE_BOUNDS,
  THERMO_BOTTOM_Y,
  THERMO_BULB_R,
  THERMO_COLD_Y,
  THERMO_HALF,
  THERMO_HOT_Y,
  THERMO_TOP_Y,
  THERMO_X,
  TOP_WIRE_Y,
  text,
} from './schema';
import type { TemperatureAndResistanceState } from './state';

/** 이음 도선 · 레일 굵기(화면 px). 막대보다 가늘어 「막대가 저항」 이 모양으로 읽힌다. */
const LEAD_PX = 2;
/** 막대 채움 불투명도. 원자 · 나르개가 그 위에서 또렷해야 해 옅다. */
const BAR_FILL_OPACITY = 0.08;
/** 전지 긴 판(+) · 짧은 판(−) 굵기(화면 px). 짧은 판이 굵은 것이 전지 기호의 관례다. */
const CELL_LONG_PX = 2;
const CELL_SHORT_PX = 4;
/** 격자 원자 반지름(화면 px). 나르개보다 커서 「자리를 지키는 원자」 로 읽힌다. */
const ATOM_PX = 3.4;
/** 전자 반지름(화면 px). */
const CARRIER_PX = 2.6;
/** 양공 반지름(월드). `body` 는 크기를 월드로 받는다 — 전자와 비슷한 화면 크기가 되게 잡았다. */
const HOLE_R = 0.05;
/** 나르개 꼬리 굵기(화면 px) · 짙기. */
const TRAIL_PX = 2.5;
const TRAIL_OPACITY = 0.5;
/** 온도계 관 · 눈금 굵기(화면 px), 눈금이 관 왼쪽으로 삐지는 길이(월드). */
const THERMO_PX = 1.5;
const TICK_LEN = 0.12;
/** 흐름 막대 채움 불투명도 · 차가울 때 윤곽 굵기(화면 px). */
const METER_FILL_OPACITY = 0.85;
const METER_GHOST_PX = 1.5;
/** 이름표 글자 크기(화면 px) · 막대 위 띄움 · 전지 위 띄움 · 온도 눈금 옆 띄움(화면 px). */
const LABEL_PX = 13;
const BAR_LABEL_GAP_PX = 12;
const BATTERY_LABEL_GAP_PX = 22;
const TEMP_LABEL_GAP_PX = 6;
/** 흐름 막대 이름표 `I` 가 막대 왼쪽 끝에서 떨어진 거리(월드). */
const METER_LABEL_GAP = 0.2;
/** 방향 화살표 굵기(화면 px). */
const DIRECTION_ARROW_PX = 2;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const LEAD = { colorRole: 'muted', emphasis: 'strong' } as const;
const CARRIER = { colorRole: 'primary', emphasis: 'strong' } as const;

export function scene(params: {
  state: TemperatureAndResistanceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('temperature-and-resistance: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const x = heatLevel(timeline);
  const out: Primitive[] = [];

  pushSupply(out, c);
  pushThermometer(out, c, x);

  // 두 막대 — 같은 모양 · 같은 전압 · 같은 온도. 다른 것은 재료뿐이다.
  pushBar(out, 'metal', ROW_METAL_Y, text('label.metal'), c, x, timeline.t);
  pushMetalCarriers(out, c, x, timeline);
  pushBar(out, 'semi', ROW_SEMI_Y, text('label.semi'), c, x, timeline.t);
  pushSemiCarriers(out, c, x, timeline);

  pushDirections(out);
  pushMeter(out, 'metal', ROW_METAL_Y, c.meterUnit, metalCurrentRatio(c, x));
  pushMeter(out, 'semi', ROW_SEMI_Y, c.meterUnit, semiCurrentRatio(c, x));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

// ------------------------------------------------------------------------
// 전지와 레일 — 두 막대가 같은 두 레일에 걸려 같은 전압을 받는다
// ------------------------------------------------------------------------

function pushSupply(out: Primitive[], c: TemperatureAndResistanceConstants): void {
  const minusX = BATTERY_X - CELL_GAP / 2;
  const plusX = BATTERY_X + CELL_GAP / 2;

  out.push({
    type: 'trajectory',
    id: 'supply-left',
    points: [
      [minusX, TOP_WIRE_Y],
      [RAIL_LEFT_X, TOP_WIRE_Y],
      [RAIL_LEFT_X, ROW_SEMI_Y],
    ],
    width: LEAD_PX,
    style: LEAD,
  });
  out.push({
    type: 'trajectory',
    id: 'supply-right',
    points: [
      [plusX, TOP_WIRE_Y],
      [RAIL_RIGHT_X, TOP_WIRE_Y],
      [RAIL_RIGHT_X, ROW_SEMI_Y],
    ],
    width: LEAD_PX,
    style: LEAD,
  });

  // 전지 — 긴 판(+)이 오른쪽. 전자는 − 에서 나와 막대를 지나 + 로 간다(왼쪽 → 오른쪽).
  out.push({
    type: 'lineSet',
    id: 'battery-plus',
    lines: [
      [
        [plusX, TOP_WIRE_Y - CELL_LONG_HALF],
        [plusX, TOP_WIRE_Y + CELL_LONG_HALF],
      ],
    ],
    width: CELL_LONG_PX,
    style: INK,
  });
  out.push({
    type: 'lineSet',
    id: 'battery-minus',
    lines: [
      [
        [minusX, TOP_WIRE_Y - CELL_SHORT_HALF],
        [minusX, TOP_WIRE_Y + CELL_SHORT_HALF],
      ],
    ],
    width: CELL_SHORT_PX,
    style: INK,
  });
  out.push({
    type: 'readout',
    id: 'battery-label',
    anchor: { world: [BATTERY_X, TOP_WIRE_Y], offset: [0, -BATTERY_LABEL_GAP_PX] },
    text: text('label.voltage'),
    vars: { v: String(c.voltage) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'center',
    style: INK,
  });
}

// ------------------------------------------------------------------------
// 온도계 — 두 막대가 함께 놓인 온도. 눈금은 선언 온도 두 개뿐이다
// ------------------------------------------------------------------------

function pushThermometer(out: Primitive[], c: TemperatureAndResistanceConstants, x: number): void {
  const xl = THERMO_X - THERMO_HALF;
  const xr = THERMO_X + THERMO_HALF;
  const level = THERMO_COLD_Y + (THERMO_HOT_Y - THERMO_COLD_Y) * x;
  const mercury = { colorRole: 'secondary', emphasis: 'strong' } as const;

  out.push({
    type: 'region',
    id: 'thermo-mercury',
    points: [
      [xl, THERMO_BOTTOM_Y],
      [xr, THERMO_BOTTOM_Y],
      [xr, level],
      [xl, level],
    ],
    fillOpacity: 1,
    style: mercury,
  });
  out.push({
    type: 'body',
    id: 'thermo-bulb',
    pos: [THERMO_X, THERMO_BOTTOM_Y - THERMO_BULB_R / 2],
    shape: 'circle',
    size: THERMO_BULB_R,
    glow: false,
    outline: 'none',
    style: mercury,
  });
  out.push({
    type: 'region',
    id: 'thermo-tube',
    points: [
      [xl, THERMO_BOTTOM_Y],
      [xr, THERMO_BOTTOM_Y],
      [xr, THERMO_TOP_Y],
      [xl, THERMO_TOP_Y],
    ],
    fillOpacity: 0,
    outline: [
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: INK,
  });

  const ticks: [number, string][] = [
    [THERMO_COLD_Y, String(c.tempCold)],
    [THERMO_HOT_Y, String(c.tempHot)],
  ];
  out.push({
    type: 'lineSet',
    id: 'thermo-ticks',
    lines: ticks.map(([y]): Vec2[] => [
      [xl - TICK_LEN, y],
      [xl, y],
    ]),
    width: THERMO_PX,
    style: INK,
  });
  ticks.forEach(([y, t], i) => {
    out.push({
      type: 'readout',
      id: `thermo-label-${i}`,
      anchor: { world: [xl - TICK_LEN, y], offset: [-TEMP_LABEL_GAP_PX, 0] },
      text: text('label.temp'),
      vars: { t },
      chip: false,
      fontSize: LABEL_PX,
      align: 'right',
      style: INK,
    });
  });
}

// ------------------------------------------------------------------------
// 막대 한 벌 — 이음 도선 · 막대 · 떨리는 격자 원자 · 이름표
// ------------------------------------------------------------------------

function pushBar(
  out: Primitive[],
  id: 'metal' | 'semi',
  y: number,
  label: LocalizedText,
  c: TemperatureAndResistanceConstants,
  x: number,
  t: number,
): void {
  const x0 = BAR_X0;
  const x1 = BAR_X0 + BAR_LENGTH;
  const yLo = y - BAR_HALF;
  const yHi = y + BAR_HALF;

  out.push({
    type: 'lineSet',
    id: `leads-${id}`,
    lines: [
      [
        [RAIL_LEFT_X, y],
        [x0, y],
      ],
      [
        [x1, y],
        [RAIL_RIGHT_X, y],
      ],
    ],
    width: LEAD_PX,
    style: LEAD,
  });

  out.push({
    type: 'region',
    id: `bar-${id}`,
    points: [
      [x0, yLo],
      [x1, yLo],
      [x1, yHi],
      [x0, yHi],
    ],
    fillOpacity: BAR_FILL_OPACITY,
    opaque: true,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: INK,
  });

  // 격자 원자 — 세 줄. 두 막대가 같은 온도라 같은 폭으로 떤다. 번호가 막대마다 달라 떨림이 겹치지 않는다.
  const amp = vibAmplitude(c, x);
  const pitch = pitchOf(c.atomPitch, BAR_LENGTH);
  const cols = Math.round(BAR_LENGTH / pitch);
  const base = id === 'metal' ? 0 : cols * 3;
  const atoms: Vec2[] = [];
  for (let row = -1; row <= 1; row++) {
    for (let col = 0; col < cols; col++) {
      const index = base + (row + 1) * cols + col;
      const [dx, dy] = atomOffset(c, index, amp, t);
      atoms.push([x0 + (col + 0.5) * pitch + dx, y + row * ATOM_ROW_GAP + dy]);
    }
  }
  out.push({
    type: 'particleSystem',
    id: `atoms-${id}`,
    positions: atoms,
    sizes: ATOM_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  out.push({
    type: 'readout',
    id: `bar-label-${id}`,
    anchor: { world: [x0, yHi], offset: [0, -BAR_LABEL_GAP_PX] },
    text: label,
    chip: false,
    fontSize: LABEL_PX,
    font: 'text',
    align: 'left',
    style: INK,
  });
}

// ------------------------------------------------------------------------
// 금속의 전자 — 수는 그대로, 데우면 느려지고 떨리는 격자에 부딪혀 흔들린다
// ------------------------------------------------------------------------

function pushMetalCarriers(
  out: Primitive[],
  c: TemperatureAndResistanceConstants,
  x: number,
  tl: TimelineFrame,
): void {
  const x0 = BAR_X0;
  const travel = metalTravel(c, tl);
  const speed = metalSpeedNow(c, x);
  const amp = vibAmplitude(c, x);
  const positions: Vec2[] = [];
  let index = 0;
  for (const lane of [0, 1]) {
    const ly = ROW_METAL_Y + (lane === 0 ? LANE_OFFSET : -LANE_OFFSET);
    for (const s of metalLaneOffsets(c, BAR_LENGTH, travel, lane)) {
      positions.push([x0 + s, ly + electronWobble(c, index, amp, tl.t)]);
      index += 1;
    }
  }
  out.push({
    type: 'particleSystem',
    id: 'carriers-metal',
    positions,
    velocities: positions.map((): Vec2 => [speed, 0]),
    sizes: CARRIER_PX,
    trail: true,
    trailStyle: { seconds: c.trailSeconds, width: TRAIL_PX, opacity: TRAIL_OPACITY },
    clip: { min: [x0, ROW_METAL_Y - BAR_HALF], max: [x0 + BAR_LENGTH, ROW_METAL_Y + BAR_HALF] },
    style: CARRIER,
  });
}

// ------------------------------------------------------------------------
// 반도체의 나르개 — 빠르기는 그대로, 데우면 쌍이 생겨 수가 는다
// ------------------------------------------------------------------------

function pushSemiCarriers(
  out: Primitive[],
  c: TemperatureAndResistanceConstants,
  x: number,
  tl: TimelineFrame,
): void {
  const x0 = BAR_X0;
  const electrons: Vec2[] = [];
  const holes: Vec2[] = [];
  for (const pair of pairsNow(c, BAR_LENGTH, tl, x)) {
    // 한 자리에서 갈라져 전자는 + 쪽(오른쪽), 양공은 − 쪽(왼쪽)으로 — 서로 다른 레인을 탄다.
    const eLane = pair.lane === 0 ? LANE_OFFSET : -LANE_OFFSET;
    const run = c.semiSpeed * pair.age;
    electrons.push([x0 + wrap(pair.site + run, BAR_LENGTH), ROW_SEMI_Y + eLane]);
    holes.push([x0 + wrap(pair.site - run, BAR_LENGTH), ROW_SEMI_Y - eLane]);
  }
  out.push({
    type: 'particleSystem',
    id: 'carriers-semi-electron',
    positions: electrons,
    velocities: electrons.map((): Vec2 => [c.semiSpeed, 0]),
    sizes: CARRIER_PX,
    trail: true,
    trailStyle: { seconds: c.trailSeconds, width: TRAIL_PX, opacity: TRAIL_OPACITY },
    clip: { min: [x0, ROW_SEMI_Y - BAR_HALF], max: [x0 + BAR_LENGTH, ROW_SEMI_Y + BAR_HALF] },
    style: CARRIER,
  });
  // 양공 — 속 빈 원. `particleSystem` 에 속 빈 점이 없어 하나씩 선언한다 (장부 G159).
  holes.forEach((pos, k) => {
    out.push({
      type: 'body',
      id: `hole-${k}`,
      pos,
      shape: 'circle',
      size: HOLE_R,
      fill: 'none',
      outline: 'role',
      glow: false,
      style: CARRIER,
    });
  });
}

// ------------------------------------------------------------------------
// 방향 표식 — 막대 위에 한 번씩
// ------------------------------------------------------------------------

function pushDirections(out: Primitive[]): void {
  const metalY = ROW_METAL_Y + BAR_HALF + DIRECTION_RISE;
  const semiY = ROW_SEMI_Y + BAR_HALF + DIRECTION_RISE;
  const arrows: { id: string; from: Vec2; delta: Vec2; label: LocalizedText }[] = [
    { id: 'metal-e', from: [DIRECTION_E_X, metalY], delta: [DIRECTION_LEN, 0], label: text('label.electron') },
    { id: 'semi-e', from: [DIRECTION_E_X, semiY], delta: [DIRECTION_LEN, 0], label: text('label.electron') },
    {
      id: 'semi-h',
      from: [DIRECTION_H_X + DIRECTION_LEN, semiY],
      delta: [-DIRECTION_LEN, 0],
      label: text('label.hole'),
    },
  ];
  for (const a of arrows) {
    out.push({
      type: 'vector',
      id: `direction-${a.id}`,
      from: a.from,
      delta: a.delta,
      label: a.label,
      labelSide: 'ccw',
      width: DIRECTION_ARROW_PX,
      style: CARRIER,
    });
  }
}

// ------------------------------------------------------------------------
// 흐름 막대 — 차가울 때(점선 윤곽)에 견준 지금 전류
// ------------------------------------------------------------------------

function pushMeter(out: Primitive[], id: 'metal' | 'semi', y: number, unit: number, ratio: number): void {
  const yLo = y - METER_HALF;
  const yHi = y + METER_HALF;
  const xEnd = METER_X + unit * ratio;
  out.push({
    type: 'region',
    id: `meter-${id}`,
    points: [
      [METER_X, yLo],
      [xEnd, yLo],
      [xEnd, yHi],
      [METER_X, yHi],
    ],
    fillOpacity: METER_FILL_OPACITY,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: `meter-cold-${id}`,
    points: [
      [METER_X, yLo],
      [METER_X + unit, yLo],
      [METER_X + unit, yHi],
      [METER_X, yHi],
    ],
    closed: true,
    width: METER_GHOST_PX,
    style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: `meter-label-${id}`,
    anchor: { world: [METER_X - METER_LABEL_GAP, y] },
    text: text('label.current'),
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'center',
    style: INK,
  });
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
