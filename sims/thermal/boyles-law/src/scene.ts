// ========================================================================
// boyles-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽은 장치 — 막힌 실린더(surface) · 기체 기둥(region) · 분자(particleSystem) ·
// 피스톤과 막대(body) · 미는 손(vector) · 관으로 붙은 압력계(body 원 · lineSet 눈금 ·
// trajectory 바늘 · readout 눈금 숫자) · 묶어 둔 온도(readout).
// 오른쪽은 P–V 그림 — 축(vector) · 같은 온도의 곡선(trajectory) · 지금 점(body) ·
// 지금 P×V 직사각형(region) · 멈춘 자리마다 남는 점선 직사각형(trajectory closed).
//
// 색은 뜻마다 하나다. 기체(기둥과 분자)는 secondary, **P×V 직사각형은 지금 것이든
// 남은 것이든 primary 한 색** — 셋 다 같은 양(넓이)이라 같은 색이다 (S-piece).
// 곡선 · 축 · 계기는 먹과 muted. 강조색은 쓰지 않는다.
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
  pinnedVisibility,
  pressureRatioAt,
  pushing,
  readConstants,
  readGas,
  readMolecules,
  type BoylesLawConstants,
} from './physics';
import {
  CYLINDER,
  GAUGE,
  GRAPH_ORIGIN,
  MOLECULE_MARGIN,
  PISTON_THICKNESS,
  ROD_LENGTH,
  ROD_THICKNESS,
  SCENE_BOUNDS,
  TEMPERATURE_AT,
  text,
  type BoylesLawMessageKey,
} from './schema';
import type { BoylesLawState } from './state';

// ---- 장치 ----
/** 분자 점 반지름(화면 px) — 작게만. 두드림은 이웃 `gas-pressure` 의 몫이다. */
const MOLECULE_PX = 2;
/** 분자 자취 — 속도 × 이 시간(초)만큼의 획, 굵기(화면 px), 짙기. */
const TRAIL_SECONDS = 0.12;
const TRAIL_WIDTH_PX = 1.2;
const TRAIL_OPACITY = 0.4;
/** 기체 기둥의 옅은 칠. 분자가 비쳐 보여야 한다. */
const GAS_FILL = 0.1;
/** 피스톤이 실린더 벽과 닿지 않게 줄이는 틈(월드). */
const PISTON_CLEARANCE = 0.03;
/** 미는 손 화살표 길이 · 막대 끝에서 띄운 거리(월드). */
const PUSH_ARROW_LEN = 0.5;
const PUSH_ARROW_GAP = 0.06;
/** 압력계로 가는 관 굵기(화면 px). */
const PIPE_WIDTH_PX = 3;

// ---- 압력계 ----
/** 눈금판 0 의 각(월드, x 축에서 반시계 — 왼쪽 아래)과 끝값까지 시계 방향으로 쓰는 각. */
const GAUGE_START = (Math.PI * 5) / 4;
const GAUGE_SWEEP = (Math.PI * 3) / 2;
/** 눈금판 안 비율 — 눈금선 안 · 바깥, 눈금 숫자 자리, 바늘 길이 · 꼬리, 가운데 축, 기호 자리. */
const GAUGE_TICK_INNER = 0.8;
const GAUGE_TICK_OUTER = 0.95;
const GAUGE_LABEL_R = 1.25;
const GAUGE_NEEDLE = 0.78;
const GAUGE_NEEDLE_TAIL = 0.15;
const GAUGE_HUB = 0.08;
const GAUGE_SYMBOL_R = 0.45;
/** 눈금판 테두리 · 눈금선 · 바늘 굵기(화면 px). */
const GAUGE_TICK_WIDTH_PX = 1.2;
const GAUGE_NEEDLE_WIDTH_PX = 2.4;
/** 눈금 숫자 · 기호 글자 크기(화면 px). */
const GAUGE_LABEL_PX = 12;
const GAUGE_SYMBOL_PX = 13;

// ---- 온도 ----
const TEMPERATURE_PX = 13;

// ---- P–V 그림 ----
/** 축 굵기(화면 px) · 축 끝이 보이는 범위 너머로 나오는 여유(월드). */
const AXIS_WIDTH_PX = 1.4;
const AXIS_OVERHANG = 0.15;
/** 축 화살촉 크기(월드). */
const AXIS_HEAD = 0.12;
/** 곡선 표본 수와 굵기(화면 px). */
const CURVE_SAMPLES = 64;
const CURVE_WIDTH_PX = 2;
/** 지금 직사각형의 칠. 아래 곡선 · 남은 직사각형이 비쳐 보여야 한다. */
const RECT_FILL = 0.2;
/** 멈춘 자리에 남는 직사각형 — 점선 굵기(화면 px) · 짙기. */
const PINNED_WIDTH_PX = 1.4;
const PINNED_OPACITY = 0.85;
/** 지금 점 · 멈춘 점의 반지름(월드). */
const POINT_RADIUS = 0.075;
const PINNED_POINT_RADIUS = 0.05;
/** 눈금선 길이(월드)와 눈금 숫자 · 축 이름의 띄움(화면 px), 글자 크기(화면 px). */
const TICK_LEN = 0.08;
const TICK_WIDTH_PX = 1.2;
const TICK_LABEL_GAP_PX = 13;
const TICK_LABEL_PX = 12;
const AXIS_LABEL_GAP_PX = 14;
const AXIS_LABEL_PX = 15;
/** 직사각형 아래쪽의 P×V 표식 글자 크기 · V 축에서 띄운 거리(화면 px). */
const AREA_LABEL_PX = 12;
const AREA_LABEL_GAP_PX = 14;

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

/** 멈추는 자리 하나 — 부피 비와 그 자리의 눈금 글자. */
interface Stop {
  id: 'first' | 'second' | 'third';
  vRatio: number;
  /** 부피 눈금(`1` · `1/k`)과 압력 눈금(`1` · `k`)의 문안과 끼울 값. */
  vLabel: BoylesLawMessageKey;
  pLabel: BoylesLawMessageKey;
  k: string;
}

function stopsOf(state: BoylesLawState, c: BoylesLawConstants): Stop[] {
  return [
    { id: 'first', vRatio: 1, vLabel: 'label.one', pLabel: 'label.one', k: '' },
    { id: 'second', vRatio: 1 / c.k2, vLabel: 'label.inverse', pLabel: 'label.ratio', k: state.k2 },
    { id: 'third', vRatio: 1 / c.k3, vLabel: 'label.inverse', pLabel: 'label.ratio', k: state.k3 },
  ];
}

export function scene(params: {
  state: BoylesLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('boyles-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const g = readGas(tl, c);
  const out: Primitive[] = [];

  // ================= 장치 =================
  const length = g.vRatio * c.worldPerVolume;
  const pistonLeft = CYLINDER.left + length;
  const pistonRight = pistonLeft + PISTON_THICKNESS;
  const midY = (CYLINDER.bottom + CYLINDER.top) / 2;

  // ---- 기체 기둥 — 막힌 벽에서 피스톤까지. 이 칸의 길이가 곧 부피다. ----
  out.push({
    type: 'region',
    id: 'gas',
    points: rect(CYLINDER.left, CYLINDER.bottom, pistonLeft, CYLINDER.top),
    fillOpacity: GAS_FILL,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 분자 — 작은 배경. 좁아지면 같은 분자가 좁은 칸에 몰리고 벽에 더 자주 닿는다. ----
  const field = readMolecules(state.molecules, tl, c, g, {
    left: CYLINDER.left,
    bottom: CYLINDER.bottom,
    top: CYLINDER.top,
    length,
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
    clip: { min: [CYLINDER.left, CYLINDER.bottom], max: [pistonLeft, CYLINDER.top] },
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 피스톤과 막대 ----
  out.push({
    type: 'body',
    id: 'piston',
    pos: [(pistonLeft + pistonRight) / 2, midY],
    shape: 'rect',
    size: [PISTON_THICKNESS, CYLINDER.top - CYLINDER.bottom - 2 * PISTON_CLEARANCE],
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'piston-rod',
    pos: [pistonRight + ROD_LENGTH / 2, midY],
    shape: 'rect',
    size: [ROD_LENGTH, ROD_THICKNESS],
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 실린더 — 막힌 왼쪽 벽과 위 · 아래 벽. 오른쪽은 열려 피스톤이 드나든다. ----
  out.push({
    type: 'surface',
    id: 'wall-left',
    geometry: { kind: 'wall', from: [CYLINDER.left, CYLINDER.top], to: [CYLINDER.left, CYLINDER.bottom] },
    material: 'solid',
  });
  out.push({
    type: 'surface',
    id: 'wall-top',
    geometry: { kind: 'wall', from: [CYLINDER.left, CYLINDER.top], to: [CYLINDER.end, CYLINDER.top] },
    material: 'solid',
  });
  out.push({
    type: 'surface',
    id: 'wall-bottom',
    geometry: { kind: 'wall', from: [CYLINDER.left, CYLINDER.bottom], to: [CYLINDER.end, CYLINDER.bottom] },
    material: 'solid',
  });

  // ---- 미는 손 — 누르는 단계에만 있다. 놓는 단계에는 손이 없다. ----
  if (pushing(tl)) {
    const tip = pistonRight + ROD_LENGTH + PUSH_ARROW_GAP;
    out.push({
      type: 'vector',
      id: 'push',
      from: [tip + PUSH_ARROW_LEN, midY],
      delta: [-PUSH_ARROW_LEN, 0],
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 압력계 — 막힌 쪽 위에 관으로 붙는다 (장부 G144 조립) ----
  const r = GAUGE.radius;
  const center: Vec2 = [GAUGE.x, GAUGE.y];
  const angleOf = (p: number): number => GAUGE_START - (Math.min(p, c.gaugeMax) / c.gaugeMax) * GAUGE_SWEEP;
  const polar = (a: number, k: number): Vec2 => [GAUGE.x + Math.cos(a) * r * k, GAUGE.y + Math.sin(a) * r * k];

  out.push({
    type: 'trajectory',
    id: 'gauge-pipe',
    points: [
      [GAUGE.x, CYLINDER.top],
      [GAUGE.x, GAUGE.y - r],
    ],
    width: PIPE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'gauge-face',
    pos: center,
    shape: 'circle',
    size: r,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  const gaugeTicks: Vec2[][] = [];
  for (let v = 0; v <= c.gaugeMax + 1e-9; v += c.gaugeTick) {
    const a = angleOf(v);
    gaugeTicks.push([polar(a, GAUGE_TICK_INNER), polar(a, GAUGE_TICK_OUTER)]);
  }
  out.push({
    type: 'lineSet',
    id: 'gauge-ticks',
    lines: gaugeTicks,
    width: GAUGE_TICK_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  // 눈금 숫자 — 멈추는 세 자리에만, 테두리 밖에 둔다(바늘이 가리지 않게). 처음 값 1 과 스테이지 상수 k₂ · k₃ 를 그대로 쓴다.
  const stops = stopsOf(state, c);
  for (const s of stops) {
    out.push({
      type: 'readout',
      id: `gauge-label-${s.id}`,
      anchor: { world: polar(angleOf(pressureRatioAt(s.vRatio, c)), GAUGE_LABEL_R) },
      text: text(s.pLabel),
      vars: { k: s.k },
      chip: false,
      font: 'mono',
      fontSize: GAUGE_LABEL_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'readout',
    id: 'gauge-symbol',
    anchor: { world: [GAUGE.x, GAUGE.y - r * GAUGE_SYMBOL_R] },
    text: text('label.pressure'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: GAUGE_SYMBOL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  const needleAngle = angleOf(g.pRatio);
  out.push({
    type: 'trajectory',
    id: 'gauge-needle',
    points: [polar(needleAngle + Math.PI, GAUGE_NEEDLE_TAIL), polar(needleAngle, GAUGE_NEEDLE)],
    width: GAUGE_NEEDLE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'gauge-hub',
    pos: center,
    shape: 'circle',
    size: r * GAUGE_HUB,
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 온도 — 주기 내내 같은 글자다. ----
  out.push({
    type: 'readout',
    id: 'temperature',
    anchor: { world: [TEMPERATURE_AT[0], TEMPERATURE_AT[1]] },
    text: text('label.temperature'),
    vars: { t: state.t },
    font: 'text',
    fontSize: TEMPERATURE_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ================= P–V 그림 (장부 G203 조립) =================
  const [ox, oy] = GRAPH_ORIGIN;
  const gx = (v: number): number => ox + v * c.worldPerVolume;
  const gy = (p: number): number => oy + p * c.worldPerPressure;
  const pinned = pinnedVisibility(tl);

  // ---- 지금 직사각형 — 원점과 지금 점을 모서리로. 넓이가 P×V 다. ----
  const px = gx(g.vRatio);
  const py = gy(g.pRatio);
  out.push({
    type: 'region',
    id: 'area-now',
    points: rect(ox, oy, px, py),
    fillOpacity: RECT_FILL,
    outline: [
      [1, 2],
      [2, 3],
    ],
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 멈춘 자리마다 남는 직사각형 — 같은 색 점선. 넓이를 서로 견준다. ----
  for (const s of stops) {
    const vis = pinned[s.id];
    if (vis <= 0) continue;
    const sx = gx(s.vRatio);
    const sy = gy(pressureRatioAt(s.vRatio, c));
    out.push({
      type: 'trajectory',
      id: `area-${s.id}`,
      points: rect(ox, oy, sx, sy),
      closed: true,
      width: PINNED_WIDTH_PX,
      opacity: vis * PINNED_OPACITY,
      style: { colorRole: 'primary', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 같은 온도의 곡선 — 지금 점과 같은 계산으로 표본한다. ----
  const vMin = 1 / c.graphPMax;
  const curve: Vec2[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const v = vMin + ((c.graphVMax - vMin) * i) / CURVE_SAMPLES;
    curve.push([gx(v), gy(pressureRatioAt(v, c))]);
  }
  out.push({
    type: 'trajectory',
    id: 'isotherm',
    points: curve,
    width: CURVE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 축 ----
  out.push({
    type: 'vector',
    id: 'axis-v',
    from: [ox, oy],
    delta: [c.graphVMax * c.worldPerVolume + AXIS_OVERHANG, 0],
    headSize: AXIS_HEAD,
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'axis-p',
    from: [ox, oy],
    delta: [0, c.graphPMax * c.worldPerPressure + AXIS_OVERHANG],
    headSize: AXIS_HEAD,
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-v-label',
    anchor: { world: [ox + c.graphVMax * c.worldPerVolume + AXIS_OVERHANG, oy], offset: [0, AXIS_LABEL_GAP_PX] },
    text: text('label.volume'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: AXIS_LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-p-label',
    anchor: { world: [ox, oy + c.graphPMax * c.worldPerPressure + AXIS_OVERHANG], offset: [-AXIS_LABEL_GAP_PX, 0] },
    text: text('label.pressure'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: AXIS_LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 눈금 — 멈추는 세 자리에만. 격자는 두지 않는다. ----
  const ticks: Vec2[][] = [];
  for (const s of stops) {
    const sx = gx(s.vRatio);
    const sy = gy(pressureRatioAt(s.vRatio, c));
    ticks.push([
      [sx, oy],
      [sx, oy - TICK_LEN],
    ]);
    ticks.push([
      [ox, sy],
      [ox - TICK_LEN, sy],
    ]);
  }
  out.push({
    type: 'lineSet',
    id: 'graph-ticks',
    lines: ticks,
    width: TICK_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  for (const s of stops) {
    const sx = gx(s.vRatio);
    const sy = gy(pressureRatioAt(s.vRatio, c));
    out.push({
      type: 'readout',
      id: `tick-v-${s.id}`,
      anchor: { world: [sx, oy], offset: [0, TICK_LABEL_GAP_PX] },
      text: text(s.vLabel),
      vars: { k: s.k },
      chip: false,
      font: 'mono',
      fontSize: TICK_LABEL_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `tick-p-${s.id}`,
      anchor: { world: [ox, sy], offset: [-TICK_LABEL_GAP_PX, 0] },
      text: text(s.pLabel),
      vars: { k: s.k },
      chip: false,
      font: 'mono',
      align: 'right',
      fontSize: TICK_LABEL_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 멈춘 점 · 지금 점 ----
  for (const s of stops) {
    const vis = pinned[s.id];
    if (vis <= 0) continue;
    out.push({
      type: 'body',
      id: `point-${s.id}`,
      pos: [gx(s.vRatio), gy(pressureRatioAt(s.vRatio, c))],
      shape: 'circle',
      size: PINNED_POINT_RADIUS,
      outline: 'none',
      glow: false,
      opacity: vis,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'body',
    id: 'point-now',
    pos: [px, py],
    shape: 'circle',
    size: POINT_RADIUS,
    outline: 'background',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 지금 직사각형의 표식 ----
  out.push({
    type: 'readout',
    id: 'area-label',
    anchor: { world: [(ox + px) / 2, oy], offset: [0, -AREA_LABEL_GAP_PX] },
    text: text('label.area'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: AREA_LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
