// ========================================================================
// refrigerator-heat-pump — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 칸 벽(trajectory) ·
// 흐름 띠 · 온도계 기둥(region) · 알갱이(particleSystem) · 기계 · 콘센트(body) ·
// 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — **열**은 primary(빼는 열 · 내보내는 열 · 새는 열 모두 같은 대상),
// **전기 일**은 secondary. 기계 · 콘센트 · 냉장고 벽 · 온도계 기둥은 먹색, 부엌 테두리 ·
// 온도계 관은 배경 정보라 muted. 강조색은 쓰지 않는다 — 가리킬 한 뜻이 따로 없다.
// 온도는 색이 아니라 **기둥 높이**로 보인다 (C2 · S-piece).
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
  bandDots,
  bandOutline,
  flowLayout,
  fridgeTemperature,
  leakTime,
  machineTime,
  readConstants,
  type Band,
  type RefrigeratorHeatPumpConstants,
} from './physics';
import {
  FRIDGE,
  KITCHEN,
  LEAK_HEAD,
  MACHINE_SIZE,
  PLUG_GAP,
  SCENE_BOUNDS,
  SOCKET_POS,
  SOCKET_SIZE,
  THERMO_BOTTOM,
  THERMO_BULB,
  THERMO_FRIDGE_X,
  THERMO_KITCHEN_X,
  THERMO_TOP,
  THERMO_WIDTH,
  text,
} from './schema';
import type { RefrigeratorHeatPumpState } from './state';

/** 냉장고 벽 굵기(화면 px). 닫힌 상자라 굵게. */
const FRIDGE_WALL_PX = 2.5;
/** 부엌 테두리 · 온도계 관 굵기(화면 px). 배경 정보라 가늘게. */
const THIN_LINE_PX = 1;
/** 흐름 띠 채움 짙기. 알갱이가 그 위에서 읽혀야 해 옅다. */
const BAND_FILL = 0.28;
/** 전기를 끊은 뒤 띠가 남는 짙기 비율 — 흐름이 있던 자리만 흐릿하게 남긴다. */
const BAND_GHOST = 0.3;
/** 알갱이 크기(화면 px). */
const DOT_PX = 2.2;
/** 칸 이름 · 기계 이름 글자 크기(화면 px). */
const NAME_PX = 13;
/** 양 · 온도 이름표 글자 크기(화면 px). */
const VALUE_PX = 12;
/** 칸 이름이 칸 윗변에서 떠 있는 거리(화면 px, 위로). */
const NAME_GAP_PX = 12;
/** 양 이름표가 띠 가장자리에서 떨어진 거리(화면 px). */
const VALUE_GAP_PX = 12;
/** 온도 글자가 기둥 꼭대기 오른쪽으로 떨어진 거리(화면 px). */
const TEMP_GAP_PX = 10;
/** 기계 이름이 몸통 아랫변 아래로 떨어진 거리(화면 px). */
const MACHINE_NAME_GAP_PX = 11;
/** 부엌 칸의 옅은 바탕 짙기. 냉장고와 달리 벽이 아니라 방이라 칸만 짚는다. */
const KITCHEN_FILL = 0.06;
/** 콘센트 이름이 콘센트 오른쪽으로 떨어진 거리(화면 px). */
const SOCKET_NAME_GAP_PX = 10;
/** 냉장고 안 처음 온도 표지 — 관 양옆으로 내민 길이(월드)와 굵기(화면 px). */
const START_MARK_REACH = 0.12;
const START_MARK_PX = 1.5;

function rectPoints(r: { minX: number; maxX: number; minY: number; maxY: number }): Vec2[] {
  return [
    [r.minX, r.minY],
    [r.maxX, r.minY],
    [r.maxX, r.maxY],
    [r.minX, r.maxY],
  ];
}

/** 온도계 하나 — 관 · 기둥 · 아래 공. 기둥 높이 = 온도 / 눈금 꼭대기. */
function thermometer(
  id: string,
  x: number,
  temperature: number,
  c: RefrigeratorHeatPumpConstants,
  alpha: number,
): { prims: Primitive[]; top: Vec2; startTop: number } {
  const h = THERMO_WIDTH / 2;
  const heightOf = (t: number): number =>
    THERMO_BOTTOM + (THERMO_TOP - THERMO_BOTTOM) * Math.max(0, Math.min(1, t / c.thermoMax));
  const top = heightOf(temperature);
  const prims: Primitive[] = [
    {
      type: 'trajectory',
      id: `${id}-tube`,
      points: rectPoints({ minX: x - h, maxX: x + h, minY: THERMO_BOTTOM, maxY: THERMO_TOP }),
      closed: true,
      width: THIN_LINE_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
    {
      type: 'region',
      id: `${id}-column`,
      points: rectPoints({ minX: x - h, maxX: x + h, minY: THERMO_BOTTOM, maxY: top }),
      fillOpacity: 1,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'body',
      id: `${id}-bulb`,
      pos: [x, THERMO_BOTTOM],
      shape: 'circle',
      size: THERMO_BULB,
      outline: 'none',
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
  ];
  return { prims, top: [x + h, top], startTop: heightOf(c.tCold) };
}

function bandRegion(
  id: string,
  b: Band,
  role: 'primary' | 'secondary',
  alpha: number,
  opts: { tip?: boolean; notch?: boolean; head?: number },
): Primitive {
  return {
    type: 'region',
    id,
    points: bandOutline(b, opts),
    fillOpacity: BAND_FILL,
    opacity: alpha,
    style: { colorRole: role, emphasis: 'strong' },
  };
}

function dotsOf(id: string, b: Band, salt: number, time: number, c: RefrigeratorHeatPumpConstants, role: 'primary' | 'secondary', alpha: number): Primitive {
  const d = bandDots(b, salt, time, c);
  return {
    type: 'particleSystem',
    id,
    positions: d.positions,
    opacities: d.opacities,
    sizes: DOT_PX,
    opacity: alpha,
    style: { colorRole: role, emphasis: 'strong' },
  };
}

export function scene(params: {
  state: RefrigeratorHeatPumpState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('refrigerator-heat-pump: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const flow = flowLayout(c);
  const out: Primitive[] = [];

  // 주기 머리에 나타나고 꼬리에 흐려진다 — 다음 주기의 차가운 냉장고로 돌아가는 것을 숨긴다.
  const alive = tl.at('appear') * (1 - tl.at('fade'));
  // 기계가 돌 때의 흐름. 전기를 끊는 동안 알갱이가 멈춘 채 흐려진다.
  const running = alive * (1 - tl.at('cut'));
  // 띠는 흐름이 있던 자리로 흐릿하게 남는다.
  const bandAlpha = alive * (1 - (1 - BAND_GHOST) * tl.at('cut'));
  // 새는 열은 전기를 끊은 뒤에만.
  const seeping = alive * tl.at('seep');

  // ---- 칸 ----
  out.push({
    type: 'region',
    id: 'kitchen-floor',
    points: rectPoints(KITCHEN),
    fillOpacity: KITCHEN_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'kitchen-edge',
    points: rectPoints(KITCHEN),
    closed: true,
    width: THIN_LINE_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'trajectory',
    id: 'fridge-wall',
    points: rectPoints(FRIDGE),
    closed: true,
    width: FRIDGE_WALL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'fridge-name',
    anchor: { world: [(FRIDGE.minX + FRIDGE.maxX) / 2, FRIDGE.maxY], offset: [0, -NAME_GAP_PX] },
    text: text('label.fridge'),
    chip: false,
    font: 'text',
    fontSize: NAME_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'kitchen-name',
    anchor: { world: [(KITCHEN.minX + KITCHEN.maxX) / 2, KITCHEN.maxY], offset: [0, -NAME_GAP_PX] },
    text: text('label.kitchen'),
    chip: false,
    font: 'text',
    fontSize: NAME_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 온도계 ----
  // 같은 눈금이다 — 찬 쪽 기둥이 낮고 더운 쪽 기둥이 높아, 열이 낮은 쪽에서 높은 쪽으로
  // 옮겨 가는 것이 보인다. 냉장고 안 기둥은 새어 드는 동안 오른다.
  const coldThermo = thermometer('thermo-fridge', THERMO_FRIDGE_X, fridgeTemperature(tl, c), c, alive);
  const hotThermo = thermometer('thermo-kitchen', THERMO_KITCHEN_X, c.tHot, c, alive);
  out.push(...coldThermo.prims, ...hotThermo.prims);
  // 처음 온도 자리 표지 — 새어 드는 동안 남아, 기둥이 그 위로 오른 것을 정지 화면에서도 견준다.
  const startTop = coldThermo.startTop;
  out.push({
    type: 'trajectory',
    id: 'thermo-fridge-start',
    points: [
      [THERMO_FRIDGE_X - THERMO_WIDTH / 2 - START_MARK_REACH, startTop],
      [THERMO_FRIDGE_X + THERMO_WIDTH / 2 + START_MARK_REACH, startTop],
    ],
    width: START_MARK_PX,
    opacity: seeping,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  // 냉장고 안 온도 글자는 선언한 처음 온도다 — 기둥이 오르기 전에 물러난다.
  out.push({
    type: 'readout',
    id: 'thermo-fridge-value',
    anchor: { world: coldThermo.top, offset: [TEMP_GAP_PX, 0] },
    text: text('label.temp'),
    vars: { t: state.tColdText },
    chip: false,
    align: 'left',
    fontSize: VALUE_PX,
    opacity: alive * (1 - tl.at('seep')),
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'thermo-kitchen-value',
    anchor: { world: hotThermo.top, offset: [TEMP_GAP_PX, 0] },
    text: text('label.temp'),
    vars: { t: state.tHotText },
    chip: false,
    align: 'left',
    fontSize: VALUE_PX,
    opacity: alive,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 새는 열 (전기를 끊은 뒤) ----
  if (seeping > 0) {
    out.push(bandRegion('leak-band', flow.leak, 'primary', seeping, { tip: true, head: LEAK_HEAD }));
    out.push(dotsOf('leak-dots', flow.leak, 4, leakTime(tl), c, 'primary', seeping));
  }

  // ---- 흐름 띠 ----
  out.push(bandRegion('cold-band', flow.cold, 'primary', bandAlpha, { notch: true }));
  // 전기를 끊는 동안 일 띠 윗끝이 콘센트에서 떨어져 내려와 틈이 벌어진다.
  const unplug = PLUG_GAP * tl.at('cut');
  const workShown: Band = { ...flow.work, from: [flow.work.from[0], flow.work.from[1] - unplug] };
  out.push(bandRegion('work-band', workShown, 'secondary', bandAlpha, {}));
  out.push(bandRegion('hot-band', flow.hot, 'primary', bandAlpha, { tip: true }));

  // ---- 알갱이 ----
  // 모두 같은 속력 · 같은 밀도다. 굵은 띠에 옆으로 더 많이 늘어서 흐르는 양이 굵기로 읽힌다.
  if (running > 0) {
    const t = machineTime(tl);
    // 일 알갱이는 떨어져 내린 일 띠 위에 둔다 — 콘센트와 띠 사이 틈이 비어 보여야 한다.
    out.push(dotsOf('cold-dots', flow.cold, 1, t, c, 'primary', running));
    out.push(dotsOf('work-dots', workShown, 2, t, c, 'secondary', running));
    out.push(dotsOf('hot-dots', flow.hot, 3, t, c, 'primary', running));
  }

  // ---- 기계 · 콘센트 ----
  // 기계 몸통이 세 띠의 끝을 덮는다 — 두 줄기가 그 안에서 합쳐져 한 줄기로 나온다.
  out.push({
    type: 'body',
    id: 'machine',
    pos: [0, 0],
    shape: 'rect',
    size: MACHINE_SIZE,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'machine-name',
    anchor: { world: [0, -MACHINE_SIZE[1] / 2], offset: [0, MACHINE_NAME_GAP_PX] },
    text: text('label.machine'),
    chip: false,
    font: 'text',
    fontSize: NAME_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'socket',
    pos: SOCKET_POS,
    shape: 'rect',
    size: SOCKET_SIZE,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'socket-name',
    anchor: { world: [SOCKET_POS[0] + SOCKET_SIZE[0] / 2, SOCKET_POS[1]], offset: [SOCKET_NAME_GAP_PX, 0] },
    text: text('label.socket'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: NAME_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 양 이름표 ----
  // 선언한 값 그대로다. 기계가 멈추면 함께 물러난다 — 흐르지 않는 띠에 양이 남으면 거짓이다.
  // 냉장고 벽과 기계 사이 — 띠가 두 칸 사이를 건너는 자리.
  const coldMid = (FRIDGE.maxX - MACHINE_SIZE[0] / 2) / 2;
  out.push({
    type: 'readout',
    id: 'cold-amount',
    anchor: { world: [coldMid, flow.cold.from[1] - flow.cold.width / 2], offset: [0, VALUE_GAP_PX] },
    text: text('label.heat'),
    vars: { q: state.qColdText },
    chip: false,
    fontSize: VALUE_PX,
    opacity: running,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'work-amount',
    anchor: {
      world: [flow.work.width / 2, (flow.work.from[1] + MACHINE_SIZE[1] / 2) / 2],
      offset: [VALUE_GAP_PX, 0],
    },
    text: text('label.work'),
    vars: { q: state.workText },
    chip: false,
    align: 'left',
    fontSize: VALUE_PX,
    opacity: running,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'hot-amount',
    anchor: {
      world: [(MACHINE_SIZE[0] / 2 + KITCHEN.minX) / 2, flow.hot.width / 2],
      offset: [0, -VALUE_GAP_PX],
    },
    text: text('label.heat'),
    vars: { q: state.qHotText },
    chip: false,
    fontSize: VALUE_PX,
    opacity: running,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
