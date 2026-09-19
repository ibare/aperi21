// ========================================================================
// power-transmission — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 발전소 · 마을(body custom),
// 송전선(trajectory), 변압기 기호(겹친 두 원, body circle 테두리), 전류 알갱이(particleSystem),
// 전류 화살표(vector), 선에서 오르는 열 김(stream), 막대(region) · 막대 바닥(lineSet) ·
// 보낸 전력 기준(trajectory 점선), 이름표 · 배수 글자(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 전자 알갱이 · `e⁻` 표식 · 화살표 `I` 는 primary, 발전소 · 마을 · 변압기 · 마을이 받은
// 전력 막대 · 글자는 먹색, 송전선 · 막대 바닥 · 기준 점선은 배경 정보라 muted. **강조색은 「열」
// 한 가지 뜻에만** 쓴다 — 선에서 오르는 김과 열 막대, 그리고 그 막대의 배수 글자.
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
import { carrierXs, lineBudget, readConstants, type LineBudget, type PowerTransmissionConstants } from './physics';
import {
  BAR_BASE_DROP,
  BAR_HALF,
  COIL_RADIUS,
  COIL_SPACING,
  CURRENT_ARROW_DROP,
  CURRENT_ARROW_FROM,
  ELECTRON_ARROW_FROM,
  ELECTRON_ARROW_LEN,
  ELECTRON_ARROW_LIFT,
  LOSS_BAR_X,
  PLANT_HALF,
  PLANT_X,
  REFERENCE_OVERHANG,
  ROW_BOTTOM_Y,
  ROW_TOP_Y,
  SCENE_BOUNDS,
  STEP_DOWN_X,
  STEP_UP_X,
  TOWN_BAR_X,
  TOWN_HALF,
  TOWN_X,
  VOLTAGE_LABEL_X,
  WISP_COUNT,
  WISP_XS_FROM,
  WISP_XS_TO,
  text,
} from './schema';
import type { PowerTransmissionState } from './state';

/** 송전선 굵기(화면 px). */
const LINE_PX = 2.5;
/** 변압기 원 테두리는 body 기본 굵기를 쓴다. 이름표 글자 크기(화면 px) — 값 · 도식 이름 · 막대 이름. */
const VALUE_LABEL_PX = 13;
const NAME_LABEL_PX = 12;
const BAR_LABEL_PX = 11;
/** 배수 글자 크기(화면 px) — 주장을 맺는 글자라 이름표보다 크다. */
const FRACTION_PX = 15;
/** 전류 알갱이 반지름(화면 px). */
const CARRIER_PX = 2.5;
/** 전류 화살표 굵기(화면 px). */
const CURRENT_ARROW_PX = 2.5;
/** 전자 방향 표식 화살표 굵기(화면 px). */
const ELECTRON_ARROW_PX = 2;
/** 열 김 굵기 · 흩날림(화면 px). */
const WISP_PX = 3;
const WISP_JITTER_PX = 7;
/** 김이 선에서 떠나는 높이(월드) — 선 위 알갱이와 겹치지 않게 조금 띄운다. */
const WISP_LIFT = 0.08;
/** 막대 채움 불투명도. */
const BAR_FILL_OPACITY = 0.9;
/** 막대 바닥 · 기준 점선 굵기(화면 px). */
const BASELINE_PX = 1.5;
const REFERENCE_PX = 1.5;
/** 이름표 띄움(화면 px). */
const NAME_LABEL_GAP_PX = 12;
const VOLTAGE_LABEL_GAP_PX = 14;
const COIL_LABEL_GAP_PX = 12;
const BAR_LABEL_GAP_PX = 10;
const REFERENCE_LABEL_GAP_PX = 6;
const FRACTION_GAP_PX = 12;
const CURRENT_FRACTION_GAP_PX = 10;

/**
 * 발전소 외형 — 톱니 지붕 공장 + 굴뚝. `pos` 기준 월드 단위, y 위. 가운데 높이가 송전선 높이다.
 * 오른쪽 끝(`PLANT_HALF`)에서 송전선이 나간다.
 */
const PLANT_PATH =
  'M -0.45 -0.32 L 0.45 -0.32 L 0.45 0.12 L 0.15 0.32 L 0.15 0.12 L -0.15 0.32 L -0.15 0.12 ' +
  'L -0.26 0.12 L -0.26 0.5 L -0.4 0.5 L -0.4 0.12 L -0.45 0.12 Z';
/** 마을 외형 — 박공지붕 집 둘. 왼쪽 끝(`TOWN_HALF`)으로 송전선이 들어온다. */
const TOWN_PATH =
  'M -0.5 -0.32 L -0.06 -0.32 L -0.06 0.06 L -0.28 0.3 L -0.5 0.06 Z ' +
  'M 0.04 -0.32 L 0.5 -0.32 L 0.5 0.14 L 0.27 0.4 L 0.04 0.14 Z';

/** 한 줄 — 높이, 송전 전압, 변압기 유무, id 접두. */
interface Row {
  id: 'low' | 'high';
  y: number;
  voltage: number;
  stepped: boolean;
}

export function scene(params: {
  state: PowerTransmissionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('power-transmission: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  // 두 줄의 목록은 코드 표로 남는다 — 스테이지 상수가 수 하나씩뿐이다 (NOTES (c) G105).
  const rows: Row[] = [
    { id: 'low', y: ROW_TOP_Y, voltage: c.voltageLow, stepped: false },
    { id: 'high', y: ROW_BOTTOM_Y, voltage: c.voltageHigh, stepped: true },
  ];

  // 막대 · 배수 글자가 드러나는 몫 — 모두 단계 진행도다. 걷힘 단계에서 함께 걷힌다.
  const kept = 1 - timeline.at('clear');
  const reveal = {
    currentNote: timeline.at('current') * kept,
    loss: timeline.at('leak') * kept,
    lossNote: timeline.at('leakNote') * kept,
    delivered: timeline.at('arrive') * kept,
  };

  for (const row of rows) {
    const budget = lineBudget(c.power, row.voltage, c.lineResistance);
    pushLine(out, row, budget, c, timeline);
    pushEnds(out, row);
    pushCurrentArrow(out, row, budget, c, reveal.currentNote);
    pushBars(out, row, budget, c, reveal);
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

// ------------------------------------------------------------------------
// 송전선 · 변압기 · 전류 알갱이 · 열 김
// ------------------------------------------------------------------------

/** 변압기 기호가 차지하는 x 구간 — 겹친 두 원의 바깥 끝. */
function coilSpan(x: number): [number, number] {
  const reach = COIL_SPACING / 2 + COIL_RADIUS;
  return [x - reach, x + reach];
}

/** 송전선 구간들 — 승압한 줄은 변압기 기호에서 끊는다. */
function lineSegments(row: Row): [number, number][] {
  const start = PLANT_X + PLANT_HALF;
  const end = TOWN_X - TOWN_HALF;
  if (!row.stepped) return [[start, end]];
  const up = coilSpan(STEP_UP_X);
  const down = coilSpan(STEP_DOWN_X);
  return [
    [start, up[0]],
    [up[1], down[0]],
    [down[1], end],
  ];
}

function pushLine(
  out: Primitive[],
  row: Row,
  budget: LineBudget,
  c: PowerTransmissionConstants,
  tl: TimelineFrame,
): void {
  const wire = { colorRole: 'muted', emphasis: 'strong' } as const;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const segments = lineSegments(row);

  segments.forEach(([x0, x1], i) => {
    out.push({
      type: 'trajectory',
      id: `line-${row.id}-${i}`,
      points: [
        [x0, row.y],
        [x1, row.y],
      ],
      width: LINE_PX,
      style: wire,
    });
  });

  // ---- 변압기 기호 — 겹친 두 원. 승압은 발전소 곁, 강압은 마을 곁 ----
  if (row.stepped) {
    for (const [id, x, label] of [
      ['up', STEP_UP_X, text('label.stepUp')],
      ['down', STEP_DOWN_X, text('label.stepDown')],
    ] as const) {
      for (const side of [-1, 1] as const) {
        out.push({
          type: 'body',
          id: `coil-${id}-${side < 0 ? 'a' : 'b'}`,
          pos: [x + (side * COIL_SPACING) / 2, row.y],
          shape: 'circle',
          size: COIL_RADIUS,
          fill: 'none',
          outline: 'role',
          glow: false,
          style: ink,
        });
      }
      out.push({
        type: 'readout',
        id: `coil-label-${id}`,
        anchor: { world: [x, row.y - COIL_RADIUS], offset: [0, COIL_LABEL_GAP_PX] },
        text: label,
        chip: false,
        font: 'text',
        fontSize: NAME_LABEL_PX,
        align: 'center',
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
    }
  }

  // ---- 송전 전압 — 선 아래 ----
  out.push({
    type: 'readout',
    id: `voltage-${row.id}`,
    anchor: { world: [VOLTAGE_LABEL_X, row.y], offset: [0, VOLTAGE_LABEL_GAP_PX] },
    text: text('label.voltage'),
    vars: { v: String(row.voltage) },
    chip: false,
    fontSize: VALUE_LABEL_PX,
    weight: 'bold',
    align: 'center',
    style: ink,
  });

  // ---- 열 김 — 선에서 오른다. 한 줄기에서 1 초에 내는 김 수가 선 손실에 비례한다 ----
  const wispRate = budget.loss * c.wispRatePerKw;
  for (let i = 0; i < WISP_COUNT; i++) {
    const x = WISP_XS_FROM + ((WISP_XS_TO - WISP_XS_FROM) * i) / Math.max(1, WISP_COUNT - 1);
    out.push({
      type: 'stream',
      id: `wisp-${row.id}-${i}`,
      from: [x, row.y + WISP_LIFT],
      velocity: [0, c.wispRise],
      rate: wispRate,
      life: c.wispLife,
      width: WISP_PX,
      jitter: WISP_JITTER_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 전자 알갱이 — 관례 전류 `I`(발전소 → 마을)와 반대로 마을에서 발전소 쪽으로 간다.
  //      촘촘함이 전류에 비례한다 ----
  const density = budget.current * c.carriersPerWorldPerAmp;
  const positions: Vec2[] = [];
  for (const [x0, x1] of segments) {
    for (const x of carrierXs(x0, x1 - x0, density, -c.carrierSpeed, tl.t)) {
      if (x < x1) positions.push([x, row.y]);
    }
  }
  out.push({
    type: 'particleSystem',
    id: `carriers-${row.id}`,
    positions,
    sizes: CARRIER_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // 알갱이가 무엇인지 — 전자 표식 `e⁻` 와 가는 방향, 위 줄에 한 번 (두 줄의 알갱이가 같은 것이다).
  if (!row.stepped) {
    out.push({
      type: 'vector',
      id: 'direction-electron',
      from: [ELECTRON_ARROW_FROM, row.y + ELECTRON_ARROW_LIFT],
      delta: [-ELECTRON_ARROW_LEN, 0],
      label: text('label.electron'),
      labelSide: 'cw',
      width: ELECTRON_ARROW_PX,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }
}

// ------------------------------------------------------------------------
// 발전소 · 마을
// ------------------------------------------------------------------------

function pushEnds(out: Primitive[], row: Row): void {
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  for (const [id, x, path, label] of [
    ['plant', PLANT_X, PLANT_PATH, text('label.plant')],
    ['town', TOWN_X, TOWN_PATH, text('label.town')],
  ] as const) {
    out.push({
      type: 'body',
      id: `${id}-${row.id}`,
      pos: [x, row.y],
      shape: 'custom',
      customPath: path,
      glow: false,
      style: ink,
    });
    out.push({
      type: 'readout',
      id: `${id}-label-${row.id}`,
      anchor: { world: [x, row.y - PLANT_HALF], offset: [0, NAME_LABEL_GAP_PX] },
      text: label,
      chip: false,
      font: 'text',
      fontSize: NAME_LABEL_PX,
      align: 'center',
      style: muted,
    });
  }
}

// ------------------------------------------------------------------------
// 전류 화살표 `I` — 길이가 전류에 비례한다
// ------------------------------------------------------------------------

function pushCurrentArrow(
  out: Primitive[],
  row: Row,
  budget: LineBudget,
  c: PowerTransmissionConstants,
  noteReveal: number,
): void {
  const y = row.y - CURRENT_ARROW_DROP;
  const length = budget.current * c.currentArrowPerAmp;
  out.push({
    type: 'vector',
    id: `current-${row.id}`,
    from: [CURRENT_ARROW_FROM, y],
    delta: [length, 0],
    label: text('label.current'),
    labelSide: 'cw',
    width: CURRENT_ARROW_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  // 승압한 줄의 화살표 곁에 전류 배수 — 선언값(`voltageFactor`) 그대로.
  if (row.stepped && noteReveal > 0) {
    out.push({
      type: 'readout',
      id: 'current-fraction',
      anchor: { world: [CURRENT_ARROW_FROM + length, y], offset: [CURRENT_FRACTION_GAP_PX, 0] },
      text: text('label.fraction'),
      vars: { n: String(c.voltageFactor) },
      chip: false,
      fontSize: VALUE_LABEL_PX,
      weight: 'bold',
      align: 'left',
      opacity: noteReveal,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }
}

// ------------------------------------------------------------------------
// 막대 — 선에서 샌 열 · 마을이 받은 전력. 같은 배율, 같은 바닥
// ------------------------------------------------------------------------

function pushBars(
  out: Primitive[],
  row: Row,
  budget: LineBudget,
  c: PowerTransmissionConstants,
  reveal: { loss: number; lossNote: number; delivered: number },
): void {
  const base = row.y - BAR_BASE_DROP;
  const left = LOSS_BAR_X - BAR_HALF - REFERENCE_OVERHANG;
  const right = TOWN_BAR_X + BAR_HALF + REFERENCE_OVERHANG;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;

  for (const [id, x, value, share, role] of [
    ['loss', LOSS_BAR_X, budget.loss, reveal.loss, 'accent'],
    ['town', TOWN_BAR_X, budget.delivered, reveal.delivered, 'ink'],
  ] as const) {
    const top = base + value * c.barWorldPerKw * share;
    if (top > base) {
      out.push({
        type: 'region',
        id: `bar-${id}-${row.id}`,
        points: [
          [x - BAR_HALF, base],
          [x + BAR_HALF, base],
          [x + BAR_HALF, top],
          [x - BAR_HALF, top],
        ],
        opaque: true,
        fillOpacity: BAR_FILL_OPACITY,
        style: { colorRole: role, emphasis: 'strong' },
      });
    }
    out.push({
      type: 'readout',
      id: `bar-label-${id}-${row.id}`,
      anchor: { world: [x, base], offset: [0, BAR_LABEL_GAP_PX] },
      text: text(id === 'loss' ? 'label.lossBar' : 'label.townBar'),
      chip: false,
      font: 'text',
      fontSize: BAR_LABEL_PX,
      align: 'center',
      style: muted,
    });
  }

  // 막대 바닥 — 막대가 비어 있어도 「0 에 가깝다」 가 읽히게.
  out.push({
    type: 'lineSet',
    id: `bar-base-${row.id}`,
    lines: [
      [
        [left, base],
        [right, base],
      ],
    ],
    width: BASELINE_PX,
    style: muted,
  });

  // 보낸 전력 기준 — 두 막대의 합이 여기에 닿는다.
  const sent = base + c.power * c.barWorldPerKw;
  out.push({
    type: 'trajectory',
    id: `reference-${row.id}`,
    points: [
      [left, sent],
      [right, sent],
    ],
    width: REFERENCE_PX,
    style: { ...muted, lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: `reference-label-${row.id}`,
    anchor: { world: [right, sent], offset: [REFERENCE_LABEL_GAP_PX, 0] },
    text: text('label.power'),
    vars: { p: String(c.power) },
    chip: false,
    fontSize: BAR_LABEL_PX,
    align: 'left',
    style: muted,
  });

  // 승압한 줄의 열 막대 위에 손실 배수 — 선언값(`lossDivisor`) 그대로.
  if (row.stepped && reveal.lossNote > 0) {
    out.push({
      type: 'readout',
      id: 'loss-fraction',
      anchor: { world: [LOSS_BAR_X, base], offset: [0, -FRACTION_GAP_PX] },
      text: text('label.fraction'),
      vars: { n: String(c.lossDivisor) },
      chip: false,
      fontSize: FRACTION_PX,
      weight: 'bold',
      align: 'center',
      opacity: reveal.lossNote,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
