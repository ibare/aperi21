// ========================================================================
// adiabatic-process — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽은 장치 — 단열재(region 빗금)로 감싼 실린더(surface) · 기체 기둥(region) ·
// 분자(particleSystem) · 피스톤(body) · 온도계(region 셋 + body, 눈금 lineSet + readout).
// 오른쪽은 P–V 그림 — 축(vector) · 등온 곡선(trajectory 점선) · 단열 곡선(trajectory 실선) ·
// 두 점(body 빈 점 · 찬 점) · 곡선 이름표 · 처음 · 끝 눈금 · 끝 압력 안내선.
//
// 색은 뜻마다 하나다. **강조색은 온도의 높이 한 뜻에만** — 온도계 채움과 알뿌리. 두 곡선은
// 색이 아니라 선 모양(점선 · 실선)과 점 모양(빈 점 · 찬 점), 이름표 낱말로 가른다 (S-piece).
// 기체 · 분자는 secondary, 단열재는 muted 빗금, 단열 곡선 · 찬 점 · 피스톤 · 축은 먹.
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
  adiabatPressure,
  isothermPressure,
  readConstants,
  readGas,
  readMolecules,
  type AdiabaticProcessConstants,
} from './physics';
import {
  CYLINDER,
  GRAPH_ORIGIN,
  INSULATION,
  PISTON_THICKNESS,
  SCENE_BOUNDS,
  THERMO,
  WALL_HEADROOM,
  text,
} from './schema';
import type { AdiabaticProcessState } from './state';

// ---- 장치 ----
/** 분자 점 반지름 · 자취(화면 px, 초, 짙기). 식을수록 자취가 짧아진다. */
const MOLECULE_PX = 2;
const MOLECULE_MARGIN = 0.05;
const TRAIL_SECONDS = 0.14;
const TRAIL_WIDTH_PX = 1.2;
const TRAIL_OPACITY = 0.45;
/** 기체 기둥의 옅은 칠. 분자가 비쳐 보여야 한다. */
const GAS_FILL = 0.1;
/** 단열재 빗금 바탕의 짙기. */
const INSULATION_FILL = 0.3;
/** 단열재 이름표 — 바닥 띠 아래로 띄운 거리(화면 px) · 글자 크기. */
const INSULATION_LABEL_GAP_PX = 12;
const INSULATION_LABEL_PX = 12;
/** 피스톤이 실린더 벽과 닿지 않게 줄이는 틈(월드). */
const PISTON_CLEARANCE = 0.03;

// ---- 온도계 ----
/** 채움의 짙기 · 관 바탕의 옅기. */
const TUBE_FILL = 0.85;
const TUBE_BG = 0.06;
/** 알뿌리 중심을 관 아래 끝에서 내리는 몫(반지름에 대한 비). 관과 알뿌리가 이어져 보인다. */
const BULB_DROP = 0.7;
/** 눈금 짧은 선의 길이(월드) · 굵기(화면 px) · 글자 띄움(화면 px) · 글자 크기(화면 px). */
const THERMO_TICK_LEN = 0.1;
const THERMO_TICK_WIDTH_PX = 1.2;
const THERMO_LABEL_GAP_PX = 5;
const THERMO_LABEL_PX = 12;

// ---- P–V 그림 ----
/** 축 굵기(화면 px) · 축 끝이 보이는 범위 너머로 나오는 여유(월드) · 화살촉 크기(월드). */
const AXIS_WIDTH_PX = 1.4;
const AXIS_OVERHANG = 0.15;
const AXIS_HEAD = 0.12;
/** 곡선 표본 수와 굵기(화면 px). 등온은 비교 기준이라 한 단 가늘다. */
const CURVE_SAMPLES = 64;
const ADIABAT_WIDTH_PX = 2.2;
const ISOTHERM_WIDTH_PX = 1.6;
/** 곡선 이름표 — 곡선 오른쪽 끝에서 띄운 거리(화면 px) · 글자 크기(화면 px). */
const CURVE_LABEL_OFFSET: Vec2 = [8, 0];
const CURVE_LABEL_PX = 13;
/** 처음 부피의 안내선 · 끝 압력 안내선 굵기(화면 px) · 짙기. */
const GUIDE_WIDTH_PX = 1.2;
const GUIDE_OPACITY = 0.7;
/** 두 점 반지름(월드). 빈 점은 둘레만 긋는다. */
const POINT_RADIUS = 0.07;
/** 눈금선 길이(월드), 눈금 이름 · 축 이름의 띄움(화면 px), 글자 크기(화면 px). */
const TICK_LEN = 0.08;
const TICK_WIDTH_PX = 1.2;
const TICK_LABEL_GAP_PX = 13;
const P_TICK_LABEL_GAP_PX = 6;
const TICK_LABEL_PX = 12;
const AXIS_LABEL_GAP_PX = 14;
const AXIS_LABEL_PX = 15;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const TEMP_LEVEL = { colorRole: 'accent', emphasis: 'strong' } as const;

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

/** 온도(K) → 온도계 채움 높이(월드 y). */
function thermoY(temp: number, c: AdiabaticProcessConstants): number {
  const f = (temp - c.thermoTMin) / (c.thermoTMax - c.thermoTMin);
  return THERMO.bottom + Math.min(1, Math.max(0, f)) * (THERMO.top - THERMO.bottom);
}

export function scene(params: {
  state: AdiabaticProcessState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('adiabatic-process: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const g = readGas(tl, c);
  const out: Primitive[] = [];

  // ================= 장치 =================
  const gasHeight = g.vRatio * c.worldPerVolume;
  const pistonBottom = CYLINDER.bottom + gasHeight;
  const pistonTop = pistonBottom + PISTON_THICKNESS;
  const wallTop = CYLINDER.bottom + c.k * c.worldPerVolume + PISTON_THICKNESS + WALL_HEADROOM;
  const cx = (CYLINDER.left + CYLINDER.right) / 2;

  // ---- 단열재 — 두 옆 벽 바깥과 바닥 아래를 감싼 ㄷ자 빗금 띠 ----
  const L = CYLINDER.left;
  const R = CYLINDER.right;
  const B = CYLINDER.bottom;
  out.push({
    type: 'region',
    id: 'insulation',
    points: [
      [L - INSULATION, B - INSULATION],
      [R + INSULATION, B - INSULATION],
      [R + INSULATION, wallTop],
      [R, wallTop],
      [R, B],
      [L, B],
      [L, wallTop],
      [L - INSULATION, wallTop],
    ],
    fill: 'hatch',
    fillOpacity: INSULATION_FILL,
    style: MUTED,
  });
  out.push({
    type: 'readout',
    id: 'insulation-label',
    anchor: { world: [cx, B - INSULATION], offset: [0, INSULATION_LABEL_GAP_PX] },
    text: text('label.insulation'),
    chip: false,
    font: 'text',
    fontSize: INSULATION_LABEL_PX,
    style: MUTED,
  });

  // ---- 기체 기둥 — 바닥에서 피스톤까지. 이 칸의 높이가 곧 부피다. ----
  out.push({
    type: 'region',
    id: 'gas',
    points: rect(L, B, R, pistonBottom),
    fillOpacity: GAS_FILL,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 분자 — 식을수록 자취가 짧아진다(속력 ∝ √T). ----
  const field = readMolecules(state.molecules, tl, c, g, {
    left: L,
    right: R,
    bottom: B,
    height: gasHeight,
    margin: MOLECULE_MARGIN,
  });
  out.push({
    type: 'particleSystem',
    id: 'molecules',
    positions: field.positions,
    velocities: field.velocities,
    sizes: MOLECULE_PX,
    trail: true,
    trailStyle: { seconds: TRAIL_SECONDS, width: TRAIL_WIDTH_PX, opacity: TRAIL_OPACITY },
    clip: { min: [L, B], max: [R, pistonBottom] },
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 피스톤 ----
  out.push({
    type: 'body',
    id: 'piston',
    pos: [cx, (pistonBottom + pistonTop) / 2],
    shape: 'rect',
    size: [R - L - 2 * PISTON_CLEARANCE, PISTON_THICKNESS],
    outline: 'none',
    style: INK,
  });

  // ---- 실린더 — 두 옆 벽과 바닥 ----
  out.push({
    type: 'surface',
    id: 'wall-left',
    geometry: { kind: 'wall', from: [L, wallTop], to: [L, B] },
    material: 'solid',
  });
  out.push({
    type: 'surface',
    id: 'wall-right',
    geometry: { kind: 'wall', from: [R, B], to: [R, wallTop] },
    material: 'solid',
  });
  out.push({
    type: 'surface',
    id: 'wall-bottom',
    geometry: { kind: 'wall', from: [L, B], to: [R, B] },
    material: 'solid',
  });

  // ---- 온도계 — 채움 높이가 지금 온도. 글자는 선언한 두 온도의 눈금에만. ----
  const tx0 = THERMO.x - THERMO.width / 2;
  const tx1 = THERMO.x + THERMO.width / 2;
  const bulbY = THERMO.bottom - THERMO.bulb * BULB_DROP;
  out.push({
    type: 'region',
    id: 'thermo-bg',
    points: rect(tx0, THERMO.bottom, tx1, THERMO.top),
    opaque: true,
    fillOpacity: TUBE_BG,
    style: MUTED,
  });
  out.push({
    type: 'body',
    id: 'thermo-bulb',
    shape: 'circle',
    pos: [THERMO.x, bulbY],
    size: THERMO.bulb,
    glow: false,
    style: TEMP_LEVEL,
  });
  out.push({
    type: 'region',
    id: 'thermo-fill',
    points: rect(tx0, bulbY, tx1, thermoY(g.temperature, c)),
    fillOpacity: TUBE_FILL,
    style: TEMP_LEVEL,
  });
  out.push({
    type: 'region',
    id: 'thermo-rim',
    points: rect(tx0, THERMO.bottom, tx1, THERMO.top),
    fillOpacity: 0,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: MUTED,
  });
  const thermoTicks = [
    { id: 'start', temp: c.t0, label: state.t0 },
    { id: 'end', temp: c.tEndShown, label: state.t1 },
  ];
  out.push({
    type: 'lineSet',
    id: 'thermo-ticks',
    lines: thermoTicks.map((t): Vec2[] => [
      [tx0 - THERMO_TICK_LEN, thermoY(t.temp, c)],
      [tx0, thermoY(t.temp, c)],
    ]),
    width: THERMO_TICK_WIDTH_PX,
    style: MUTED,
  });
  for (const t of thermoTicks) {
    out.push({
      type: 'readout',
      id: `thermo-tick-${t.id}`,
      anchor: { world: [tx0 - THERMO_TICK_LEN, thermoY(t.temp, c)], offset: [-THERMO_LABEL_GAP_PX, 0] },
      text: text('label.kelvin'),
      vars: { t: t.label },
      chip: false,
      font: 'mono',
      align: 'right',
      fontSize: THERMO_LABEL_PX,
      style: MUTED,
    });
  }

  // ================= P–V 그림 (장부 G203 조립) =================
  const [ox, oy] = GRAPH_ORIGIN;
  const gx = (v: number): number => ox + v * c.graphWorldPerVolume;
  const gy = (p: number): number => oy + p * c.graphWorldPerPressure;
  /** 끝 압력 안내선 · 눈금은 부풂이 끝난 뒤 떠오르고 되돌리는 동안 옅어진다. */
  const markFade = tl.at('mark') * (1 - tl.at('reset'));

  // ---- 처음 자리 안내선 — V₁ 에서 곡선까지, P₁ 에서 곡선까지 점선. ----
  out.push({
    type: 'trajectory',
    id: 'guide-start',
    points: [
      [gx(1), oy],
      [gx(1), gy(1)],
      [ox, gy(1)],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: GUIDE_OPACITY,
    style: { ...MUTED, lineStyle: 'dashed' },
  });
  // ---- 끝 부피 안내선 — k·V₁ 에서 등온 곡선 높이까지. ----
  out.push({
    type: 'trajectory',
    id: 'guide-end-v',
    points: [
      [gx(c.k), oy],
      [gx(c.k), gy(isothermPressure(c.k))],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: GUIDE_OPACITY,
    style: { ...MUTED, lineStyle: 'dashed' },
  });
  // ---- 끝 압력 안내선 — 두 곡선의 끝 점에서 P 축까지. 부풂이 끝난 뒤에만. ----
  const pEnds = [
    { id: 'iso', p: isothermPressure(c.k), label: state.pIso },
    { id: 'adia', p: adiabatPressure(c.k, c), label: state.pAdia },
  ];
  if (markFade > 0) {
    for (const e of pEnds) {
      out.push({
        type: 'trajectory',
        id: `guide-end-p-${e.id}`,
        points: [
          [gx(c.k), gy(e.p)],
          [ox, gy(e.p)],
        ],
        width: GUIDE_WIDTH_PX,
        opacity: GUIDE_OPACITY * markFade,
        style: { ...MUTED, lineStyle: 'dashed' },
      });
    }
  }

  // ---- 등온 곡선(점선) · 단열 곡선(실선) — 지금 점과 같은 계산으로 표본한다. ----
  const iso: Vec2[] = [];
  const adia: Vec2[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const v = c.graphVMin + ((c.graphVMax - c.graphVMin) * i) / CURVE_SAMPLES;
    iso.push([gx(v), gy(isothermPressure(v))]);
    adia.push([gx(v), gy(adiabatPressure(v, c))]);
  }
  /** 두 곡선을 그림 판 안으로 자른다 — 처음 부피 왼쪽에서 압력이 보이는 범위를 넘는다. */
  const graphBox = { min: [ox, oy] as Vec2, max: [gx(c.graphVMax), gy(c.graphPMax)] as Vec2 };
  out.push({
    type: 'trajectory',
    id: 'isotherm',
    points: iso,
    width: ISOTHERM_WIDTH_PX,
    clip: graphBox,
    style: { ...MUTED, lineStyle: 'dashed' },
  });
  out.push({
    type: 'trajectory',
    id: 'adiabat',
    points: adia,
    width: ADIABAT_WIDTH_PX,
    clip: graphBox,
    style: INK,
  });
  out.push({
    type: 'readout',
    id: 'isotherm-label',
    anchor: { world: iso[iso.length - 1]!, offset: CURVE_LABEL_OFFSET },
    text: text('label.isotherm'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: CURVE_LABEL_PX,
    style: MUTED,
  });
  out.push({
    type: 'readout',
    id: 'adiabat-label',
    anchor: { world: adia[adia.length - 1]!, offset: CURVE_LABEL_OFFSET },
    text: text('label.adiabat'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: CURVE_LABEL_PX,
    style: INK,
  });

  // ---- 축 ----
  out.push({
    type: 'vector',
    id: 'axis-v',
    from: [ox, oy],
    delta: [c.graphVMax * c.graphWorldPerVolume + AXIS_OVERHANG, 0],
    headSize: AXIS_HEAD,
    width: AXIS_WIDTH_PX,
    style: INK,
  });
  out.push({
    type: 'vector',
    id: 'axis-p',
    from: [ox, oy],
    delta: [0, c.graphPMax * c.graphWorldPerPressure + AXIS_OVERHANG],
    headSize: AXIS_HEAD,
    width: AXIS_WIDTH_PX,
    style: INK,
  });
  out.push({
    type: 'readout',
    id: 'axis-v-label',
    anchor: {
      world: [ox + c.graphVMax * c.graphWorldPerVolume + AXIS_OVERHANG, oy],
      offset: [0, AXIS_LABEL_GAP_PX],
    },
    text: text('label.volume'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: AXIS_LABEL_PX,
    style: INK,
  });
  out.push({
    type: 'readout',
    id: 'axis-p-label',
    anchor: {
      world: [ox, oy + c.graphPMax * c.graphWorldPerPressure + AXIS_OVERHANG],
      offset: [-AXIS_LABEL_GAP_PX, 0],
    },
    text: text('label.pressure'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: AXIS_LABEL_PX,
    style: INK,
  });

  // ---- 눈금 — V 축에 처음 · 끝 부피, P 축에 처음 압력(늘) · 두 끝 압력(부풂이 끝난 뒤). ----
  out.push({
    type: 'lineSet',
    id: 'graph-ticks-v',
    lines: [1, c.k].map((v): Vec2[] => [
      [gx(v), oy],
      [gx(v), oy - TICK_LEN],
    ]),
    width: TICK_WIDTH_PX,
    style: INK,
  });
  out.push({
    type: 'readout',
    id: 'tick-v-start',
    anchor: { world: [gx(1), oy], offset: [0, TICK_LABEL_GAP_PX] },
    text: text('label.volumeStart'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: TICK_LABEL_PX,
    style: MUTED,
  });
  out.push({
    type: 'readout',
    id: 'tick-v-end',
    anchor: { world: [gx(c.k), oy], offset: [0, TICK_LABEL_GAP_PX] },
    text: text('label.volumeEnd'),
    vars: { k: state.k },
    chip: false,
    font: 'text',
    italic: true,
    fontSize: TICK_LABEL_PX,
    style: MUTED,
  });
  out.push({
    type: 'lineSet',
    id: 'graph-tick-p-start',
    lines: [
      [
        [ox, gy(1)],
        [ox - TICK_LEN, gy(1)],
      ],
    ],
    width: TICK_WIDTH_PX,
    style: INK,
  });
  out.push({
    type: 'readout',
    id: 'tick-p-start',
    anchor: { world: [ox - TICK_LEN, gy(1)], offset: [-P_TICK_LABEL_GAP_PX, 0] },
    text: text('label.pressureStart'),
    chip: false,
    font: 'text',
    italic: true,
    align: 'right',
    fontSize: TICK_LABEL_PX,
    style: MUTED,
  });
  if (markFade > 0) {
    out.push({
      type: 'lineSet',
      id: 'graph-ticks-p-end',
      lines: pEnds.map((e): Vec2[] => [
        [ox, gy(e.p)],
        [ox - TICK_LEN, gy(e.p)],
      ]),
      width: TICK_WIDTH_PX,
      opacity: markFade,
      style: INK,
    });
    for (const e of pEnds) {
      out.push({
        type: 'readout',
        id: `tick-p-end-${e.id}`,
        anchor: { world: [ox - TICK_LEN, gy(e.p)], offset: [-P_TICK_LABEL_GAP_PX, 0] },
        text: text('label.pressureEnd'),
        vars: { p: e.label },
        chip: false,
        font: 'text',
        italic: true,
        align: 'right',
        opacity: markFade,
        fontSize: TICK_LABEL_PX,
        style: MUTED,
      });
    }
  }

  // ---- 두 점 — 같은 부피에서 등온 곡선의 빈 점, 단열 곡선의 찬 점. ----
  out.push({
    type: 'body',
    id: 'point-iso',
    pos: [gx(g.vRatio), gy(g.pIso)],
    shape: 'circle',
    size: POINT_RADIUS,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: MUTED,
  });
  out.push({
    type: 'body',
    id: 'point-adia',
    pos: [gx(g.vRatio), gy(g.pAdia)],
    shape: 'circle',
    size: POINT_RADIUS,
    outline: 'background',
    glow: false,
    style: INK,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
