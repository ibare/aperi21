// ========================================================================
// latent-heat — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
//   그릇            trajectory — 벽 셋
//   물              region — 물 몫만큼의 높이
//   얼음            region(hatch) — 조각마다. 남은 얼음 몫의 제곱근으로 한 변이 준다
//   김              particleSystem — 김 몫만큼의 알갱이가 수면에서 오른다(시드 결정적)
//   가열기           body(rect) + lineSet 코일, 켜지면 열 색 코일과 열 화살표(vector) 셋
//   시간-온도 곡선    trajectory 곡선 · lineSet 축 · readout 눈금 · trajectory 안내 점선 · body 지금 점
//   평평한 구간       dimension — 누운 구간을 재고, 다 누우면 잠열 글자(readout)
//   캡션            BundleSchema.caption 슬롯
//
// ---- 색은 뜻마다 하나다 ----
//   secondary 물이라는 한 물질 — 얼음 · 물 · 김이 같은 색이고 결 · 모양으로 가른다 (S-piece)
//   primary   들어가는 열 — 켜진 코일 · 열 화살표
//   ink       온도 — 곡선과 지금 점
//   accent    평평하게 누운 구간 — 그것을 재는 치수선과 잠열 글자, 한 뜻에만
//   muted     물건과 자 — 그릇 · 가열기 · 축 · 눈금 · 상 이름
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
  curveCorners,
  hash01,
  heatBudget,
  heatIn,
  heaterOn,
  readConstants,
  readPot,
  sceneOpacity,
  type LatentHeatConstants,
} from './physics';
import {
  AXIS_OVERHANG,
  FLAT_DIM_GAP,
  FLAT_LABEL_GAP,
  GRAPH_H,
  GRAPH_PAD,
  GRAPH_W,
  GRAPH_X0,
  GRAPH_Y0,
  HEATER_SIZE,
  HEAT_ARROW_LEN,
  HEAT_ARROW_Y,
  ICE_ABOVE,
  ICE_SIDE,
  PHASE_LABEL_X,
  POT_BOTTOM,
  POT_TOP,
  POT_X0,
  POT_X1,
  SCENE_BOUNDS,
  STEAM_LABEL_Y,
  STEAM_TOP,
  WATER_FULL,
  text,
} from './schema';
import type { LatentHeatState } from './state';

/** 상 이름 · 축 이름 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 눈금 · 잠열 글자 크기(화면 px). */
const VALUE_PX = 11;
/** 눈금 글자를 축에서 띄우는 거리 · 축 이름을 축 끝에서 띄우는 거리(화면 px). */
const TICK_LABEL_GAP = 8;
const AXIS_LABEL_GAP = 12;
/** 얼음 · 물 이름 사이의 가장 작은 세로 간격(월드). */
const LABEL_SEP = 0.3;
/** 눈금선이 축 왼쪽으로 삐져나오는 길이(월드). */
const TICK_LEN = 0.1;
/** 곡선 · 코일 · 그릇 · 축 · 안내선 굵기(화면 px). */
const CURVE_PX = 2.5;
const COIL_PX = 2;
const POT_PX = 2;
const AXIS_PX = 1.5;
const GUIDE_PX = 1;
/** 열 화살표 굵기(화면 px). */
const HEAT_ARROW_PX = 2.5;
/** 안내 점선의 짙기 — 곡선보다 물러나 있어야 한다. */
const GUIDE_OPACITY = 0.55;
/** 물의 채움 짙기 · 얼음의 채움 짙기. */
const WATER_FILL = 0.38;
const ICE_FILL = 0.55;
/** 가열기 판의 불투명도. 물건이라 옅다. */
const HEATER_OPACITY = 0.9;
/** 김 알갱이 크기(화면 px) · 좌우 흔들림(월드) · 흔들림 횟수(한 번 오르는 동안). */
const STEAM_DOT_PX = 2.4;
const STEAM_WOBBLE = 0.12;
const STEAM_WAVES = 1.5;
/** 김 알갱이가 그릇 벽에서 떨어지는 거리(월드). */
const STEAM_INSET = 0.25;
/** 코일 지그재그 — 판 폭에 대한 몫 · 꺾임 수 · 높이(월드). */
const COIL_SPAN = 0.8;
const COIL_TURNS = 12;
const COIL_AMP = 0.06;
/** 열 화살표 셋의 가로 자리(그릇 가운데에서, 월드). */
const HEAT_ARROW_DX: readonly number[] = [-0.65, 0, 0.65];

const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const SUBSTANCE = { colorRole: 'secondary', emphasis: 'strong' } as const;
const HEAT = { colorRole: 'primary', emphasis: 'strong' } as const;
const TEMP = { colorRole: 'ink', emphasis: 'strong' } as const;
const FLAT = { colorRole: 'accent', emphasis: 'strong' } as const;

/** 곡선 판의 사상 — (넣은 열 kJ, 온도 ℃) → 월드. 넣은 열 = 시간 × 세기라 가로는 시간이다. */
function graphMap(c: LatentHeatConstants, total: number): (q: number, temp: number) => Vec2 {
  return (q, temp) => [
    GRAPH_X0 + GRAPH_PAD + (q / total) * GRAPH_W,
    GRAPH_Y0 + ((temp - c.axisMin) / (c.axisMax - c.axisMin)) * GRAPH_H,
  ];
}

/** 가열기 윗면 아래 코일 지그재그. */
function coil(cx: number): Vec2[] {
  const half = (HEATER_SIZE[0] * COIL_SPAN) / 2;
  const y = -HEATER_SIZE[1] / 2;
  const pts: Vec2[] = [];
  for (let i = 0; i <= COIL_TURNS; i++) {
    const x = cx - half + (2 * half * i) / COIL_TURNS;
    pts.push([x, y + (i % 2 === 0 ? -COIL_AMP : COIL_AMP)]);
  }
  return pts;
}

/** 네모 하나의 네 꼭짓점. */
function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

const ALL_EDGES: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
];

export function scene(params: {
  state: LatentHeatState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('latent-heat: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const b = heatBudget(c);
  const alpha = sceneOpacity(tl);
  const q = heatIn(tl, c, b);
  const pot = readPot(q, c, b);
  const on = heaterOn(tl);
  const toGraph = graphMap(c, b.total);
  const out: Primitive[] = [];

  const potMid = (POT_X0 + POT_X1) / 2;
  const potW = POT_X1 - POT_X0;
  const level = POT_BOTTOM + pot.water * WATER_FULL;

  // ================= 그릇 쪽 =================

  // ---- 가열기 ----
  // 코일은 늘 먹선으로 있고, 켜진 동안 열 색 코일이 위에 겹친다. 켜진 동안은 처음부터
  // 끝까지 같은 모양이다 — 세기가 변하지 않는다는 것이 이 조각의 전제다.
  out.push({
    type: 'body',
    id: 'heater',
    shape: 'rect',
    pos: [potMid, -HEATER_SIZE[1] / 2],
    size: HEATER_SIZE,
    opacity: alpha * HEATER_OPACITY,
    style: MUTED,
  });
  out.push({ type: 'lineSet', id: 'coil', lines: [coil(potMid)], width: COIL_PX, opacity: alpha, style: MUTED });
  if (on) {
    out.push({ type: 'lineSet', id: 'coil-on', lines: [coil(potMid)], width: COIL_PX, opacity: alpha, style: HEAT });
    HEAT_ARROW_DX.forEach((dx, i) => {
      out.push({
        type: 'vector',
        id: `heat-arrow-${i}`,
        from: [potMid + dx, HEAT_ARROW_Y],
        delta: [0, HEAT_ARROW_LEN],
        width: HEAT_ARROW_PX,
        opacity: alpha,
        style: HEAT,
      });
    });
  }

  // ---- 물 ----
  if (pot.water > 0) {
    out.push({
      type: 'region',
      id: 'water',
      points: rect(POT_X0, POT_BOTTOM, POT_X1, level),
      fillOpacity: WATER_FILL,
      opaque: true,
      opacity: alpha,
      style: SUBSTANCE,
    });
  }

  // ---- 얼음 ----
  // 같은 물질이라 물과 같은 색이고, 결(사선)과 둘레로 가른다. 남은 얼음 몫만큼 넓이가
  // 줄도록 한 변이 제곱근으로 준다. 물이 차오르면 떠서 윗부분만 물 위로 나온다.
  let iceLabelY = POT_BOTTOM + ICE_SIDE / 2;
  if (pot.ice > 0) {
    const side = ICE_SIDE * Math.sqrt(pot.ice);
    const cell = potW / c.iceCubes;
    const cy = Math.max(POT_BOTTOM + side / 2, level + ICE_ABOVE * side - side / 2);
    iceLabelY = cy;
    for (let i = 0; i < c.iceCubes; i++) {
      const cx = POT_X0 + (i + 0.5) * cell;
      out.push({
        type: 'region',
        id: `ice-${i}`,
        points: rect(cx - side / 2, cy - side / 2, cx + side / 2, cy + side / 2),
        fill: 'hatch',
        fillOpacity: ICE_FILL,
        opaque: true,
        outline: ALL_EDGES,
        opacity: alpha,
        style: SUBSTANCE,
      });
    }
  }

  // ---- 김 ----
  // 끓은 몫만큼의 알갱이가 수면에서 기둥 위로 오른다. 알갱이 i 의 자리는 (시드, i, 시각)의
  // 닫힌 식이라 같은 시각은 같은 화면이다. 오를수록 옅어진다.
  const shown = Math.floor(pot.steam * c.steamDots);
  if (shown > 0) {
    const positions: Vec2[] = [];
    const opacities: number[] = [];
    const column = STEAM_TOP - level;
    for (let i = 0; i < shown; i++) {
      const rise = (tl.t / c.steamRiseS + hash01(c.seed, i, 0)) % 1;
      const x0 = POT_X0 + STEAM_INSET + hash01(c.seed, i, 1) * (potW - 2 * STEAM_INSET);
      const wobble = STEAM_WOBBLE * Math.sin(2 * Math.PI * (rise * STEAM_WAVES + hash01(c.seed, i, 2)));
      positions.push([x0 + wobble, level + rise * column]);
      opacities.push(1 - rise);
    }
    out.push({
      type: 'particleSystem',
      id: 'steam',
      positions,
      sizes: STEAM_DOT_PX,
      opacities,
      opacity: alpha,
      style: SUBSTANCE,
    });
  }

  // ---- 그릇 ----
  out.push({
    type: 'trajectory',
    id: 'pot',
    points: [
      [POT_X0, POT_TOP],
      [POT_X0, POT_BOTTOM],
      [POT_X1, POT_BOTTOM],
      [POT_X1, POT_TOP],
    ],
    width: POT_PX,
    opacity: alpha,
    style: MUTED,
  });

  // ---- 상 이름 ----
  // 지금 그릇에 있는 것만 이름을 단다. 그릇 왼쪽에 제 높이로.
  // 얼음 · 물 이름이 겹치면 얼음 이름을 위로 민다.
  const waterLabelY = (POT_BOTTOM + level) / 2;
  const phaseLabels: { key: 'label.ice' | 'label.water' | 'label.steam'; y: number; show: boolean }[] = [
    {
      key: 'label.ice',
      y: pot.water > 0 ? Math.max(iceLabelY, waterLabelY + LABEL_SEP) : iceLabelY,
      show: pot.ice > 0,
    },
    { key: 'label.water', y: waterLabelY, show: pot.water > 0 },
    { key: 'label.steam', y: STEAM_LABEL_Y, show: shown > 0 },
  ];
  for (const l of phaseLabels) {
    if (!l.show) continue;
    out.push({
      type: 'readout',
      id: `name-${l.key}`,
      anchor: { world: [PHASE_LABEL_X, l.y] },
      text: text(l.key),
      chip: false,
      font: 'text',
      align: 'right',
      fontSize: LABEL_PX,
      opacity: alpha,
      style: MUTED,
    });
  }

  // ================= 시간-온도 곡선 =================

  const corners = curveCorners(c, b);
  const xEnd = GRAPH_X0 + GRAPH_PAD + GRAPH_W + AXIS_OVERHANG;
  const yTop = GRAPH_Y0 + GRAPH_H;

  // ---- 안내 점선 · 눈금 ----
  // 녹는점 · 끓는점에 가로 점선을 깐다. 곡선이 이 선 위에 눕는 것이 「멈췄다」 이다.
  // 눈금은 선언한 세 온도에만 — 읽을 것은 눈금 값이 아니라 누운 구간이다.
  for (const temp of [c.tMelt, c.tBoil]) {
    const [, y] = toGraph(0, temp);
    out.push({
      type: 'trajectory',
      id: `guide-${temp}`,
      points: [
        [GRAPH_X0, y],
        [xEnd, y],
      ],
      width: GUIDE_PX,
      opacity: alpha * GUIDE_OPACITY,
      style: { ...MUTED, lineStyle: 'dashed' },
    });
  }
  const ticks: Vec2[][] = [];
  for (const temp of [c.tStart, c.tMelt, c.tBoil]) {
    const [, y] = toGraph(0, temp);
    ticks.push([
      [GRAPH_X0 - TICK_LEN, y],
      [GRAPH_X0, y],
    ]);
    out.push({
      type: 'readout',
      id: `tick-${temp}`,
      anchor: { world: [GRAPH_X0 - TICK_LEN, y], offset: [-TICK_LABEL_GAP, 0] },
      text: text('label.tick'),
      vars: { t: String(temp) },
      chip: false,
      align: 'right',
      fontSize: VALUE_PX,
      opacity: alpha,
      style: MUTED,
    });
  }

  // ---- 축 ----
  out.push({
    type: 'lineSet',
    id: 'axes',
    lines: [
      [
        [GRAPH_X0, yTop],
        [GRAPH_X0, GRAPH_Y0],
        [xEnd, GRAPH_Y0],
      ],
      ...ticks,
    ],
    width: AXIS_PX,
    opacity: alpha,
    style: MUTED,
  });
  out.push({
    type: 'readout',
    id: 'axis-temp',
    anchor: { world: [GRAPH_X0, yTop], offset: [0, -AXIS_LABEL_GAP] },
    text: text('label.tempAxis'),
    chip: false,
    font: 'text',
    align: 'center',
    fontSize: LABEL_PX,
    opacity: alpha,
    style: MUTED,
  });
  out.push({
    type: 'readout',
    id: 'axis-time',
    anchor: { world: [xEnd, GRAPH_Y0], offset: [0, AXIS_LABEL_GAP] },
    text: text('label.timeAxis'),
    chip: false,
    font: 'text',
    align: 'right',
    fontSize: LABEL_PX,
    opacity: alpha,
    style: MUTED,
  });

  // ---- 평평한 구간 ----
  // 곡선이 눕기 시작하면 그 위에 치수선이 따라 자라고, 다 누우면
  // 잠열 글자가 붙는다. 두 치수선의 길이 차가 곧 두 잠열의 차다.
  const flats = [
    { id: 'melt', from: corners[1]!, to: corners[2]!, side: 1, latent: c.lFusion },
    { id: 'boil', from: corners[3]!, to: corners[4]!, side: 1, latent: c.lVapor },
  ];
  for (const f of flats) {
    if (q <= f.from[0]) continue;
    const [x0, y] = toGraph(f.from[0], f.from[1]);
    const [x1] = toGraph(Math.min(q, f.to[0]), f.to[1]);
    const [xFull] = toGraph(f.to[0], f.to[1]);
    out.push({
      type: 'dimension',
      id: `flat-${f.id}`,
      from: [x0, y + f.side * FLAT_DIM_GAP],
      to: [x1, y + f.side * FLAT_DIM_GAP],
      opacity: alpha,
      style: FLAT,
    });
    if (q >= f.to[0]) {
      out.push({
        type: 'readout',
        id: `flat-label-${f.id}`,
        anchor: { world: [(x0 + xFull) / 2, y + f.side * FLAT_LABEL_GAP] },
        text: text('label.latent'),
        vars: { l: String(f.latent) },
        chip: false,
        align: 'center',
        fontSize: VALUE_PX,
        opacity: alpha,
        style: FLAT,
      });
    }
  }

  // ---- 곡선 · 지금 점 ----
  // 지나온 꺾임점을 잇고 지금 자리에서 끊는다. 가열 전에는 처음 자리의 점 하나뿐이다.
  const points: Vec2[] = [];
  for (const [cq, ct] of corners) {
    if (cq >= q) break;
    points.push(toGraph(cq, ct));
  }
  const head = toGraph(q, pot.temp);
  points.push(head);
  if (points.length >= 2) {
    out.push({ type: 'trajectory', id: 'curve', points, width: CURVE_PX, opacity: alpha, style: TEMP });
  }
  out.push({ type: 'body', id: 'now', pos: head, shape: 'point', opacity: alpha, style: TEMP });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
