// ========================================================================
// thermistor-and-ldr — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 판 둘(왼쪽 써미스터 · 오른쪽 광저항)이 같은 모양이다. 판마다 아래에서 위로 —
//   회로: 레일 · 도선(lineSet) → 소자 · 고정 저항 지그재그(lineSet) → 소자 표지(써미스터 사선 ·
//         광저항 동그라미) → 가운데 접점(particleSystem) → 출력 전압계(scale dial)
//   저항 막대: 소자의 표본 최댓값 길이 점선(trajectory) → 소자 막대 · 고정 저항 막대(lineSet)
//   자극: 써미스터 — 온도계(region · body · lineSet), 광저항 — 등(body · lineSet) · 광선(vector) · 알갱이
//   이름표(readout) — 맨 위
//
// 색은 뜻마다 하나다 — 회로 · 막대 · 광선은 먹색, 온도계 수은은 secondary, **강조색은 「출력 전압」
// 한 뜻** — 전압계의 0 에서 바늘까지 부채꼴. 빛은 색이 아니라 광선 · 알갱이의 수로 보인다.
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
  ldrNow,
  photonFractions,
  rayOpacities,
  readConstants,
  thermistorNow,
  type SensorNow,
  type ThermistorAndLdrConstants,
} from './physics';
import {
  BAR_DX,
  FIXED_Y,
  LAMP_DX,
  LAMP_R,
  LAMP_Y,
  LDR_PANEL_X,
  LDR_RING_R,
  METER_DX,
  METER_R,
  METER_Y,
  NODE_Y,
  RAIL_BOTTOM_Y,
  RAIL_TOP_Y,
  RAY_ARC_FROM,
  RAY_ARC_TO,
  RESISTOR_HALF,
  SCENE_BOUNDS,
  SENSOR_Y,
  THERMO_BOTTOM_Y,
  THERMO_BULB_R,
  THERMO_COLD_Y,
  THERMO_DX,
  THERMO_HALF,
  THERMO_HOT_Y,
  THERMO_TOP_Y,
  THERM_PANEL_X,
  text,
} from './schema';
import type { ThermistorAndLdrState } from './state';

/** 도선 · 레일 · 저항 지그재그 굵기(화면 px). */
const LEAD_PX = 2;
const RAIL_PX = 2.5;
const RESISTOR_PX = 2.2;
/** 지그재그 — 꺾임 수 · 옆으로 벌어지는 반 폭(월드). */
const ZIGZAG_TEETH = 6;
const ZIGZAG_AMP = 0.17;
/** 가운데 접점 점 반지름(화면 px). */
const NODE_DOT_PX = 4;

/** 써미스터 표지 — 사선의 반 가로 · 반 세로(월드) · 아래 끝의 발 길이(월드) · 굵기(화면 px). */
const SLASH_HALF_X = 0.36;
const SLASH_HALF_Y = 0.46;
const SLASH_FOOT = 0.2;
const SLASH_PX = 1.6;

/** 저항 막대 굵기 · 점선 윤곽 굵기(화면 px). */
const BAR_PX = 9;
const BAR_GUIDE_PX = 1.2;

/** 레일 — 소자 기둥 왼쪽으로 뻗는 길이 · 위 레일이 오른쪽으로 뻗는 길이(월드). */
const RAIL_LEFT = 0.5;
const RAIL_TOP_RIGHT = 0.5;

/** 온도계 관 · 눈금 굵기(화면 px), 눈금이 관 왼쪽으로 삐지는 길이(월드). */
const THERMO_PX = 1.5;
const THERMO_TICK = 0.12;

/** 등 — 둘레 안 가위표 반 길이(몫, 반지름 기준) · 굵기(화면 px). 광선 굵기 · 머리 크기 · 등에서 띄우는 거리(월드). */
const LAMP_CROSS = 0.62;
const LAMP_CROSS_PX = 1.4;
const RAY_PX = 1.4;
const RAY_HEAD = 0.14;
const RAY_GAP = 0.08;
/** 광선 위 알갱이 반지름(화면 px). */
const PHOTON_PX = 2.6;

/** 이름표 글자 크기(화면 px) · 대상에서 띄우는 거리. */
const LABEL_PX = 13;
const TITLE_PX = 14;
const TITLE_Y = 2.55;
const TITLE_DX = 1.3;
const RAIL_LABEL_GAP = 0.15;
const BAR_LABEL_RISE = 0.3;
const TEMP_LABEL_GAP_PX = 4;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;

export function scene(params: {
  state: ThermistorAndLdrState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('thermistor-and-ldr: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  // ================= 써미스터 판 =================
  const th = thermistorNow(tl, c);
  pushThermometer(out, c, th.x);
  pushDivider(out, 'therm', THERM_PANEL_X, c, th, c.thermRCold, c.thermRHot, text('label.thermistor'));
  pushThermistorMark(out);

  // ================= 광저항 판 =================
  const ld = ldrNow(tl, c);
  pushDivider(out, 'ldr', LDR_PANEL_X, c, ld, c.ldrRDark, c.ldrRBright, text('label.ldr'));
  pushLdrMark(out);
  pushLampAndRays(out, c, ld.x, tl.t);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}

// ------------------------------------------------------------------------
// 분압기 한 벌 — 레일 · 소자(위) · 고정 저항(아래) · 저항 막대 · 출력 전압계
// ------------------------------------------------------------------------

function pushDivider(
  out: Primitive[],
  id: 'therm' | 'ldr',
  px: number,
  c: ThermistorAndLdrConstants,
  now: SensorNow,
  r0: number,
  r1: number,
  title: LocalizedText,
): void {
  const sTop = SENSOR_Y + RESISTOR_HALF;
  const sBot = SENSOR_Y - RESISTOR_HALF;
  const fTop = FIXED_Y + RESISTOR_HALF;
  const fBot = FIXED_Y - RESISTOR_HALF;
  const meterX = px + METER_DX;
  const meterLeft: Vec2 = [meterX - METER_R, METER_Y];

  // ---- 레일 두 줄 — 위 6 V, 아래 0 V ----
  out.push({
    type: 'lineSet',
    id: `${id}-rails`,
    lines: [
      [
        [px - RAIL_LEFT, RAIL_TOP_Y],
        [px + RAIL_TOP_RIGHT, RAIL_TOP_Y],
      ],
      [
        [px - RAIL_LEFT, RAIL_BOTTOM_Y],
        [meterX, RAIL_BOTTOM_Y],
      ],
    ],
    width: RAIL_PX,
    style: INK,
  });
  out.push(voltLabel(`${id}-rail-top`, [px - RAIL_LEFT - RAIL_LABEL_GAP, RAIL_TOP_Y], c.volts));
  out.push(voltLabel(`${id}-rail-bottom`, [px - RAIL_LEFT - RAIL_LABEL_GAP, RAIL_BOTTOM_Y], 0));

  // ---- 도선 — 레일에서 소자로, 소자에서 고정 저항으로, 고정 저항에서 아래 레일로. 출력은 가운데 접점에서 ----
  out.push({
    type: 'lineSet',
    id: `${id}-leads`,
    lines: [
      [
        [px, RAIL_TOP_Y],
        [px, sTop],
      ],
      [
        [px, sBot],
        [px, fTop],
      ],
      [
        [px, fBot],
        [px, RAIL_BOTTOM_Y],
      ],
      [
        [px, NODE_Y],
        [meterLeft[0], NODE_Y],
        meterLeft,
      ],
      [
        [meterX, METER_Y - METER_R],
        [meterX, RAIL_BOTTOM_Y],
      ],
    ],
    width: LEAD_PX,
    style: INK,
  });

  // ---- 소자 · 고정 저항 — 같은 지그재그. 소자 표지는 판마다 따로 얹는다 ----
  out.push({
    type: 'lineSet',
    id: `${id}-resistors`,
    lines: [zigzag(px, sTop, sBot), zigzag(px, fTop, fBot)],
    width: RESISTOR_PX,
    style: INK,
  });
  out.push({
    type: 'particleSystem',
    id: `${id}-node`,
    positions: [[px, NODE_Y]],
    sizes: NODE_DOT_PX,
    style: INK,
  });

  // ---- 저항 막대 — 길이가 저항. 소자 막대는 표본 최댓값 길이의 점선 윤곽 안에서 줄고 는다 ----
  const x0 = px + BAR_DX;
  const rMax = Math.max(r0, r1);
  out.push({
    type: 'trajectory',
    id: `${id}-bar-guide`,
    points: [
      [x0, SENSOR_Y],
      [x0 + rMax * c.barPerKohm, SENSOR_Y],
    ],
    width: BAR_GUIDE_PX,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  });
  out.push({
    type: 'lineSet',
    id: `${id}-bars`,
    lines: [
      [
        [x0, SENSOR_Y],
        [x0 + now.r * c.barPerKohm, SENSOR_Y],
      ],
      [
        [x0, FIXED_Y],
        [x0 + c.rFixed * c.barPerKohm, FIXED_Y],
      ],
    ],
    width: BAR_PX,
    style: INK,
  });
  // 저항 글자 — 선언한 표본에 멈췄을 때만 그 값을 그대로 쓴다. 옮겨 가는 동안은 막대만 말한다.
  const sensorValue = now.x <= 0 ? r0 : now.x >= 1 ? r1 : undefined;
  if (sensorValue !== undefined) {
    out.push(kohmLabel(`${id}-bar-sensor-value`, [x0, SENSOR_Y + BAR_LABEL_RISE], sensorValue));
  }
  out.push(kohmLabel(`${id}-bar-fixed-value`, [x0, FIXED_Y + BAR_LABEL_RISE], c.rFixed));

  // ---- 출력 전압계 — 고정 저항 양단. 0 에서 바늘까지 부채꼴이 강조색(출력 전압 한 뜻) ----
  const ticks: number[] = [];
  for (let k = 0; k * c.meterTick <= c.volts; k++) ticks.push(k * c.meterTick);
  out.push({
    type: 'scale',
    id: `${id}-meter`,
    shape: 'dial',
    pos: [meterX, METER_Y],
    size: METER_R,
    range: [0, c.volts],
    value: now.out,
    origin: 0,
    showDelta: false,
    tickAt: ticks,
    labelAt: [0, c.volts],
    unit: text('label.unit'),
    digits: c.meterDigits,
    label: text('label.output'),
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 판 이름 ----
  out.push({
    type: 'readout',
    id: `${id}-title`,
    anchor: { world: [px + TITLE_DX, TITLE_Y] },
    text: title,
    chip: false,
    font: 'text',
    fontSize: TITLE_PX,
    weight: 'bold',
    align: 'center',
    style: INK,
  });
}

/** 세로 지그재그 — 위 끝에서 아래 끝까지, 좌우로 번갈아 꺾는다. */
function zigzag(x: number, yTop: number, yBot: number): Vec2[] {
  const pts: Vec2[] = [[x, yTop]];
  const h = (yTop - yBot) / ZIGZAG_TEETH;
  for (let i = 0; i < ZIGZAG_TEETH; i++) {
    pts.push([x + (i % 2 === 0 ? ZIGZAG_AMP : -ZIGZAG_AMP), yTop - h * (i + 0.5)]);
  }
  pts.push([x, yBot]);
  return pts;
}

// ------------------------------------------------------------------------
// 소자 표지 — 써미스터는 사선(아래 끝에 발), 광저항은 동그라미
// ------------------------------------------------------------------------

function pushThermistorMark(out: Primitive[]): void {
  const px = THERM_PANEL_X;
  const a: Vec2 = [px - SLASH_HALF_X, SENSOR_Y - SLASH_HALF_Y];
  const b: Vec2 = [px + SLASH_HALF_X, SENSOR_Y + SLASH_HALF_Y];
  out.push({
    type: 'lineSet',
    id: 'therm-slash',
    lines: [[[a[0] - SLASH_FOOT, a[1]], a, b]],
    width: SLASH_PX,
    style: INK,
  });
}

function pushLdrMark(out: Primitive[]): void {
  out.push({
    type: 'body',
    id: 'ldr-ring',
    pos: [LDR_PANEL_X, SENSOR_Y],
    shape: 'circle',
    size: LDR_RING_R,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: INK,
  });
}

// ------------------------------------------------------------------------
// 온도계 — 써미스터가 놓인 온도. 눈금은 선언 온도 두 개뿐이다
// ------------------------------------------------------------------------

function pushThermometer(out: Primitive[], c: ThermistorAndLdrConstants, x: number): void {
  const tx = THERM_PANEL_X + THERMO_DX;
  const xl = tx - THERMO_HALF;
  const xr = tx + THERMO_HALF;
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
    pos: [tx, THERMO_BOTTOM_Y - THERMO_BULB_R / 2],
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

  const ticks: [number, number][] = [
    [THERMO_COLD_Y, c.tempCold],
    [THERMO_HOT_Y, c.tempHot],
  ];
  out.push({
    type: 'lineSet',
    id: 'thermo-ticks',
    lines: ticks.map(([y]): Vec2[] => [
      [xl - THERMO_TICK, y],
      [xl, y],
    ]),
    width: THERMO_PX,
    style: INK,
  });
  ticks.forEach(([y, t], i) => {
    out.push({
      type: 'readout',
      id: `thermo-label-${i}`,
      anchor: { world: [xl - THERMO_TICK, y], offset: [-TEMP_LABEL_GAP_PX, 0] },
      text: text('label.temp'),
      vars: { t: String(t) },
      chip: false,
      fontSize: LABEL_PX,
      align: 'right',
      style: MUTED,
    });
  });
}

// ------------------------------------------------------------------------
// 등 · 광선 · 알갱이 — 닿는 광선의 수가 빛의 양이다
// ------------------------------------------------------------------------

function pushLampAndRays(out: Primitive[], c: ThermistorAndLdrConstants, x: number, t: number): void {
  const lamp: Vec2 = [LDR_PANEL_X + LAMP_DX, LAMP_Y];
  const d = LAMP_R * LAMP_CROSS * Math.SQRT1_2;
  out.push({
    type: 'body',
    id: 'lamp',
    pos: lamp,
    shape: 'circle',
    size: LAMP_R,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: INK,
  });
  out.push({
    type: 'lineSet',
    id: 'lamp-cross',
    lines: [
      [
        [lamp[0] - d, lamp[1] - d],
        [lamp[0] + d, lamp[1] + d],
      ],
      [
        [lamp[0] - d, lamp[1] + d],
        [lamp[0] + d, lamp[1] - d],
      ],
    ],
    width: LAMP_CROSS_PX,
    style: INK,
  });

  const alphas = rayOpacities(c, x);
  const n = alphas.length;
  const slots = middleOutSlots(n);
  const photons: Vec2[] = [];
  const photonAlphas: number[] = [];
  alphas.forEach((alpha, i) => {
    if (alpha <= 0) return;
    // 광선 i 가 닿는 광저항 둘레 자리 — 가운데 자리부터 바깥으로 채운다.
    const slot = slots[i]!;
    const theta = RAY_ARC_FROM + ((RAY_ARC_TO - RAY_ARC_FROM) * (slot + 0.5)) / n;
    const hit: Vec2 = [
      LDR_PANEL_X + Math.cos(theta) * (LDR_RING_R + RAY_GAP),
      SENSOR_Y + Math.sin(theta) * (LDR_RING_R + RAY_GAP),
    ];
    const dx = hit[0] - lamp[0];
    const dy = hit[1] - lamp[1];
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const from: Vec2 = [lamp[0] + ux * (LAMP_R + RAY_GAP), lamp[1] + uy * (LAMP_R + RAY_GAP)];
    const span = len - LAMP_R - RAY_GAP;
    out.push({
      type: 'vector',
      id: `ray-${i}`,
      from,
      delta: [ux * span, uy * span],
      width: RAY_PX,
      headSize: RAY_HEAD,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
    for (const f of photonFractions(c, t, i)) {
      photons.push([from[0] + ux * span * f, from[1] + uy * span * f]);
      photonAlphas.push(alpha);
    }
  });
  if (photons.length > 0) {
    out.push({
      type: 'particleSystem',
      id: 'photons',
      positions: photons,
      opacities: photonAlphas,
      sizes: PHOTON_PX,
      style: INK,
    });
  }
}

/** 광선 자리 순서 — 가운데 자리부터 위아래로 번갈아 바깥으로. 광선이 적을 때도 소자 가운데를 비춘다. */
function middleOutSlots(n: number): number[] {
  const mid = (n - 1) / 2;
  return Array.from({ length: n }, (_, s) => s).sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b);
}

/** 전압 글자 — 선언값을 그대로 `{v} V` 에 끼운다. */
function voltLabel(id: string, at: Vec2, volts: number): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: text('label.volt'),
    vars: { v: String(volts) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'right',
    style: MUTED,
  };
}

/** 저항 글자 — 선언한 표본 값을 그대로 `{r} kΩ` 에 끼운다. 막대 시작 위에 붙인다. */
function kohmLabel(id: string, at: Vec2, kohm: number): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: text('label.kohm'),
    vars: { r: String(kohm) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'left',
    style: MUTED,
  };
}
