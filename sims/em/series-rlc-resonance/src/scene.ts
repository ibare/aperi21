// ========================================================================
// series-rlc-resonance — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 세 덩어리가 가로로 나란하다.
//   왼쪽 — 직렬 RLC 회로 하나. 전원(body 원 + trajectory 물결) · 도선(lineSet) · 저항 톱니 ·
//          코일 혹(trajectory) · 축전기 판(lineSet) · 기호와 값 이름표(readout).
//   가운데 — 막는 몫의 사슬. 기준선 위 한 점에서 코일 몫이 위로 · 축전기 몫이 아래로 뻗고
//          (vector), 옆 칸 파선 vector 가 둘을 합친 남은 몫이다. 두 팔의 길이가 같아지면 남은
//          몫이 사라진다.
//   오른쪽 — I–f 평면. 축(lineSet) · f₀ 눈금 · 큰 저항 곡선 · 작은 저항 곡선(trajectory) ·
//          지금 진동수 점(body).
//
// 색은 뜻마다 하나다. 장치 · 사슬 · 글자는 먹색, 축 · 눈금은 muted, 전류 곡선은 둘 다
// `primary`. **강조색은 「지금 진동수」 한 뜻에만** — 곡선 위를 가는 점. 두 저항의 곡선은 색이
// 아니라 선 모양(지금 곡선 실선 · 앞 곡선 흐린 점선)과 봉우리 옆 값 이름표로 가른다 (S-piece).
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
  currentAmplitude,
  frequencyNow,
  inductiveReactance,
  readConstants,
  resistanceLabelValue,
  resistanceNow,
  resonanceFrequency,
  sweepReachHigh,
  sweepReachLow,
  type SeriesRlcResonanceConstants,
} from './physics';
import {
  CHAIN_BASE_LEFT,
  CHAIN_BASE_RIGHT,
  CHAIN_NET_GAP,
  CHAIN_ORIGIN_X,
  CHAIN_ORIGIN_Y,
  COIL_BUMP,
  COIL_HALF_LEN,
  COIL_TURNS,
  GRAPH_HEIGHT,
  GRAPH_ORIGIN_X,
  GRAPH_ORIGIN_Y,
  GRAPH_WIDTH,
  LOOP_BOTTOM,
  LOOP_LEFT,
  LOOP_RIGHT,
  LOOP_TOP,
  PHASE,
  PLATE_HALF_GAP,
  PLATE_HALF_H,
  RESISTOR_AMP,
  RESISTOR_HALF_LEN,
  RESISTOR_ZIGS,
  SCENE_BOUNDS,
  SOURCE_R,
  SOURCE_WAVE_HALF_H,
  SOURCE_WAVE_HALF_W,
  text,
} from './schema';
import type { SeriesRlcResonanceState } from './state';

// ------------------------------------------------------------------------
// 굵기 · 글자 · 짙기 · 표본 (화면 px · 0~1 · 개수)
// ------------------------------------------------------------------------

const WIRE_WIDTH = 2;
const PLATE_WIDTH = 3.5;
const ELEMENT_WIDTH = 2;
const SOURCE_WAVE_WIDTH = 1.6;
const AXIS_WIDTH = 1;
const CHAIN_WIDTH = 2.4;
const CURVE_WIDTH = 2.4;
const GHOST_WIDTH = 1.6;
const SYMBOL_PX = 14;
const LABEL_PX = 12;
/** 앞 저항 곡선의 짙기 — 지금 곡선 뒤로 물러나 비교 기준만 된다. */
const GHOST_OPACITY = 0.75;
/** 이름표를 앵커에서 띄우는 거리(화면 px). */
const LABEL_GAP = 10;
/** 기호 이름표와 그 아래 · 위 값 이름표 사이(화면 px). */
const VALUE_LINE = 16;
/** 큰 저항 봉우리 이름표를 봉우리 아래로 내리는 거리(화면 px) — 곡선 획과 떨어지게. */
const PEAK_LABEL_DROP = 18;
/** 가로축 f₀ 눈금의 길이(월드). */
const TICK_LEN = 0.1;
/** 지금 진동수 점의 반지름(월드). */
const NOW_DOT_R = 0.1;
/** 전류 곡선 표본 수 — 좁은 봉우리 꼭대기가 모나지 않게. */
const CURVE_SAMPLES = 360;
/** 전원 물결 · 코일 혹 하나의 표본 수. */
const SOURCE_WAVE_SAMPLES = 24;
const COIL_SAMPLES_PER_TURN = 16;

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
  opts: { italic?: boolean; vars?: Record<string, string>; opacity?: number } = {},
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos, offset },
    text: body,
    ...(opts.vars ? { vars: opts.vars } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    chip: false,
    font: 'text',
    align,
    fontSize,
    italic: opts.italic ?? false,
    style,
  };
}

/** 직렬 회로 한 고리 — 왼쪽 전원 · 위 저항 · 오른쪽 코일 · 아래 축전기. */
function circuit(out: Primitive[], c: SeriesRlcResonanceConstants, rLabel: number): void {
  const cx = (LOOP_LEFT + LOOP_RIGHT) / 2;
  const cy = (LOOP_TOP + LOOP_BOTTOM) / 2;

  out.push({
    type: 'lineSet',
    id: 'wires',
    lines: [
      [[LOOP_LEFT, cy + SOURCE_R], [LOOP_LEFT, LOOP_TOP], [cx - RESISTOR_HALF_LEN, LOOP_TOP]],
      [[cx + RESISTOR_HALF_LEN, LOOP_TOP], [LOOP_RIGHT, LOOP_TOP], [LOOP_RIGHT, cy + COIL_HALF_LEN]],
      [[LOOP_RIGHT, cy - COIL_HALF_LEN], [LOOP_RIGHT, LOOP_BOTTOM], [cx + PLATE_HALF_GAP, LOOP_BOTTOM]],
      [[cx - PLATE_HALF_GAP, LOOP_BOTTOM], [LOOP_LEFT, LOOP_BOTTOM], [LOOP_LEFT, cy - SOURCE_R]],
    ],
    width: WIRE_WIDTH,
    style: INK,
  });

  // ---- 교류 전원 — 원 안의 물결 한 번 ----
  out.push({
    type: 'body',
    id: 'source',
    pos: [LOOP_LEFT, cy],
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
    wave.push([LOOP_LEFT - SOURCE_WAVE_HALF_W + 2 * SOURCE_WAVE_HALF_W * s, cy + SOURCE_WAVE_HALF_H * Math.sin(2 * Math.PI * s)]);
  }
  out.push({ type: 'trajectory', id: 'source-wave', points: wave, width: SOURCE_WAVE_WIDTH, style: INK });
  out.push(
    label('source-voltage', text('label.voltage'), [LOOP_LEFT - SOURCE_R, cy], [-LABEL_GAP, 0], 'right', LABEL_PX, MUTED, {
      vars: { v: String(c.voltage) },
    }),
  );

  // ---- 저항 — 위 가지의 톱니 ----
  const zig: Vec2[] = [[cx - RESISTOR_HALF_LEN, LOOP_TOP]];
  for (let k = 0; k < RESISTOR_ZIGS; k++) {
    const x = cx - RESISTOR_HALF_LEN + ((2 * RESISTOR_HALF_LEN) / RESISTOR_ZIGS) * (k + 0.5);
    zig.push([x, LOOP_TOP + (k % 2 === 0 ? RESISTOR_AMP : -RESISTOR_AMP)]);
  }
  zig.push([cx + RESISTOR_HALF_LEN, LOOP_TOP]);
  out.push({ type: 'trajectory', id: 'resistor', points: zig, width: ELEMENT_WIDTH, style: INK });
  const rTop: Vec2 = [cx, LOOP_TOP + RESISTOR_AMP];
  out.push(label('resistor-symbol', text('label.resistor'), rTop, [0, -LABEL_GAP], 'center', SYMBOL_PX, INK, { italic: true }));
  out.push(
    label('resistor-value', text('label.resistance'), rTop, [0, -LABEL_GAP - VALUE_LINE], 'center', LABEL_PX, MUTED, {
      vars: { v: String(rLabel) },
    }),
  );

  // ---- 코일 — 오른쪽 가지, 오른쪽으로 불룩한 혹이 감은 수만큼 ----
  const coil: Vec2[] = [];
  const seg = (2 * COIL_HALF_LEN) / COIL_TURNS;
  for (let k = 0; k < COIL_TURNS; k++) {
    const yc = cy + COIL_HALF_LEN - seg * (k + 0.5);
    for (let i = 0; i <= COIL_SAMPLES_PER_TURN; i++) {
      const th = Math.PI / 2 - (Math.PI * i) / COIL_SAMPLES_PER_TURN;
      coil.push([LOOP_RIGHT + COIL_BUMP * Math.cos(th), yc + (seg / 2) * Math.sin(th)]);
    }
  }
  out.push({ type: 'trajectory', id: 'coil', points: coil, width: ELEMENT_WIDTH, style: INK });
  // 이름표는 고리 안쪽(코일 왼쪽)에 둔다 — 고리 오른쪽은 사슬이 가깝다.
  out.push(label('coil-symbol', text('label.inductor'), [LOOP_RIGHT, cy], [-LABEL_GAP, -LABEL_GAP], 'right', SYMBOL_PX, INK, { italic: true }));
  out.push(
    label('coil-value', text('label.inductance'), [LOOP_RIGHT, cy], [-LABEL_GAP, LABEL_GAP], 'right', LABEL_PX, MUTED, {
      vars: { v: String(c.inductance) },
    }),
  );

  // ---- 축전기 — 아래 가지에 세운 두 판 ----
  out.push({
    type: 'lineSet',
    id: 'plates',
    lines: [
      [[cx - PLATE_HALF_GAP, LOOP_BOTTOM - PLATE_HALF_H], [cx - PLATE_HALF_GAP, LOOP_BOTTOM + PLATE_HALF_H]],
      [[cx + PLATE_HALF_GAP, LOOP_BOTTOM - PLATE_HALF_H], [cx + PLATE_HALF_GAP, LOOP_BOTTOM + PLATE_HALF_H]],
    ],
    width: PLATE_WIDTH,
    style: INK,
  });
  const cBottom: Vec2 = [cx, LOOP_BOTTOM - PLATE_HALF_H];
  out.push(label('capacitor-symbol', text('label.capacitor'), cBottom, [0, LABEL_GAP], 'center', SYMBOL_PX, INK, { italic: true }));
  out.push(
    label('capacitor-value', text('label.capacitance'), cBottom, [0, LABEL_GAP + VALUE_LINE], 'center', LABEL_PX, MUTED, {
      vars: { v: String(c.capacitance) },
    }),
  );
}

/**
 * 막는 몫의 사슬 — 기준선 위 한 점에서 코일 몫이 위로, 축전기 몫이 아래로 뻗는다. 오른쪽
 * 옆 칸의 파선이 둘을 합친 남은 몫(위 − 아래)이다. 두 팔이 같아지면 남은 몫이 사라진다.
 * 모두 같은 배율(`ohmScale`)이다.
 *
 * R 은 두지 않았다 — 같은 배율에서 몇 px 라 읽히지 않는다 (NOTES (b)).
 */
function chain(out: Primitive[], f: number, c: SeriesRlcResonanceConstants): void {
  const s = c.ohmScale;
  const o: Vec2 = [CHAIN_ORIGIN_X, CHAIN_ORIGIN_Y];
  const xl = inductiveReactance(f, c) * s;
  const xc = capacitiveReactance(f, c) * s;
  const net = xl - xc;
  const netFrom: Vec2 = [o[0] + CHAIN_NET_GAP, o[1]];

  out.push({
    type: 'lineSet',
    id: 'chain-base',
    lines: [[[o[0] - CHAIN_BASE_LEFT, o[1]], [netFrom[0] + CHAIN_BASE_RIGHT, o[1]]]],
    width: AXIS_WIDTH,
    style: MUTED,
  });
  out.push({ type: 'vector', id: 'chain-coil', from: o, delta: [0, xl], width: CHAIN_WIDTH, style: INK });
  out.push({ type: 'vector', id: 'chain-capacitor', from: o, delta: [0, -xc], width: CHAIN_WIDTH, style: INK });
  out.push({
    type: 'vector',
    id: 'chain-net',
    from: netFrom,
    delta: [0, net],
    width: CHAIN_WIDTH,
    style: { ...INK, lineStyle: 'dashed' },
  });

  out.push(label('chain-coil-name', text('label.inductor'), [o[0], o[1] + xl], [-LABEL_GAP, 0], 'right', SYMBOL_PX, INK, { italic: true }));
  out.push(label('chain-capacitor-name', text('label.capacitor'), [o[0], o[1] - xc], [-LABEL_GAP, 0], 'right', SYMBOL_PX, INK, { italic: true }));
  // 남은 몫의 이름은 기준선 옆에 둔다 — 화살표가 사라져도 자리가 남아 「0」 을 가리킨다.
  out.push(label('chain-net-name', text('label.reactance'), netFrom, [LABEL_GAP, net >= 0 ? LABEL_GAP : -LABEL_GAP], 'left', SYMBOL_PX, INK, { italic: true }));
}

export function scene(params: {
  state: SeriesRlcResonanceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('series-rlc-resonance: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const f = frequencyNow(tl, c);
  const r = resistanceNow(tl, c);
  const f0 = resonanceFrequency(c);
  const out: Primitive[] = [];

  circuit(out, c, resistanceLabelValue(tl, c));
  chain(out, f, c);

  // ---- I–f 평면 ----
  const gx = (hz: number): number => GRAPH_ORIGIN_X + (hz / c.graphFreqMax) * GRAPH_WIDTH;
  const gy = (amp: number): number => GRAPH_ORIGIN_Y + (amp / c.graphCurrentMax) * GRAPH_HEIGHT;
  const right = GRAPH_ORIGIN_X + GRAPH_WIDTH;
  const top = GRAPH_ORIGIN_Y + GRAPH_HEIGHT;

  out.push({
    type: 'lineSet',
    id: 'plane-axes',
    lines: [
      [[GRAPH_ORIGIN_X, GRAPH_ORIGIN_Y], [right, GRAPH_ORIGIN_Y]],
      [[GRAPH_ORIGIN_X, GRAPH_ORIGIN_Y], [GRAPH_ORIGIN_X, top]],
      [[gx(f0), GRAPH_ORIGIN_Y], [gx(f0), GRAPH_ORIGIN_Y - TICK_LEN]],
    ],
    width: AXIS_WIDTH,
    style: MUTED,
  });
  out.push(label('plane-f', text('label.freqAxis'), [right, GRAPH_ORIGIN_Y], [LABEL_GAP, 0], 'left', LABEL_PX, MUTED, { italic: true }));
  out.push(label('plane-i', text('label.current'), [GRAPH_ORIGIN_X, top], [0, -LABEL_GAP], 'center', LABEL_PX, MUTED, { italic: true }));
  out.push(
    label('plane-f0', text('label.resonance'), [gx(f0), GRAPH_ORIGIN_Y - TICK_LEN], [0, LABEL_GAP], 'center', LABEL_PX, MUTED, {
      italic: true,
    }),
  );

  // 곡선 — 쓸기가 닿은 진동수까지만 그린다. 곡선은 `clear` 동안 사라진다.
  const fade = 1 - tl.at(PHASE.clear);
  const curve = (reach: number, rr: number): Vec2[] => {
    const pts: Vec2[] = [];
    for (let i = 0; i <= CURVE_SAMPLES; i++) {
      const hz = c.freqMin + (reach - c.freqMin) * (i / CURVE_SAMPLES);
      pts.push([gx(hz), gy(currentAmplitude(hz, rr, c))]);
    }
    return pts;
  };

  // 큰 저항 곡선 — 첫 쓸기 동안은 지금 곡선(실선), `swap` 이 시작되면 앞 곡선(흐린 점선)으로 물러난다.
  // 같은 물리량이라 색은 그대로 `primary` 다 — 선 모양 · 굵기 · 짙기로만 물러난다 (S-piece).
  const reachHigh = sweepReachHigh(tl, c);
  const highIsGhost = tl.at(PHASE.swap) > 0;
  if (reachHigh > c.freqMin) {
    out.push({
      type: 'trajectory',
      id: 'curve-high',
      points: curve(reachHigh, c.resistanceHigh),
      width: highIsGhost ? GHOST_WIDTH : CURVE_WIDTH,
      opacity: (highIsGhost ? GHOST_OPACITY : 1) * fade,
      style: highIsGhost ? { ...CURRENT, lineStyle: 'dotted' } : CURRENT,
    });
  }
  // 봉우리 이름표 — 쓸기가 f₀ 에 닿은 뒤에 붙는다. 큰 저항 곡선은 작은 저항 곡선 아래에
  // 늘 놓이므로 이름표를 제 봉우리 **아래**에 두면 어느 곡선에도 걸리지 않는다.
  if (tl.at(PHASE.peakHigh) > 0) {
    out.push(
      label('peak-high-value', text('label.resistance'), [gx(f0), gy(currentAmplitude(f0, c.resistanceHigh, c))], [0, PEAK_LABEL_DROP], 'center', LABEL_PX, MUTED, {
        vars: { v: String(c.resistanceHigh) },
        opacity: fade,
      }),
    );
  }

  // 작은 저항 곡선 — 둘째 쓸기부터.
  const reachLow = sweepReachLow(tl, c);
  if (reachLow > c.freqMin) {
    out.push({
      type: 'trajectory',
      id: 'curve-low',
      points: curve(reachLow, c.resistanceLow),
      width: CURVE_WIDTH,
      opacity: fade,
      style: CURRENT,
    });
  }
  if (tl.at(PHASE.peakLow) > 0) {
    out.push(
      label('peak-low-value', text('label.resistance'), [gx(f0), gy(currentAmplitude(f0, c.resistanceLow, c))], [0, -LABEL_GAP], 'center', LABEL_PX, MUTED, {
        vars: { v: String(c.resistanceLow) },
        opacity: fade,
      }),
    );
  }

  // ---- 지금 진동수 — 곡선 위를 가는 점 (강조색 한 뜻) ----
  out.push({
    type: 'body',
    id: 'plane-now',
    pos: [gx(f), gy(currentAmplitude(f, r, c))],
    shape: 'circle',
    size: NOW_DOT_R,
    outline: 'background',
    glow: false,
    style: NOW,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
