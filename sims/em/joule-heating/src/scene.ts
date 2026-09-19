// ========================================================================
// joule-heating — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 도선 · 스위치 레버(trajectory),
// 전지 판(lineSet), 저항 덩어리(region), 원자 · 전자 알갱이(particleSystem), 알갱이 꼬리
// (lineSet), 온도계 알(body) · 막대(region) · 관(lineSet), 방향 표식(vector), 이름표(readout)가
// 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 전자는 primary, 원자 · 덩어리 · 전지는 먹색, 도선 · 관은 배경 정보라
// muted. **강조색은 「열(온도)」 한 가지 뜻에만** 쓴다 — 온도계 알과 차오른 막대. 뜨거운
// 덩어리를 붉게 칠하거나 빛나게 하지 않는다 — 달아오름은 원자의 떨림 폭과 막대 높이가 보인다.
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
  currentOn,
  flowDistance,
  heatingRate,
  jitterOffset,
  jitterVoices,
  pointAt,
  readConstants,
  seriesCurrent,
  subPath,
  switchAngle,
  temperatureRise,
  visibleArcs,
  type JouleHeatingConstants,
} from './physics';
import {
  ATOM_COLUMNS,
  ATOM_ROW_OFFSET,
  BATTERY_Y,
  BLOCK_HEIGHT,
  BLOCK_LARGE_X,
  BLOCK_SMALL_X,
  BLOCK_WIDTH,
  BULB_RADIUS,
  BULB_Y,
  CELL_GAP,
  CELL_LONG_HALF,
  CELL_SHORT_HALF,
  CURRENT_ARROW_FROM,
  DIRECTION_ARROW_LEN,
  DIRECTION_Y,
  ELECTRON_ARROW_FROM,
  LOOP_BOTTOM,
  LOOP_LEFT,
  LOOP_RIGHT,
  LOOP_TOP,
  ROOM_COLUMN,
  SCENE_BOUNDS,
  SWITCH_CONTACT_X,
  SWITCH_OPEN_ANGLE,
  SWITCH_PIVOT_X,
  TUBE_BOTTOM,
  TUBE_HALF,
  TUBE_TOP,
  text,
} from './schema';
import type { JouleHeatingState } from './state';

/** 도선 굵기(화면 px). */
const WIRE_PX = 2;
/** 스위치 레버 굵기(화면 px) · 축과 닿는 점의 반지름(월드). */
const LEVER_PX = 2.5;
const SWITCH_DOT_RADIUS = 0.05;
/** 전지 긴 판(+) · 짧은 판(−) 굵기(화면 px). 짧은 판이 굵은 것이 전지 기호의 관례다. */
const CELL_LONG_PX = 2;
const CELL_SHORT_PX = 4;
/** 저항 덩어리 속 채움 불투명도 — 도선을 가리되 원자가 또렷하도록 옅게. */
const BLOCK_FILL_OPACITY = 0.1;
/** 원자 반지름(화면 px). 전자 알갱이보다 커서 둘이 크기로 갈린다. */
const ATOM_PX = 4;
/** 전자 알갱이 반지름(화면 px). */
const CARRIER_PX = 2.5;
/** 알갱이 꼬리 굵기(화면 px) · 짙기. */
const TRAIL_PX = 2.5;
const TRAIL_OPACITY = 0.55;
/** 온도계 관 굵기(화면 px) · 막대 채움 불투명도. */
const TUBE_PX = 1.5;
const COLUMN_FILL_OPACITY = 0.9;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 방향 화살표 굵기(화면 px). */
const DIRECTION_ARROW_PX = 2;
/** 이름표 띄움(화면 px) — 저항 이름표는 덩어리 위, 전지 이름표는 전지 왼쪽, T 는 관 위. */
const RESISTOR_LABEL_GAP_PX = 14;
const BATTERY_LABEL_GAP_PX = 32;
const TEMPERATURE_LABEL_GAP_PX = 10;
/** 전지 판 곁의 알갱이를 가리는 여유(월드). */
const BATTERY_HIDE_MARGIN = 0.06;
/** 원자 격자의 시드 줄 — 두 덩어리가 다른 떨림을 갖게. */
const STREAM_LARGE = 1;
const STREAM_SMALL = 2;

/** 저항 덩어리 한 벌 — 가운데 x, 저항, 떨림 시드 줄. */
interface Block {
  id: 'large' | 'small';
  x: number;
  resistance: number;
  stream: number;
}

export function scene(params: {
  state: JouleHeatingState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('joule-heating: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  // 덩어리 둘의 목록은 코드 표로 남는다 — 스테이지 상수가 수 하나씩뿐이다 (NOTES (c) G105).
  const blocks: Block[] = [
    { id: 'large', x: BLOCK_LARGE_X, resistance: c.resistanceLarge, stream: STREAM_LARGE },
    { id: 'small', x: BLOCK_SMALL_X, resistance: c.resistanceSmall, stream: STREAM_SMALL },
  ];
  const current = seriesCurrent(c);

  pushWiring(out, c, timeline);
  for (const block of blocks) {
    const rise = temperatureRise(timeline, heatingRate(current, block.resistance, c.heatCapacity));
    pushBlock(out, block, rise, c, timeline);
    pushThermometer(out, block, rise, c);
  }
  pushCarriers(out, c, current, timeline);
  pushDirection(out);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

// ------------------------------------------------------------------------
// 도선 · 전지 · 스위치
// ------------------------------------------------------------------------

function pushWiring(out: Primitive[], c: JouleHeatingConstants, tl: TimelineFrame): void {
  const wire = { colorRole: 'muted', emphasis: 'strong' } as const;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const plus = BATTERY_Y + CELL_GAP / 2;
  const minus = BATTERY_Y - CELL_GAP / 2;

  // 도선은 전지와 스위치에서 끊어 둘로 긋는다. 윗변은 끊지 않는다 — 덩어리가 그 위를 덮는다.
  out.push({
    type: 'trajectory',
    id: 'wire-right',
    points: [
      [SWITCH_CONTACT_X, LOOP_BOTTOM],
      [LOOP_RIGHT, LOOP_BOTTOM],
      [LOOP_RIGHT, LOOP_TOP],
      [LOOP_LEFT, LOOP_TOP],
      [LOOP_LEFT, plus],
    ],
    width: WIRE_PX,
    style: wire,
  });
  out.push({
    type: 'trajectory',
    id: 'wire-left',
    points: [
      [LOOP_LEFT, minus],
      [LOOP_LEFT, LOOP_BOTTOM],
      [SWITCH_PIVOT_X, LOOP_BOTTOM],
    ],
    width: WIRE_PX,
    style: wire,
  });

  // ---- 전지 — 긴 판(+) 위, 짧은 판(−) 아래 ----
  out.push({
    type: 'lineSet',
    id: 'battery-plus',
    lines: [
      [
        [LOOP_LEFT - CELL_LONG_HALF, plus],
        [LOOP_LEFT + CELL_LONG_HALF, plus],
      ],
    ],
    width: CELL_LONG_PX,
    style: ink,
  });
  out.push({
    type: 'lineSet',
    id: 'battery-minus',
    lines: [
      [
        [LOOP_LEFT - CELL_SHORT_HALF, minus],
        [LOOP_LEFT + CELL_SHORT_HALF, minus],
      ],
    ],
    width: CELL_SHORT_PX,
    style: ink,
  });
  out.push({
    type: 'readout',
    id: 'battery-label',
    anchor: { world: [LOOP_LEFT, BATTERY_Y], offset: [-BATTERY_LABEL_GAP_PX, 0] },
    text: text('label.voltage'),
    vars: { v: String(c.voltage) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'right',
    style: ink,
  });

  // ---- 스위치 — 축에서 닿는 점 쪽으로 뻗은 레버. 열리면 위로 들린다 ----
  const angle = switchAngle(tl, SWITCH_OPEN_ANGLE);
  const lever = SWITCH_CONTACT_X - SWITCH_PIVOT_X;
  out.push({
    type: 'trajectory',
    id: 'switch-lever',
    points: [
      [SWITCH_PIVOT_X, LOOP_BOTTOM],
      [SWITCH_PIVOT_X + lever * Math.cos(angle), LOOP_BOTTOM + lever * Math.sin(angle)],
    ],
    width: LEVER_PX,
    style: ink,
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
      size: SWITCH_DOT_RADIUS,
      outline: 'none',
      glow: false,
      style: ink,
    });
  }
}

// ------------------------------------------------------------------------
// 저항 덩어리 — 떨리는 원자 격자
// ------------------------------------------------------------------------

function pushBlock(
  out: Primitive[],
  block: Block,
  rise: number,
  c: JouleHeatingConstants,
  tl: TimelineFrame,
): void {
  const left = block.x - BLOCK_WIDTH / 2;
  const right = block.x + BLOCK_WIDTH / 2;
  const bottom = LOOP_TOP - BLOCK_HEIGHT / 2;
  const top = LOOP_TOP + BLOCK_HEIGHT / 2;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;

  out.push({
    type: 'region',
    id: `block-${block.id}`,
    points: [
      [left, bottom],
      [right, bottom],
      [right, top],
      [left, top],
    ],
    opaque: true,
    fillOpacity: BLOCK_FILL_OPACITY,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: ink,
  });
  out.push({
    type: 'readout',
    id: `block-label-${block.id}`,
    anchor: { world: [block.x, top], offset: [0, -RESISTOR_LABEL_GAP_PX] },
    text: text('label.resistance'),
    vars: { r: String(block.resistance) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'center',
    style: ink,
  });

  // 원자는 도선(전자가 지나는 줄) 위 · 아래 두 줄. 떨림 폭은 오른 온도에 따라 커진다.
  const amplitude = c.jitterRest + c.jitterPerKelvin * rise;
  const count = ATOM_COLUMNS * 2;
  const voices = jitterVoices(c.seed, block.stream, count, c.jitterFreqMin, c.jitterFreqMax);
  const pitch = BLOCK_WIDTH / ATOM_COLUMNS;
  const positions: Vec2[] = [];
  for (let row = 0; row < 2; row++) {
    const y = LOOP_TOP + (row === 0 ? ATOM_ROW_OFFSET : -ATOM_ROW_OFFSET);
    for (let col = 0; col < ATOM_COLUMNS; col++) {
      const [dx, dy] = jitterOffset(voices[row * ATOM_COLUMNS + col]!, tl.t, amplitude);
      positions.push([left + (col + 0.5) * pitch + dx, y + dy]);
    }
  }
  out.push({
    type: 'particleSystem',
    id: `atoms-${block.id}`,
    positions,
    sizes: ATOM_PX,
    style: ink,
  });
}

// ------------------------------------------------------------------------
// 온도계 — 덩어리 바로 아래
// ------------------------------------------------------------------------

function pushThermometer(out: Primitive[], block: Block, rise: number, c: JouleHeatingConstants): void {
  const heat = { colorRole: 'accent', emphasis: 'strong' } as const;
  const tube = { colorRole: 'muted', emphasis: 'strong' } as const;
  const x0 = block.x - TUBE_HALF;
  const x1 = block.x + TUBE_HALF;
  const level = TUBE_BOTTOM + ROOM_COLUMN + rise * c.columnWorldPerKelvin;

  out.push({
    type: 'region',
    id: `column-${block.id}`,
    points: [
      [x0, BULB_Y],
      [x1, BULB_Y],
      [x1, level],
      [x0, level],
    ],
    opaque: true,
    fillOpacity: COLUMN_FILL_OPACITY,
    style: heat,
  });
  out.push({
    type: 'lineSet',
    id: `tube-${block.id}`,
    lines: [
      [
        [x0, TUBE_BOTTOM],
        [x0, TUBE_TOP],
        [x1, TUBE_TOP],
        [x1, TUBE_BOTTOM],
      ],
    ],
    width: TUBE_PX,
    style: tube,
  });
  out.push({
    type: 'body',
    id: `bulb-${block.id}`,
    pos: [block.x, BULB_Y],
    shape: 'circle',
    size: BULB_RADIUS,
    outline: 'none',
    glow: false,
    style: heat,
  });
  out.push({
    type: 'readout',
    id: `thermometer-label-${block.id}`,
    anchor: { world: [block.x, TUBE_TOP], offset: [0, -TEMPERATURE_LABEL_GAP_PX] },
    text: text('label.temperature'),
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'center',
    style: tube,
  });
}

// ------------------------------------------------------------------------
// 전자 알갱이 — 두 덩어리를 같은 빠르기로 지난다
// ------------------------------------------------------------------------

/**
 * 전자가 도는 닫힌 길. 전지의 + 판이 위라 관례 전류는 윗변을 왼쪽에서 오른쪽으로 가고,
 * 전자는 그 반대로 돈다 — 왼쪽 변을 아래로(전지를 지나), 아랫변을 오른쪽으로(스위치를 지나),
 * 오른쪽 변을 위로, 윗변을 오른쪽에서 왼쪽으로(두 덩어리를 지나).
 */
function electronPath(): Vec2[] {
  return [
    [LOOP_LEFT, LOOP_TOP],
    [LOOP_LEFT, LOOP_BOTTOM],
    [LOOP_RIGHT, LOOP_BOTTOM],
    [LOOP_RIGHT, LOOP_TOP],
  ];
}

function pushCarriers(out: Primitive[], c: JouleHeatingConstants, current: number, tl: TimelineFrame): void {
  const path = electronPath();
  const lengths = cumulativeLengths(path);
  const loopLength = lengths[lengths.length - 1]!;
  const speed = current * c.flowSpeedPerAmp;
  const trailLength = currentOn(tl) ? speed * c.trailSeconds : 0;
  const n = carrierCount(loopLength, c.carrierSpacing);
  const pitch = loopLength / n;
  const offset = flowDistance(tl, speed, loopLength);
  // 전지 판이 차지하는 호길이 구간 — 길의 첫 변(왼쪽 변, 위에서 아래로) 위에 있다.
  const hidden: [number, number] = [
    LOOP_TOP - (BATTERY_Y + CELL_GAP / 2) - BATTERY_HIDE_MARGIN,
    LOOP_TOP - (BATTERY_Y - CELL_GAP / 2) + BATTERY_HIDE_MARGIN,
  ];
  // 스위치 틈 — 길의 둘째 변(아랫변, 왼쪽에서 오른쪽으로) 위. 레버가 들린 동안 틈에 든 알갱이는
  // 공중에 뜬 것처럼 보여 가린다.
  const bottomStart = lengths[1]!;
  const switchGap: [number, number] = [
    bottomStart + (SWITCH_PIVOT_X - LOOP_LEFT),
    bottomStart + (SWITCH_CONTACT_X - LOOP_LEFT),
  ];
  const leverUp = switchAngle(tl, SWITCH_OPEN_ANGLE) > 0;
  const positions: Vec2[] = [];
  const trails: Vec2[][] = [];
  for (let k = 0; k < n; k++) {
    const s = (offset + k * pitch) % loopLength;
    if (s >= hidden[0] && s <= hidden[1]) continue;
    if (leverUp && s > switchGap[0] && s < switchGap[1]) continue;
    positions.push(pointAt(path, lengths, s));
    if (trailLength <= 0) continue;
    for (const [a, b] of visibleArcs(s - trailLength, s, loopLength, hidden)) {
      trails.push(subPath(path, lengths, a, b));
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
}

// ------------------------------------------------------------------------
// 방향 표식 — 아랫변 밑에 한 번. 아랫변에서 전자는 오른쪽으로, 관례 전류 I 는 왼쪽으로
// ------------------------------------------------------------------------

function pushDirection(out: Primitive[]): void {
  out.push({
    type: 'vector',
    id: 'direction-electron',
    from: [ELECTRON_ARROW_FROM, DIRECTION_Y],
    delta: [DIRECTION_ARROW_LEN, 0],
    label: text('label.electron'),
    labelSide: 'ccw',
    width: DIRECTION_ARROW_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'direction-current',
    from: [CURRENT_ARROW_FROM, DIRECTION_Y],
    delta: [-DIRECTION_ARROW_LEN, 0],
    label: text('label.current'),
    labelSide: 'cw',
    width: DIRECTION_ARROW_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
