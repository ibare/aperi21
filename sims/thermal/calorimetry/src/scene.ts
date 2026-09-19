// ========================================================================
// calorimetry — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
//   컵 · 받침대 · 비커   lineSet(벽) + body(rect) — 물건
//   물                   region — 컵 속 뜨거운 물, 비커 속 찬 물 층과 부어진 뜨거운 물 층.
//                        명암이 온도다(한 역할의 짙기). 섞이며 두 층의 명암이 같아진다
//   물방울               body(circle) — 붓는 동안 컵 입에서 비커로 떨어진다
//   온도 축              lineSet(축 · 눈금) + readout(선언한 온도 글자)
//   가운데 선            trajectory(점선) — 두 처음 온도의 가운데. 「가운데가 아니다」 의 잣대
//   열 직사각형          region 칸 타일 — 가로 = 질량(열용량), 세로 = 온도 변화.
//                        위(뜨거운 물이 잃은 열)는 처음 온도에서 아래로, 아래(찬 물이 얻은 열)는
//                        처음 온도에서 위로 자라 멈춘 온도에서 맞닿는다. 칸 하나가 같은 열이다
//   멈춘 온도            trajectory + readout — 멈춘 뒤에만. 글자는 선언한 정박값
//   캡션                 BundleSchema.caption 슬롯
//
// ---- 색은 뜻마다 하나다 ----
//   accent  온도 — 물의 명암 · 멈춘 온도 선. 뜨거움 · 차가움을 두 색으로 가르지 않는다 (S-piece)
//   primary 열 — 두 직사각형의 칸과 이름. 잃은 열과 얻은 열이 같은 색이다(같은 것이라서)
//           물방울은 물이라 accent 다
//   ink     멈춘 온도 글자 · 물 속 질량 글자(명암 위에서 읽히게)
//   muted   물건과 자 — 컵 · 비커 · 축 · 가운데 선 · 질량 · 온도 글자
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
  dropDepart,
  readConstants,
  roundAt,
  roundOpacity,
  tempsAt,
  widthCells,
  type CalorimetryConstants,
} from './physics';
import {
  AXIS_X,
  BEAKER_BOTTOM,
  BEAKER_H_PER_G,
  BEAKER_RIM,
  BEAKER_X0,
  BEAKER_X1,
  CELL_W,
  CUP_BOTTOM,
  CUP_RIM,
  CUP_X0,
  CUP_X1,
  DROP_ARC,
  DROP_TO_X,
  RECT_X,
  SCALE_BOTTOM,
  SCALE_TOP,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { CalorimetryState } from './state';

/** 온도 · 질량 · 직사각형 이름 글자 크기(화면 px). */
const VALUE_PX = 12;
/** 멈춘 온도 글자 크기(화면 px). */
const FINAL_PX = 14;
/** 글자를 선 · 변에서 띄우는 거리(화면 px). */
const LABEL_GAP = 6;
/** 직사각형 위 · 아래 질량 글자의 띄움 거리(화면 px) — 곁글자보다 멀리 둔다. */
const MASS_LABEL_GAP = 12;
/** 그릇 벽 · 축 · 눈금 · 가운데 선 · 멈춘 온도 선 · 처음 온도 변의 굵기(화면 px). */
const WALL_WIDTH = 2;
const AXIS_WIDTH = 1.5;
const MID_LINE_WIDTH = 1.5;
const FINAL_LINE_WIDTH = 2;
const EDGE_WIDTH = 1.5;
/** 눈금이 축 왼쪽으로 삐져나오는 길이(월드). */
const TICK_LEN = 0.08;
/** 멈춘 온도 선이 직사각형 오른쪽으로 더 나가는 길이(월드). */
const FINAL_OVERHANG = 0.15;
/** 물의 짙기 — 축 아래 끝 온도일 때 · 위 끝 온도일 때. 그 사이는 온도에 비례한다. */
const WATER_FILL_LO = 0.08;
const WATER_FILL_HI = 0.85;
/** 칸 타일의 짙기 · 타일 사이 틈(월드, 한쪽). 틈이 칸을 셀 수 있게 한다. */
const CELL_FILL = 0.8;
const CELL_INSET = 0.025;
/** 받침대의 불투명도. 물건이라 옅다. */
const STAND_OPACITY = 0.9;
/** 두 물 층 사이 경계 점선의 굵기(화면 px). */
const LAYER_LINE_WIDTH = 1;
/** 물방울 반지름(월드). */
const DROP_R = 0.05;
/** 받침대 폭(컵 폭에 대한 몫). */
const STAND_SPAN = 0.6;

const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const STAND = { colorRole: 'muted', emphasis: 'subtle' } as const;
const TEMP = { colorRole: 'accent', emphasis: 'strong' } as const;
const HEAT = { colorRole: 'primary', emphasis: 'strong' } as const;
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 물 속 질량 글자 — muted 는 다크에서 물 명암에 묻혀 먹색으로 둔다. */
const WATER_LABEL = INK;

/** 온도(℃) → 축 위 높이(월드 y). */
function yOf(temp: number, c: CalorimetryConstants): number {
  const f = (temp - c.axisMin) / (c.axisMax - c.axisMin);
  return SCALE_BOTTOM + f * (SCALE_TOP - SCALE_BOTTOM);
}

/** 온도(℃) → 물의 짙기. 한 역할(accent)의 명암이 온도다. */
function waterFill(temp: number, c: CalorimetryConstants): number {
  const f = Math.min(1, Math.max(0, (temp - c.axisMin) / (c.axisMax - c.axisMin)));
  return WATER_FILL_LO + f * (WATER_FILL_HI - WATER_FILL_LO);
}

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

/** 윗면이 열린 그릇의 벽 — 왼쪽 벽 · 바닥 · 오른쪽 벽. */
function vessel(x0: number, x1: number, bottom: number, rim: number): Vec2[] {
  return [
    [x0, rim],
    [x0, bottom],
    [x1, bottom],
    [x1, rim],
  ];
}

/**
 * 열 직사각형의 칸 타일. 가로 `cols` 칸(끝 칸은 모자랄 수 있다), 세로는 처음 온도 `from` 에서
 * 지금 온도 `to` 쪽으로 `cellTemp` ℃ 씩 — 아직 덜 자란 칸은 지금 온도에서 잘린다.
 */
function tiles(
  id: string,
  cols: number,
  from: number,
  to: number,
  c: CalorimetryConstants,
  opacity: number,
): Primitive[] {
  const out: Primitive[] = [];
  const dir = to >= from ? 1 : -1;
  const span = Math.abs(to - from);
  if (span <= 0) return out;
  const rows = Math.ceil(span / c.cellTemp);
  for (let k = 0; k < Math.ceil(cols); k++) {
    const x0 = RECT_X + k * CELL_W + CELL_INSET;
    const x1 = RECT_X + Math.min(k + 1, cols) * CELL_W - CELL_INSET;
    if (x1 <= x0) continue;
    for (let j = 0; j < rows; j++) {
      const t0 = from + dir * j * c.cellTemp;
      const t1 = from + dir * Math.min((j + 1) * c.cellTemp, span);
      const ya = yOf(t0, c) + dir * CELL_INSET;
      const yb = yOf(t1, c) - dir * CELL_INSET;
      if ((yb - ya) * dir <= 0) continue;
      out.push({
        type: 'region',
        id: `${id}-${k}-${j}`,
        points: rect(x0, Math.min(ya, yb), x1, Math.max(ya, yb)),
        fillOpacity: CELL_FILL,
        opacity,
        style: HEAT,
      });
    }
  }
  return out;
}

export function scene(params: {
  state: CalorimetryState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('calorimetry: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const r = roundAt(tl, c);
  const alpha = roundOpacity(tl, r);
  const pour = tl.at(`pour${r.suffix}`);
  const mix = tl.at(`mix${r.suffix}`);
  const hold = tl.at(`hold${r.suffix}`);
  const temps = tempsAt(mix, r, c);
  const out: Primitive[] = [];

  // ================= 왼쪽 — 컵과 비커 =================

  // ---- 받침대 · 컵 · 비커 (늘 있다) ----
  const cupW = CUP_X1 - CUP_X0;
  const cupCx = (CUP_X0 + CUP_X1) / 2;
  out.push({
    type: 'body',
    id: 'stand',
    shape: 'rect',
    pos: [cupCx, (BEAKER_BOTTOM + CUP_BOTTOM) / 2],
    size: [cupW * STAND_SPAN, CUP_BOTTOM - BEAKER_BOTTOM],
    opacity: STAND_OPACITY,
    style: STAND,
  });

  // ---- 물 ----
  // 같은 물이라 1 g 이 차지하는 넓이가 컵과 비커에서 같다.
  const beakerW = BEAKER_X1 - BEAKER_X0;
  const cupHPerG = (BEAKER_H_PER_G * beakerW) / cupW;
  const cupLevel = CUP_BOTTOM + r.mHot * cupHPerG * (1 - pour);
  const coldTop = BEAKER_BOTTOM + r.mCold * BEAKER_H_PER_G;
  const hotTop = coldTop + r.mHot * BEAKER_H_PER_G * pour;

  if (pour < 1) {
    out.push({
      type: 'region',
      id: 'cup-water',
      points: rect(CUP_X0, CUP_BOTTOM, CUP_X1, cupLevel),
      fillOpacity: waterFill(c.tHot, c),
      opacity: alpha,
      style: TEMP,
    });
    out.push({
      type: 'readout',
      id: 'cup-mass',
      anchor: { world: [cupCx, (CUP_BOTTOM + cupLevel) / 2] },
      text: text('label.mass'),
      vars: { m: String(r.mHot) },
      chip: false,
      font: 'mono',
      fontSize: VALUE_PX,
      opacity: alpha * (1 - pour),
      style: WATER_LABEL,
    });
  }
  out.push({
    type: 'region',
    id: 'beaker-cold',
    points: rect(BEAKER_X0, BEAKER_BOTTOM, BEAKER_X1, coldTop),
    fillOpacity: waterFill(temps.cold, c),
    opacity: alpha,
    style: TEMP,
  });
  out.push({
    type: 'readout',
    id: 'beaker-cold-mass',
    anchor: { world: [(BEAKER_X0 + BEAKER_X1) / 2, (BEAKER_BOTTOM + coldTop) / 2] },
    text: text('label.mass'),
    vars: { m: String(r.mCold) },
    chip: false,
    font: 'mono',
    fontSize: VALUE_PX,
    opacity: alpha,
    style: WATER_LABEL,
  });
  if (pour > 0) {
    out.push({
      type: 'region',
      id: 'beaker-hot',
      points: rect(BEAKER_X0, coldTop, BEAKER_X1, hotTop),
      fillOpacity: waterFill(temps.hot, c),
      opacity: alpha,
      style: TEMP,
    });
    out.push({
      type: 'readout',
      id: 'beaker-hot-mass',
      anchor: { world: [(BEAKER_X0 + BEAKER_X1) / 2, (coldTop + hotTop) / 2] },
      text: text('label.mass'),
      vars: { m: String(r.mHot) },
      chip: false,
      font: 'mono',
      fontSize: VALUE_PX,
      opacity: alpha * pour,
      style: WATER_LABEL,
    });
    // 두 층의 경계 — 멈춘 뒤에는 한 물이라 거둔다.
    if (hold < 1) {
      out.push({
        type: 'trajectory',
        id: 'layer-line',
        points: [
          [BEAKER_X0, coldTop],
          [BEAKER_X1, coldTop],
        ],
        width: LAYER_LINE_WIDTH,
        opacity: alpha * (1 - hold),
        style: { ...MUTED, lineStyle: 'dashed' },
      });
    }
  }

  // ---- 물방울 ----
  // 컵 입(오른쪽 위 모서리)을 같은 간격으로 떠나 호를 그리며 비커 물 위로 떨어진다.
  const s = tl.u - tl.start(`pour${r.suffix}`);
  const pourDuration = tl.duration(`pour${r.suffix}`);
  if (s > 0 && s < pourDuration) {
    for (let n = 0; n < c.drops; n++) {
      const p = (s - dropDepart(n, pourDuration, c)) / c.dropTravel;
      if (p < 0 || p >= 1) continue;
      const y1 = hotTop;
      out.push({
        type: 'body',
        id: `drop-${n}`,
        shape: 'circle',
        size: DROP_R,
        pos: [CUP_X1 + (DROP_TO_X - CUP_X1) * p, CUP_RIM + (y1 - CUP_RIM) * p + DROP_ARC * 4 * p * (1 - p)],
        glow: false,
        opacity: alpha,
        style: TEMP,
      });
    }
  }

  // 그릇 벽은 물 위에 긋는다 — 물의 명암이 벽을 덮지 않게.
  out.push({
    type: 'lineSet',
    id: 'vessels',
    lines: [vessel(CUP_X0, CUP_X1, CUP_BOTTOM, CUP_RIM), vessel(BEAKER_X0, BEAKER_X1, BEAKER_BOTTOM, BEAKER_RIM)],
    width: WALL_WIDTH,
    style: MUTED,
  });

  // ================= 오른쪽 — 온도 축과 열 직사각형 =================

  const wHot = widthCells(r.mHot, c.cHot, c);
  const wCold = widthCells(r.mCold, c.cCold, c);
  const wMax = Math.max(widthCells(c.mHotA, c.cHot, c), widthCells(c.mColdA, c.cCold, c), widthCells(c.mHotB, c.cHot, c), widthCells(c.mColdB, c.cCold, c));
  const yHot = yOf(c.tHot, c);
  const yCold = yOf(c.tCold, c);
  const yMid = yOf(c.tMid, c);

  // ---- 축 · 눈금 (늘 있다) ----
  out.push({
    type: 'lineSet',
    id: 'axis',
    lines: [
      [
        [AXIS_X, SCALE_BOTTOM],
        [AXIS_X, SCALE_TOP],
      ],
      ...[yHot, yMid, yCold].map((y): Vec2[] => [
        [AXIS_X - TICK_LEN, y],
        [AXIS_X, y],
      ]),
    ],
    width: AXIS_WIDTH,
    style: MUTED,
  });
  const tickLabels: [string, number, string][] = [
    ['hot', yHot, state.hotText],
    ['mid', yMid, state.midText],
    ['cold', yCold, state.coldText],
  ];
  for (const [id, y, t] of tickLabels) {
    out.push({
      type: 'readout',
      id: `tick-${id}`,
      anchor: { world: [AXIS_X - TICK_LEN, y], offset: [-LABEL_GAP, 0] },
      text: text('label.temp'),
      vars: { t },
      chip: false,
      font: 'mono',
      fontSize: VALUE_PX,
      align: 'right',
      style: MUTED,
    });
  }

  // ---- 가운데 선 ----
  out.push({
    type: 'trajectory',
    id: 'mid-line',
    points: [
      [AXIS_X, yMid],
      [RECT_X + wMax * CELL_W, yMid],
    ],
    width: MID_LINE_WIDTH,
    style: { ...MUTED, lineStyle: 'dashed' },
  });

  // ---- 처음 온도 변 · 질량 글자 ----
  // 두 직사각형이 자라 나오는 자리. 가로 길이가 질량이다.
  out.push({
    type: 'lineSet',
    id: 'start-edges',
    lines: [
      [
        [RECT_X, yHot],
        [RECT_X + wHot * CELL_W, yHot],
      ],
      [
        [RECT_X, yCold],
        [RECT_X + wCold * CELL_W, yCold],
      ],
    ],
    width: EDGE_WIDTH,
    opacity: alpha,
    style: MUTED,
  });
  out.push({
    type: 'readout',
    id: 'hot-mass',
    anchor: { world: [RECT_X + (wHot * CELL_W) / 2, yHot], offset: [0, -MASS_LABEL_GAP] },
    text: text('label.mass'),
    vars: { m: String(r.mHot) },
    chip: false,
    font: 'mono',
    fontSize: VALUE_PX,
    opacity: alpha,
    style: MUTED,
  });
  out.push({
    type: 'readout',
    id: 'cold-mass',
    anchor: { world: [RECT_X + (wCold * CELL_W) / 2, yCold], offset: [0, MASS_LABEL_GAP] },
    text: text('label.mass'),
    vars: { m: String(r.mCold) },
    chip: false,
    font: 'mono',
    fontSize: VALUE_PX,
    opacity: alpha,
    style: MUTED,
  });

  // ---- 열 직사각형 ----
  if (mix > 0) {
    out.push(...tiles('lost', wHot, c.tHot, temps.hot, c, alpha));
    out.push(...tiles('gained', wCold, c.tCold, temps.cold, c, alpha));
    out.push({
      type: 'readout',
      id: 'lost-name',
      anchor: { world: [RECT_X + wHot * CELL_W, (yHot + yOf(temps.hot, c)) / 2], offset: [LABEL_GAP, 0] },
      text: text('label.lost'),
      chip: false,
      font: 'text',
      fontSize: VALUE_PX,
      align: 'left',
      opacity: alpha * mix,
      style: HEAT,
    });
    out.push({
      type: 'readout',
      id: 'gained-name',
      anchor: { world: [RECT_X + wCold * CELL_W, (yCold + yOf(temps.cold, c)) / 2], offset: [LABEL_GAP, 0] },
      text: text('label.gained'),
      chip: false,
      font: 'text',
      fontSize: VALUE_PX,
      align: 'left',
      opacity: alpha * mix,
      style: HEAT,
    });
  }

  // ---- 멈춘 온도 ----
  // 맞닿은 뒤에만. 선은 계산한 자리, 글자는 선언한 정박값이다(둘의 관계는 G143).
  if (hold > 0) {
    const yF = yOf(temps.hot, c);
    const xEnd = RECT_X + Math.max(wHot, wCold) * CELL_W + FINAL_OVERHANG;
    out.push({
      type: 'trajectory',
      id: 'final-line',
      points: [
        [AXIS_X, yF],
        [xEnd, yF],
      ],
      width: FINAL_LINE_WIDTH,
      opacity: alpha,
      style: { ...TEMP, lineStyle: 'dashed' },
    });
    out.push({
      type: 'readout',
      id: 'final-temp',
      anchor: { world: [xEnd, yF], offset: [LABEL_GAP, 0] },
      text: text('label.temp'),
      vars: { t: r.suffix === 'A' ? state.finalAText : state.finalBText },
      chip: false,
      font: 'mono',
      weight: 'bold',
      fontSize: FINAL_PX,
      align: 'left',
      opacity: alpha,
      style: INK,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
