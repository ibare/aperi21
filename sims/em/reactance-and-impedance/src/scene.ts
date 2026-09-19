// ========================================================================
// reactance-and-impedance — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 세 덩어리가 가로로 나란하다.
//   왼쪽 — 두 회로. 전원(body 원 + trajectory 물결) · 도선(lineSet) · 코일(trajectory) ·
//          축전기 판(lineSet) · 이름표(readout). 위 줄이 코일, 아래 줄이 축전기다.
//   가운데 — 각 회로의 전류 기록지. 축(lineSet) · 파형(trajectory) · 한 단계 낮은 진동수의
//          파형(trajectory, 흐린 점선). 두 기록지는 같은 세로 배율이다.
//   오른쪽 — X–f 평면. 축 · 눈금(lineSet) · 코일 곡선(실선) · 축전기 곡선(점선) ·
//          지금 진동수 표지(세로 점선 + 두 곡선 위 점).
//
// 색은 뜻마다 하나다. 장치 · 곡선 · 글자는 먹색, 축 · 눈금 · 흐린 파형은 muted, 전류 파형은
// 두 줄 모두 `primary`(같은 물리량). **강조색은 「지금 진동수」 한 뜻에만** — 평면 위 세로
// 점선과 두 점. 코일과 축전기는 색이 아니라 자리(위 · 아래 줄)와 표식 `L` · `C`, 평면에서는
// 선 모양(실선 · 점선)으로 가른다 (S-piece).
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LocalizedText,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  capacitiveReactance,
  frequencyNow,
  inductiveReactance,
  previousFrequency,
  readCircuits,
  readConstants,
  type ReactanceAndImpedanceConstants,
} from './physics';
import {
  COIL_BUMP,
  COIL_HALF_LEN,
  COIL_TURNS,
  GRAPH_HEIGHT,
  GRAPH_ORIGIN_X,
  GRAPH_ORIGIN_Y,
  GRAPH_WIDTH,
  LOOP_HALF_H,
  LOOP_LEFT,
  LOOP_RIGHT,
  PLATE_HALF_GAP,
  PLATE_HALF_W,
  ROW_CAP_Y,
  ROW_COIL_Y,
  SCENE_BOUNDS,
  SCOPE_AXIS_HALF_H,
  SCOPE_LEFT,
  SCOPE_RIGHT,
  SOURCE_R,
  SOURCE_WAVE_HALF_H,
  SOURCE_WAVE_HALF_W,
  text,
  type ReactanceAndImpedanceMessageKey,
} from './schema';
import type { ReactanceAndImpedanceState } from './state';

// ------------------------------------------------------------------------
// 굵기 · 글자 · 짙기 · 표본 (화면 px · 0~1 · 개수)
// ------------------------------------------------------------------------

const WIRE_WIDTH = 2;
const PLATE_WIDTH = 3.5;
const COIL_WIDTH = 2;
const SOURCE_WAVE_WIDTH = 1.6;
const AXIS_WIDTH = 1;
const TRACE_WIDTH = 2.2;
const GHOST_WIDTH = 1.4;
const CURVE_WIDTH = 2;
const MARKER_LINE_WIDTH = 1.4;
const SYMBOL_PX = 14;
const LABEL_PX = 12;
const TICK_PX = 11;
/** 한 단계 낮은 진동수 파형의 짙기 — 지금 파형 뒤로 물러나 비교 기준만 된다. */
const GHOST_OPACITY = 0.7;
/** 이름표를 앵커에서 띄우는 거리(화면 px). */
const LABEL_GAP = 10;
/** 축전기 곡선 이름을 곡선 끝 위로 띄우는 거리(화면 px). */
const CURVE_NAME_LIFT = 18;
/** 평면 가로축 눈금의 길이(월드). */
const TICK_LEN = 0.08;
/** 지금 진동수 점의 반지름(월드). */
const MARKER_DOT_R = 0.085;
/** 기록지 파형 표본 수 — 가장 높은 진동수에서도 한 번 오르내림에 수십 점이 들어가게. */
const TRACE_SAMPLES = 480;
/** 전원 물결 · 코일 혹 하나 · 축전기 곡선의 표본 수. */
const SOURCE_WAVE_SAMPLES = 24;
const COIL_SAMPLES_PER_TURN = 16;
const CURVE_SAMPLES = 96;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const CURRENT = { colorRole: 'primary', emphasis: 'strong' } as const;
const NOW = { colorRole: 'accent', emphasis: 'strong' } as const;

// ------------------------------------------------------------------------
// 도우미
// ------------------------------------------------------------------------

function label(
  id: string,
  body: LocalizedText,
  pos: Vec2,
  offset: Vec2,
  align: 'left' | 'center' | 'right',
  fontSize: number,
  style: Readout['style'],
  opts: { italic?: boolean; vars?: Record<string, string> } = {},
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos, offset },
    text: body,
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: false,
    font: 'text',
    align,
    fontSize,
    italic: opts.italic ?? false,
    style,
  };
}

/** 한 줄의 회로 — 왼쪽 가지에 전원, 오른쪽 가지에 소자. */
function circuitRow(
  out: Primitive[],
  prefix: string,
  y0: number,
  element: 'coil' | 'capacitor',
  c: ReactanceAndImpedanceConstants,
): void {
  const top = y0 + LOOP_HALF_H;
  const bottom = y0 - LOOP_HALF_H;
  const elemHalf = element === 'coil' ? COIL_HALF_LEN : PLATE_HALF_GAP;

  out.push({
    type: 'lineSet',
    id: `${prefix}-wires`,
    lines: [
      [[LOOP_LEFT, y0 + SOURCE_R], [LOOP_LEFT, top], [LOOP_RIGHT, top], [LOOP_RIGHT, y0 + elemHalf]],
      [[LOOP_LEFT, y0 - SOURCE_R], [LOOP_LEFT, bottom], [LOOP_RIGHT, bottom], [LOOP_RIGHT, y0 - elemHalf]],
    ],
    width: WIRE_WIDTH,
    style: INK,
  });

  // ---- 교류 전원 — 원 안의 물결 한 번. 두 줄이 같은 전원이다 ----
  out.push({
    type: 'body',
    id: `${prefix}-source`,
    pos: [LOOP_LEFT, y0],
    shape: 'circle',
    size: SOURCE_R,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: INK,
  });
  const wave: Vec2[] = [];
  for (let i = 0; i <= SOURCE_WAVE_SAMPLES; i++) {
    const s = i / SOURCE_WAVE_SAMPLES;
    wave.push([
      LOOP_LEFT - SOURCE_WAVE_HALF_W + 2 * SOURCE_WAVE_HALF_W * s,
      y0 + SOURCE_WAVE_HALF_H * Math.sin(2 * Math.PI * s),
    ]);
  }
  out.push({ type: 'trajectory', id: `${prefix}-source-wave`, points: wave, width: SOURCE_WAVE_WIDTH, style: INK });
  out.push(
    label(`${prefix}-voltage`, text('label.voltage'), [LOOP_LEFT - SOURCE_R, y0], [-LABEL_GAP, 0], 'right', LABEL_PX, MUTED, {
      vars: { v: String(c.voltage) },
    }),
  );

  // ---- 소자 ----
  if (element === 'coil') {
    // 옆에서 본 감긴 도선 — 오른쪽으로 불룩한 혹이 감은 수만큼 위에서 아래로 이어진다.
    const coil: Vec2[] = [];
    const seg = (2 * COIL_HALF_LEN) / COIL_TURNS;
    for (let k = 0; k < COIL_TURNS; k++) {
      const yc = y0 + COIL_HALF_LEN - seg * (k + 0.5);
      for (let i = 0; i <= COIL_SAMPLES_PER_TURN; i++) {
        const th = Math.PI / 2 - (Math.PI * i) / COIL_SAMPLES_PER_TURN;
        coil.push([LOOP_RIGHT + COIL_BUMP * Math.cos(th), yc + (seg / 2) * Math.sin(th)]);
      }
    }
    out.push({ type: 'trajectory', id: `${prefix}-coil`, points: coil, width: COIL_WIDTH, style: INK });
  } else {
    out.push({
      type: 'lineSet',
      id: `${prefix}-plates`,
      lines: [
        [[LOOP_RIGHT - PLATE_HALF_W, y0 + PLATE_HALF_GAP], [LOOP_RIGHT + PLATE_HALF_W, y0 + PLATE_HALF_GAP]],
        [[LOOP_RIGHT - PLATE_HALF_W, y0 - PLATE_HALF_GAP], [LOOP_RIGHT + PLATE_HALF_W, y0 - PLATE_HALF_GAP]],
      ],
      width: PLATE_WIDTH,
      style: INK,
    });
  }
  // 이름표는 고리 안쪽(소자 왼쪽)에 둔다 — 고리 오른쪽은 기록지가 바로 붙는다.
  const side = LOOP_RIGHT - (element === 'coil' ? 0 : PLATE_HALF_W);
  const symbol: ReactanceAndImpedanceMessageKey = element === 'coil' ? 'label.inductor' : 'label.capacitor';
  const valueKey: ReactanceAndImpedanceMessageKey = element === 'coil' ? 'label.inductance' : 'label.capacitance';
  const value = element === 'coil' ? c.inductance : c.capacitance;
  out.push(label(`${prefix}-symbol`, text(symbol), [side, y0], [-LABEL_GAP, -LABEL_GAP], 'right', SYMBOL_PX, INK, { italic: true }));
  out.push(
    label(`${prefix}-value`, text(valueKey), [side, y0], [-LABEL_GAP, LABEL_GAP], 'right', LABEL_PX, MUTED, {
      vars: { v: String(value) },
    }),
  );
}

/** 기록지 위 파형 — 한 폭 동안의 전류. 폭 왼쪽 끝에서 0 으로 출발한다(맞춰 멈춘 기록). */
function tracePoints(y0: number, amplitude: number, f: number, c: ReactanceAndImpedanceConstants): Vec2[] {
  const pts: Vec2[] = [];
  const windowS = c.scopeWindow * 1e-3;
  const h = amplitude * c.currentScale;
  for (let i = 0; i <= TRACE_SAMPLES; i++) {
    const s = i / TRACE_SAMPLES;
    pts.push([SCOPE_LEFT + (SCOPE_RIGHT - SCOPE_LEFT) * s, y0 + h * Math.sin(2 * Math.PI * f * windowS * s)]);
  }
  return pts;
}

/** 한 줄의 기록지 — 축 · 한 단계 낮은 진동수의 흐린 파형 · 지금 파형. */
function scopeRow(
  out: Primitive[],
  prefix: string,
  y0: number,
  amplitude: number,
  f: number,
  ghost: { amplitude: number; f: number } | null,
  c: ReactanceAndImpedanceConstants,
): void {
  out.push({
    type: 'lineSet',
    id: `${prefix}-scope-axes`,
    lines: [
      [[SCOPE_LEFT, y0], [SCOPE_RIGHT, y0]],
      [[SCOPE_LEFT, y0 - SCOPE_AXIS_HALF_H], [SCOPE_LEFT, y0 + SCOPE_AXIS_HALF_H]],
    ],
    width: AXIS_WIDTH,
    style: MUTED,
  });
  out.push(
    label(`${prefix}-scope-i`, text('label.current'), [SCOPE_LEFT, y0 + SCOPE_AXIS_HALF_H], [-LABEL_GAP, 0], 'right', LABEL_PX, MUTED, {
      italic: true,
    }),
  );
  out.push(
    label(`${prefix}-scope-t`, text('label.time'), [SCOPE_RIGHT, y0], [LABEL_GAP, 0], 'left', LABEL_PX, MUTED, { italic: true }),
  );
  if (ghost) {
    out.push({
      type: 'trajectory',
      id: `${prefix}-ghost`,
      points: tracePoints(y0, ghost.amplitude, ghost.f, c),
      width: GHOST_WIDTH,
      opacity: GHOST_OPACITY,
      style: { ...MUTED, lineStyle: 'dotted' },
    });
  }
  out.push({
    type: 'trajectory',
    id: `${prefix}-trace`,
    points: tracePoints(y0, amplitude, f, c),
    width: TRACE_WIDTH,
    style: CURRENT,
  });
}

export function scene(params: {
  state: ReactanceAndImpedanceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('reactance-and-impedance: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const f = frequencyNow(timeline, c);
  const now = readCircuits(f, c);
  const prevF = previousFrequency(timeline, c);
  const out: Primitive[] = [];

  // ---- 두 회로와 그 전류 기록지 ----
  circuitRow(out, 'coil', ROW_COIL_Y, 'coil', c);
  circuitRow(out, 'cap', ROW_CAP_Y, 'capacitor', c);
  const ghost = (pick: (r: ReturnType<typeof readCircuits>) => number) =>
    prevF === null ? null : { amplitude: pick(readCircuits(prevF, c)), f: prevF };
  scopeRow(out, 'coil', ROW_COIL_Y, now.coil.current, f, ghost((r) => r.coil.current), c);
  scopeRow(out, 'cap', ROW_CAP_Y, now.capacitor.current, f, ghost((r) => r.capacitor.current), c);

  // ---- X–f 평면 ----
  const gx = (hz: number): number => GRAPH_ORIGIN_X + (hz / c.graphFreqMax) * GRAPH_WIDTH;
  const gy = (ohm: number): number => GRAPH_ORIGIN_Y + (ohm / c.graphReactanceMax) * GRAPH_HEIGHT;
  const right = GRAPH_ORIGIN_X + GRAPH_WIDTH;
  const top = GRAPH_ORIGIN_Y + GRAPH_HEIGHT;

  out.push({
    type: 'lineSet',
    id: 'plane-axes',
    lines: [
      [[GRAPH_ORIGIN_X, GRAPH_ORIGIN_Y], [right, GRAPH_ORIGIN_Y]],
      [[GRAPH_ORIGIN_X, GRAPH_ORIGIN_Y], [GRAPH_ORIGIN_X, top]],
      ...c.freqs.map((hz): Vec2[] => [[gx(hz), GRAPH_ORIGIN_Y], [gx(hz), GRAPH_ORIGIN_Y - TICK_LEN]]),
    ],
    width: AXIS_WIDTH,
    style: MUTED,
  });
  c.freqs.forEach((hz, k) => {
    out.push(
      label(`plane-tick-${k}`, text('label.tick'), [gx(hz), GRAPH_ORIGIN_Y - TICK_LEN], [0, LABEL_GAP], 'center', TICK_PX, MUTED, {
        vars: { v: String(hz) },
      }),
    );
  });
  out.push(label('plane-f', text('label.freqAxis'), [right, GRAPH_ORIGIN_Y], [LABEL_GAP, 0], 'left', LABEL_PX, MUTED));
  out.push(label('plane-x', text('label.reactanceAxis'), [GRAPH_ORIGIN_X, top], [0, -LABEL_GAP], 'center', LABEL_PX, MUTED));

  // 코일 곡선 — 원점에서 오르는 직선. 세로축 끝에서 자른다.
  const coilEndHz = Math.min(c.graphFreqMax, c.graphReactanceMax / inductiveReactance(1, c));
  const coilEnd: Vec2 = [gx(coilEndHz), gy(inductiveReactance(coilEndHz, c))];
  out.push({
    type: 'trajectory',
    id: 'plane-coil',
    points: [[GRAPH_ORIGIN_X, GRAPH_ORIGIN_Y], coilEnd],
    width: CURVE_WIDTH,
    style: INK,
  });
  // 축전기 곡선 — 세로축 끝에서 내려와 가로축에 다가가는 곡선. 로그 간격으로 표본한다.
  const capStartHz = Math.max(1 / (2 * Math.PI * c.capacitance * 1e-6 * c.graphReactanceMax), 1e-6);
  const capCurve: Vec2[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const hz = capStartHz * Math.pow(c.graphFreqMax / capStartHz, i / CURVE_SAMPLES);
    capCurve.push([gx(hz), gy(capacitiveReactance(hz, c))]);
  }
  out.push({
    type: 'trajectory',
    id: 'plane-capacitor',
    points: capCurve,
    width: CURVE_WIDTH,
    style: { ...INK, lineStyle: 'dashed' },
  });
  out.push(label('plane-coil-name', text('label.inductor'), coilEnd, [LABEL_GAP, 0], 'left', SYMBOL_PX, INK, { italic: true }));
  out.push(
    label('plane-capacitor-name', text('label.capacitor'), capCurve[capCurve.length - 1]!, [0, -CURVE_NAME_LIFT], 'center', SYMBOL_PX, INK, {
      italic: true,
    }),
  );

  // ---- 지금 진동수 — 세로 점선과 두 곡선 위의 점 (강조색 한 뜻) ----
  out.push({
    type: 'trajectory',
    id: 'plane-now',
    points: [[gx(f), GRAPH_ORIGIN_Y], [gx(f), top]],
    width: MARKER_LINE_WIDTH,
    style: { ...NOW, lineStyle: 'dotted' },
  });
  for (const [id, x] of [
    ['plane-now-coil', now.coil.reactance],
    ['plane-now-capacitor', now.capacitor.reactance],
  ] as const) {
    if (x > c.graphReactanceMax) continue;
    out.push({
      type: 'body',
      id,
      pos: [gx(f), gy(x)],
      shape: 'circle',
      size: MARKER_DOT_R,
      outline: 'background',
      glow: false,
      style: NOW,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
