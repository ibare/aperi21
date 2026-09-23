// ========================================================================
// series-parallel-resistors — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 도선 · 전지 두 판 ·
// 세는 문(lineSet) · 저항 기호(circuitElement) · 마디(terminal) · 전자
// (particleSystem) · 기둥 칸(region) · 기준선(trajectory) · 값과 이름표(readout)
// 가 모두 어휘로 있다.
//
// 색은 뜻마다 하나다 — 도선 · 전지 · 저항 · 마디는 먹색(세 회로가 같은 부품이다),
// 전자와 그 전자가 쌓인 기둥은 primary(기둥은 문을 지난 전하 그 자체다),
// **강조색은 「하나만 일 때의 높이」 한 가지 뜻에만** (기준선). 문 · 기둥 바닥 ·
// 이름표는 배경 정보라 muted.
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
  batteryOf,
  buildCells,
  carriersOn,
  columnAlpha,
  columnHeight,
  comparing,
  counting,
  gateOf,
  MINUS_Y,
  PLUS_Y,
  readConstants,
  trailsOn,
  wirePieces,
  type Arrangement,
  type Cell,
  type SeriesParallelResistorsConstants,
} from './physics';
import {
  BATTERY_LONG_HALF,
  BATTERY_SHORT_HALF,
  CELL_BOTTOM_Y,
  COLUMN_BASE_Y,
  COLUMN_CELL_GAP,
  COLUMN_LABEL_Y,
  COLUMN_WIDTH,
  GATE_HALF,
  SCENE_BOUNDS,
  text,
  type SeriesParallelResistorsMessageKey,
} from './schema';
import type { SeriesParallelResistorsState } from './state';

// ---- 화면 치수. 숫자를 primitive 안에 박지 않는다 (C2) ----

/** 도선 굵기(화면 px). */
const WIRE_PX = 2;
/** 전지 판 굵기. 도선보다 굵어야 판으로 읽힌다. */
const BATTERY_PX = 3;
/** 세는 문 굵기. */
const GATE_PX = 2.5;
/** 세지 않는 동안 문의 짙기. */
const GATE_IDLE = 0.3;
/** 전자 점의 반지름(화면 px). */
const CARRIER_PX = 2.2;
/** 전자 꼬리의 굵기와 짙기. 꼬리는 길을 따라 잘린 lineSet 이다(G181). */
const TRAIL_PX = 2;
const TRAIL_ALPHA = 0.6;
/** 기둥 칸의 채움 짙기. */
const COLUMN_FILL = 0.9;
/** 기둥 바닥선의 굵기와 도드라진 길이(월드). */
const COLUMN_BASE_PX = 1.5;
const COLUMN_BASE_OVERHANG = 0.14;
/** 기준선 굵기와 기둥 바깥으로 뻗는 길이(월드). */
const REF_PX = 1.5;
const REF_OVERHANG = 0.3;
/** 값 칩이 기둥 꼭대기에서 띄워지는 거리(월드). */
const CHIP_RISE = 0.24;
/** 전지 이름표가 전지 왼쪽으로 띄워지는 거리(월드). */
const BATTERY_LABEL_GAP = 0.72;
/** 전자 표식 화살표의 길이와 아래 도선에서 내려간 거리(월드). */
const ELECTRON_ARROW_LEN = 0.55;
const ELECTRON_ARROW_DROP = 0.38;
/** 전자 표식 글자가 화살표 아래로 더 내려가는 거리(월드). */
const ELECTRON_NAME_DROP = 0.34;
/** 전자 표식이 놓이는 아래 도선 위 자리(가로 폭에 대한 비). */
const ELECTRON_ARROW_AT = 0.76;
/** 값 칩 · 이름표의 글자 크기(화면 px). */
const VALUE_PX = 11;
const NAME_PX = 12;

/** 배치 이름 문안 키. 배치가 늘면 여기서 타입이 막는다. */
const NAME_KEY: Record<Arrangement, SeriesParallelResistorsMessageKey> = {
  single: 'label.single',
  series: 'label.series',
  parallel: 'label.parallel',
};

/** 기둥 하나의 칸 사각형들. 다 찬 칸은 틈을 두고 쌓이고, 자라는 중인 칸은 그만큼만 찬다. */
function columnRects(centerX: number, height: number, unit: number): Vec2[][] {
  const left = centerX - COLUMN_WIDTH / 2;
  const right = centerX + COLUMN_WIDTH / 2;
  const filled = Math.floor(height / unit + 1e-9);
  const rest = height - filled * unit;
  const rects: Vec2[][] = [];
  const add = (y0: number, y1: number): void => {
    if (y1 - y0 <= 0) return;
    rects.push([
      [left, y0],
      [right, y0],
      [right, y1],
      [left, y1],
    ]);
  };
  for (let i = 0; i < filled; i++) {
    const y0 = COLUMN_BASE_Y + i * unit;
    add(y0, y0 + unit - COLUMN_CELL_GAP);
  }
  const y0 = COLUMN_BASE_Y + filled * unit;
  add(y0, y0 + Math.min(rest, unit - COLUMN_CELL_GAP));
  return rects;
}

/** 다 그려진 기둥의 꼭대기 — 값 칩과 기준선이 여기에 맞춘다. */
function columnTop(height: number): number {
  return COLUMN_BASE_Y + Math.max(height - COLUMN_CELL_GAP, 0);
}

/** 전지 두 판 — 긴 판이 + (아래), 짧은 판이 − (위). 전자는 − 에서 나온다. */
function batteryPlates(cell: Cell): Vec2[][] {
  const [bx] = batteryOf(cell);
  return [
    [
      [bx - BATTERY_SHORT_HALF, MINUS_Y],
      [bx + BATTERY_SHORT_HALF, MINUS_Y],
    ],
    [
      [bx - BATTERY_LONG_HALF, PLUS_Y],
      [bx + BATTERY_LONG_HALF, PLUS_Y],
    ],
  ];
}

export function scene(params: {
  state: SeriesParallelResistorsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('series-parallel-resistors: schema.timeline 이 선언되어야 한다');
  const c: SeriesParallelResistorsConstants = readConstants(stage);
  const cells = buildCells(c);
  const alpha = columnAlpha(timeline);
  const out: Primitive[] = [];

  // ---- 도선 — 저항 기호가 차지한 자리는 비워 둔다(기호가 제 리드선을 그린다) ----
  out.push({
    type: 'lineSet',
    id: 'wires',
    lines: cells.flatMap((cell) => cell.strands.flatMap((s) => wirePieces(s))),
    width: WIRE_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 전지 — 두 판(G178). 세 회로가 같은 전지다 ----
  out.push({
    type: 'lineSet',
    id: 'batteries',
    lines: cells.flatMap((cell) => batteryPlates(cell)),
    width: BATTERY_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 세는 문 — 전지 바로 위, 막 나온 전하가 지나는 자리. 세는 동안만 짙다 ----
  out.push({
    type: 'lineSet',
    id: 'gates',
    lines: cells.map((cell) => {
      const [gx, gy] = gateOf(cell);
      return [
        [gx, gy - GATE_HALF],
        [gx, gy + GATE_HALF],
      ] as Vec2[];
    }),
    width: GATE_PX,
    opacity: counting(timeline) ? 1 : GATE_IDLE,
    style: { colorRole: counting(timeline) ? 'ink' : 'muted', emphasis: 'strong' },
  });

  // ---- 마디 — 병렬에서 갈라지고 다시 모이는 자리 ----
  for (const cell of cells) {
    cell.junctions.forEach((pos, i) => {
      out.push({ type: 'terminal', id: `${cell.arrangement}-node-${i}`, pos, kind: 'junction' });
    });
  }

  // ---- 저항 — 다섯 기호가 모두 같은 값이다. 값 글자는 선언한 스테이지 상수 그대로 ----
  for (const cell of cells) {
    cell.resistors.forEach((pos, i) => {
      out.push({
        type: 'circuitElement',
        id: `${cell.arrangement}-r${i}`,
        subtype: 'resistor',
        pos,
        rotation: 0,
        value: c.resistance,
        unit: 'Ω',
      });
    });
  }

  // ---- 전자 — 간격은 세 회로에서 같고 빠르기가 전류다. 꼬리 길이 = 빠르기 × 시간 ----
  for (const cell of cells) {
    for (const s of cell.strands) {
      const trails = trailsOn(s, c, timeline.t);
      if (trails.length > 0) {
        out.push({
          type: 'lineSet',
          id: `trails-${s.id}`,
          lines: trails,
          width: TRAIL_PX,
          opacity: TRAIL_ALPHA,
          style: { colorRole: 'primary', emphasis: 'strong' },
        });
      }
      const carriers = carriersOn(s, c, timeline.t);
      if (carriers.positions.length === 0) continue;
      out.push({
        type: 'particleSystem',
        id: `carriers-${s.id}`,
        positions: carriers.positions,
        sizes: CARRIER_PX,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    }
  }

  // ---- 무엇이 흐르는지 한 번만 밝힌다. 전자는 관례 전류와 반대로 간다 ----
  // 표식은 화살표에 붙이지 않고 따로 둔다 — 화살표 이름은 아래 도선 위에 얹혀 잘렸다(1차 촬영).
  const first = cells[0]!;
  const markX = first.x0 + first.w * ELECTRON_ARROW_AT;
  const markY = CELL_BOTTOM_Y - ELECTRON_ARROW_DROP;
  out.push({
    type: 'vector',
    id: 'electron-mark',
    from: [markX, markY],
    delta: [-ELECTRON_ARROW_LEN, 0],
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'electron-name',
    anchor: { world: [markX - ELECTRON_ARROW_LEN / 2, markY - ELECTRON_NAME_DROP] },
    text: text('label.electron'),
    chip: false,
    fontSize: VALUE_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 기둥 바닥 — 셋이 같은 높이에서 출발한다 ----
  out.push({
    type: 'lineSet',
    id: 'column-bases',
    lines: cells.map(
      (cell): Vec2[] => [
        [cell.centerX - COLUMN_WIDTH / 2 - COLUMN_BASE_OVERHANG, COLUMN_BASE_Y],
        [cell.centerX + COLUMN_WIDTH / 2 + COLUMN_BASE_OVERHANG, COLUMN_BASE_Y],
      ],
    ),
    width: COLUMN_BASE_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 기둥 — 같은 동안 전지에서 나온 전하. 칸 사이 틈이 있어 셀 수 있다 ----
  for (const cell of cells) {
    const h = columnHeight(timeline, c, cell.current);
    columnRects(cell.centerX, h, c.columnUnit).forEach((points, i) => {
      out.push({
        type: 'region',
        id: `column-${cell.arrangement}-${i}`,
        points,
        fillOpacity: COLUMN_FILL,
        opaque: true,
        opacity: alpha,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    });
  }

  // ---- 기준선 — 「하나만 일 때의 높이」. 강조색은 이 한 뜻에만 ----
  if (comparing(timeline)) {
    const refY = columnTop(columnHeight(timeline, c, cells[0]!.current));
    const last = cells[cells.length - 1]!;
    out.push({
      type: 'trajectory',
      id: 'one-resistor-level',
      points: [
        [first.centerX - COLUMN_WIDTH / 2 - REF_OVERHANG, refY],
        [last.centerX + COLUMN_WIDTH / 2 + REF_OVERHANG, refY],
      ],
      width: REF_PX,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
    });

    // 배치마다 전지가 내주는 전류 — 계산값이 아니라 선언한 스테이지 상수다
    for (const cell of cells) {
      const top = columnTop(columnHeight(timeline, c, cell.current));
      out.push({
        type: 'readout',
        id: `current-${cell.arrangement}`,
        anchor: { world: [cell.centerX, top + CHIP_RISE] },
        text: text('label.amps'),
        vars: { i: String(cell.current) },
        fontSize: VALUE_PX,
        opacity: alpha,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    }
  }

  // ---- 전지 전압 · 배치 이름 ----
  for (const cell of cells) {
    out.push({
      type: 'readout',
      id: `emf-${cell.arrangement}`,
      anchor: { world: [batteryOf(cell)[0] - BATTERY_LABEL_GAP, 0] },
      text: text('label.volts'),
      vars: { v: String(c.voltage) },
      fontSize: VALUE_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `name-${cell.arrangement}`,
      anchor: { world: [cell.centerX, COLUMN_LABEL_Y] },
      text: text(NAME_KEY[cell.arrangement]),
      chip: false,
      font: 'text',
      fontSize: NAME_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
