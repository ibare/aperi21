// ========================================================================
// transistor-principle — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 막대 세 부분(`region`) · 전극(`body` rect) · 베이스 도선(`trajectory`) ·
// 도선 끝(`body` point) · 전자(`particleSystem` 점 + 속도 꼬리) · 두 전류 막대(`region` 틀 + 칠) ·
// 이름표 · 전류값 · 배율(`readout`) 이 모두 표준 어휘로 있다.
//
// 색: 전자 · 컬렉터 전류 막대는 먹색. 막대 · 전극 · 눈금 틀은 무채색. 강조색은 **베이스 전류** 한 뜻에만
// 쓴다 — 베이스 도선이 켜지는 것과 베이스 전류 막대 · 값. 「작은 신호」 가 무엇인지가 그것 하나다.
// n · p 는 색으로 가르지 않고 글자로 적는다.
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
  baseCurrent,
  collectorCurrent,
  electrons,
  flowSpeed,
  meterFraction,
  openness,
  readConstants,
  valueWeights,
  type TransistorPrincipleConstants,
} from './physics';
import {
  BAR_HALF_H,
  BASE_METER_X,
  BASE_X0,
  BASE_X1,
  COLLECTOR_METER_X,
  COLLECTOR_X1,
  EMITTER_X0,
  LEAD_TOP,
  METER_BASE_Y,
  METER_H,
  METER_W,
  PLATE_W,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { TransistorPrincipleState } from './state';

// ------------------------------------------------------------------------
// 모양 — 선 굵기 · 글자 크기 · 짙기 · 띄움 거리 (C2)
// ------------------------------------------------------------------------

/** 막대 칠 짙기. 베이스는 한 단 짙게 — 얇은 층이 따로 있다는 것이 모양으로 읽히게. */
const BAR_FILL = 0.06;
const BASE_FILL = 0.16;
/** 전자 점 반지름(화면 px) · 꼬리 길이(초 × 속력) · 꼬리 굵기(화면 px) · 꼬리 짙기. */
const ELECTRON_PX = 3.2;
const TRAIL_SECONDS = 0.3;
const TRAIL_WIDTH_PX = 1.6;
const TRAIL_OPACITY = 0.5;
/** 이보다 옅은 전자는 선언하지 않는다 — `particleSystem` 은 1/16 미만을 버린다. */
const WEIGHT_CUTOFF = 0.06;

/** 베이스 도선 굵기(화면 px) — 꺼짐 · 켜짐. 켜지면 굵어진다. 도선 끝 점 크기(월드 반지름). */
const LEAD_WIDTH_PX = 2;
const LEAD_ON_WIDTH_PX = 3.5;
const LEAD_TIP_R = 0.09;

/** 전류 막대 칠 짙기. 틀은 무채색 선이다. */
const METER_FILL = 0.85;

/** 이름표 · 값 · 배율 글자 크기(화면 px). */
const LABEL_PX = 13;
const TYPE_PX = 15;
const VALUE_PX = 13;
const RATIO_PX = 15;
/** 이름표를 막대 위 · 아래로 띄우는 거리(화면 px). */
const ABOVE: Vec2 = [0, -12];
const BELOW: Vec2 = [0, 13];
/** 전류값을 막대 칠 윗끝에서 올리는 거리(화면 px). */
const VALUE_ABOVE: Vec2 = [0, -11];
/** 배율 글자의 높이 — 전류 막대 눈금 높이에 대한 비. 두 막대 사이 가운데쯤. */
const RATIO_HEIGHT = 0.55;

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

type Style = typeof ink | typeof muted | typeof accent;

const rect = (x0: number, x1: number, y0: number, y1: number): Vec2[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];
const BOX_EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
] as const;

export function scene(params: {
  state: TransistorPrincipleState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('transistor-principle: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const open = openness(tl, c);
  const g: Primitive[] = [];

  // ================= 막대 세 부분 · 전극 =================
  const parts: { id: string; x0: number; x1: number; fill: number }[] = [
    { id: 'emitter', x0: EMITTER_X0, x1: BASE_X0, fill: BAR_FILL },
    { id: 'base', x0: BASE_X0, x1: BASE_X1, fill: BASE_FILL },
    { id: 'collector', x0: BASE_X1, x1: COLLECTOR_X1, fill: BAR_FILL },
  ];
  for (const p of parts) {
    g.push({
      type: 'region',
      id: `${p.id}-bar`,
      points: rect(p.x0, p.x1, -BAR_HALF_H, BAR_HALF_H),
      fillOpacity: p.fill,
      outline: BOX_EDGES,
      style: muted,
    });
  }
  for (const [id, x] of [
    ['emitter-plate', EMITTER_X0 - PLATE_W / 2],
    ['collector-plate', COLLECTOR_X1 + PLATE_W / 2],
  ] as const) {
    g.push({ type: 'body', id, pos: [x, 0], shape: 'rect', size: [PLATE_W, 2 * BAR_HALF_H], style: muted });
  }

  // ================= 베이스 도선 — 켜지면 강조색으로 굵어진다 =================
  const baseMid = (BASE_X0 + BASE_X1) / 2;
  const lead: Vec2[] = [
    [baseMid, BAR_HALF_H],
    [baseMid, LEAD_TOP],
  ];
  g.push({ type: 'trajectory', id: 'lead', points: lead, width: LEAD_WIDTH_PX, opacity: 1 - open, style: muted });
  if (open > 0) {
    g.push({ type: 'trajectory', id: 'lead-on', points: lead, width: LEAD_ON_WIDTH_PX, opacity: open, style: accent });
  }
  g.push({ type: 'body', id: 'lead-tip', pos: [baseMid, LEAD_TOP], shape: 'circle', size: LEAD_TIP_R, glow: false, style: muted });
  if (open > 0) {
    g.push({
      type: 'body',
      id: 'lead-tip-on',
      pos: [baseMid, LEAD_TOP],
      shape: 'circle',
      size: LEAD_TIP_R,
      glow: false,
      opacity: open,
      style: accent,
    });
  }

  // ================= 전자 — 전류에 비례한 빠르기로 이미터 → 컬렉터 =================
  const v = flowSpeed(tl, c);
  const list = electrons(tl, c).filter((e) => e.weight > WEIGHT_CUTOFF);
  g.push({
    type: 'particleSystem',
    id: 'electrons',
    positions: list.map((e) => e.pos),
    velocities: list.map((): Vec2 => [v, 0]),
    sizes: ELECTRON_PX,
    opacities: list.map((e) => e.weight),
    trail: v > 0,
    trailStyle: { seconds: TRAIL_SECONDS, width: TRAIL_WIDTH_PX, opacity: TRAIL_OPACITY },
    style: ink,
  });

  // ================= 이름표 — 세 부분 · 반도체 종류 =================
  const emitterMid = (EMITTER_X0 + BASE_X0) / 2;
  const collectorMid = (BASE_X1 + COLLECTOR_X1) / 2;
  g.push(label('emitter-name', [emitterMid, BAR_HALF_H], ABOVE, text('label.emitter'), LABEL_PX, ink));
  g.push(label('collector-name', [collectorMid, BAR_HALF_H], ABOVE, text('label.collector'), LABEL_PX, ink));
  g.push(label('base-name', [baseMid, LEAD_TOP], ABOVE, text('label.base'), LABEL_PX, ink));
  g.push(label('emitter-type', [emitterMid, -BAR_HALF_H], BELOW, text('label.n'), TYPE_PX, muted));
  g.push(label('base-type', [baseMid, -BAR_HALF_H], BELOW, text('label.p'), TYPE_PX, muted));
  g.push(label('collector-type', [collectorMid, -BAR_HALF_H], BELOW, text('label.n'), TYPE_PX, muted));

  // ================= 두 전류 막대 — 같은 눈금 =================
  meter(g, 'base-current', BASE_METER_X, meterFraction(c, baseCurrent(tl, c)), accent);
  meter(g, 'collector-current', COLLECTOR_METER_X, meterFraction(c, collectorCurrent(tl, c)), ink);
  g.push(label('base-current-name', [BASE_METER_X, METER_BASE_Y], BELOW, text('label.baseCurrent'), LABEL_PX, accent));
  g.push(
    label('collector-current-name', [COLLECTOR_METER_X, METER_BASE_Y], BELOW, text('label.collectorCurrent'), LABEL_PX, ink),
  );
  values(g, tl, c);

  // ---- 배율 — 베이스가 열린 동안 두 막대 사이에 ----
  if (open > 0) {
    g.push({
      type: 'readout',
      id: 'ratio',
      anchor: { world: [(BASE_METER_X + COLLECTOR_METER_X) / 2, METER_BASE_Y + METER_H * RATIO_HEIGHT] },
      text: text('label.ratio'),
      vars: { beta: String(c.beta) },
      chip: false,
      font: 'text',
      fontSize: RATIO_PX,
      weight: 'bold',
      align: 'center',
      opacity: open,
      style: ink,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 전류 막대 하나 — 무채색 틀과 바닥에서 자라는 칠. 두 막대가 같은 높이 · 같은 눈금이다. */
function meter(g: Primitive[], id: string, x: number, fraction: number, fill: Style): void {
  const x0 = x - METER_W / 2;
  const x1 = x + METER_W / 2;
  if (fraction > 0) {
    g.push({
      type: 'region',
      id: `${id}-fill`,
      points: rect(x0, x1, METER_BASE_Y, METER_BASE_Y + METER_H * fraction),
      fillOpacity: METER_FILL,
      style: fill,
    });
  }
  g.push({
    type: 'region',
    id: `${id}-frame`,
    points: rect(x0, x1, METER_BASE_Y, METER_BASE_Y + METER_H),
    fillOpacity: 0,
    outline: BOX_EDGES,
    style: muted,
  });
}

/** 전류값 — 0 · 낮음 · 높음 세 글자를 같은 자리(칠 윗끝)에서 엇갈려 옅게 한다. */
function values(g: Primitive[], tl: TimelineFrame, c: TransistorPrincipleConstants): void {
  const w = valueWeights(tl);
  const ibTop = METER_BASE_Y + METER_H * meterFraction(c, baseCurrent(tl, c));
  const icTop = METER_BASE_Y + METER_H * meterFraction(c, collectorCurrent(tl, c));
  const rows: { id: string; x: number; y: number; style: Style; zero: number; low: string; high: string }[] = [
    { id: 'ib', x: BASE_METER_X, y: ibTop, style: accent, zero: w.zero, low: String(c.baseCurrentLow), high: String(c.baseCurrentHigh) },
    {
      id: 'ic',
      x: COLLECTOR_METER_X,
      y: icTop,
      style: ink,
      zero: w.zero,
      low: String(c.collectorCurrentLow),
      high: String(c.collectorCurrentHigh),
    },
  ];
  for (const r of rows) {
    const at: Vec2 = [r.x, r.y];
    if (r.zero > 0) g.push({ ...label(`${r.id}-zero`, at, VALUE_ABOVE, text('label.zero'), VALUE_PX, r.style), opacity: r.zero });
    if (w.low > 0) {
      g.push({ ...label(`${r.id}-low`, at, VALUE_ABOVE, text('label.ma'), VALUE_PX, r.style), vars: { v: r.low }, opacity: w.low });
    }
    if (w.high > 0) {
      g.push({ ...label(`${r.id}-high`, at, VALUE_ABOVE, text('label.ma'), VALUE_PX, r.style), vars: { v: r.high }, opacity: w.high });
    }
  }
}

function label(
  id: string,
  at: Vec2,
  offset: Vec2,
  msg: LocalizedText,
  px: number,
  style: Style,
): Extract<Primitive, { type: 'readout' }> {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: msg,
    chip: false,
    font: 'text',
    fontSize: px,
    weight: 'bold',
    align: 'center',
    style,
  };
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
