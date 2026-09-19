// ========================================================================
// resistance-and-geometry — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 도선 막대(region) · 이음 도선과
// 레일(trajectory) · 전지 판(lineSet) · 전자 알갱이와 꼬리(particleSystem, clip) · 이음매
// 점선(trajectory dashed) · 출구 문(lineSet) · 무더기(particleSystem) · 방향 표식(vector) ·
// 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 전자는 primary(도선 속 알갱이와 무더기의 알갱이가 같은 대상이라 같은
// 색), **강조색은 「지금 세는 출구」 한 가지 뜻에만**. 도선 막대 · 전지 · 이름표는 먹색,
// 이음 도선 · 레일 · 이음매는 배경 정보라 muted.
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
  laneOffsets,
  lanesOf,
  passedCount,
  readConstants,
  speedOf,
  type ResistanceAndGeometryConstants,
  type WireShape,
} from './physics';
import {
  BATTERY_X,
  CELL_GAP,
  CELL_LONG_HALF,
  CELL_SHORT_HALF,
  DIRECTION_CURRENT_Y,
  DIRECTION_ELECTRON_Y,
  DIRECTION_FROM_X,
  DIRECTION_LEN,
  PILE_START_X,
  RAIL_LEFT_X,
  RAIL_RIGHT_X,
  ROW_BASE_Y,
  ROW_LONG_Y,
  ROW_THICK_Y,
  SCENE_BOUNDS,
  TOP_WIRE_Y,
  WIRE_EXIT_X,
  text,
} from './schema';
import type { ResistanceAndGeometryState } from './state';

/** 이음 도선 · 레일 굵기(화면 px). 도선 막대보다 가늘어 「저항은 막대」 가 모양으로 읽힌다. */
const LEAD_PX = 2;
/** 도선 막대 채움 불투명도. 알갱이가 그 위에서 또렷해야 해 옅다. */
const BAR_FILL_OPACITY = 0.1;
/** 전지 긴 판(+) · 짧은 판(−) 굵기(화면 px). 짧은 판이 굵은 것이 전지 기호의 관례다. */
const CELL_LONG_PX = 2;
const CELL_SHORT_PX = 4;
/** 전자 알갱이 반지름(화면 px). 세 도선 · 무더기가 같다. */
const CARRIER_PX = 2.6;
/** 알갱이 꼬리 굵기(화면 px) · 짙기. 빠르기가 꼬리 길이로 읽혀야 해 알갱이만큼 짙지는 않게. */
const TRAIL_PX = 2.5;
const TRAIL_OPACITY = 0.5;
/** 이음매 점선 굵기(화면 px) · 막대 밖으로 삐져나오는 길이(월드). 막대 윤곽보다 가늘되, 삐져나와 이음매로 읽힌다. */
const SEAM_PX = 1.5;
const SEAM_OVERHANG = 0.08;
/** 출구 문 굵기(화면 px) · 막대 위아래로 삐져나가는 길이(월드). */
const GATE_PX = 2.5;
const GATE_OVERHANG = 0.1;
/** 이름표 글자 크기(화면 px) · 막대 위 띄움 · 전지 위 띄움(화면 px). */
const LABEL_PX = 13;
const WIRE_LABEL_GAP_PX = 12;
const BATTERY_LABEL_GAP_PX = 22;
/** 방향 화살표 굵기(화면 px). */
const DIRECTION_ARROW_PX = 2;

/** 도선 한 벌의 선언 — 형태 · 줄 높이 · 이름표. */
interface Wire {
  id: 'base' | 'long' | 'thick';
  shape: WireShape;
  y: number;
  label: LocalizedText;
  vars: Record<string, string>;
}

export function scene(params: {
  state: ResistanceAndGeometryState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('resistance-and-geometry: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  // 도선 셋의 목록은 코드 표로 남는다 — 스테이지 상수가 수 하나씩뿐이다 (NOTES (c) G105).
  // 줄마다의 값은 `baseLength` · `baseArea` · `lengthFactor` · `areaFactor` 로 흩었다.
  const base: WireShape = { length: c.baseLength, area: c.baseArea };
  const wires: Wire[] = [
    { id: 'base', shape: base, y: ROW_BASE_Y, label: text('label.wireBase'), vars: {} },
    {
      id: 'long',
      shape: { length: c.baseLength * c.lengthFactor, area: c.baseArea },
      y: ROW_LONG_Y,
      label: text('label.wireLong'),
      vars: { lf: String(c.lengthFactor) },
    },
    {
      id: 'thick',
      shape: { length: c.baseLength, area: c.baseArea * c.areaFactor },
      y: ROW_THICK_Y,
      label: text('label.wireThick'),
      vars: { af: String(c.areaFactor) },
    },
  ];

  pushSupply(out, c);
  for (const wire of wires) pushWire(out, wire, base, c, timeline);
  pushDirection(out);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

// ------------------------------------------------------------------------
// 전지와 레일 — 세 도선이 같은 두 레일에 걸려 같은 전압을 받는다
// ------------------------------------------------------------------------

function pushSupply(out: Primitive[], c: ResistanceAndGeometryConstants): void {
  const lead = { colorRole: 'muted', emphasis: 'strong' } as const;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const minusX = BATTERY_X - CELL_GAP / 2;
  const plusX = BATTERY_X + CELL_GAP / 2;

  // 위 도선 — 전지 판 사이를 비워 둘로. 왼쪽 레일 · 오른쪽 레일로 이어져 내려간다.
  out.push({
    type: 'trajectory',
    id: 'supply-left',
    points: [
      [minusX, TOP_WIRE_Y],
      [RAIL_LEFT_X, TOP_WIRE_Y],
      [RAIL_LEFT_X, ROW_THICK_Y],
    ],
    width: LEAD_PX,
    style: lead,
  });
  out.push({
    type: 'trajectory',
    id: 'supply-right',
    points: [
      [plusX, TOP_WIRE_Y],
      [RAIL_RIGHT_X, TOP_WIRE_Y],
      [RAIL_RIGHT_X, ROW_THICK_Y],
    ],
    width: LEAD_PX,
    style: lead,
  });

  // 전지 — 긴 판(+)이 오른쪽. 전자는 − 에서 나와 도선을 지나 + 로 간다(왼쪽 → 오른쪽).
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
    style: ink,
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
    style: ink,
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
    style: ink,
  });
}

// ------------------------------------------------------------------------
// 도선 한 벌 — 막대 · 이음매 · 알갱이 · 출구 · 무더기
// ------------------------------------------------------------------------

function pushWire(
  out: Primitive[],
  wire: Wire,
  base: WireShape,
  c: ResistanceAndGeometryConstants,
  tl: TimelineFrame,
): void {
  const { shape, y } = wire;
  const x0 = WIRE_EXIT_X - shape.length;
  const x1 = WIRE_EXIT_X;
  const yLo = y - shape.area / 2;
  const yHi = y + shape.area / 2;
  const lead = { colorRole: 'muted', emphasis: 'strong' } as const;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const electron = { colorRole: 'primary', emphasis: 'strong' } as const;

  // ---- 이음 도선 — 레일에서 막대 입구까지, 막대 출구에서 레일까지 ----
  const leads: Vec2[][] = [
    [
      [x1, y],
      [RAIL_RIGHT_X, y],
    ],
  ];
  if (x0 > RAIL_LEFT_X) {
    leads.push([
      [RAIL_LEFT_X, y],
      [x0, y],
    ]);
  }
  out.push({ type: 'lineSet', id: `leads-${wire.id}`, lines: leads, width: LEAD_PX, style: lead });

  // ---- 막대 — 길이가 도선 길이, 두께가 단면적 ----
  out.push({
    type: 'region',
    id: `bar-${wire.id}`,
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
    style: ink,
  });

  // ---- 전자 알갱이 ----
  // 레인 간격 · 앞뒤 간격은 세 도선이 같다(같은 재료). 빠르기만 형태에 따라 다르다.
  const speed = speedOf(c, shape, base, tl);
  const lanes = lanesOf(c, shape);
  const laneGap = shape.area / lanes;
  const positions: Vec2[] = [];
  for (let j = 0; j < lanes; j++) {
    const ly = yHi - (j + 0.5) * laneGap;
    for (const s of laneOffsets(c, shape.length, speed, j, tl.t)) positions.push([x0 + s, ly]);
  }
  out.push({
    type: 'particleSystem',
    id: `carriers-${wire.id}`,
    positions,
    velocities: positions.map((): Vec2 => [speed, 0]),
    sizes: CARRIER_PX,
    trail: true,
    trailStyle: { seconds: c.trailSeconds, width: TRAIL_PX, opacity: TRAIL_OPACITY },
    // 입구로 돌아온 알갱이의 꼬리가 막대 밖 이음 도선 위로 삐지지 않게 막대 안에서만.
    clip: { min: [x0, yLo], max: [x1, yHi] },
    style: electron,
  });

  // ---- 이음매 — 긴 도선은 기준 도선을 이어 붙인 것, 굵은 도선은 나란히 붙인 것 ----
  // 알갱이 위에 긋는다 — 아래에 깔면 알갱이와 꼬리에 묻혀 보이지 않았다(2차 촬영).
  const seams: Vec2[][] = [];
  for (let k = 1; k < Math.round(shape.length / base.length); k++) {
    const x = x0 + k * base.length;
    seams.push([
      [x, yLo - SEAM_OVERHANG],
      [x, yHi + SEAM_OVERHANG],
    ]);
  }
  for (let k = 1; k < Math.round(shape.area / base.area); k++) {
    const sy = yLo + k * base.area;
    seams.push([
      [x0 - SEAM_OVERHANG, sy],
      [x1 + SEAM_OVERHANG, sy],
    ]);
  }
  seams.forEach((points, k) => {
    out.push({
      type: 'trajectory',
      id: `seam-${wire.id}-${k}`,
      points,
      width: SEAM_PX,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  });

  // ---- 이름표 — 막대 위 가운데 ----
  out.push({
    type: 'readout',
    id: `wire-label-${wire.id}`,
    anchor: { world: [(x0 + x1) / 2, yHi], offset: [0, -WIRE_LABEL_GAP_PX] },
    text: wire.label,
    vars: wire.vars,
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'center',
    style: ink,
  });

  // ---- 출구 문 — 세는 동안만 ----
  if (tl.phase === 'count') {
    out.push({
      type: 'lineSet',
      id: `gate-${wire.id}`,
      lines: [
        [
          [x1, yLo - GATE_OVERHANG],
          [x1, yHi + GATE_OVERHANG],
        ],
      ],
      width: GATE_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 무더기 — 세는 동안 출구를 지난 알갱이. 줄 수가 같아 개수의 비가 폭의 비다 ----
  const count = passedCount(c, shape.length, speed, lanes, tl);
  if (count > 0) {
    const rows = Math.max(1, Math.round(c.pileRows));
    const pile: Vec2[] = [];
    for (let i = 0; i < count; i++) {
      const col = Math.floor(i / rows);
      const row = i % rows;
      pile.push([PILE_START_X + col * c.pilePitchX, y + ((rows - 1) / 2 - row) * c.pilePitchY]);
    }
    out.push({
      type: 'particleSystem',
      id: `pile-${wire.id}`,
      positions: pile,
      sizes: CARRIER_PX,
      opacity: 1 - tl.at('fade'),
      style: electron,
    });
  }
}

// ------------------------------------------------------------------------
// 방향 표식 — 기준 도선의 왼쪽 이음 도선 위 · 아래에 한 번만
// ------------------------------------------------------------------------

function pushDirection(out: Primitive[]): void {
  // 전자는 − 판(왼쪽 레일)에서 + 판(오른쪽 레일)으로, 관례 전류 I 는 그 반대로 간다.
  out.push({
    type: 'vector',
    id: 'direction-electron',
    from: [DIRECTION_FROM_X, DIRECTION_ELECTRON_Y],
    delta: [DIRECTION_LEN, 0],
    label: text('label.electron'),
    labelSide: 'ccw',
    width: DIRECTION_ARROW_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'direction-current',
    from: [DIRECTION_FROM_X + DIRECTION_LEN, DIRECTION_CURRENT_Y],
    delta: [-DIRECTION_LEN, 0],
    label: text('label.current'),
    labelSide: 'ccw',
    width: DIRECTION_ARROW_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
